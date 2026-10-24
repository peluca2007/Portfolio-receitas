# Portfólio de Receitas (Dark.onion Slop)

Aplicação web em Node.js para um portfólio de receitas "exóticas" mantido por alunos de culinária. Usa arquitetura MVC com Express e Handlebars, SQLite (via Sequelize) para os dados relacionais e MongoDB (via Mongoose) para os comentários.

## Funcionalidades

- Página inicial pública com todas as receitas, suas categorias, alunos responsáveis e comentários
- Filtro de receitas por categoria, com contagem de receitas por categoria no menu
- Relatório público com a proporção de alunos que dominam cada habilidade
- Login com senha criptografada (bcrypt) e sessão (`express-session`), com perfis de aluno e administrador
- Alunos logados podem cadastrar receitas, marcar coautores e categorias, e editar ou excluir receitas das quais são responsáveis
- Alunos registram suas habilidades culinárias com nível de 0 a 10
- Comentários nas receitas: visitantes podem comentar livremente; alunos logados comentam uma vez por receita
- Painel do administrador (rotas protegidas por middleware):
  - cadastro, edição e exclusão de alunos
  - gestão de categorias e habilidades (telas e rotas JSON em `/categorias/api`)
  - auditoria e ajuste do nível de habilidade de cada aluno
- Povoamento automático na primeira execução: categorias, habilidades, administrador, seis alunos e seis receitas de exemplo
- Se o MongoDB não estiver disponível, o site sobe normalmente, apenas sem comentários

## Modelo de dados

- SQLite: `Usuario`, `Receita`, `Categoria`, `Habilidade`
- Relacionamentos N:N: receita x aluno (responsáveis), receita x categoria e aluno x habilidade (com o campo `nivel`)
- MongoDB: `Comment`, ligado à receita pelo `receita_id`

## Tecnologias

- Node.js, Express 5, Express Handlebars
- Sequelize + SQLite3
- Mongoose + MongoDB
- bcryptjs, express-session
- nodemon (desenvolvimento)

## Como rodar

Pré-requisitos: Node.js e, opcionalmente, um MongoDB local em `mongodb://127.0.0.1:27017` (banco `portfolio_receitas`) para os comentários.

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000` e cria o arquivo `database.sqlite` na raiz do projeto.

Usuários criados pelo povoamento automático:

- Administrador: `admin@sistema.com` / `admin`
- Alunos: por exemplo `carlos@aluno.com` / `123`

## Contexto

Trabalho acadêmico de back-end (o código referencia os requisitos do enunciado, como "Requisito 1.4").
