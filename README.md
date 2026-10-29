# 🎬 CineScore

CineScore é uma aplicação web que permite pesquisar filmes utilizando a API do TMDB, visualizar detalhes completos das obras (sinopse, data de lançamento, duração, gênero e elenco) e criar uma coleção pessoal de avaliações com notas de 1 a 5.

O projeto foi estruturado seguindo uma arquitetura fullstack integrada, com frontend em React + TypeScript, backend em Python (Django) + SQLite e infraestrutura containerizada com Docker.

## O desafio

Desenvolver uma aplicação utilizando:
- consumo de API externa (TMDB)
- componentização e tipagem estática
- gerenciamento de estado no React
- criação de API REST e CRUD completo de avaliações
- navegação fluida entre visualizações
- persistência de dados em banco relacional
- tratamento de erros e estados de carregamento (loading states)
- execução simplificada via Docker com comando único

Além da interface funcional, o projeto teve foco em organização de código, experiência do usuário e integração real entre frontend, backend e banco de dados.

## Funcionalidades

### Implementadas (Obrigatórias)
- **Pesquisa de filmes em tempo real** via TMDB API (com *debounce* para otimização de requisições)
- **Listagem de filmes em alta** na página inicial
- **Modal de detalhes do filme** contendo pôster, sinopse, ano de lançamento, gênero, duração e elenco principal (*cast*)
- **Sistema de avaliações com estrelas (1 a 5)** permitindo avaliar filmes, editar notas existentes e remover avaliações
- **Página "Minhas avaliações"** listando todos os filmes avaliados pelo usuário com atualização em tempo real
- **Loading states e Error handling** em todas as interações com a API
- **Responsividade** para diferentes tamanhos de tela

### Pontos Extras (Bônus Implementados)
- **Paginação** estruturada para navegação entre os resultados
- **Filtro por Gênero** integrado à busca e aos filmes em alta
- **Implementação de Cache** no backend (`LocMemCache` do Django) para armazenar respostas do TMDB por 5 minutos e reduzir chamadas repetidas à API externa

### Não Implementadas (Escopo Futuro)
- **Autenticação de usuários (Login/Cadastro):** Por decisão de escopo e priorização da qualidade/estabilidade do fluxo principal de busca, CRUD de avaliações e containerização em Docker, as avaliações foram modeladas de forma global para o usuário local da aplicação.
- **Infinite Scroll e Filtro por Ano:** Optou-se pela implementação da paginação numerada clássica e do filtro por gênero para manter a interface limpa e fiel ao protótipo visual do projeto.

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- CSS3 (Design System customizado e ícones vetoriais SVG)
- Fetch API
- Vite

### Backend
- Python
- Django
- Django CORS Headers
- Requests
- Python-dotenv
- SQLite

### Infraestrutura & Ferramentas
- Docker & Docker Compose
- Git & GitHub
- Postman (testes de endpoints REST)

## Aprendizados

Durante o desenvolvimento deste projeto, aprofundei meus conhecimentos em:
- Componentização e tipagem de dados com React e TypeScript (`interfaces`)
- Gerenciamento de estado (`useState` e `useEffect`) e controle de efeitos colaterais
- Consumo e integração de APIs REST entre cliente e servidor
- Tratamento de estados de carregamento e falhas de rede na interface
- Responsividade, alinhamento com CSS Grid e experiência do usuário

E tive novas experiências práticas com:
- Criação de rotas e endpoints REST (`GET`, `POST`, `PUT`, `DELETE`) com Django
- Modelagem de banco de dados relacional e migrações utilizando o ORM do Django com SQLite
- Testes de requisições HTTP e validação de payloads JSON utilizando o Postman
- Configuração de políticas de segurança CORS e variáveis de ambiente (`.env`)
- Containerização de aplicações fullstack utilizando `Dockerfile` e `docker-compose.yml`

## Estrutura do Projeto

```text
pixel-breeders-movie-app/
│
├── backend/                  # Configurações principais do projeto Django
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── frontend/                 # Aplicação Frontend (React + TypeScript + Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api.ts            # Funções de comunicação HTTP com o backend
│   │   ├── types.ts          # Interfaces e tipagens TypeScript
│   │   ├── App.tsx           # Componente principal, busca, filtros e abas
│   │   ├── MovieModal.tsx    # Modal de detalhes, elenco e CRUD de estrelas
│   │   ├── index.css         # Estilização global do CineScore
│   │   └── main.tsx
│   ├── Dockerfile            # Receita Docker do Frontend
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
├── movies/                   # Aplicação Django (Regras de negócio e API)
│   ├── migrations/           # Histórico de migrações do banco SQLite
│   ├── admin.py
│   ├── models.py             # Modelo MovieRating (persistência de notas 1-5)
│   ├── urls.py               # Roteamento dos endpoints (/api/...)
│   └── views.py              # Integração com TMDB, cache e CRUD de notas
│
├── .dockerignore
├── .env.example              # Exemplo de configuração de variáveis de ambiente
├── .gitignore
├── Dockerfile                # Receita Docker do Backend
├── docker-compose.yml        # Orquestração dos containers (Frontend + Backend)
├── manage.py
├── requirements.txt          # Dependências Python do Backend
└── README.md
```

## Decisões Técnicas

### Persistência Inteligente no Banco de Dados
Ao avaliar um filme, o backend armazena no SQLite não apenas o `tmdb_id` e a nota (`score` validado de 1 a 5), mas também os metadados essenciais de exibição (`title`, `poster_url`, `release_date`, `genre` e `runtime`). Essa decisão arquitetural permite que a página **"Minhas avaliações"** seja carregada instantaneamente a partir do banco de dados local, evitando múltiplas chamadas sequenciais desnecessárias à API do TMDB.

### Declaração de Uso de Inteligência Artificial
Conforme permitido pelas diretrizes do processo seletivo, ferramentas de Inteligência Artificialforam utilizadas durante o desenvolvimento atuando como um **Mentor Sênior**. O auxílio concentrou-se em:
- Explicação conceitual passo a passo da arquitetura fullstack (comunicação cliente-servidor, métodos HTTP, ORM e funcionamento de containers Docker);
- Orientação na estruturação dos endpoints em Django e boas práticas de componentização em React + TypeScript;
- Diagnóstico de erros de ambiente virtual (`venv`), configuração de CORS e revisão de código linha por linha.

Todas as decisões técnicas e linhas de código implementadas foram revisadas, testadas manualmente via Postman/navegador e compreendidas integralmente.

## Melhorias Futuras

- Sistema de autenticação de usuários (JWT / OAuth) para listas de avaliações individuais
- Filtro adicional por ano de lançamento e ordenação customizada nas avaliações
- Opção de alternância entre *Dark Mode* e *Light Mode*
- Implementação de testes automatizados (Pytest no backend e Vitest no frontend)
- Deploy em nuvem

## Como Rodar o Projeto

### Variáveis de Ambiente

Antes de iniciar, crie um arquivo chamado `.env` na **raiz do projeto** (você pode usar o arquivo `.env.example` como base) e adicione a sua chave da API do TMDB:

```env
TMDB_API_KEY=sua_chave_api_do_tmdb_aqui
```

---

### Opção 1: Rodando com Docker (Recomendado, Comando Único)

Certifique-se de estar com o **Docker Desktop** aberto e em execução. No terminal, na pasta raiz do projeto, execute apenas:

```bash
docker compose up --build
```

O Docker irá construir as imagens, aplicar as migrações do banco de dados automaticamente e iniciar os dois servidores:
- **Frontend (Aplicação Web):** [http://localhost:5173](http://localhost:5173)
- **Backend (API Django):** [http://localhost:8000/api/](http://localhost:8000/api/)

---

### Opção 2: Rodando Localmente (Sem Docker)

#### 1. Backend (Terminal 1)
Na raiz do projeto, crie e ative o ambiente virtual, instale as dependências e inicie o servidor Django:

```bash
python -m venv venv

# Ativar no Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Ativar no Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 2. Frontend (Terminal 2)
Em outro terminal, entre na pasta `frontend`, instale os pacotes e inicie o Vite:

```bash
cd frontend
npm install
npm run dev
```

Acesse a aplicação no navegador em: `http://localhost:5173`
