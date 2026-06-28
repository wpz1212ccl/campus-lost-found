CREATE DATABASE IF NOT EXISTS minda;

USE minda;

CREATE TABLE IF NOT EXISTS founder (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    finder_name VARCHAR(50) NOT NULL,
    finder_phone VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    item_photo VARCHAR(255),
    found_location VARCHAR(100) NOT NULL,
    found_time DATETIME NOT NULL,
    claim_location VARCHAR(100) NOT NULL,
    claim_status ENUM('unclaimed', 'claimed') DEFAULT 'unclaimed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loster (
    loster_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(50) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    item_photo VARCHAR(255),
    report_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加admin表字段（用于已有表结构的更新）
