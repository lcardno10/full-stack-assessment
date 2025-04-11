FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm cache clean --force && \
    npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]