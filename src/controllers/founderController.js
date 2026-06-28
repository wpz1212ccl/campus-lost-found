const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// 管理员登录验证
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '123456') {
        res.json({ success: true, message: '登录成功' });
    } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
};

// 获取所有失物信息
const getAllFoundItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM founder ORDER BY found_time DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '获取失物信息失败', error: error.message });
    }
};

// 搜索失物信息
const searchFoundItems = async (req, res) => {
    const { keyword, startDate, endDate } = req.query;
    try {
        // 构建SQL查询语句和参数数组
        let sql = 'SELECT * FROM founder WHERE 1=1';
        const params = [];
        
        // 添加关键词搜索条件
        if (keyword) {
            sql += ' AND (item_name LIKE ? OR item_description LIKE ? OR found_location LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        }
        
        // 添加开始时间筛选
        if (startDate) {
            sql += ' AND found_time >= ?';
            params.push(`${startDate} 00:00:00`);
        }
        
        // 添加结束时间筛选
        if (endDate) {
            sql += ' AND found_time <= ?';
            params.push(`${endDate} 23:59:59`);
        }
        
        // 添加排序
        sql += ' ORDER BY found_time DESC';
        
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '搜索失物信息失败', error: error.message });
    }
};

// 添加失物信息
const addFoundItem = async (req, res) => {
    const {
        finder_name,
        finder_phone,
        item_name,
        item_description,
        found_location,
        found_time,
        claim_location,
        item_photo: body_item_photo
    } = req.body;

    // 处理文件上传 - 优先使用文件上传的路径，否则使用前端提供的路径字符串
    const item_photo = req.file ? `/uploads/${req.file.filename}` : body_item_photo;

    try {
        // 格式化日期
        const formattedFoundTime = new Date(found_time).toISOString().slice(0, 19).replace('T', ' ');

        const [result] = await db.query(
            `INSERT INTO founder 
            (finder_name, finder_phone, item_name, item_description, item_photo, 
             found_location, found_time, claim_location) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [finder_name, finder_phone, item_name, item_description, item_photo || null,
                found_location, formattedFoundTime, claim_location]
        );
        res.json({ message: '添加成功', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: '添加失物信息失败', error: error.message });
    }
};

// 更新失物认领状态
const updateClaimStatus = async (req, res) => {
    const { item_id } = req.params;
    const { claim_status } = req.body;

    try {
        await db.query(
            'UPDATE founder SET claim_status = ? WHERE item_id = ?',
            [claim_status, item_id]
        );
        res.json({ message: '更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新认领状态失败', error: error.message });
    }
};

// 删除失物信息
const deleteFoundItem = async (req, res) => {
    const { item_id } = req.params;

    try {
        // 先获取失物信息，包括图片路径
        const [rows] = await db.query('SELECT item_photo FROM founder WHERE item_id = ?', [item_id]);
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
        await db.query('DELETE FROM founder WHERE item_id = ?', [item_id]);
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失物信息失败', error: error.message });
    }
};

// 更新失物信息
const updateFoundItem = async (req, res) => {
    const { item_id } = req.params;
    const {
        finder_name,
        finder_phone,
        item_name,
        item_description,
        found_location,
        found_time, // 前端传递的原始时间
        claim_location,
        item_photo
    } = req.body;

    try {
        // 1. 新增：对 found_time 进行格式转换（与 addFoundItem 保持一致）
        const formattedFoundTime = new Date(found_time).toISOString().slice(0, 19).replace('T', ' ');

        // 2. 处理文件上传
        const photo = req.file ? `/uploads/${req.file.filename}` : item_photo;

        // 3. SQL 语句中使用转换后的时间
        await db.query(
            `UPDATE founder SET 
            finder_name = ?,
            finder_phone = ?,
            item_name = ?,
            item_description = ?,
            item_photo = ?,
            found_location = ?,
            found_time = ?,
            claim_location = ?
            WHERE item_id = ?`,
            [finder_name, finder_phone, item_name, item_description, photo,
                found_location, formattedFoundTime, claim_location, item_id] // 替换为 formattedFoundTime
        );
        res.json({ message: '更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新失物信息失败', error: error.message });
    }
};

// 获取失物数量统计
const getFoundItemStats = async (req, res) => {
    try {
        // 获取失物总数
        const [totalResult] = await db.query('SELECT COUNT(*) as total FROM founder');
        // 获取已认领数量
        const [claimedResult] = await db.query('SELECT COUNT(*) as claimed FROM founder WHERE claim_status = ?', ['claimed']);
        // 获取未认领数量
        const [unclaimedResult] = await db.query('SELECT COUNT(*) as unclaimed FROM founder WHERE claim_status = ?', ['unclaimed']);
        
        res.json({
            total: totalResult[0].total,
            claimed: claimedResult[0].claimed,
            unclaimed: unclaimedResult[0].unclaimed
        });
    } catch (error) {
        res.status(500).json({ message: '获取失物数量统计失败', error: error.message });
    }
};

module.exports = {
    adminLogin,
    getAllFoundItems,
    searchFoundItems,
    addFoundItem,
    updateFoundItem,
    updateClaimStatus,
    deleteFoundItem,
    getFoundItemStats
};
