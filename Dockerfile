FROM node:8-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY index.html *.js ./

RUN adduser -S krax
USER krax

EXPOSE 11181
CMD [ "npm", "start" ]
