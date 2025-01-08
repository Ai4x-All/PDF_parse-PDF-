# --------- install dependence -----------
FROM node:20.14.0 AS mainDeps
WORKDIR /app

# 设置npm源为淘宝镜像
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm@9.4.0

# 安装必要的依赖
RUN apt-get update && apt-get install -y \
libcairo2-dev \
libjpeg-dev \
libpango1.0-dev \
libgif-dev \
build-essential \
g++ \
&& rm -rf /var/lib/apt/lists/*

# copy packages and one project
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ./packages ./packages
COPY ./projects/app/package.json ./projects/app/package.json

# 验证 pnpm-lock.yaml 文件是否存在
RUN [ -f pnpm-lock.yaml ] || (echo "Lockfile not found." && exit 1)

# 安装依赖
RUN pnpm i

# 安装额外的依赖
RUN pnpm install -w redlock
RUN pnpm install -w @zilliz/milvus2-sdk-node
RUN pnpm install -w tiktoken

# --------- builder -----------
FROM node:20.14.0 AS builder
WORKDIR /app

ARG proxy

# copy common node_modules and one project node_modules
COPY package.json pnpm-workspace.yaml .npmrc tsconfig.json ./
COPY --from=mainDeps /app/node_modules ./node_modules
COPY --from=mainDeps /app/packages ./packages
COPY ./projects/app ./projects/app
COPY --from=mainDeps /app/projects/app/node_modules ./projects/app/node_modules

RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm@9.4.0
RUN pnpm --filter=app build

# --------- runner -----------
FROM node:20.14.0 AS runner
WORKDIR /app

# create user and use it
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 安装依赖并设置权限
RUN apt-get update && apt-get install -y curl ca-certificates && update-ca-certificates

# copy running files
COPY --from=builder /app/projects/app/public /app/projects/app/public
COPY --from=builder /app/projects/app/next.config.js /app/projects/app/next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/standalone /app/
COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/static /app/projects/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/server/chunks /app/projects/app/.next/server/chunks
COPY --from=builder --chown=nextjs:nodejs /app/projects/app/.next/server/worker /app/projects/app/.next/server/worker

# copy standload packages
COPY --from=mainDeps /app/node_modules/tiktoken ./node_modules/tiktoken
RUN rm -rf ./node_modules/tiktoken/encoders
COPY --from=mainDeps /app/node_modules/@zilliz/milvus2-sdk-node ./node_modules/@zilliz/milvus2-sdk-node

# copy package.json to version file
COPY --from=builder /app/projects/app/package.json ./package.json

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT=3000

EXPOSE 3000

USER nextjs

ENV serverPath=./projects/app/server.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

ENTRYPOINT ["sh","-c","node --max-old-space-size=4096 ${serverPath}"]