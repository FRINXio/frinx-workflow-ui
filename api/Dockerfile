# --- Setup API server ---

FROM node:9.4.0-alpine

WORKDIR /usr/app/api/
COPY package*.json ./
RUN npm install -qy
COPY ./ ./

EXPOSE 3001

CMD ["npm", "start"]