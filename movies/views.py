import requests
from django.conf import settings
from django.http import JsonResponse


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

        movies = []
        for item in data.get("results", []):
            poster_path = item.get("poster_path")
            movies.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "synopsis": item.get("overview"),
                "release_date": item.get("release_date"),
                "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
            })

        return JsonResponse({"results": movies})

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)


def movie_detail(request, tmdb_id):
    """
    Busca os detalhes completos de um filme específico no TMDB,
    incluindo sinopse, data de lançamento e os principais atores (elenco/cast).
    """
    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({"error": "Chave da API do TMDB não configurada no servidor."}, status=500)

    # Usamos append_to_response=credits para trazer detalhes + elenco numa única requisição!
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    params = {
        "api_key": api_key,
        "language": "pt-BR",
        "append_to_response": "credits"
    }

    try:
        response = requests.get(url, params=params, timeout=10)

        # Tratamento de erro específico se o ID do filme não existir no TMDB
        if response.status_code == 404:
            return JsonResponse({"error": "Filme não encontrado no TMDB."}, status=404)

        response.raise_for_status()
        data = response.json()

        # Pegamos os 10 primeiros atores do elenco para não sobrecarregar o modal no Frontend
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

        poster_path = data.get("poster_path")
        movie_data = {
            "id": data.get("id"),
            "title": data.get("title"),
            "synopsis": data.get("overview"),
            "release_date": data.get("release_date"),
            "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
            "genres": [g.get("name") for g in data.get("genres", [])],
            "cast": cast
        }

        return JsonResponse(movie_data)

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)