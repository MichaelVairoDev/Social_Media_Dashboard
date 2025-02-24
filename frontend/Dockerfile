FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli
RUN npm install --legacy-peer-deps

COPY . .

RUN ng build --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/social-media-dashboard /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"] 