FROM node:12-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  yarn

COPY package*.json ./

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN yarn --frozen-lockfile --silent

COPY . .

RUN npm run build

RUN yarn global add pm2 --silent

RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

EXPOSE 8080

USER pptruser

CMD ["pm2-runtime", "server/index.js"]
