# 🎬 CineScore — Movie Search & Rating App

Interface web fullstack desenvolvida para o processo seletivo de estágio em desenvolvimento web da **Pixel Breeders (2026)**, permitindo buscar filmes através da API pública do TMDB, visualizar detalhes completos com elenco e sinopse, e gerenciar uma coleção pessoal de avaliações (notas de 1 a 5).

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, CSS Moderno (Design System customizado com ícones SVG).
- **Backend:** Python, Django REST Framework, Django CORS Headers, Requests.
- **Banco de Dados:** SQLite (com ORM nativo do Django).
- **Infraestrutura:** Docker e Docker Compose *(Em preparação para a execução via comando único)*.

---

## 🎯 Objetivo e Requisitos Atendidos

- ✅ **Consumo de API Externa:** Integração completa com os endpoints de busca (`/search/movie`), detalhes e créditos (`/movie/{id}`) do TMDB.
- ✅ **Gerenciamento de Estado & UI:** Estados reativos em React para busca em tempo real com *debounce*, paginação dinâmica, filtros por gênero e modais interativos.
- ✅ **Uso Apropriado de Banco de Dados:** Persistência relacional em SQLite armazenando notas, títulos, pôsteres, anos, gêneros e durações.
- ✅ **Criação de API (Backend Endpoints):** Endpoints RESTful em Django para busca, listagem, criação (`POST`), edição (`PUT`) e exclusão (`DELETE`) de avaliações.
- ✅ **Estados de Carregamento e Tratamento de Erros:** *Loading states* fluidos e tratamento de falhas de rede com feedback visual na interface.

### 🌟 Pontos Extras (Bônus) Implementados
- **Paginação Completa:** Navegação por páginas estruturada e responsiva na página inicial.
- **Filtro por Gênero:** Seletor integrado com os gêneros oficiais do TMDB em português.
- **Interface Polida:** Design moderno com grade uniforme de pôsteres e ícones vetoriais customizados em SVG.

---

## 🚀 Funcionalidades da Aplicação

1. **Página Inicial (Descobrir / Filmes em Alta):**
   - Exibição de filmes populares com grade uniforme de pôsteres.
   - Barra de pesquisa integrada e seletor de gêneros.
   - Paginação estruturada no rodapé.
2. **Modal de Detalhes do Filme:**
   - Exibição de sinopse, data de lançamento, gênero, duração e elenco principal (*cast*).
   - Sistema de avaliação interativo por estrelas (1 a 5) com opções para editar ou excluir avaliações existentes[cite: 1].
3. **Página "Minhas Avaliações":**
   - Listagem dedicada de todos os filmes avaliados pelo usuário, com contador em destaque, cartões horizontais detalhados e notas persistidas no banco de dados[cite: 1].

---

## 📂 Estrutura do Projeto

```text
pixel-breeders-movie-app/
│
├── backend/                  # Configurações do projeto Django
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── frontend/                 # Aplicação React + TypeScript (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api.ts            # Camada de serviços HTTP (Fetch API)
│   │   ├── types.ts          # Contratos de tipagem TypeScript
│   │   ├── App.tsx           # Componente principal e rotas de telas
│   │   ├── MovieModal.tsx    # Modal de detalhes e sistema de notas
│   │   └── index.css         # Design System CineScore
│   ├── package.json
│   └── tsconfig.json
│
├── movies/                   # App Django (Endpoints e Modelos)
│   ├── migrations/
│   ├── admin.py
│   ├── models.py             # Modelo MovieRating (Banco de Dados SQL)
│   ├── urls.py
│   └── views.py              # Lógica de negócio e integração com TMDB
│
├── .env                      # Variáveis de ambiente (Chave da API do TMDB)
├── .gitignore
├── db.sqlite3                # Banco de dados SQLite local
├── manage.py                 # Utilitário de linha de comando do Django
├── requirements.txt          # Dependências Python
└── README.md

