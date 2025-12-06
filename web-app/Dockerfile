# Multi-stage Dockerfile for Angular Frontend

# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist/expense-tracker-web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]