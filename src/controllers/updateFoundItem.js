const db = require('../config/db');
const errorLogger = require('../middleware/errorLogger');

// 更新失物信息的详细日志记录函数
const logUpdateOperation = (operation, data) => {
    console.log(`\n=== ${operation} ===`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`=== ${operation} 结束 ===\n`);
};

// 更新失物信息
const updateFoundItem = async (req, res) => {
    try {
        // 详细的请求数据日志
        console.log('接收到的请求数据：', {
            body: req.body,
            file: req.file,
            params: req.params,
            headers: req.headers['content-type']
        });

        logUpdateOperation('开始处理更新请求', {
            time: new Date().toISOString(),
            params: req.params,
            body: req.body,
            file: req.file
        });

        const { item_id } = req.params;
        if (!item_id) {
            const error = new Error('缺少物品ID');
            error.status = 400;
            throw error;
        }

        const {
            finder_name,
            finder_phone,
            item_name,
            item_description,
            found_location,
            found_time,
            claim_location,
            item_photo
        } = req.body;

        // 验证必填字段
        const requiredFields = {
            finder_name,
            finder_phone,
            item_name,
            found_location,
            found_time,
            claim_location
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            logUpdateOperation('缺少必填字段', { missingFields });
            return res.status(400).json({
                message: '缺少必填字段',
                missingFields
            });
        }

        // 格式化日期
        let formattedFoundTime;
        try {
            formattedFoundTime = new Date(found_time).toISOString().slice(0, 19).replace('T', ' ');
            logUpdateOperation('日期格式化', {
                original: found_time,
                formatted: formattedFoundTime
            });
        } catch (error) {
            logUpdateOperation('日期格式化失败', {
                error: error.message,
                invalidDate: found_time
            });
            return res.status(400).json({
                message: '日期格式无效',
                error: error.message
            });
        }

        // 处理图片路径
        const photo = req.file ? `/uploads/${req.file.filename}` : item_photo;
        logUpdateOperation('图片路径处理', {
            originalPhoto: item_photo,
            newPhoto: photo,
            hasNewFile: !!req.file
        });

        // 执行更新操作
        const updateQuery = `
            UPDATE founder SET 
            finder_name = ?,
            finder_phone = ?,
            item_name = ?,
            item_description = ?,
            found_location = ?,
            found_time = ?,
            claim_location = ?,
            item_photo = ?
            WHERE item_id = ?
        `;

        const updateValues = [
            finder_name,
            finder_phone,
            item_name,
            item_description,
            found_location,
            formattedFoundTime,
            claim_location,
            photo,
            item_id
        ];

        logUpdateOperation('执行SQL更新', {
            query: updateQuery,
            values: updateValues
        });

        const [result] = await db.query(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            logUpdateOperation('更新失败', { reason: '未找到记录', item_id });
            return res.status(404).json({ message: '未找到要更新的记录' });
        }

        // 获取更新后的记录
        const [updatedRecord] = await db.query(
            'SELECT * FROM founder WHERE item_id = ?',
            [item_id]
        );

        logUpdateOperation('更新成功', {
            affectedRows: result.affectedRows,
            updatedRecord: updatedRecord[0]
        });

        res.json({
            message: '更新成功',
            data: updatedRecord[0]
        });
    } catch (error) {
        logUpdateOperation('更新操作失败', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                sql: error.sql,
                code: error.code
            }
        });

        errorLogger(error, req);

        res.status(500).json({
            message: '更新失物信息失败',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
