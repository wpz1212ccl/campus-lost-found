const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// 获取所有挂失信息
const getAllLostItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM loster ORDER BY report_time DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '获取挂失信息失败', error: error.message });
    }
};

// 搜索挂失信息
const searchLostItems = async (req, res) => {
    const { keyword, startDate, endDate } = req.query;
    try {
        // 构建SQL查询语句和参数数组
        let sql = 'SELECT * FROM loster WHERE 1=1';
        const params = [];
        
        // 添加关键词搜索条件
        if (keyword) {
            sql += ' AND (item_name LIKE ? OR item_description LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        
        // 添加开始时间筛选
        if (startDate) {
            sql += ' AND report_time >= ?';
            params.push(`${startDate} 00:00:00`);
        }
        
        // 添加结束时间筛选
        if (endDate) {
            sql += ' AND report_time <= ?';
            params.push(`${endDate} 23:59:59`);
        }
        
        // 添加排序
        sql += ' ORDER BY report_time DESC';
        
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '搜索挂失信息失败', error: error.message });
    }
};

// 添加挂失信息
const addLostItem = async (req, res) => {
    const {
        owner_name,
        owner_phone,
        item_name,
        item_description,
        lost_location,
        item_photo: body_item_photo
    } = req.body;

    // 处理文件上传 - 优先使用文件上传的路径，否则使用前端提供的路径字符串
    const item_photo = req.file ? `/uploads/${req.file.filename}` : body_item_photo;

    try {
        const [result] = await db.query(
            `INSERT INTO loster 
            (owner_name, owner_phone, item_name, item_description, item_photo, lost_location) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [owner_name, owner_phone, item_name, item_description, item_photo || null, lost_location || '']
        );
        res.json({ message: '添加成功', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: '添加挂失信息失败', error: error.message });
    }
};

// 删除挂失信息
const deleteLostItem = async (req, res) => {
    const { loster_id } = req.params;

    try {
        // 先获取挂失信息，包括图片路径
        const [rows] = await db.query('SELECT item_photo FROM loster WHERE loster_id = ?', [loster_id]);
        if (rows.length > 0) {
            const itemPhoto = rows[0].item_photo;
            
            // 如果有图片路径，尝试删除图片文件
            if (itemPhoto && itemPhoto.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), 'public', itemPhoto.substring(1)); // 去掉开头的斜杠
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`成功删除图片文件: ${filePath}`);
                    }
                } catch (fileError) {
                    console.error(`删除图片文件失败: ${fileError.message}`);
                    // 继续执行，不阻止数据库记录的删除
                }
            }
        }
        
        // 删除数据库记录
        await db.query('DELETE FROM loster WHERE loster_id = ?', [loster_id]);
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除挂失信息失败', error: error.message });
    }
};

// 更新挂失信息
const updateLostItem = async (req, res) => {
    const { loster_id } = req.params;
    const {
        owner_name,
        owner_phone,
        item_name,
        item_description,
        lost_location,
        item_photo
    } = req.body;

    try {
        // 如果有新上传的文件，使用新的文件路径
        const photo = req.file ? `/uploads/${req.file.filename}` : item_photo;

        await db.query(
            `UPDATE loster SET 
            owner_name = ?,
            owner_phone = ?,
            item_name = ?,
            item_description = ?,
            item_photo = ?,
            lost_location = ?
            WHERE loster_id = ?`,
            [owner_name, owner_phone, item_name, item_description, photo, lost_location || '', loster_id]
        );
        res.json({ message: '更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新挂失信息失败', error: error.message });
    }
};

// 获取挂失物品数量统计
const getLostItemStats = async (req, res) => {
    try {
        // 获取挂失物品总数
        const [totalResult] = await db.query('SELECT COUNT(*) as total FROM loster');
        
        res.json({
            total: totalResult[0].total
        });
    } catch (error) {
        res.status(500).json({ message: '获取挂失物品数量统计失败', error: error.message });
    }
};

module.exports = {
    getAllLostItems,
    searchLostItems,
    addLostItem,
    updateLostItem,
    deleteLostItem,
    getLostItemStats
};
