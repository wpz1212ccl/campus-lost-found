<template>
  <el-container class="app-wrapper">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="side-menu">
      <div class="menu-header">
        <img src="/logo.png" alt="Logo" class="logo">
      </div>
      <el-menu
        class="side-menu-list"
        :router="true"
        :default-active="$route.path"
      >
        <el-menu-item index="/" class="menu-item">
          <el-icon><HomeFilled /></el-icon>
          <span>失物招领</span>
        </el-menu-item>
        <el-menu-item index="/lost-notices" class="menu-item">
          <el-icon><Bell /></el-icon>
          <span>挂失公告</span>
        </el-menu-item>
        <el-menu-item index="/found-items" class="menu-item">
          <el-icon><Box /></el-icon>
          <span>失物招领仓库</span>
        </el-menu-item>
        <el-menu-item index="/admin" class="menu-item">
          <el-icon><Setting /></el-icon>
          <span>管理员入口</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <!-- 顶部标题栏 -->
      <el-header class="main-header">
        <h1 class="site-title">民大失物招领</h1>
      </el-header>
      
      <!-- 主要内容区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { HomeFilled, Bell, Box, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from './store/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const authStore = useAuthStore()

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    authStore.logout()
    ElMessage.success('已退出登录')
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}
</script>

<style>
/* 全局背景样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-image: url('/uploads/mindalogo/mindalogo.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* 全局布局样式 */
.app-wrapper {
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.3); /* 降低主容器背景透明度，让背景图片更明显 */
}

/* 侧边栏样式 */
.side-menu {
  background: linear-gradient(180deg, #1a237e 0%, #303f9f 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.menu-header {
  padding: 20px;
  text-align: center;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
  background: white;
  padding: 5px;
}

/* 菜单项样式 */
.side-menu-list {
  border: none;
  background: transparent !important;
}

.menu-item {
  height: 56px;
  line-height: 56px;
  margin: 8px 0;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  transform: translateX(5px);
}

.menu-item.is-active {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
  font-weight: bold;
}

.el-menu-item [class^="el-icon"] {
  color: inherit;
  font-size: 1.2em;
  margin-right: 12px;
}

/* 主内容区样式 */
.main-container {
  margin-left: 240px;
  background: rgba(245, 247, 250, 0.7);
}

/* 顶部标题栏样式 */
.main-header {
  background: white;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px !important;
  padding: 0;
}

/* 标题动效样式 */
.site-title {
  font-size: 2.5em;
  margin: 0;
  background: linear-gradient(45deg, #1a237e, #7c4dff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: floatUpDown 2.5s ease-in-out infinite;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
}

@keyframes floatUpDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* 主内容区样式 */
.el-main {
  padding: 20px;
  background: rgba(245, 247, 250, 0.7);
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
}

.table-actions {
  margin-bottom: 20px;
}

/* Element Plus 组件样式优化 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  margin: 4px 16px;
  border-radius: 8px;
  width: calc(100% - 32px);
}
</style>
