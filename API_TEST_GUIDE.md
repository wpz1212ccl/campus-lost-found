# 失物招领系统 API 测试文档

## 基础信息

- 基础URL：`http://localhost:3000`
- 所有需要上传图片的接口都使用 `multipart/form-data` 格式
- 响应格式：JSON

## 1. 管理员登录接口

### 请求信息

- 方法：POST
- URL：`/api/founder/admin/login`
- Content-Type: `application/json`

### 请求体

```json
{
    "username": "admin",
    "password": "123456"
}
```

### 预期响应

```json
{
    "success": true,
    "message": "登录成功"
}
```

## 2. 失物招领相关接口

### 2.1 获取所有失物信息

- 方法：GET
- URL：`/api/founder/items`
- 预期响应：返回所有失物信息列表

### 2.2 搜索失物信息

- 方法：GET
- URL：`/api/founder/search?keyword=关键词`
- 示例：`/api/founder/search?keyword=手机`
- 预期响应：返回匹配的失物信息列表

### 2.3 添加失物信息

- 方法：POST
- URL：`/api/founder/items`
- Content-Type: `multipart/form-data`

#### 表单字段

```
finder_name: 张三
finder_phone: 13800138000
item_name: iPhone手机
item_description: 一台黑色iPhone 14
found_location: 图书馆二楼
found_time: 2025-09-04 14:30:00
claim_location: 保卫处失物招领办公室
item_photo: [文件]
```

### 2.4 编辑失物信息

- 方法：PUT
- URL：`/api/founder/items/:item_id`
- Content-Type: `multipart/form-data`

#### 表单字段
```
finder_name: 张三
finder_phone: 13800138000
item_name: iPhone手机
item_description: 一台黑色iPhone 14
found_location: 图书馆二楼
found_time: 2025-09-04 14:30:00
claim_location: 保卫处失物招领办公室
item_photo: [文件]  // 可选，如果不更新图片则不需要上传
```

#### Postman 测试步骤
1. 打开 Postman，创建新的请求
2. 选择 PUT 方法
3. 输入URL：`http://localhost:3000/api/founder/items/1`（将1替换为实际的item_id）
4. 选择 Body 标签页
5. 选择 form-data
6. 添加所有需要更新的字段：
   - Key: finder_name，Value: 新的寻物者姓名
   - Key: finder_phone，Value: 新的联系电话
   - Key: item_name，Value: 新的物品名称
   - Key: item_description，Value: 新的物品描述
   - Key: found_location，Value: 新的拾取地点
   - Key: found_time，Value: 新的拾取时间
   - Key: claim_location，Value: 新的认领地点
   - Key: item_photo，Type: File，Value: 选择新的图片文件（如果需要更新图片）
7. 点击 Send 发送请求

#### 调试技巧
1. 在发送请求前，先用GET接口获取现有数据，确保item_id正确
2. 观察服务器控制台输出的详细日志
3. 检查响应状态码和响应内容
4. 常见问题排查：
   - 400错误：检查是否缺少必填字段
   - 404错误：检查item_id是否存在
   - 500错误：检查服务器控制台的错误日志

#### 预期响应
成功情况：
```json
{
    "message": "更新成功",
    "data": {
        "item_id": "1",
        "finder_name": "新的寻物者姓名",
        "finder_phone": "新的联系电话",
        "item_name": "新的物品名称",
        "item_description": "新的物品描述",
        "found_location": "新的拾取地点",
        "found_time": "2025-09-04 15:30:00",
        "claim_location": "新的认领地点",
        "item_photo": "/uploads/新图片文件名"
    }
}
```

### 2.5 更新物品认领状态

- 方法：PUT
- URL：`/api/founder/items/:item_id/claim`
- Content-Type: `application/json`

#### 请求体

```json
{
    "claim_status": "claimed"
}
```

### 2.5 删除失物信息

- 方法：DELETE
- URL：`/api/founder/items/:item_id`

## 3. 挂失信息相关接口

### 3.1 获取所有挂失信息

- 方法：GET
- URL：`/api/loster/items`
- 预期响应：返回所有挂失信息列表

### 3.2 搜索挂失信息

- 方法：GET
- URL：`/api/loster/search?keyword=关键词`
- 示例：`/api/loster/search?keyword=钱包`
- 预期响应：返回匹配的挂失信息列表

### 3.3 添加挂失信息

- 方法：POST
- URL：`/api/loster/items`
- Content-Type: `multipart/form-data`

#### 表单字段

```
owner_name: 李四
owner_phone: 13900139000
item_name: 钱包
item_description: 棕色真皮钱包，内有学生证
item_photo: [文件]
```

### 3.4 删除挂失信息

- 方法：DELETE
- URL：`/api/loster/items/:loster_id`

## 测试步骤建议

1. 首先测试管理员登录接口，确保能够正常登录。
2. 测试失物招领功能：

   - 添加一条失物信息（包含图片）
   - 获取所有失物信息，确认新增的信息存在
   - 使用关键词搜索刚添加的信息
   - 更新该物品的认领状态
   - 最后测试删除功能
3. 测试挂失功能：

   - 添加一条挂失信息（包含图片）
   - 获取所有挂失信息，确认新增的信息存在
   - 使用关键词搜索刚添加的信息
   - 测试删除功能

## 使用 Postman 测试的示例请求

### 添加失物信息的 Postman 设置：

1. 选择 POST 方法
2. 输入 URL：`http://localhost:3000/api/founder/items`
3. 选择 Body 标签页
4. 选择 form-data
5. 添加字段：
   - finder_name (Text)
   - finder_phone (Text)
   - item_name (Text)
   - item_description (Text)
   - found_location (Text)
   - found_time (Text)
   - claim_location (Text)
   - item_photo (File) - 选择一个图片文件

### 图片上传注意事项：

1. 确保图片大小不超过 5MB
2. 只支持图片格式（jpg, png, gif 等）
3. 上传成功后可以通过 `/uploads/文件名` 访问图片

## 错误处理测试

建议测试以下错误情况：

1. 使用错误的管理员密码登录
2. 上传超过 5MB 的图片文件
3. 上传非图片类型的文件
4. 使用不存在的 ID 进行更新或删除操作
5. 提交表单时缺少必要字段

## 启动服务器

```bash
cd d:\code\projects\school-found-lost\minda
npm run dev
```

服务器将在 http://localhost:3000 启动
