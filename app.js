const express = require('express');
const cors = require('cors');
const path = require('path');
const founderRoutes = require('./src/routes/founderRoutes');
const losterRoutes = require('./src/routes/losterRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 路由
app.use('/api/founder', founderRoutes);
app.use('/api/loster', losterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);

// 错误处理中间件
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
