const errorLogger = require('./errorLogger');

const errorHandler = (err, req, res, next) => {
    // 使用错误日志记录器
    errorLogger(err, req);

    // 详细的错误信息
    const errorDetails = {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code,
        detail: err.detail
    };

    // 根据不同的错误类型返回不同的状态码
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: '数据验证失败',
            errors: errorDetails
        });
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            message: '数据已存在',
            errors: errorDetails
        });
    }

    // 默认返回500错误
    res.status(500).json({
        message: '服务器内部错误',
        errors: errorDetails
    });
};

module.exports = errorHandler;
