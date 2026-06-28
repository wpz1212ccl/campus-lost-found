const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const {
    adminLogin,
    getAllFoundItems,
    searchFoundItems,
    addFoundItem,
    updateFoundItem,
    updateClaimStatus,
    deleteFoundItem,
    getFoundItemStats
} = require('../controllers/founderController');

// 管理员登录
router.post('/admin/login', adminLogin);

// 失物信息相关路由
router.get('/items', getAllFoundItems);
router.get('/search', searchFoundItems);
router.post('/items', upload.single('item_photo'), addFoundItem);
router.put('/items/:item_id', upload.single('item_photo'), updateFoundItem);
router.put('/items/:item_id/claim', updateClaimStatus);
router.delete('/items/:item_id', deleteFoundItem);

// 获取失物数量统计
router.get('/stats', getFoundItemStats);

module.exports = router;
