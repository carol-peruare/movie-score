import json
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import MovieRating


def home(request):
    return JsonResponse({
        "message": "API de filmes funcionando!",
        "status": "ok"
    })


def search_movies(request):
    query = request.GET.get('query', '').strip()

    if not query:
        return JsonResponse({"error": "O parâmetro 'query' é obrigatório."}, status=400)

    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({"error": "Chave da API do TMDB não configurada no servidor."}, status=500)

    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": api_key,
        "query": query,
        "language": "pt-BR",
        "page": 1
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Busca todas as notas já salvas no banco para exibir junto na busca se necessário
        ratings_map = dict(MovieRating.objects.values_list('tmdb_id', 'score'))

        movies = []
        for item in data.get("results", []):
            poster_path = item.get("poster_path")
            tmdb_id = item.get("id")
            movies.append({
                "id": tmdb_id,
                "title": item.get("title"),
                "synopsis": item.get("overview"),
                "release_date": item.get("release_date"),
                "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
                "user_rating": ratings_map.get(tmdb_id)
            })

        return JsonResponse({"results": movies})

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

        # Verifica no nosso banco de dados se o usuário já avaliou este filme
        rating_obj = MovieRating.objects.filter(tmdb_id=tmdb_id).first()

        poster_path = data.get("poster_path")
        movie_data = {
            "id": data.get("id"),
            "title": data.get("title"),
            "synopsis": data.get("overview"),
            "release_date": data.get("release_date"),
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "genres": [g.get("name") for g in data.get("genres", [])],
            "cast": cast,
            "user_rating": rating_obj.score if rating_obj else None
        }

        return JsonResponse(movie_data)

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)


@csrf_exempt
def ratings_list_create(request):
    """
    GET: Lista todos os filmes avaliados pelo usuário (Rated Movies Page).
    POST: Avalia um filme com nota de 1 a 5.
    """
    if request.method == "GET":
        ratings = MovieRating.objects.all().order_by("-updated_at")
        results = [
            {
                "id": r.tmdb_id,
                "title": r.title,
                "poster_url": r.poster_url,
                "release_date": r.release_date,
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
                    "user_rating": rating_obj.score,
                }
            },
            status=201 if created else 200
        )

    return JsonResponse({"error": "Método não permitido."}, status=405)


@csrf_exempt
def rating_detail(request, tmdb_id):
    """
    PUT: Edita a nota (1 a 5) de um filme já avaliado.
    DELETE: Remove a avaliação de um filme.
    """
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
                "user_rating": rating_obj.score,
            }
        })

    if request.method == "DELETE":
        rating_obj.delete()
        return JsonResponse({"message": "Avaliação removida com sucesso!"})

    return JsonResponse({"error": "Método não permitido."}, status=405)