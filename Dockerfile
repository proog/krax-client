FROM node:8-alpine

WORKDIR /app

RUN addgroup -S krax && adduser -S -G krax krax && chown -R krax:krax ./
USER krax

COPY --chown=krax:krax package*.json ./
RUN npm install --production

COPY --chown=krax:krax index.html *.js ./

EXPOSE 11181
ENTRYPOINT [ "npm", "start" ]
