# Fullstack Todo

一个用于学习前后端全栈开发、Docker 容器化部署、Nginx 反向代理、GitHub Actions 自动部署与 Docker 镜像仓库发布的 Todo 项目。

项目包含：

* 前端：React + Vite + TypeScript
* 后端：Node.js + Express
* 数据库：MySQL
* 部署：Docker Compose + 宿主机 Nginx
* CI/CD：GitHub Actions + GHCR（GitHub Container Registry）

当前生产部署方案采用：

```txt
本地修改代码
  ↓
git push origin main
  ↓
GitHub Actions 自动触发
  ↓
GitHub Runner 构建 front/server Docker 镜像
  ↓
推送镜像到 GHCR
  ↓
GitHub Actions 通过 SSH 登录阿里云服务器
  ↓
服务器 docker pull 最新镜像
  ↓
docker compose up -d 重启容器
  ↓
宿主机 Nginx 对外提供访问
```

公网访问链路：

```txt
公网用户
  ↓
http://公网IP:80
  ↓
宿主机 Nginx
  ├─ /           → 127.0.0.1:8080 → front 容器 Nginx → 前端页面
  └─ /baseApi/   → 127.0.0.1:3000 → server 容器 Node 服务
                                        ↓
                                     mysql 容器
```

公网只暴露 `80` 和 `22` 端口。`8080`、`3000`、`3306/3307` 不直接暴露给公网。

---

## 一、项目目录结构

```txt
fullstackTodo/
  docker-compose.yml
  docker-compose.prod.yml
  .env.docker.example
  .gitignore
  README.md

  .github/
    workflows/
      deploy.yml

  frontend/
    Dockerfile
    nginx.conf
    package.json
    package-lock.json
    src/
    .env.example
    .env.production.example

  server/
    Dockerfile
    package.json
    package-lock.json
    src/
    .env.docker.example

  mysql/
    init/
      init.sql
```

说明：

```txt
docker-compose.yml       本地/服务器源码 build 方式，可作为开发或旧部署参考
docker-compose.prod.yml  生产部署使用，从 GHCR 拉取镜像，不在服务器 build
.github/workflows        GitHub Actions 自动构建镜像并部署
```

---

## 二、技术栈

### 前端

* React
* Vite
* TypeScript
* Axios
* React Router
* Ant Design
* Zustand

### 后端

* Node.js
* Express
* MySQL2
* JWT
* bcryptjs
* dotenv
* cors

### 部署与自动化

* Docker
* Docker Compose v2
* Nginx
* MySQL 8.0
* Ubuntu Server
* GitHub Actions
* GHCR（GitHub Container Registry）

---

## 三、核心功能

### 用户模块

* 用户注册
* 用户登录
* JWT 登录认证
* Token 失效自动退出

### Todo 模块

* 获取 Todo 列表
* 新增 Todo
* 删除 Todo
* 修改 Todo 完成状态
* 根据用户隔离 Todo 数据

---

## 四、接口说明

后端接口统一以 `/api` 开头。

在生产环境中，浏览器请求的是：

```txt
/baseApi/xxx
```

宿主机 Nginx 会转发成：

```txt
/api/xxx
```

例如：

```txt
浏览器请求：
http://公网IP/baseApi/todos

Nginx 转发：
http://127.0.0.1:3000/api/todos
```

### 常用接口

```txt
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/todos
POST   /api/todos
PATCH  /api/todos/:id
DELETE /api/todos/:id
```

---

## 五、本地开发

### 1. 前端本地运行

进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

前端本地环境变量示例：

```env
VITE_BASE_URL=http://localhost:3000/api
```

如果本地使用 Vite proxy，也可以配置为：

```env
VITE_BASE_URL=/baseApi
```

### 2. 后端本地运行

进入后端目录：

```bash
cd server
```

安装依赖：

```bash
npm install
```

创建本地 `.env` 文件，例如：

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fullstacktodo
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

启动后端：

```bash
npm start
```

如果使用开发模式，可以根据项目 scripts 使用：

```bash
npm run dev
```

---

## 六、生产环境变量

真实环境变量文件不提交 Git，只提交 example 示例文件。

项目里有两个 `.env.docker` 文件，作用不同：

```txt
根目录 .env.docker          给 Docker Compose 解析变量
server/.env.docker          给后端容器运行时读取变量
```

### 1. 根目录 `.env.docker`

位置：

```txt
/www/fullstackTodo/.env.docker
```

用于 Docker Compose 解析 MySQL 初始化参数和端口映射。

示例文件：`.env.docker.example`

```env
MYSQL_ROOT_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=fullstacktodo
MYSQL_USER=fullstacktodo_user
MYSQL_PASSWORD=your_mysql_password

SERVER_PORT=3000
FRONT_PORT=8080
```

服务器上需要复制一份真实文件：

```bash
cp .env.docker.example .env.docker
```

然后修改真实密码。

注意：因为文件名是 `.env.docker`，不是默认的 `.env`，所以执行 compose 命令时必须显式指定：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
```

否则 `${MYSQL_USER}`、`${SERVER_PORT}`、`${FRONT_PORT}` 等变量可能读取不到。

### 2. 后端 `server/.env.docker`

位置：

```txt
/www/fullstackTodo/server/.env.docker
```

用于后端容器运行。

示例文件：`server/.env.docker.example`

```env
PORT=3000
DB_HOST=mysql
DB_PORT=3306
DB_USER=fullstacktodo_user
DB_PASSWORD=your_mysql_password
DB_NAME=fullstacktodo
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

服务器上需要复制一份真实文件：

```bash
cp server/.env.docker.example server/.env.docker
```

注意：

```env
DB_HOST=mysql
```

这里的 `mysql` 是 Docker Compose 服务名，不要写成 `127.0.0.1`。

在 `server` 容器内部，`127.0.0.1` 指的是 server 容器自己，不是 MySQL 容器。

### 3. 前端生产环境变量

示例文件：`frontend/.env.production.example`

```env
VITE_BASE_URL=/baseApi
```

真实生产环境可以复制：

```bash
cp frontend/.env.production.example frontend/.env.production
```

不要写：

```env
VITE_BASE_URL=http://server:3000/api
```

因为前端代码运行在用户浏览器中，浏览器不认识 Docker 内部服务名 `server`。

---

## 七、生产环境 Docker Compose

生产环境使用：

```txt
docker-compose.prod.yml
```

该文件不在服务器上 build 镜像，而是直接从 GHCR 拉取镜像。

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: fullstacktodo-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci

  server:
    image: ghcr.io/ggbond-l/fullstacktodo-server:latest
    container_name: fullstacktodo-server
    restart: unless-stopped
    depends_on:
      - mysql
    env_file:
      - ./server/.env.docker
    ports:
      - "127.0.0.1:${SERVER_PORT}:3000"

  front:
    image: ghcr.io/ggbond-l/fullstacktodo-front:latest
    container_name: fullstacktodo-front
    restart: unless-stopped
    depends_on:
      - server
    ports:
      - "127.0.0.1:${FRONT_PORT}:80"

volumes:
  mysql_data:
```

镜像地址：

```txt
后端镜像：ghcr.io/ggbond-l/fullstacktodo-server:latest
前端镜像：ghcr.io/ggbond-l/fullstacktodo-front:latest
```

当前 GHCR 镜像设置为 Public，服务器可以直接拉取，不需要执行 `docker login ghcr.io`。

### 生产环境启动

```bash
cd /www/fullstackTodo
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
```

### 拉取最新镜像并更新

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull server front
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
```

### 查看容器

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps
```

### 查看当前容器使用的镜像

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

正常应看到：

```txt
fullstacktodo-server   ghcr.io/ggbond-l/fullstacktodo-server:latest
fullstacktodo-front    ghcr.io/ggbond-l/fullstacktodo-front:latest
fullstacktodo-mysql    mysql:8.0
```

注意不要随便执行：

```bash
docker compose down -v
```

因为 `-v` 会删除 MySQL 数据卷，数据库数据会丢失。

---

## 八、开发/旧部署方式：服务器本地 build

项目根目录的 `docker-compose.yml` 可以保留作为开发或旧部署参考。

旧方式流程：

```txt
GitHub Actions SSH 到服务器
  ↓
服务器 git pull
  ↓
服务器 docker compose up -d --build
  ↓
服务器本地构建 front/server 镜像
```

该方式已经不作为当前推荐生产方案，原因是：

```txt
1. 低配服务器执行前端 npm run build 较慢
2. Docker build 容易导致服务器 CPU/内存占用过高
3. GitHub Actions 可能出现 command timeout
4. SSH 连接可能因服务器高负载出现 handshake failed: EOF
```

当前推荐使用：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull server front
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
```

而不是：

```bash
docker compose --env-file ./.env.docker up -d --build
```

---

## 九、前端 Dockerfile

`frontend/Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

说明：

```txt
第一阶段：
使用 Node 镜像安装依赖并执行 npm run build，生成 dist。

第二阶段：
使用 Nginx 镜像运行 dist 静态文件。
```

在当前生产部署中，这个 Dockerfile 由 GitHub Actions 在 GitHub Runner 上执行，不在阿里云服务器上执行。

---

## 十、前端容器 Nginx 配置

`frontend/nginx.conf`：

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

作用：

```txt
1. 返回前端静态文件
2. 支持 React Router 前端路由
3. 页面刷新时不会 404
```

API 代理不在 front 容器里做，而是交给宿主机 Nginx 做。

---

## 十一、后端 Dockerfile

`server/Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

当前生产部署中，这个 Dockerfile 由 GitHub Actions 在 GitHub Runner 上执行，不在阿里云服务器上执行。

---

## 十二、宿主机 Nginx 配置

宿主机 Nginx 作为公网入口，监听 `80`。

示例配置：

```nginx
server {
    listen 80;
    server_name _;

    location /baseApi/ {
        proxy_pass http://127.0.0.1:3000/api/;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

注意：当前方案下，宿主机 Nginx 不再直接读取：

```nginx
root /www/fullstackTodo/frontend/dist;
```

前端页面由 `front` 容器提供。

修改 Nginx 后：

```bash
nginx -t
systemctl reload nginx
```

---

## 十三、GitHub Actions 自动部署

Workflow 文件：

```txt
.github/workflows/deploy.yml
```

当前自动化流程：

```txt
1. push 到 main 分支
2. GitHub Actions 拉取源码
3. 登录 GHCR
4. 构建并推送 server 镜像
5. 构建并推送 front 镜像
6. SSH 登录服务器
7. 服务器拉取最新镜像
8. 使用 docker-compose.prod.yml 重启容器
```

示例配置：

```yaml
name: Build Images and Deploy

on:
  push:
    branches:
      - main

concurrency:
  group: deploy-production
  cancel-in-progress: true

permissions:
  contents: read
  packages: write

env:
  SERVER_IMAGE: ghcr.io/ggbond-l/fullstacktodo-server
  FRONT_IMAGE: ghcr.io/ggbond-l/fullstacktodo-front

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push server image
        uses: docker/build-push-action@v6
        with:
          context: ./server
          push: true
          tags: |
            ${{ env.SERVER_IMAGE }}:latest
            ${{ env.SERVER_IMAGE }}:${{ github.sha }}

      - name: Build and push front image
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ env.FRONT_IMAGE }}:latest
            ${{ env.FRONT_IMAGE }}:${{ github.sha }}

      - name: Deploy on server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          timeout: 120s
          command_timeout: 10m
          script: |
            set -e
            cd /www/fullstackTodo

            echo "===== pull latest compose config ====="
            git fetch origin main
            git reset --hard origin/main

            echo "===== pull latest images ====="
            docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull server front

            echo "===== restart containers ====="
            docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d

            echo "===== containers status ====="
            docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps

            echo "===== clean old images ====="
            docker image prune -f
```

说明：

```txt
latest       当前生产部署默认使用的标签
github.sha   每次提交对应的镜像标签，后续可用于回滚
```

---

## 十四、GitHub Secrets 配置

GitHub 仓库中需要配置以下 Secrets：

路径：

```txt
GitHub 仓库
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

需要添加：

```txt
SERVER_HOST      服务器公网 IP
SERVER_USER      root
SERVER_SSH_KEY   SSH 私钥完整内容
```

注意：

```txt
SERVER_SSH_KEY 填私钥，不是 .pub 公钥
```

私钥内容格式：

```txt
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

服务器中需要把对应公钥加入：

```txt
/root/.ssh/authorized_keys
```

本地测试 SSH：

```bash
ssh -i C:\Users\57069\fullstackTodoGithub root@47.120.15.168
```

如果不需要输入密码即可登录，说明 SSH key 配置正确。

---

## 十五、部署流程

### 1. 本地开发并提交

```bash
git status
git add .
git commit -m "feat: update project"
git push origin main
```

### 2. GitHub Actions 自动执行

推送到 `main` 后，GitHub Actions 会自动执行：

```txt
Checkout code
Login to GHCR
Set up Docker Buildx
Build and push server image
Build and push front image
Deploy on server
```

### 3. 服务器自动执行

服务器端会执行：

```bash
cd /www/fullstackTodo
git fetch origin main
git reset --hard origin/main
docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull server front
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps
docker image prune -f
```

### 4. 手动检查状态

```bash
ssh root@服务器公网IP
cd /www/fullstackTodo
docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps
```

### 5. 检查端口

```bash
ss -lntp | grep -E ':80|:8080|:3000|:3307'
```

理想结果：

```txt
0.0.0.0:80          nginx
127.0.0.1:8080      docker-proxy
127.0.0.1:3000      docker-proxy
```

不应该出现：

```txt
0.0.0.0:8080
0.0.0.0:3000
0.0.0.0:3307
```

---

## 十六、安全组配置

当前未配置域名和 HTTPS，因此安全组只需要开放：

```txt
22    SSH
80    HTTP
```

暂时不需要开放：

```txt
443
8080
3000
3306
3307
```

如果后续配置 HTTPS，再开放：

```txt
443
```

---

## 十七、常用命令

### 生产环境 Docker Compose

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull server front
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps
docker compose --env-file ./.env.docker -f docker-compose.prod.yml logs -f
docker compose --env-file ./.env.docker -f docker-compose.prod.yml down
```

### 查看日志

```bash
docker logs -f fullstacktodo-server
docker logs -f fullstacktodo-front
docker logs -f fullstacktodo-mysql
```

### 查看镜像来源

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

### 清理未使用镜像

```bash
docker image prune -f
```

### 进入容器

```bash
docker exec -it fullstacktodo-server sh
docker exec -it fullstacktodo-front sh
docker exec -it fullstacktodo-mysql bash
```

### MySQL

```bash
docker exec -it fullstacktodo-mysql mysql -u fullstacktodo_user -p
```

进入 MySQL 后：

```sql
SHOW DATABASES;
USE fullstacktodo;
SHOW TABLES;
DESC users;
DESC todos;
```

### Nginx

```bash
nginx -t
systemctl reload nginx
systemctl restart nginx
systemctl status nginx
nginx -T
```

筛选 Nginx 关键配置：

```bash
nginx -T | grep -nE "listen|server_name|root|proxy_pass"
```

### 端口检查

```bash
ss -lntp | grep -E ':80|:8080|:3000|:3307'
```

---

## 十八、测试方式

测试 front 容器：

```bash
curl -I http://127.0.0.1:8080
```

测试 server 容器：

```bash
curl http://127.0.0.1:3000/api/health
```

测试宿主机 Nginx：

```bash
curl -I http://127.0.0.1
```

浏览器访问：

```txt
http://公网IP
```

浏览器 Network 面板中，接口请求应该是：

```txt
http://公网IP/baseApi/xxx
```

不应该是：

```txt
http://公网IP:3000/api/xxx
http://server:3000/api/xxx
```

---

## 十九、Git 忽略规则

根目录 `.gitignore` 推荐：

```gitignore
# dependencies
node_modules/
frontend/node_modules/
server/node_modules/

# env
.env
.env.*
!.env.example
!.env.docker.example
!frontend/.env.example
!frontend/.env.production.example
!server/.env.example
!server/.env.docker.example

# build
dist/
frontend/dist/
server/dist/

# logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# OS
.DS_Store
Thumbs.db

# editor
.vscode/
.idea/

# docker/mysql local data
mysql_data/
*.sql.bak
```

不提交真实环境变量文件：

```txt
.env
.env.docker
server/.env.docker
frontend/.env
frontend/.env.production
```

提交 example 文件：

```txt
.env.docker.example
server/.env.docker.example
frontend/.env.example
frontend/.env.production.example
```

---

## 二十、常见问题

### 1. 为什么公网 IP 和公网 IP:8080 都能访问前端？

说明有两个入口同时存在：

```txt
公网IP:80   → 宿主机 Nginx
公网IP:8080 → front 容器 Nginx
```

当前方案中，`8080` 不应该对公网开放，front 应该写成：

```yaml
ports:
  - "127.0.0.1:${FRONT_PORT}:80"
```

同时安全组不要开放 `8080`。

---

### 2. 为什么后端 ports 写 127.0.0.1:3000:3000？

因为后端只需要给宿主机 Nginx 访问，不应该直接暴露公网。

```yaml
ports:
  - "127.0.0.1:${SERVER_PORT}:3000"
```

表示：

```txt
宿主机 127.0.0.1:3000 → server 容器 3000
```

公网不能直接访问：

```txt
http://公网IP:3000
```

---

### 3. 为什么 MySQL 不写 ports？

因为 MySQL 只需要给 server 容器访问。

后端连接：

```txt
mysql:3306
```

不是：

```txt
公网IP:3307
```

所以正式部署不需要暴露数据库端口。

---

### 4. 为什么前端 VITE_BASE_URL 写 /baseApi？

因为浏览器请求的是宿主机 Nginx：

```txt
http://公网IP/baseApi
```

然后宿主机 Nginx 再转发到后端：

```txt
http://127.0.0.1:3000/api
```

浏览器不能直接访问 Docker 内部服务名 `server`。

---

### 5. docker-compose 和 docker compose 有什么区别？

`docker-compose` 是旧版 Compose v1。

`docker compose` 是新版 Compose v2。

建议统一使用：

```bash
docker compose
```

不要再混用：

```bash
docker-compose
```

旧版 `docker-compose 1.29.2` 可能会出现：

```txt
KeyError: 'ContainerConfig'
```

---

### 6. 修改 frontend/nginx.conf 后为什么不生效？

`frontend/nginx.conf` 是在 Dockerfile 构建时复制进镜像的。

当前生产部署中，修改后需要：

```txt
1. 提交代码并 push 到 GitHub
2. GitHub Actions 重新构建 front 镜像
3. 服务器 pull 新 front 镜像并重启容器
```

不要只在服务器上改文件，因为生产环境使用的是 GHCR 镜像。

---

### 7. 修改 server/.env.docker 后为什么不生效？

环境变量在容器创建时注入，修改后需要重建容器：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d --force-recreate server
```

---

### 8. 修改 mysql/init/init.sql 后为什么不生效？

MySQL 初始化 SQL 只会在数据卷第一次创建时执行。

如果要重新执行，需要删除 volume：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml down -v
```

但这会清空数据库，谨慎使用。

---

### 9. docker compose 提示变量未设置

如果出现：

```txt
The "SERVER_PORT" variable is not set
The "MYSQL_USER" variable is not set
```

说明没有读取根目录 `.env.docker`。

正确命令：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d
```

不要漏掉：

```bash
--env-file ./.env.docker
```

---

### 10. 容器端口变成 32770 / 32771

如果看到：

```txt
127.0.0.1:32770->3000/tcp
127.0.0.1:32771->80/tcp
```

说明 `${SERVER_PORT}`、`${FRONT_PORT}` 没有被正确读取。

正常应该是：

```txt
127.0.0.1:3000->3000/tcp
127.0.0.1:8080->80/tcp
```

---

### 11. 浏览器访问 502 Bad Gateway

优先检查：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml ps
curl http://127.0.0.1:3000/api/health
curl -I http://127.0.0.1:8080
nginx -t
```

常见原因：

```txt
server/front 容器未启动
端口映射不正确
宿主机 Nginx 仍然指向旧 dist 目录
Nginx 没有反代到 127.0.0.1:8080
```

---

### 12. 页面没有更新

检查当前容器是否使用 GHCR 镜像：

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

确认前端容器镜像是：

```txt
ghcr.io/ggbond-l/fullstacktodo-front:latest
```

如果仍是旧的本地镜像：

```txt
fullstacktodo-front
```

说明还没有切换到 `docker-compose.prod.yml`。

也可以强制拉取并重启：

```bash
docker compose --env-file ./.env.docker -f docker-compose.prod.yml pull front
docker compose --env-file ./.env.docker -f docker-compose.prod.yml up -d front
```

浏览器侧也可以使用 `Ctrl + F5` 或无痕窗口排除缓存。

---

### 13. GitHub Actions SSH 失败

如果报：

```txt
ssh: handshake failed: EOF
```

可能原因：

```txt
服务器 SSH 偶发连接不稳定
服务器负载过高
安全组或防火墙限制
SSH timeout 太短
```

当前 workflow 已配置：

```yaml
timeout: 120s
command_timeout: 10m
```

如果频繁出现，可以优先检查服务器负载：

```bash
top
free -h
df -h
journalctl -u ssh -n 100 --no-pager
```

---

### 14. GitHub Actions 构建镜像成功，但服务器 pull 失败

如果 GHCR 镜像是 private，服务器需要先登录 GHCR。

当前学习阶段建议将 GHCR package 设置为 Public。

如果使用 private 镜像，需要在服务器执行：

```bash
docker login ghcr.io -u GGBOND-L
```

密码使用 GitHub Personal Access Token，并授予 `read:packages` 权限。

---

## 二十一、当前阶段结论

当前部署已经完成了一个小型全栈项目的自动化部署闭环：

```txt
本地开发
  ↓
push 到 GitHub main
  ↓
GitHub Actions 构建 front/server 镜像
  ↓
镜像推送到 GHCR
  ↓
阿里云服务器拉取最新镜像
  ↓
Docker Compose 重启容器
  ↓
宿主机 Nginx 统一代理
  ↓
公网访问 http://公网IP
```

这套结构的核心价值是：

```txt
1. 前端、后端、数据库职责分离
2. 宿主机 Nginx 统一公网入口
3. 前端和后端容器不直接暴露公网
4. 数据库只在 Docker 内部网络访问
5. Docker Compose 统一管理服务生命周期
6. GitHub Actions 自动构建和部署
7. GHCR 作为镜像仓库，服务器不再承担构建压力
```

当前方案相比旧的“服务器本地 build”更稳定，尤其适合低配云服务器。
