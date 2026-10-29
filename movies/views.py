import json
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import MovieRating
from django.core.cache import cache #Importa o sistema nativo de memória em cache do Django

# Mapa oficial de IDs de gêneros do TMDB em Português
TMDB_GENRES = {
    28: "Ação",
    12: "Aventura",
    16: "Animação",
    35: "Comédia",
    80: "Crime",
    99: "Documentário",
    18: "Drama",
    10751: "Família",
    14: "Fantasia",
    36: "História",
    27: "Terror",
    10402: "Música",
    9648: "Mistério",
    10749: "Romance",
    878: "Ficção científica",
    10770: "Cinema TV",
    53: "Suspense",
    10752: "Guerra",
    37: "Faroeste",
}


def format_runtime(minutes):
    """Converte minutos (ex: 128) para o formato do layout '2h 08min'."""
    if not minutes or not isinstance(minutes, int):
        return None
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0:
        return f"{hours}h {mins:02d}min"
    return f"{mins}min"


def home(request):
    return JsonResponse({
        "message": "API CineScore funcionando!",
        "status": "ok"
    })


def search_movies(request):
    query = request.GET.get('query', '').strip()
    user_page = int(request.GET.get('page', '1'))
    genre_id = request.GET.get('genre', '').strip()

    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({"error": "Chave da API do TMDB não configurada no servidor."}, status=500)

    # Cria uma chave única de cache para esta combinação de busca + página + gênero
    cache_key = f"tmdb_search_{query}_{user_page}_{genre_id}"
    cached_tmdb_data = cache.get(cache_key)

    ratings_map = dict(MovieRating.objects.values_list('tmdb_id', 'score'))

    # Se já buscamos isso nos últimos 5 minutos, usa o cache instantaneamente!
    if cached_tmdb_data is not None:
        for movie in cached_tmdb_data["results"]:
            movie["user_rating"] = ratings_map.get(movie["id"])
        return JsonResponse(cached_tmdb_data)

    tmdb_start_page = (user_page - 1) * 2 + 1
    tmdb_pages_to_fetch = [tmdb_start_page, tmdb_start_page + 1]

    movies = []
    seen_ids = set()
    total_tmdb_pages = 1
    total_tmdb_results = 0

    try:
        for tmdb_page in tmdb_pages_to_fetch:
            params = {
                "api_key": api_key,
                "language": "pt-BR",
                "page": tmdb_page,
            }

            if query:
                url = "https://api.themoviedb.org/3/search/movie"
                params["query"] = query
            else:
                url = "https://api.themoviedb.org/3/discover/movie"
                params["sort_by"] = "popularity.desc"
                if genre_id:
                    params["with_genres"] = genre_id

            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                break

            data = response.json()
            total_tmdb_pages = data.get("total_pages", 1)
            total_tmdb_results = data.get("total_results", 0)

            for item in data.get("results", []):
                tmdb_id = item.get("id")
                if tmdb_id in seen_ids:
                    continue

                genre_ids = item.get("genre_ids", [])
                if query and genre_id and int(genre_id) not in genre_ids:
                    continue

                seen_ids.add(tmdb_id)
                primary_genre = TMDB_GENRES.get(genre_ids[0], "Filme") if genre_ids else "Filme"
                poster_path = item.get("poster_path")

                movies.append({
                    "id": tmdb_id,
                    "title": item.get("title"),
                    "synopsis": item.get("overview"),
                    "release_date": item.get("release_date"),
                    "genre": primary_genre,
                    "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
                    "user_rating": ratings_map.get(tmdb_id),
                })

            if tmdb_page >= total_tmdb_pages:
                break

        movies = movies[:30]
        calculated_total_pages = max(1, min(total_tmdb_pages // 2, 250))

        response_payload = {
            "results": movies,
            "page": user_page,
            "total_pages": calculated_total_pages,
            "total_results": total_tmdb_results,
        }

        # Salva o resultado no cache por 300 segundos (5 minutos)
        cache.set(cache_key, response_payload, timeout=300)

        return JsonResponse(response_payload)

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)
    
def movie_detail(request, tmdb_id):
    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({"error": "Chave da API do TMDB não configurada no servidor."}, status=500)

    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {
        "api_key": api_key,
        "language": "pt-BR",
        "append_to_response": "credits"
    }

    try:
        response = requests.get(url, params=params, timeout=10)

        if response.status_code == 404:
            return JsonResponse({"error": "Filme não encontrado no TMDB."}, status=404)

        response.raise_for_status()
        data = response.json()

        raw_cast = data.get("credits", {}).get("cast", [])[:10]
        cast = []
        for actor in raw_cast:
            profile_path = actor.get("profile_path")
            cast.append({
                "id": actor.get("id"),
                "name": actor.get("name"),
                "character": actor.get("character"),
                "profile_url": f"https://image.tmdb.org/t/p/w185{profile_path}" if profile_path else None
            })

        rating_obj = MovieRating.objects.filter(tmdb_id=tmdb_id).first()
        genres_list = [g.get("name") for g in data.get("genres", [])]
        primary_genre = genres_list[0] if genres_list else "Filme"

        poster_path = data.get("poster_path")
        movie_data = {
            "id": data.get("id"),
            "title": data.get("title"),
            "synopsis": data.get("overview"),
            "release_date": data.get("release_date"),
            "genre": primary_genre,
            "genres": genres_list,
            "runtime": format_runtime(data.get("runtime")),
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "cast": cast,
            "user_rating": rating_obj.score if rating_obj else None
        }

        return JsonResponse(movie_data)

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)


@csrf_exempt
def ratings_list_create(request):
    if request.method == "GET":
        ratings = MovieRating.objects.all().order_by("-updated_at")
        results = [
            {
                "id": r.tmdb_id,
                "title": r.title,
                "poster_url": r.poster_url,
                "release_date": r.release_date,
                "genre": r.genre or "Filme",
                "runtime": r.runtime,
                "user_rating": r.score,
                "updated_at": r.updated_at.isoformat(),
            }
            for r in ratings
        ]
        return JsonResponse({"results": results})

    if request.method == "POST":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido no corpo da requisição."}, status=400)

        tmdb_id = body.get("tmdb_id")
        title = body.get("title")
        poster_url = body.get("poster_url")
        release_date = body.get("release_date")
        genre = body.get("genre")
        runtime = body.get("runtime")
        score = body.get("score")

        if not tmdb_id or not title or score is None:
            return JsonResponse(
                {"error": "Os campos 'tmdb_id', 'title' e 'score' são obrigatórios."},
                status=400
            )

        if not isinstance(score, int) or score < 1 or score > 5:
            return JsonResponse(
                {"error": "A nota ('score') deve ser um número inteiro entre 1 e 5."},
                status=400
            )

        rating_obj, created = MovieRating.objects.update_or_create(
            tmdb_id=tmdb_id,
            defaults={
                "title": title,
                "poster_url": poster_url,
                "release_date": release_date,
                "genre": genre,
                "runtime": runtime,
                "score": score,
            }
        )

        return JsonResponse(
            {
                "message": "Avaliação salva com sucesso!",
                "movie": {
                    "id": rating_obj.tmdb_id,
                    "title": rating_obj.title,
                    "poster_url": rating_obj.poster_url,
                    "release_date": rating_obj.release_date,
                    "genre": rating_obj.genre,
                    "runtime": rating_obj.runtime,
                    "user_rating": rating_obj.score,
                }
            },
            status=201 if created else 200
        )

    return JsonResponse({"error": "Método não permitido."}, status=405)


@csrf_exempt
def rating_detail(request, tmdb_id):
    rating_obj = MovieRating.objects.filter(tmdb_id=tmdb_id).first()
    if not rating_obj:
        return JsonResponse({"error": "Avaliação não encontrada para este filme."}, status=404)

    if request.method == "PUT":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "JSON inválido no corpo da requisição."}, status=400)

        score = body.get("score")
        if not isinstance(score, int) or score < 1 or score > 5:
            return JsonResponse(
                {"error": "A nota ('score') deve ser um número inteiro entre 1 e 5."},
                status=400
            )

        rating_obj.score = score
        rating_obj.save()

        return JsonResponse({
            "message": "Nota atualizada com sucesso!",
            "movie": {
                "id": rating_obj.tmdb_id,
                "title": rating_obj.title,
                "poster_url": rating_obj.poster_url,
                "release_date": rating_obj.release_date,
                "genre": rating_obj.genre,
                "runtime": rating_obj.runtime,
                "user_rating": rating_obj.score,
            }
        })

    if request.method == "DELETE":
        rating_obj.delete()
        return JsonResponse({"message": "Avaliação removida com sucesso!"})

    return JsonResponse({"error": "Método não permitido."}, status=405)