# Fullstack Todo

一个用于学习前后端全栈开发与服务器部署的 Todo 项目。

项目包含：

* 前端：React + Vite + TypeScript
* 后端：Node.js + Express
* 数据库：MySQL
* 部署：Docker Compose + 宿主机 Nginx

当前部署方案采用：

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

公网只暴露 `80` 端口，`8080`、`3000`、`3306/3307` 不直接暴露给公网。

---

## 一、项目目录结构

```txt
fullstackTodo/
  docker-compose.yml
  .env.docker.example
  .gitignore
  README.md

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

### 部署

* Docker
* Docker Compose v2
* Nginx
* MySQL 8.0
* Ubuntu Server

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

### 1. 根目录 `.env.docker`

用于 Docker Compose 读取 MySQL 初始化配置。

示例文件：`.env.docker.example`

```env
MYSQL_ROOT_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=fullstacktodo
MYSQL_USER=fullstacktodo_user
MYSQL_PASSWORD=your_mysql_password
```

服务器上需要复制一份真实文件：

```bash
cp .env.docker.example .env.docker
```

然后修改真实密码。

### 2. 后端 `server/.env.docker`

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

## 七、Docker Compose 部署

项目根目录的 `docker-compose.yml`：

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
    build:
      context: ./server
    container_name: fullstacktodo-server
    restart: unless-stopped
    depends_on:
      - mysql
    env_file:
      - ./server/.env.docker
    ports:
      - "127.0.0.1:3000:3000"

  front:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fullstacktodo-front
    restart: unless-stopped
    depends_on:
      - server
    ports:
      - "127.0.0.1:8080:80"

volumes:
  mysql_data:
```

启动：

```bash
docker compose --env-file .env.docker up -d --build
```

查看容器：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f
```

停止：

```bash
docker compose down
```

注意不要随便执行：

```bash
docker compose down -v
```

因为 `-v` 会删除 MySQL 数据卷，数据库数据会丢失。

---

## 八、前端 Dockerfile

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

生产环境前端不是用 `npm run dev` 运行，而是由 Nginx 返回打包后的静态文件。

---

## 九、前端容器 Nginx 配置

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

## 十、后端 Dockerfile

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

如果项目必须使用 Node 20，也可以改成：

```dockerfile
FROM node:20-alpine
```

但建议前后端 Node 版本尽量统一。

---

## 十一、宿主机 Nginx 配置

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

---

## 十二、部署流程

### 1. 本地开发并提交

```bash
git status
git add .
git commit -m "feat: update project"
git push origin main
```

### 2. 服务器拉取代码

```bash
ssh root@服务器公网IP
cd /www/fullstackTodo
git pull origin main
```

### 3. 启动或更新容器

```bash
docker compose --env-file .env.docker up -d --build
```

### 4. 检查状态

```bash
docker compose ps
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

## 十三、安全组配置

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

## 十四、常用命令

### Docker

```bash
docker compose --env-file .env.docker up -d --build
docker compose ps
docker compose logs -f
docker logs -f fullstacktodo-server
docker logs -f fullstacktodo-front
docker logs -f fullstacktodo-mysql
docker compose down
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

## 十五、测试方式

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

## 十六、Git 忽略规则

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

## 十七、常见问题

### 1. 为什么公网 IP 和公网 IP:8080 都能访问前端？

说明有两个入口同时存在：

```txt
公网IP:80   → 宿主机 Nginx
公网IP:8080 → front 容器 Nginx
```

当前方案中，`8080` 不应该对公网开放，front 应该写成：

```yaml
ports:
  - "127.0.0.1:8080:80"
```

这样公网不能直接访问 `8080`。

---

### 2. 为什么后端docker-compose ports 写 127.0.0.1:3000:3000？

因为后端只需要给宿主机 Nginx 访问，不应该直接暴露公网。

```yaml
ports:
  - "127.0.0.1:3000:3000"
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

因为 `frontend/nginx.conf` 是在 Dockerfile 构建时复制进镜像的。

修改后需要重新 build front：

```bash
docker compose --env-file .env.docker up -d --build front
```

---

### 7. 修改 server/.env.docker 后为什么不生效？

环境变量在容器创建时注入，修改后需要重建容器：

```bash
docker compose --env-file .env.docker up -d --force-recreate server
```

---

### 8. 修改 mysql/init/init.sql 后为什么不生效？

MySQL 初始化 SQL 只会在数据卷第一次创建时执行。

如果要重新执行，需要删除 volume：

```bash
docker compose down -v
```

但这会清空数据库，谨慎使用。

---

## 十八、当前阶段结论

当前部署已经完成了一个小型全栈项目的容器化部署闭环：

```txt
本地开发
  ↓
push 到 GitHub
  ↓
服务器 git pull
  ↓
Docker Compose 构建 front/server/mysql
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
```

下一步可以继续学习：

```txt
1. MySQL 数据备份与恢复
2. GitHub Actions 自动部署
3. Docker 镜像仓库发布流程
4. HTTPS 与域名部署
5. 生产环境安全加固
```
