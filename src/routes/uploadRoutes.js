const express = require('express');
const router = express.Router();
const upload = require('../config/upload');

// 处理单个文件上传
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有选择文件' });
        }

        // 返回文件URL
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            code: 200,
            message: '文件上传成功',
            data: {
                url: fileUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: '文件上传失败',
            error: error.message
        });
    }
});

module.exports = router;
