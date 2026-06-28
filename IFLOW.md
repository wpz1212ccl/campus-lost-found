# 项目概述 (Project Overview)

这是一个基于 Node.js 和 Vue.js 的学校失物招领系统，包含前后端两部分。

## 技术栈 (Tech Stack)

### 后端 (Backend)
- **语言/框架**: Node.js with Express
- **数据库**: MySQL
- **其他依赖**: 
  - `mysql2` - MySQL 数据库驱动
  - `multer` - 处理文件上传
  - `cors` - 处理跨域请求
  - `dotenv` - 环境变量管理

### 前端 (Frontend)
- **语言/框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表库**: ECharts, Chart.js
- **CSS 框架**: Tailwind CSS

## 项目架构 (Architecture)

### 后端架构
```
minda/
├── app.js                 # 应用入口文件
├── package.json           # 项目依赖和脚本
├── src/
│   ├── config/            # 配置文件 (数据库连接)
│   ├── controllers/       # 控制器 (业务逻辑)
│   ├── middleware/        # 中间件 (错误处理, 文件上传)
│   ├── routes/            # 路由定义
│   └── utils/             # 工具函数
├── public/uploads/        # 上传文件存储目录
└── ...
```

### 前端架构
```
minda/frontend/
├── index.html             # 主页面
├── package.json           # 项目依赖和脚本
├── src/
│   ├── main.js            # 应用入口文件
│   ├── App.vue            # 根组件
│   ├── api/               # API 请求封装
│   ├── components/        # 公共组件
│   ├── config/            # 配置文件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理 (Pinia)
│   └── views/             # 页面视图
├── public/                # 静态资源
└── ...
```

## 核心功能 (Core Features)

1.  **失物信息发布与管理**: 用户可以发布失物信息，管理员可以在后台管理这些信息。
2.  **挂失信息发布与管理**: 用户可以发布挂失信息，管理员可以在后台管理这些信息。
3.  **搜索与筛选**: 支持按关键词、时间范围搜索失物和挂失信息。
4.  **文件上传**: 支持上传物品图片。
5.  **统计数据**: 实时统计失物和挂失物品的数量。
6.  **管理员功能**: 管理员登录、数据管理、查看统计数据。

# 构建和运行 (Building and Running)

## 后端

1.  **安装依赖**:
    ```bash
    cd minda
    npm install
    ```
2.  **配置数据库**:
    *   确保 MySQL 服务正在运行。
    *   在 `src/config/db.js` 中配置数据库连接信息。
    *   执行 `src/config/init.sql` 和 `src/config/admin_init.sql` 初始化数据库表。
3.  **运行**:
    *   开发模式: `npm run dev` (需要安装 nodemon)
    *   生产模式: `npm start`

## 前端

1.  **安装依赖**:
    ```bash
    cd minda/frontend
    npm install
    ```
2.  **运行**:
    *   开发模式: `npm run dev`
    *   构建生产版本: `npm run build`
    *   预览生产版本: `npm run preview`

# 开发约定 (Development Conventions)

## 后端

-   **代码风格**: 遵循 JavaScript 标准风格。
-   **路由**: 使用 RESTful 风格 API。
-   **控制器**: 控制器函数处理具体的业务逻辑，与数据库交互。
-   **错误处理**: 使用统一的错误处理中间件。
-   **数据库**: 使用 `mysql2` Promise API 进行数据库操作。

## 前端

-   **代码风格**: 遵循 Vue.js 官方风格指南。
-   **组件**: 使用 Vue 3 Composition API。
-   **状态管理**: 使用 Pinia 进行全局状态管理。
-   **API 调用**: 封装在 `src/api` 目录下。
-   **路由**: 使用 Vue Router 进行页面路由。
-   **UI**: 使用 Element Plus 组件库。