# Back-end do projeto

## Informações gerais

O projeto consiste de uma API Restful construída com *Node*, *Typescript*, *Express* e *Prisma* (ORM), o banco de dados usado no projeto é o *postgreSQL*, também foi utilizado o *Localstack* para simular o serviço de bucket S3 da AWS rodando localmente. Para conteinerizar a aplicação foi utilizado o *Docker*.

## Requerimentos

Para usar a aplicação conteinerizada basta ter o docker instalado na máquina.

## Como rodar a API / DB / LOCALSTACK (Docker)

### 1. Clonar ou baixar o repositório no github
### 2. Fazer o build da imagem da API presente no Dockerfile

 `docker built -t api .`

### 3. Rodar os conteineres das imagens do `compose.yml`

 `docker compose up` ou `docker compose up -d` 

(Pode acontecer um erro ao rodar a API caso o banco de dados não esteja rodando ainda na porta, caso aconteça basta reiniciar o conteiner da API)

### 4. Verificar ausência de erros e testar a aplicação

Com a aplicação rodando pode-se testar as rotas da API por quaisquer clientes desejados

## Scripts do NPM

0. Instalar as dependências do projeto

`npm install`

1. Rodar a API em desenvolvimento usando a dependência `tsx`.

`npm run dev`

2. Transpilar os arquivos para javascript na pasta `dist`

`npm run build`

3. Startar a aplicação, fazer as migrações e o seed

`npm run start`

4. Executar os testes (feitos utilizando as dependências Jest e Supertest)

`npm run test`

## Documentação da API

A documentação da API foi feita utilizando o *swagger* e pode ser acessada na rota `http://localhost:3333/docs`
