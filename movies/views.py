import requests
from django.conf import settings
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "API de filmes funcionando!",
        "status": "ok"
    })

def search_movies(request):
    # 1. Pega a palavra buscada na URL (ex: /api/search/?query=batman)
    query = request.GET.get('query', '').strip()

    # Se a pessoa não digitou nada, retorna um erro 400 (Bad Request) amigável
    if not query:
        return JsonResponse({"error": "O parâmetro 'query' é obrigatório."}, status=400)

    # 2. Verifica se a chave do TMDB foi configurada no .env
    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({"error": "Chave da API do TMDB não configurada no servidor."}, status=500)

    # 3. Faz a chamada para a API oficial do TMDB
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": api_key,
        "query": query,
        "language": "pt-BR", # Traz títulos e sinopses em português (ou mude para en-US se preferir)
        "page": 1
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status() # Dispara um erro caso o TMDB responda com erro (ex: chave inválida)
        data = response.json()

        # 4. Limpa e organiza os dados que vamos devolver para o nosso Frontend
        movies = []
        for item in data.get("results", []):
            poster_path = item.get("poster_path")
            movies.append({
                "id": item.get("id"),
                "title": item.get("title"),
                "synopsis": item.get("overview"),
                "release_date": item.get("release_date"),
                # Monta o link completo da imagem do pôster se ela existir
                "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
            })

        return JsonResponse({"results": movies})

    except requests.RequestException as e:
        return JsonResponse({"error": "Erro ao comunicar com o TMDB.", "details": str(e)}, status=502)