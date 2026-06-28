const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const {
    getAllLostItems,
    searchLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem,
    getLostItemStats
} = require('../controllers/losterController');

// 挂失信息相关路由
router.get('/items', getAllLostItems);
router.get('/search', searchLostItems);
router.post('/items', upload.single('item_photo'), addLostItem);
router.put('/items/:loster_id', upload.single('item_photo'), updateLostItem);
router.delete('/items/:loster_id', deleteLostItem);

// 获取挂失物品数量统计
router.get('/stats', getLostItemStats);

module.exports = router;
