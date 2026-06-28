const errorLogger = (error, req) => {
    console.log('\n=== 错误详情 ===');
    console.log('时间:', new Date().toISOString());
    console.log('请求方法:', req.method);
    console.log('请求URL:', req.originalUrl);
    console.log('请求参数:', {
        params: req.params,
        query: req.query,
        body: req.body
    });
    console.log('错误名称:', error.name);
    console.log('错误消息:', error.message);
    console.log('错误堆栈:', error.stack);
    if (error.sql) {
        console.log('SQL语句:', error.sql);
        console.log('SQL错误码:', error.code);
    }
    console.log('=== 错误详情结束 ===\n');
};

module.exports = errorLogger;
