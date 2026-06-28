const db = require('../config/db');
const crypto = require('crypto');

// 生成密码哈希
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// 验证密码
const verifyPassword = (password, storedHash) => {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

// 管理员登录
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证请求体
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
        }

        // 查询数据库
        const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);

        // 检查用户是否存在
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const admin = rows[0];
        let passwordMatch = false;
        let needsPasswordUpdate = false;

        // 检查密码是否是哈希格式
        if (admin.password.includes(':')) {
            // 使用哈希验证
            passwordMatch = verifyPassword(password, admin.password);
        } else {
            // 兼容性处理：直接比较明文密码
            passwordMatch = (password === admin.password);
            needsPasswordUpdate = true; // 标记需要更新密码为哈希格式
        }

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 返回不包含密码的完整管理员信息
        const { password: _, ...adminInfo } = admin;
        adminInfo.needsPasswordUpdate = needsPasswordUpdate;

        // 登录成功
        res.json({
            success: true,
            message: '登录成功',
            data: adminInfo
        });
    } catch (error) {
        console.error('登录失败：', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

// 随机选择头像
const getRandomAvatar = () => {
    const avatars = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png'];
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return `/uploads/admin_avatar/${avatars[randomIndex]}`;
};

// 添加管理员
const addAdmin = async (req, res) => {
    try {
        const { username, password, admin_phone } = req.body;

        // 验证请求体
        if (!username || !password || !admin_phone) {
            return res.status(400).json({
                success: false,
                message: '用户名、密码和电话不能为空'
            });
        }

        // 检查用户名是否已存在
        const [existing] = await db.query(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '用户名已存在'
            });
        }

        // 加密密码
        const hashedPassword = hashPassword(password);
        
        // 随机选择头像
        const admin_avatar = getRandomAvatar();

        // 插入新管理员
        await db.query(
            'INSERT INTO admin (username, password, admin_phone, admin_avatar) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, admin_phone, admin_avatar]
        );

        res.json({
            success: true,
            message: '管理员添加成功'
        });
    } catch (error) {
        console.error('添加管理员失败：', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 获取管理员列表
const getAdmins = async (req, res) => {
    try {
        // 查询所有管理员，但不返回密码
        const [rows] = await db.query(
            'SELECT admin_id, username, admin_phone, admin_avatar, created_at FROM admin ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('获取管理员列表失败：', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

// 删除管理员
const deleteAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        
        // 检查管理员是否存在
        const [existing] = await db.query(
            'SELECT * FROM admin WHERE admin_id = ?',
            [adminId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: '管理员不存在'
            });
        }
        
        // 不允许删除最后一个管理员
        const [allAdmins] = await db.query('SELECT COUNT(*) as count FROM admin');
        if (allAdmins[0].count <= 1) {
            return res.status(400).json({
                success: false,
                message: '至少保留一个管理员账号'
            });
        }
        
        // 删除管理员
        await db.query('DELETE FROM admin WHERE admin_id = ?', [adminId]);
        
        res.json({
            success: true,
            message: '管理员删除成功'
        });
    } catch (error) {
        console.error('删除管理员失败：', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

module.exports = {
    adminLogin,
    addAdmin,
    getAdmins,
    deleteAdmin
};
