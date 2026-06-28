const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 管理员登录路由
router.post('/login', adminController.adminLogin);

// 添加管理员路由（可以根据需要限制访问）
router.post('/register', adminController.addAdmin);

// 获取管理员列表
router.get('/list', adminController.getAdmins);

// 删除管理员
router.delete('/delete/:adminId', adminController.deleteAdmin);

module.exports = router;
