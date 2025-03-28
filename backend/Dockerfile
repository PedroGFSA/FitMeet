FROM node:22.14.0

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]
