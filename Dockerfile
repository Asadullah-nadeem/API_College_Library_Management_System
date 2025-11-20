FROM node:20
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN npx tsc
EXPOSE 3000
CMD ["node", "dist/app.js"]
