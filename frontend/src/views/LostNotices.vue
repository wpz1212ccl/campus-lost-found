<template>
  <div class="lost-notices">
    <h1>挂失公告</h1>
    
    <!-- 数量统计令牌 -->
    <div class="stats-tokens">
      <div class="stat-token">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总挂失数量</div>
      </div>
    </div>
    
    <div class="action-bar">
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索物品名称/描述..."
          clearable
          @input="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleSearch"
          class="date-range-picker"
        />
      </div>
    </div>

    <!-- 搜索结果为空时的提示 -->
    <div v-if="isSearching && notices.length === 0" class="no-results">
      <p>没有该物品哟.......</p>
    </div>

    <el-row v-else :gutter="20" class="notices-grid">
      <el-col 
        v-for="notice in notices" 
        :key="notice.loster_id" 
        :xs="24" 
        :sm="12" 
        :md="8"
        style="margin-bottom: 10px;"
      >
        <el-card class="fixed-card">
          <div class="image-container">
            <img 
              v-if="notice.item_photo" 
              :src="getImageUrl(notice.item_photo)" 
              class="item-image"
              @click="showImagePreview([notice.item_photo])"
              style="cursor: pointer"
              :alt="notice.item_name"
            >
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
            </div>
          </div>
          <div class="notice-info">
            <h3>{{ notice.item_name }}</h3>
            <p class="description">{{ notice.item_description }}</p>
            <p><strong>失主：</strong>{{ notice.owner_name }}</p>
            <p><strong>联系方式：</strong>{{ notice.owner_phone }}</p>
            <p><strong>丢失地点：</strong>{{ notice.lost_location }}</p>
            <p><strong>发布时间：</strong>{{ formatDate(notice.report_time) }}</p>
            <p><strong>下架时间：</strong>{{ formatDate(getExpirationDate(notice.report_time)) }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="90%"
      height="90%"
      :show-close="true"
    >
      <el-image-viewer
        v-if="previewVisible"
        :url-list="previewImages"
        @close="closeImagePreview"
        :z-index="2000"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElImageViewer } from 'element-plus'
import api from '../api'
import { getImageUrl } from '../config/urls'

const notices = ref([])
const searchKeyword = ref('')
const previewVisible = ref(false)
const previewImages = ref([])
const dateRange = ref([])
const isSearching = ref(false)
const stats = ref({ total: 0 })

// 检查物品是否已超过一个月的函数
const isItemExpired = (reportTime) => {
  const reportDate = new Date(reportTime)
  const now = new Date()
  const diffMs = now - reportDate
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 30
}

// 计算下架时间的函数
const getExpirationDate = (reportTime) => {
  const reportDate = new Date(reportTime)
  const expirationDate = new Date(reportDate)
  expirationDate.setMonth(expirationDate.getMonth() + 1)
  return expirationDate
}

const loadNotices = async () => {
  try {
    const response = await api.get('/loster/items')
    // 按发布时间降序排序，最新的排在前面
    const sortedItems = response.sort((a, b) => new Date(b.report_time) - new Date(a.report_time))
    // 过滤掉已超过一个月的物品
    notices.value = sortedItems.filter(item => !isItemExpired(item.report_time))
  } catch (error) {
    console.error('加载挂失信息失败：', error)
    ElMessage.error('加载挂失信息失败')
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/loster/stats')
    stats.value = response
  } catch (error) {
    console.error('加载挂失统计信息失败：', error)
  }
}

const handleSearch = async () => {
  try {
    // 设置搜索状态为true
    isSearching.value = true
    
    // 构建查询参数
    const params = new URLSearchParams()
    if (searchKeyword.value) {
      params.append('keyword', searchKeyword.value)
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.append('startDate', dateRange.value[0])
      params.append('endDate', dateRange.value[1])
    }
    
    // 发送搜索请求
    const response = await api.get(`/loster/search?${params.toString()}`)
    // 按发布时间降序排序，最新的排在前面
    const sortedItems = response.sort((a, b) => new Date(b.report_time) - new Date(a.report_time))
    // 过滤掉已超过一个月的物品
    notices.value = sortedItems.filter(item => !isItemExpired(item.report_time))
  } catch (error) {
    console.error('搜索失败：', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const showImagePreview = (images) => {
  // 将相对路径转换为完整URL
  previewImages.value = images.map(img => getImageUrl(img))
  previewVisible.value = true
}

const closeImagePreview = () => {
  previewVisible.value = false
}

onMounted(() => {
  loadNotices()
  loadStats()
})
</script>

<style scoped>
.lost-notices {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.action-bar {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.date-range-picker {
  width: 280px;
}

/* 数量统计令牌样式 */
.stats-tokens {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-token {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6e6e6;
  transition: all 0.3s ease;
}

.stat-token:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: #1a237e;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.notices-grid {
  margin-top: 20px;
}
.fixed-card {
  height: 430px; /* 固定卡片高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止卡片内容溢出 */
}

:deep(.el-card__body) {
  height: 100%;
  padding: 0 !important; /* 移除默认内边距 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}



.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.notice-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许内容滚动 */
  padding-right: 5px; /* 为滚动条留出空间 */
  min-height: 0; /* 确保在flex容器中正确计算高度 */
  /* 为内容区域设置最小高度，确保即使内容少也能保持良好的视觉效果 */
  min-height: 200px;
}
  /* 自定义滚动条样式 */
  .notice-info::-webkit-scrollbar {
    width: 6px;
  }

  .notice-info::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .notice-info::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .notice-info::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

.notice-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.description {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  /* 确保描述文本不会无限制扩展 */
  overflow: visible;
}


/* 为.notice-info内的所有p标签设置flex-shrink: 0，防止它们被压缩 */
.notice-info p {
  margin: 6px 0;
  font-size: 14px;
  flex-shrink: 0;
}

/* 下架时间样式 */
.notice-info p:nth-last-child(1) {
  color: #f56c6c; /* 红色，表示重要信息 */
  font-weight: bold;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}
/* 无搜索结果提示样式 */
.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.no-results p {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .date-range-picker {
    width: 100%;
  }
  
  .stats-tokens {
    justify-content: center;
  }
  
  .stat-token {
    width: 100%;
    max-width: 300px;
  }
  
  .no-results p {
    font-size: 18px;
  }
}
</style>
