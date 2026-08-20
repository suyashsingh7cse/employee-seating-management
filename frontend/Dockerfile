# Dev-oriented image, used by docker-compose.yml for local development
# with hot module reload. Production doesn't use this image at all —
# the root Dockerfile builds the React app into static files that Flask
# serves directly.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
