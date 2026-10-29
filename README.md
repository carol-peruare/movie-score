# 🎬 CineScore

CineScore é uma aplicação web que permite pesquisar filmes utilizando a API do TMDB, visualizar detalhes completos das obras (sinopse, data de lançamento, duração, gênero e elenco) e criar uma coleção pessoal de avaliações com notas de 1 a 5.

O projeto foi estruturado seguindo uma arquitetura fullstack integrada, com frontend em React + TypeScript, backend em Python (Django) + SQLite e infraestrutura containerizada com Docker.

![Ecrã Principal do CineScore](./docs/home.png)
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

### Implementadas
- **Pesquisa de filmes em tempo real** via TMDB API (com *debounce* para otimização de requisições)
- **Listagem de filmes em alta** na página inicial
- **Modal de detalhes do filme** contendo pôster, sinopse, ano de lançamento, gênero, duração e elenco principal (*cast*)
- **Sistema de avaliações com estrelas (1 a 5)** permitindo avaliar filmes, editar notas existentes e remover avaliações
- **Página "Minhas avaliações"** listando todos os filmes avaliados pelo usuário com atualização em tempo real
- **Loading states e Error handling** em todas as interações com a API
- **Responsividade** para diferentes tamanhos de tela

### Extras 
- **Paginação** estruturada para navegação entre os resultados
- **Filtro por Gênero e por Ano** integrados à busca e aos filmes em alta
- **Implementação de Cache** no backend (`LocMemCache` do Django) para armazenar respostas do TMDB por 5 minutos e reduzir chamadas repetidas à API externa

### Não Implementadas (Escopo Futuro)
- **Autenticação de usuários (Login/Cadastro):** Por decisão de escopo e priorização da qualidade/estabilidade do fluxo principal de busca, CRUD de avaliações e containerização em Docker, as avaliações foram modeladas de forma global para o usuário local da aplicação.
- **Infinite Scroll:** Optou-se pela implementação da paginação numerada clássica para manter a navegação previsível e alinhada ao layout do projeto.

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
- Responsividade, alinhamento uniforme de cards com CSS Grid e experiência do usuário

E tive novas experiências práticas com:
- Criação de rotas e endpoints REST (`GET`, `POST`, `PUT`, `DELETE`) com Django
- Modelagem de banco de dados relacional e migrações utilizando o ORM do Django com SQLite
- Testes de requisições HTTP e validação de payloads JSON utilizando o Postman
- Configuração de políticas de segurança CORS e variáveis de ambiente (`.env`)
- Containerização de aplicações fullstack utilizando `Dockerfile` e `docker-compose.yml`

## Estrutura do Projeto

```text
movie-score/
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

### 1. Segurança e Arquitetura Proxy (Backend-for-Frontend)
Em vez de expor a chave da API do TMDB (`TMDB_API_KEY`) diretamente nas requisições do navegador no React, todas as buscas e consultas passam pelo backend em Django. Isso protege a credencial sensível no servidor (via arquivo `.env`) e permite que o backend já enriqueça a listagem do TMDB cruzando os dados com as notas salvas no banco SQLite local.

### 2. Persistência Inteligente no Banco de Dados
Ao avaliar um filme, o backend armazena no SQLite não apenas o `tmdb_id` e a nota (`score` validado de 1 a 5), mas também os metadados essenciais de exibição (`title`, `poster_url`, `release_date`, `genre` e `runtime`). Essa decisão arquitetural permite que a página **"Minhas avaliações"** seja carregada instantaneamente a partir do banco de dados local, evitando múltiplas chamadas sequenciais desnecessárias à API do TMDB.

### 3. Agregação de Resultados para Alinhamento de Layout (Grid 6x5)
A API do TMDB retorna, por padrão, 20 filmes por página, o que deixava a última linha da grade de 6 colunas incompleta. Para garantir consistência visual, o endpoint `/api/search/` agrega duas subpáginas do TMDB por requisição, filtra eventuais duplicatas com estruturas `set()` em Python e entrega lotes de 30 filmes (formando 5 fileiras completas de 6 pôsteres).

### 4. Otimização de Chamadas e Debounce
- **No Frontend:** A barra de pesquisa utiliza um *debounce* de `300ms`, aguardando o usuário pausar a digitação antes de acionar a API, evitando requisições excessivas a cada tecla pressionada.
- **No Backend:** Na rota de detalhes do filme (`/api/movies/<id>/`), foi utilizado o parâmetro `append_to_response=credits` do TMDB, obtendo os dados gerais do filme e a lista de atores (*cast*) em uma única requisição HTTP.

### 5. Estratégia Híbrida de Cache (`LocMemCache` + `no-store`)
Para acelerar a navegação entre páginas e filtros repetidos, o backend armazena em memória RAM (`LocMemCache` do Django) os resultados vindos do TMDB por 5 minutos (`300s`). Por outro lado, nas rotas que consultam as avaliações do usuário no banco de dados, o frontend utiliza a diretiva `cache: 'no-store'` na Fetch API, garantindo que o navegador não exiba listas antigas e reflita criações, edições ou exclusões de notas imediatamente.

### Declaração de Uso de Inteligência Artificial
Conforme permitido pelas diretrizes do processo seletivo, ferramentas de Inteligência Artificial foram utilizadas durante o desenvolvimento atuando como um **Mentor Sênior**. O auxílio concentrou-se em:
- Explicação conceitual passo a passo da arquitetura fullstack (comunicação cliente-servidor, métodos HTTP, ORM e funcionamento de containers Docker);
- Orientação na estruturação dos endpoints em Django e boas práticas de componentização em React + TypeScript;
- Diagnóstico de erros de ambiente virtual (`venv`), configuração de CORS e revisão de código linha por linha.
- Design de Ícones: O código SVG utilizado para a logo do CineScore e o favicon da aba do navegador foi gerado com o auxílio de I.A. para garantir um aspecto profissional sem depender de imagens externas.

Todas as decisões técnicas e linhas de código implementadas foram revisadas, testadas manualmente via Postman/navegador e compreendidas integralmente.

## Melhorias Futuras

- **Sistema de autenticação de usuários (JWT / OAuth):** Permitir que diferentes pessoas criem contas ou façam login (para que cada usuário tenha sua própria lista privada de avaliações)
- **Avaliações com resenha em texto:** Adicionar um campo opcional de comentário escrito para acompanhar a nota de 1 a 5 estrelas
- **Ordenação customizada em "Minhas avaliações":** Permitir ordenar os filmes avaliados por maior nota, data de avaliação ou ordem alfabética
- **Alternância de tema (*Dark Mode* / *Light Mode*):** Opção para alternar entre o tema escuro padrão do CineScore e um tema claro
- **Testes automatizados (`Pytest` e `Vitest`):** Criação de scripts de teste para validar automaticamente as rotas da API em Django e os componentes em React
- **Deploy em nuvem:** Publicação da aplicação em um servidor online para acesso direto via link na web

## Como Rodar o Projeto

### Variáveis de Ambiente

Antes de iniciar, crie um arquivo chamado `.env` na **raiz do projeto** (você pode usar o arquivo `.env.example` como base) e adicione a sua chave da API do TMDB:

```env
TMDB_API_KEY=sua_chave_api_do_tmdb_aqui
```

---

### Opção 1: Rodando com Docker (Recomendado — Comando Único)

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
