FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/
COPY mock/feed.json mock/
RUN npm ci --workspace=@aibc/shared --workspace=@aibc/api
COPY packages/shared packages/shared
COPY packages/api packages/api
COPY mock mock
RUN npm run build --workspace=@aibc/shared && npm run build --workspace=@aibc/api

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/
RUN npm ci --omit=dev --workspace=@aibc/shared --workspace=@aibc/api
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/api/dist packages/api/dist
COPY --from=build /app/mock mock
RUN mkdir -p /data
ENV AIBC_DB_PATH=/data/aibc.db
EXPOSE 8787
CMD ["node", "packages/api/dist/index.js"]
