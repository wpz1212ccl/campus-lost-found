const db = require('./src/config/db');

(async () => {
  try {
    // 添加字段
    await db.query('ALTER TABLE loster ADD COLUMN lost_location VARCHAR(100) AFTER item_photo');
    console.log('字段添加成功');
    
    // 为现有数据随机分配丢失地点
    const locations = ['校友楼', '学友楼', '文综楼'];
    const [rows] = await db.query('SELECT loster_id FROM loster');
    
    for (const row of rows) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      await db.query('UPDATE loster SET lost_location = ? WHERE loster_id = ?', [location, row.loster_id]);
    }
    
    console.log('数据更新成功');
  } catch (error) {
    console.error('操作失败:', error.message);
  } finally {
    process.exit();
  }
})();