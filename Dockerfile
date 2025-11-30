FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 3001

RUN npm install -g serve concurrently

CMD ["sh", "-c", "concurrently \"serve -s build -l 3000\" \"node server.js\""]
