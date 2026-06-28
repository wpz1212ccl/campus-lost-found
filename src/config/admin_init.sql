-- 在 init.sql 中添加管理员账号
-- 密码需要通过 API 接口添加，因为需要进行加密
INSERT INTO
    admin (username, password)
VALUES ('admin', 'temporary_password');

-- 注意：实际使用时应该通过管理员添加接口来创建账号，这样密码才会被正确加密