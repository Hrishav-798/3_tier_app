FROM node:22-alpine AS frontend
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
RUN npm run build

FROM nginx:alpine
COPY --from=frontend /home/node/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]