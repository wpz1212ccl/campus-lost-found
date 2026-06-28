<template>
  <div class="found-items">
    <h1>失物招领仓库</h1>
    
    <!-- 数量统计令牌 -->
    <div class="stats-tokens">
      <div class="stat-token" :class="{ active: filterStatus === 'all' }" @click="handleFilter('all')">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总失物数量</div>
      </div>
      <div class="stat-token" :class="{ active: filterStatus === 'unclaimed' }" @click="handleFilter('unclaimed')">
        <div class="stat-value claimed">{{ stats.unclaimed }}</div>
        <div class="stat-label">未认领</div>
      </div>
      <div class="stat-token" :class="{ active: filterStatus === 'claimed' }" @click="handleFilter('claimed')">
        <div class="stat-value unclaimed">{{ stats.claimed }}</div>
        <div class="stat-label">已认领</div>
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
    <div v-if="isSearching && items.length === 0" class="no-results">
      <p>没有该物品哟.......</p>
    </div>

    <el-row v-else :gutter="20" class="items-grid">
      <el-col 
        v-for="item in items" 
        :key="item.item_id" 
        :xs="24" 
        :sm="12" 
        :md="8"
        style="margin-bottom: 10px;"
      >
        <el-card class="fixed-card">
          <div class="image-container">
            <img 
              v-if="item.item_photo" 
              :src="getImageUrl(item.item_photo)" 
              class="item-image"
              @click="showImagePreview([item.item_photo])"
              style="cursor: pointer"
              :alt="item.item_name"
            >
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
            </div>
          </div>
          <div class="item-info">
            <h3>{{ item.item_name }}</h3>
            <p class="description">{{ item.item_description }}</p>
            <p><strong>拾获地点：</strong>{{ item.found_location }}</p>
            <p><strong>拾获时间：</strong>{{ formatDate(item.found_time) }}</p>
            <div class="status-badge" :class="item.claim_status === 'claimed' ? 'claimed' : 'unclaimed'">
              {{ item.claim_status === 'claimed' ? '已认领' : '未认领' }}
            </div>
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

const items = ref([])
const allItems = ref([]) // 存储所有物品数据
const searchKeyword = ref('')
const previewVisible = ref(false)
const previewImages = ref([])
const dateRange = ref([])
const isSearching = ref(false)
const stats = ref({ total: 0, unclaimed: 0, claimed: 0 })
const filterStatus = ref('all') // 筛选状态：all, unclaimed, claimed

const loadItems = async () => {
  try {
    const response = await api.get('/founder/items')
    // 按拾获时间降序排序，最新的排在前面
    const sortedItems = response.sort((a, b) => new Date(b.found_time) - new Date(a.found_time))
    allItems.value = sortedItems
    applyFilter()
  } catch (error) {
    console.error('加载失物信息失败：', error)
    ElMessage.error('加载失物信息失败')
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/founder/stats')
    stats.value = response
  } catch (error) {
    console.error('加载失物统计信息失败：', error)
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
    const response = await api.get(`/founder/search?${params.toString()}`)
    // 按拾获时间降序排序，最新的排在前面
    const sortedItems = response.sort((a, b) => new Date(b.found_time) - new Date(a.found_time))
    allItems.value = sortedItems
    applyFilter()
  } catch (error) {
    console.error('搜索失败：', error)
  }
}

// 处理筛选点击
const handleFilter = (status) => {
  filterStatus.value = status
  applyFilter()
}

// 应用筛选条件
const applyFilter = () => {
  if (filterStatus.value === 'all') {
    items.value = [...allItems.value]
  } else {
    items.value = allItems.value.filter(item => item.claim_status === filterStatus.value)
  }
  // 更新搜索状态
  isSearching.value = searchKeyword.value || (dateRange.value && dateRange.value.length === 2)
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
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
  loadItems()
  loadStats()
})
</script>

<style scoped>
.found-items {
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
  cursor: pointer;
}

.stat-token:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.stat-token.active {
  background-color:#a1dbec;
  color: white;
  border-color: #a1dbec;
   cursor: pointer;
}


.stat-token.active .stat-value {
  color: white;
}

.stat-value {
  font-size: 2.5em;
  font-weight: bold;
  color: #1a237e;
  margin-bottom: 8px;
}

.stat-value.claimed {
    color: #67c23a;
  }

  .stat-value.unclaimed {
    color: #f56c6c;
  }

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.items-grid {
  margin-top: 20px;
}

.fixed-card {
  height: 380px; 
  display: flex;
  flex-direction: column;
  padding: 0;
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

.item-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许内容滚动 */
  padding-right: 5px; /* 为滚动条留出空间 */
  position: relative;
}

/* 自定义滚动条样式 */
.item-info::-webkit-scrollbar {
  width: 6px;
}

.item-info::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.item-info::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.item-info::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.item-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.description {
  flex: 1;
  margin: 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.item-info p {
  margin: 6px 0;
  font-size: 14px;
}

/* 状态标签样式 */
.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  z-index: 10;
}

.status-badge.unclaimed {
  background-color: #52c41a;
}

.status-badge.claimed {
  background-color: #ff4d4f;
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
