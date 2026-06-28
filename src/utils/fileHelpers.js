const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const ensureUploadDir = () => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

// 格式化文件URL
const formatFileUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/${filename}`;
};

// 处理上传的图片
const processUploadedFile = (req) => {
    if (!req.file) return null;
    const fileUrl = formatFileUrl(req.file.filename);
    console.log('处理上传文件:', {
        originalName: req.file.originalname,
        filename: req.file.filename,
        fileUrl
    });
    return fileUrl;
};

module.exports = {
    ensureUploadDir,
    formatFileUrl,
    processUploadedFile
};
