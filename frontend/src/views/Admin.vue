<template>
  <div class="admin-container">
    <div v-if="!authStore.isLoggedIn" class="login-form">
      <el-card>
        <h2>管理员登录</h2>
        <el-form 
          ref="loginFormRef"
          :model="loginForm" 
          :rules="loginRules"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div v-else class="admin-panel">
      <div class="admin-header">
        <!-- 显示当前管理员头像和名字 -->
        <div class="current-admin" v-if="authStore.adminData">
          <el-avatar :size="32" :src="authStore.adminData.admin_avatar ? getAdminAvatarUrl(authStore.adminData.admin_avatar) : ''" class="avatar">
            {{ authStore.adminData.username ? authStore.adminData.username.charAt(0) : '' }}
          </el-avatar>
          <span class="admin-name">{{ authStore.adminData.username }}</span>
        </div>
        <el-button type="danger" size="small" @click="handleLogout" class="logout-button">
          退出登录
        </el-button>
      </div>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="管理员账号管理" name="admin">
          <div class="admin-management">
            <!-- 注册新管理员表单 -->
            <el-card class="register-card">
              <template #header>
                <div class="card-header">
                  <span>注册新管理员</span>
                </div>
              </template>
              <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="registerForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="联系电话" prop="admin_phone">
                  <el-input v-model="registerForm.admin_phone" placeholder="请输入联系电话" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleRegister" :loading="registerLoading">注册</el-button>
                  <el-button @click="resetRegisterForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 管理员列表 -->
            <el-card class="admin-list-card" style="margin-top: 20px;">
              <template #header>
                <div class="card-header">
                  <span>管理员列表</span>
                </div>
              </template>
              <el-table :data="adminList" style="width: 100%">
                <el-table-column prop="admin_id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="admin_phone" label="联系电话" width="150" />
                <el-table-column prop="admin_avatar" label="头像" width="100">
                  <template #default="scope">
                    <el-avatar v-if="scope.row.admin_avatar" :size="32" :src="getAdminAvatarUrl(scope.row.admin_avatar)" />
                    <span v-else>无头像</span>
                  </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.created_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="handleDeleteAdmin(scope.row.admin_id)"
                      :disabled="isLastAdmin || scope.row.admin_id === authStore.adminData.admin_id"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="失物管理" name="found">
          <div class="table-actions">
            <el-button type="primary" @click="showAddFoundDialog">
              添加失物信息
            </el-button>
            <el-button :type="foundSelectAll ? 'primary' : 'default'" @click="toggleFoundSelectAll">
              一键全选
            </el-button>
            <div class="search-container">
              <el-select v-model="foundSearchField" placeholder="选择搜索字段" style="width: 150px;">
                <el-option label="物品名称" value="item_name"></el-option>
                <el-option label="物品描述" value="item_description"></el-option>
                <el-option label="拾取地点" value="found_location"></el-option>
              </el-select>
              <el-input
                v-model="foundSearchKeyword"
                placeholder="请输入搜索关键词"
                style="width: 200px; margin-left: 10px;"
                @keyup.enter="handleFoundSearch"
              >
                <template #append>
                  <el-button @click="handleFoundSearch" icon="Search"></el-button>
                </template>
              </el-input>
              <el-date-picker
                v-model="foundDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 250px; margin-left: 10px;"
                value-format="YYYY-MM-DD"
              />
              <el-button @click="resetFoundSearch" type="default" style="margin-left: 10px;">重置</el-button>
            </div>
          </div>
          <el-table :data="foundItems" style="width: 100%" v-model:selection="selectedFoundItems" @selection-change="handleFoundSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="item_name" label="物品名称" width="120" show-overflow-tooltip />
            <el-table-column prop="item_description" label="物品描述" show-overflow-tooltip />
            <el-table-column prop="found_location" label="拾取地点" />
            <el-table-column prop="found_time" label="拾取时间">
              <template #default="scope">
                {{ formatDate(scope.row.found_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="claim_status" label="认领状态">
              <template #default="scope">
                <el-tag :type="scope.row.claim_status === 'unclaimed' ? 'warning' : 'success'">
                  {{ scope.row.claim_status === 'unclaimed' ? '未认领' : '已认领' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  @click="handleEditFound(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  :type="scope.row.claim_status === 'unclaimed' ? 'success' : 'warning'"
                  @click="handleClaimStatus(scope.row)"
                >
                  {{ scope.row.claim_status === 'unclaimed' ? '标记已认领' : '标记未认领' }}
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="confirmDelete('found', scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 批量操作按钮 -->
          <div style="margin-top: 10px; display: flex; gap: 10px;">
            <el-button type="primary" @click="batchMarkAsClaimed" :disabled="selectedFoundItems.length === 0">
              批量标记已认领
            </el-button>
            <el-button type="warning" @click="batchMarkAsUnclaimed" :disabled="selectedFoundItems.length === 0">
              批量标记未认领
            </el-button>
            <el-button type="danger" @click="batchDeleteFound" :disabled="selectedFoundItems.length === 0">
              批量删除
            </el-button>
          </div>
          <!-- 失物管理分页组件 -->
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <el-pagination
              v-model:current-page="foundCurrentPage"
              v-model:page-size="foundPageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="foundTotal"
              @size-change="applyFoundPagination"
              @current-change="applyFoundPagination"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="挂失管理" name="lost">
          <div class="table-actions">
            <el-button type="primary" @click="showAddLostDialog">
              添加挂失信息
            </el-button>
            <el-button :type="lostSelectAll ? 'primary' : 'default'" @click="toggleLostSelectAll">
              一键全选
            </el-button>
            <div class="search-container">
              <el-select v-model="lostSearchField" placeholder="选择搜索字段" style="width: 150px;">
                <el-option label="物品名称" value="item_name"></el-option>
                <el-option label="物品描述" value="item_description"></el-option>
                <el-option label="失主姓名" value="owner_name"></el-option>
                <el-option label="联系电话" value="owner_phone"></el-option>
                <el-option label="丢失地点" value="lost_location"></el-option>
              </el-select>
              <el-input
                v-model="lostSearchKeyword"
                placeholder="请输入搜索关键词"
                style="width: 200px; margin-left: 10px;"
                @keyup.enter="handleLostSearch"
              >
                <template #append>
                  <el-button @click="handleLostSearch" icon="Search"></el-button>
                </template>
              </el-input>
              <el-date-picker
                v-model="lostDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 250px; margin-left: 10px;"
                value-format="YYYY-MM-DD"
              />
              <el-button @click="resetLostSearch" type="default" style="margin-left: 10px;">重置</el-button>
            </div>
          </div>
          <el-table :data="lostItems" style="width: 100%" v-model:selection="selectedLostItems" @selection-change="handleLostSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="item_name" label="物品名称" width="120" show-overflow-tooltip />
            <el-table-column prop="item_description" label="物品描述" show-overflow-tooltip />
            <el-table-column prop="owner_name" label="失主姓名" />
            <el-table-column prop="owner_phone" label="联系电话" />
            <el-table-column prop="lost_location" label="丢失地点" />
            <el-table-column prop="report_time" label="报失时间">
              <template #default="scope">
                {{ formatDate(scope.row.report_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  size="small"
                  type="primary"
                  @click="handleEditLost(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="confirmDelete('lost', scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 批量操作按钮 -->
          <div style="margin-top: 10px; display: flex; gap: 10px;">
            <el-button type="danger" @click="batchDeleteLost" :disabled="selectedLostItems.length === 0">
              批量删除
            </el-button>
          </div>
          <!-- 挂失管理分页组件 -->
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <el-pagination
              v-model:current-page="lostCurrentPage"
              v-model:page-size="lostPageSize"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="lostTotal"
              @size-change="applyLostPagination"
              @current-change="applyLostPagination"
            />
          </div>
        </el-tab-pane>
        <!-- 数据可视化标签页 -->
        <el-tab-pane label="数据可视化" name="visualization">
          <div class="admin-container">
            <!-- 数据概览卡片 -->
            <div class="section-title">
              <i class="el-icon-data-analysis"></i> 数据概览
            </div>
            <div class="overview-cards">
              <div class="stats-card">
                <div class="stats-icon">
                  <i class="el-icon-s-goods" style="font-size: 24px;"></i>
                </div>
                <div class="stats-number">{{ totalFoundItems }}</div>
                <div class="stats-label">总失物数量</div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">
                  <i class="el-icon-check" style="font-size: 24px;"></i>
                </div>
                <div class="stats-number">{{ claimedItems }}</div>
                <div class="stats-label">已认领数量</div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">
                  <i class="el-icon-circle-plus-outline" style="font-size: 24px;"></i>
                </div>
                <div class="stats-number">{{ unclaimedItems }}</div>
                <div class="stats-label">未认领数量</div>
              </div>
              <div class="stats-card">
                <div class="stats-icon">
                  <i class="el-icon-search" style="font-size: 24px;"></i>
                </div>
                <div class="stats-number">{{ totalLostItems }}</div>
                <div class="stats-label">总挂失数量</div>
              </div>
            </div>
            
            <!-- 图表容器 -->
            <div class="section-title" style="margin-top: 30px;">
              <i class="el-icon-pie-chart"></i> 数据分析
            </div>
            
            <!-- 加载状态 -->
            <div v-if="statsLoading" class="loading-overlay">
              <div class="loading-content">
                <el-loading-spinner></el-loading-spinner>
                <p style="margin-top: 10px;">正在加载数据...</p>
              </div>
            </div>
            
            <div class="charts-container">
              <!-- 失物认领状态分布饼图 -->
              <div class="chart-card">
                <div class="chart-card-header">
                  <i class="el-icon-document-copy" style="margin-right: 8px;"></i> 失物认领状态分布
                </div>
                <div class="chart-wrapper">
                  <canvas ref="claimStatusChart" class="chart"></canvas>
                </div>
              </div>
              
              <!-- 每月失物数量趋势折线图 -->
              <div class="chart-card">
                <div class="chart-card-header">
                  <i class="el-icon-trend-charts" style="margin-right: 8px;"></i> 每月失物数量趋势
                </div>
                <div class="chart-wrapper">
                  <canvas ref="monthlyTrendChart" class="chart"></canvas>
                </div>
              </div>
              
              <!-- 失物类型分布横向柱状图 -->
              <div class="chart-card">
                <div class="chart-card-header">
                  <i class="el-icon-menu" style="margin-right: 8px;"></i> 失物类型分布
                </div>
                <div class="chart-wrapper">
                  <canvas ref="itemTypeChart" class="chart"></canvas>
                </div>
              </div>
              
              <!-- 失物高发地点环形图 -->
              <div class="chart-card">
                <div class="chart-card-header">
                  <i class="el-icon-location" style="margin-right: 8px;"></i> 失物高发地点
                </div>
                <div class="chart-wrapper">
                  <canvas ref="locationChart" class="chart"></canvas>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

    </div>

    <!-- 失物信息编辑/添加对话框 -->
    <el-dialog
      v-model="foundDialogVisible"
      :title="editingFound ? '编辑失物信息' : '添加失物信息'"
      width="50%"
    >
      <el-form
        ref="foundFormRef"
        :model="foundForm"
        :rules="foundRules"
        label-width="100px"
      >
        <el-form-item label="物品名称" prop="item_name">
          <el-input v-model="foundForm.item_name" />
        </el-form-item>
        <el-form-item label="物品描述" prop="item_description">
          <el-input
            v-model="foundForm.item_description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="拾取人" prop="finder_name">
          <el-input v-model="foundForm.finder_name" />
        </el-form-item>
        <el-form-item label="联系电话" prop="finder_phone">
          <el-input v-model="foundForm.finder_phone" />
        </el-form-item>
        <el-form-item label="拾取地点" prop="found_location">
          <el-input v-model="foundForm.found_location" />
        </el-form-item>
        <el-form-item label="拾取时间" prop="found_time">
          <el-date-picker
            v-model="foundForm.found_time"
            type="datetime"
            placeholder="选择拾取时间"
          />
        </el-form-item>
        <el-form-item label="认领地点" prop="claim_location">
          <el-input v-model="foundForm.claim_location" />
        </el-form-item>
        <el-form-item label="物品照片">
          <el-upload
            class="upload-demo"
            :action="`${API_BASE_URL}/api/upload`"
            :before-upload="beforeUpload"
            :on-success="handleFoundPhotoSuccess"
            :on-error="handleUploadError"
            name="file"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
          <img v-if="foundForm.item_photo" :src="getImageUrl(foundForm.item_photo)" class="preview-image">
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="foundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFoundForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 挂失信息编辑/添加对话框 -->
    <el-dialog
      v-model="lostDialogVisible"
      :title="editingLost ? '编辑挂失信息' : '添加挂失信息'"
      width="50%"
    >
      <el-form
        ref="lostFormRef"
        :model="lostForm"
        :rules="lostRules"
        label-width="100px"
      >
        <el-form-item label="物品名称" prop="item_name">
          <el-input v-model="lostForm.item_name" />
        </el-form-item>
        <el-form-item label="物品描述" prop="item_description">
          <el-input
            v-model="lostForm.item_description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="失主姓名" prop="owner_name">
          <el-input v-model="lostForm.owner_name" />
        </el-form-item>
        <el-form-item label="联系电话" prop="owner_phone">
          <el-input v-model="lostForm.owner_phone" />
        </el-form-item>
        <el-form-item label="丢失地点" prop="lost_location">
          <el-input v-model="lostForm.lost_location" placeholder="请输入丢失地点" />
        </el-form-item>
        <el-form-item label="物品照片">
          <el-upload
            class="upload-demo"
            :action="`${API_BASE_URL}/api/upload`"
            :before-upload="beforeUpload"
            :on-success="handleLostPhotoSuccess"
            :on-error="handleUploadError"
            name="file"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件，且不超过 5MB
              </div>
            </template>
          </el-upload>
          <img v-if="lostForm.item_photo" :src="getImageUrl(lostForm.item_photo)" class="preview-image">
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="lostDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLostForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount, nextTick, onUpdated } from 'vue'
import { useAuthStore } from '../store/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'
import { getImageUrl, API_BASE_URL } from '../config/urls'
import Chart from 'chart.js/auto'

const authStore = useAuthStore()

// 监听标签页变化函数（必须在activeTab定义前声明）
const handleTabChange = async (newTab) => {
  if (newTab === 'admin' && authStore.isLoggedIn) {
    loadAdminList()
  } else if (newTab === 'visualization' && authStore.isLoggedIn) {
    await initCharts()
  }
}

// 处理管理员头像URL，使用前端public目录下的资源
const getAdminAvatarUrl = (path) => {
  if (!path) return '';
  
  // 管理员头像存储在前端public/uploads/admin_avatar目录下
  // 由于是静态资源，可以直接使用相对路径访问
  if (path.startsWith('/uploads/admin_avatar/')) {
    // 如果路径已经包含完整路径，则返回相对路径（去掉/api部分）
    return path;
  } else if (path.startsWith('avatar')) {
    // 如果只有文件名，则添加完整路径
    return `/uploads/admin_avatar/${path}`;
  } else if (path.includes('/admin_avatar/')) {
    // 如果包含admin_avatar但没有/uploads前缀
    const filename = path.split('/admin_avatar/')[1];
    return `/uploads/admin_avatar/${filename}`;
  }
  
  // 默认情况下使用getImageUrl
  return getImageUrl(path);
}

// 数据可视化相关变量
const claimStatusChart = ref(null)
const monthlyTrendChart = ref(null)
const itemTypeChart = ref(null)
const locationChart = ref(null)

const charts = ref([]) // 存储所有图表实例

const loading = ref(false)
const activeTab = ref('found')
const foundItems = ref([])
const lostItems = ref([])
const allFoundItems = ref([]) // 存储所有失物数据
const allLostItems = ref([]) // 存储所有挂失数据
const loginFormRef = ref(null)

// 计算属性 - 统计数据
const totalFoundItems = computed(() => allFoundItems.value.length)
const totalLostItems = computed(() => allLostItems.value.length)
const claimedItems = computed(() => allFoundItems.value.filter(item => item.claim_status === 'claimed').length)
const unclaimedItems = computed(() => allFoundItems.value.filter(item => item.claim_status === 'unclaimed').length)
const foundFormRef = ref(null)
const lostFormRef = ref(null)

// 批量操作相关变量
const selectedFoundItems = ref([]) // 选中的失物项
const selectedLostItems = ref([]) // 选中的挂失项
const foundSelectAll = ref(false) // 失物管理全选状态
const lostSelectAll = ref(false) // 挂失管理全选状态

// 分页相关变量
const foundCurrentPage = ref(1)
const foundPageSize = ref(10)
const foundTotal = ref(0)
const lostCurrentPage = ref(1)
const lostPageSize = ref(10)
const lostTotal = ref(0)

// 失物搜索相关变量
const foundSearchField = ref('item_name') // 默认搜索物品名称
const foundSearchKeyword = ref('')
const foundDateRange = ref([])

// 挂失搜索相关变量
const lostSearchField = ref('item_name') // 默认搜索物品名称
const lostSearchKeyword = ref('')
const lostDateRange = ref([])

//豆包建议：
// 失物信息编辑相关
const foundDialogVisible = ref(false)
const editingFound = ref(false)

const handleEditFound = (item) => {
  editingFound.value = true
  foundForm.value = { ...item }
  // 转换日期格式以适应日期选择器
  foundForm.value.found_time = new Date(item.found_time)
  foundDialogVisible.value = true
}

const showAddFoundDialog = () => {
  editingFound.value = false
  foundForm.value = {
    item_name: '',
    item_description: '',
    finder_name: '',
    finder_phone: '',
    found_location: '',
    found_time: new Date(),
    claim_location: '',
    item_photo: '',
    item_id: null
  }
  foundDialogVisible.value = true
}

// 挂失信息编辑相关
const lostDialogVisible = ref(false)
const editingLost = ref(false)

const handleEditLost = (item) => {
  editingLost.value = true
  lostForm.value = { ...item }
  lostDialogVisible.value = true
}

const showAddLostDialog = () => {
  editingLost.value = false
  lostForm.value = {
    item_name: '',
    item_description: '',
    owner_name: '',
    owner_phone: '',
    lost_location: '',
    item_photo: '',
    loster_id: null
  }
  lostDialogVisible.value = true
}

const submitLostForm = async () => {
  if (!lostFormRef.value) return

  await lostFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (editingLost.value) {
          // 编辑现有挂失
          await api.put(`/loster/items/${lostForm.value.loster_id}`, lostForm.value)
          ElMessage.success('更新成功')
        } else {
          // 添加新挂失
          await api.post('/loster/items', lostForm.value)
          ElMessage.success('添加成功')
        }
        lostDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('操作失败：', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 上传相关方法
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

const handleFoundPhotoSuccess = (response) => {
  if (response.code === 200 && response.data) {
    // 只保存相对路径
    foundForm.value.item_photo = `/uploads/${response.data.filename}`
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 提交失物表单
const submitFoundForm = async () => {
  if (!foundFormRef.value) return

  await foundFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 创建要提交的数据对象
        const formData = new FormData()
        
        // 添加所有必填字段
        formData.append('finder_name', foundForm.value.finder_name)
        formData.append('finder_phone', foundForm.value.finder_phone)
        formData.append('item_name', foundForm.value.item_name)
        formData.append('item_description', foundForm.value.item_description || '')
        formData.append('found_location', foundForm.value.found_location)
        
        // 格式化日期
        const formattedDate = new Date(foundForm.value.found_time).toISOString()
        formData.append('found_time', formattedDate)
        
        formData.append('claim_location', foundForm.value.claim_location)
        
        // 如果有图片路径，添加图片路径（使用相对路径）
        if (foundForm.value.item_photo) {
          const photoPath = foundForm.value.item_photo.startsWith('/uploads/') 
            ? foundForm.value.item_photo 
            : `/uploads/${foundForm.value.item_photo}`
          formData.append('item_photo', photoPath)
        }

        // 调试信息
        console.log('提交的表单数据：', Object.fromEntries(formData.entries()))

        if (editingFound.value) {
          // 编辑现有失物信息
          await api.put(`/founder/items/${foundForm.value.item_id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          ElMessage.success('更新成功')
        } else {
          // 添加新失物信息
          await api.post('/founder/items', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          ElMessage.success('添加成功')
        }
        foundDialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('操作失败：', error)
        // 显示详细错误信息
        if (error.response && error.response.data) {
          ElMessage.error(`操作失败: ${error.response.data.message || '未知错误'}`)
        } else {
          ElMessage.error('操作失败：' + (error.message || '未知错误'))
        }
      }
    }
  })
}

const handleLostPhotoSuccess = (response) => {
  if (response.code === 200 && response.data) {
    // 只保存相对路径
    lostForm.value.item_photo = `/uploads/${response.data.filename}`
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

const confirmDelete = (type, item) => {
  ElMessageBox.confirm(
    '确定要删除这条信息吗？',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    if (type === 'found') {
      handleDeleteFound(item.item_id)
    } else {
      handleDeleteLost(item.loster_id)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}





// 登录表单
const loginForm = ref({
  username: '',
  password: ''
})

// 注册表单
const registerForm = ref({
  username: '',
  password: '',
  admin_phone: ''
})

// 管理员列表
const adminList = ref([])
const registerFormRef = ref(null)
const registerLoading = ref(false)

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  admin_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}

// 计算是否为最后一个管理员
const isLastAdmin = computed(() => adminList.value.length <= 1)

// 失物表单
const foundForm = ref({
  item_name: '',
  item_description: '',
  finder_name: '',
  finder_phone: '',
  found_location: '',
  found_time: '',
  claim_location: '',
  item_photo: '',
  item_id: null
})

// 挂失表单
const lostForm = ref({
  item_name: '',
  item_description: '',
  owner_name: '',
  owner_phone: '',
  item_photo: '',
  loster_id: null
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await authStore.login(loginForm.value.username, loginForm.value.password)
        if (success) {
          ElMessage.success('登录成功')
          loadData()
          // 加载管理员列表
          if (activeTab.value === 'admin') {
            loadAdminList()
          }
        } else {
          ElMessage.error('用户名或密码错误')
        }
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}

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
    adminList.value = []
  }).catch(() => {
    ElMessage.info('已取消退出')
  })
}

// 加载管理员列表
const loadAdminList = async () => {
  try {
    const response = await api.get('/admin/list')
    if (response.success) {
      adminList.value = response.data
    }
  } catch (error) {
    console.error('获取管理员列表失败：', error)
    ElMessage.error('获取管理员列表失败')
  }
}

// 注册新管理员
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      try {
        const response = await api.post('/admin/register', registerForm.value)
        if (response.success) {
          ElMessage.success(response.message || '注册成功')
          resetRegisterForm()
          loadAdminList()
        } else {
          ElMessage.error(response.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败：', error)
        ElMessage.error('注册失败：' + error.message)
      } finally {
        registerLoading.value = false
      }
    }
  })
}

// 重置注册表单
const resetRegisterForm = () => {
  registerForm.value = {
    username: '',
    password: '',
    admin_phone: ''
  }
  if (registerFormRef.value) {
    registerFormRef.value.resetFields()
  }
}

// 删除管理员
const handleDeleteAdmin = async (adminId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个管理员吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    const response = await api.delete(`/admin/delete/${adminId}`)
    if (response.success) {
      ElMessage.success(response.message || '删除成功')
      loadAdminList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败：', error)
      ElMessage.error('删除失败')
    }
  }
}

const loadData = async () => {
  try {
    const [foundResponse, lostResponse] = await Promise.all([
      api.get('/founder/items'),
      api.get('/loster/items')
    ])
    allFoundItems.value = foundResponse
    allLostItems.value = lostResponse
    
    // 重置分页并应用分页
    foundCurrentPage.value = 1
    lostCurrentPage.value = 1
    // 重置全选状态
    foundSelectAll.value = false
    lostSelectAll.value = false
    applyFoundPagination()
    applyLostPagination()
  } catch (error) {
    console.error('加载数据失败：', error)
    ElMessage.error('加载数据失败')
  }
}

const handleClaimStatus = async (item) => {
  try {
    await api.put(`/founder/items/${item.item_id}/claim`, {
      claim_status: item.claim_status === 'unclaimed' ? 'claimed' : 'unclaimed'
    })
    ElMessage.success('更新状态成功')
    loadData()
  } catch (error) {
    console.error('更新状态失败：', error)
    ElMessage.error('更新状态失败')
  }
}

const handleDeleteFound = async (itemId) => {
  try {
    await api.delete(`/founder/items/${itemId}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败：', error)
    ElMessage.error('删除失败')
  }
}

const handleDeleteLost = async (losterId) => {
  try {
    await api.delete(`/loster/items/${losterId}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败：', error)
    ElMessage.error('删除失败')
  }
}

// 失物搜索处理函数
const handleFoundSearch = () => {
  foundCurrentPage.value = 1 // 搜索时重置到第一页
  
  // 检查是否有搜索条件
  if (!foundSearchKeyword.value && !foundDateRange.value.length) {
    applyFoundPagination()
    return
  }
  
  const filteredItems = allFoundItems.value.filter(item => {
    // 关键词搜索
    let keywordMatch = true
    if (foundSearchKeyword.value) {
      keywordMatch = item[foundSearchField.value] && 
        item[foundSearchField.value].toLowerCase().includes(foundSearchKeyword.value.toLowerCase())
    }
    
    // 日期范围搜索
    let dateMatch = true
    if (foundDateRange.value && foundDateRange.value.length === 2) {
      const itemDate = new Date(item.found_time)
      const startDate = new Date(foundDateRange.value[0])
      const endDate = new Date(foundDateRange.value[1])
      // 设置结束日期为当天的最后一刻
      endDate.setHours(23, 59, 59, 999)
      dateMatch = itemDate >= startDate && itemDate <= endDate
    }
    
    return keywordMatch && dateMatch
  })
  
  // 按时间降序排序
  filteredItems.sort((a, b) => new Date(b.found_time) - new Date(a.found_time))
  
  foundTotal.value = filteredItems.length
  const start = (foundCurrentPage.value - 1) * foundPageSize.value
  const end = start + foundPageSize.value
  foundItems.value = filteredItems.slice(start, end)
}

// 失物搜索重置函数
const resetFoundSearch = () => {
  foundSearchField.value = 'item_name'
  foundSearchKeyword.value = ''
  foundDateRange.value = []
  foundCurrentPage.value = 1
  applyFoundPagination()
}

// 应用失物数据分页
const applyFoundPagination = () => {
  // 按时间降序排序
  const sortedItems = [...allFoundItems.value].sort((a, b) => new Date(b.found_time) - new Date(a.found_time))
  
  foundTotal.value = sortedItems.length
  const start = (foundCurrentPage.value - 1) * foundPageSize.value
  const end = start + foundPageSize.value
  foundItems.value = sortedItems.slice(start, end)
  
  // 重置选中状态
  selectedFoundItems.value = []
  foundSelectAll.value = false
}

// 挂失搜索处理函数
const handleLostSearch = () => {
  lostCurrentPage.value = 1 // 搜索时重置到第一页
  
  // 检查是否有搜索条件
  if (!lostSearchKeyword.value && !lostDateRange.value.length) {
    applyLostPagination()
    return
  }
  
  const filteredItems = allLostItems.value.filter(item => {
    // 关键词搜索
    let keywordMatch = true
    if (lostSearchKeyword.value) {
      keywordMatch = item[lostSearchField.value] && 
        item[lostSearchField.value].toLowerCase().includes(lostSearchKeyword.value.toLowerCase())
    }
    
    // 日期范围搜索
    let dateMatch = true
    if (lostDateRange.value && lostDateRange.value.length === 2) {
      const itemDate = new Date(item.report_time)
      const startDate = new Date(lostDateRange.value[0])
      const endDate = new Date(lostDateRange.value[1])
      // 设置结束日期为当天的最后一刻
      endDate.setHours(23, 59, 59, 999)
      dateMatch = itemDate >= startDate && itemDate <= endDate
    }
    
    return keywordMatch && dateMatch
  })
  
  // 按时间降序排序
  filteredItems.sort((a, b) => new Date(b.report_time) - new Date(a.report_time))
  
  lostTotal.value = filteredItems.length
  const start = (lostCurrentPage.value - 1) * lostPageSize.value
  const end = start + lostPageSize.value
  lostItems.value = filteredItems.slice(start, end)
}

// 挂失搜索重置函数
const resetLostSearch = () => {
  lostSearchField.value = 'item_name'
  lostSearchKeyword.value = ''
  lostDateRange.value = []
  lostCurrentPage.value = 1
  applyLostPagination()
}

// 应用挂失数据分页
const applyLostPagination = () => {
  // 按时间降序排序
  const sortedItems = [...allLostItems.value].sort((a, b) => new Date(b.report_time) - new Date(a.report_time))
  
  lostTotal.value = sortedItems.length
  const start = (lostCurrentPage.value - 1) * lostPageSize.value
  const end = start + lostPageSize.value
  lostItems.value = sortedItems.slice(start, end)
  
  // 重置选中状态
  selectedLostItems.value = []
  lostSelectAll.value = false
}

// 切换失物管理全选状态
const toggleFoundSelectAll = () => {
  foundSelectAll.value = !foundSelectAll.value
  if (foundSelectAll.value) {
    // 全选当前页的所有项
    selectedFoundItems.value = [...foundItems.value]
  } else {
    // 取消全选
    selectedFoundItems.value = []
  }
  // 强制更新响应式数据，确保表格复选框状态同步
  nextTick(() => {
    selectedFoundItems.value = [...selectedFoundItems.value]
  })
}

// 处理失物管理选择变化
const handleFoundSelectionChange = (selections) => {
  selectedFoundItems.value = selections
  // 检查是否所有项都被选中
  foundSelectAll.value = selections.length > 0 && selections.length === foundItems.value.length
}

// 切换挂失管理全选状态
const toggleLostSelectAll = () => {
  lostSelectAll.value = !lostSelectAll.value
  if (lostSelectAll.value) {
    // 全选当前页的所有项
    selectedLostItems.value = [...lostItems.value]
  } else {
    // 取消全选
    selectedLostItems.value = []
  }
  // 强制更新响应式数据，确保表格复选框状态同步
  nextTick(() => {
    selectedLostItems.value = [...selectedLostItems.value]
  })
}

// 处理挂失管理选择变化
const handleLostSelectionChange = (selections) => {
  selectedLostItems.value = selections
  // 检查是否所有项都被选中
  lostSelectAll.value = selections.length > 0 && selections.length === lostItems.value.length
}

// 批量标记失物为已认领
const batchMarkAsClaimed = async () => {
  if (selectedFoundItems.value.length === 0) {
    ElMessage.warning('请选择要操作的失物')
    return
  }
  
  try {
    // 显示加载状态
    loading.value = true
    
    // 批量更新失物状态
    const updatePromises = selectedFoundItems.value.map(item => 
      api.put(`/founder/items/${item.item_id}/claim`, { claim_status: 'claimed' })
    )
    
    await Promise.all(updatePromises)
    
    ElMessage.success(`已成功标记${selectedFoundItems.value.length}项为已认领`)
    selectedFoundItems.value = []
    loadData()
  } catch (error) {
    console.error('批量更新失败：', error)
    ElMessage.error('批量操作失败')
  } finally {
    loading.value = false
  }
}

// 批量标记失物为未认领
const batchMarkAsUnclaimed = async () => {
  if (selectedFoundItems.value.length === 0) {
    ElMessage.warning('请选择要操作的失物')
    return
  }
  
  try {
    // 显示加载状态
    loading.value = true
    
    // 批量更新失物状态
    const updatePromises = selectedFoundItems.value.map(item => 
      api.put(`/founder/items/${item.item_id}/claim`, { claim_status: 'unclaimed' })
    )
    
    await Promise.all(updatePromises)
    
    ElMessage.success(`已成功标记${selectedFoundItems.value.length}项为未认领`)
    selectedFoundItems.value = []
    loadData()
  } catch (error) {
    console.error('批量更新失败：', error)
    ElMessage.error('批量操作失败')
  } finally {
    loading.value = false
  }
}

// 批量删除失物
const batchDeleteFound = async () => {
  if (selectedFoundItems.value.length === 0) {
    ElMessage.warning('请选择要删除的失物')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedFoundItems.value.length}条失物信息吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    // 显示加载状态
    loading.value = true
    
    // 批量删除失物
    const deletePromises = selectedFoundItems.value.map(item => 
      api.delete(`/founder/items/${item.item_id}`)
    )
    
    await Promise.all(deletePromises)
    
    ElMessage.success(`已成功删除${selectedFoundItems.value.length}条失物信息`)
    selectedFoundItems.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败：', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 批量删除挂失
const batchDeleteLost = async () => {
  if (selectedLostItems.value.length === 0) {
    ElMessage.warning('请选择要删除的挂失')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedLostItems.value.length}条挂失信息吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    
    // 显示加载状态
    loading.value = true
    
    // 批量删除挂失
    const deletePromises = selectedLostItems.value.map(item => 
      api.delete(`/loster/items/${item.loster_id}`)
    )
    
    await Promise.all(deletePromises)
    
    ElMessage.success(`已成功删除${selectedLostItems.value.length}条挂失信息`)
    selectedLostItems.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败：', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 数据可视化相关函数
// 数据加载状态
const statsLoading = ref(true)

// 从API获取统计数据
const loadStatsData = async () => {
  try {
    statsLoading.value = true
    const [foundStats, lostStats] = await Promise.all([
      api.get('/founder/stats'),
      api.get('/loster/stats')
    ])
    
    // 使用真实数据更新统计信息
    // 注意：这里不直接修改计算属性，而是确保allFoundItems和allLostItems有真实数据
    // 计算属性会根据这两个数据自动更新
    if (allFoundItems.value.length === 0 && foundStats.total === 0) {
      // 如果API返回的数据也是空的，使用一些简单的模拟数据以便展示图表
      generateMinimalDemoData()
    }
  } catch (error) {
    console.error('获取统计数据失败：', error)
    ElMessage.error('获取统计数据失败，使用演示数据')
    generateMinimalDemoData()
  } finally {
    statsLoading.value = false
  }
}

// 生成最小化的演示数据（仅当API返回空数据时使用）
const generateMinimalDemoData = () => {
  const locations = ['图书馆', '教室', '食堂', '操场', '宿舍']
  const itemTypes = ['手机', '钱包', '钥匙', '学生证', '书包']
  
  const demoFoundItems = []
  for (let i = 0; i < 20; i++) {
    const randomDate = new Date()
    randomDate.setMonth(randomDate.getMonth() - Math.floor(Math.random() * 6)) // 过去6个月
    
    demoFoundItems.push({
      item_id: i + 1,
      item_name: itemTypes[Math.floor(Math.random() * itemTypes.length)],
      item_description: `${itemTypes[Math.floor(Math.random() * itemTypes.length)]}一个`,
      found_location: locations[Math.floor(Math.random() * locations.length)],
      found_time: randomDate.toISOString(),
      claim_status: Math.random() > 0.4 ? 'unclaimed' : 'claimed', // 60%未认领
    })
  }
  
  allFoundItems.value = demoFoundItems
  
  const demoLostItems = []
  for (let i = 0; i < 15; i++) {
    const randomDate = new Date()
    randomDate.setMonth(randomDate.getMonth() - Math.floor(Math.random() * 6)) // 过去6个月
    
    demoLostItems.push({
      loster_id: i + 1,
      item_name: itemTypes[Math.floor(Math.random() * itemTypes.length)],
      lost_location: locations[Math.floor(Math.random() * locations.length)],
      report_time: randomDate.toISOString()
    })
  }
  
  allLostItems.value = demoLostItems
}

// 清理已有图表
const destroyCharts = () => {
  charts.value.forEach(chart => {
    if (chart && chart.destroy) {
      chart.destroy()
    }
  })
  charts.value = []
}

// 图表配置基类
const getBaseChartConfig = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  }
}

// 初始化认领状态分布饼图
const initClaimStatusChart = () => {
  const ctx = claimStatusChart.value?.getContext('2d')
  if (!ctx) return
  
  const claimed = claimedItems.value
  const unclaimed = unclaimedItems.value
  
  if (claimed === 0 && unclaimed === 0) {
    // 避免零数据导致的图表错误
    return
  }
  
  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['已认领', '未认领'],
      datasets: [{
        data: [claimed, unclaimed],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderColor: ['#059669', '#d97706'],
        borderWidth: 1
      }]
    },
    options: {
      ...getBaseChartConfig(),
      plugins: {
        ...getBaseChartConfig().plugins,
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = claimed + unclaimed
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
  
  charts.value.push(chart)
}

// 初始化每月失物数量趋势折线图
const initMonthlyTrendChart = () => {
  const ctx = monthlyTrendChart.value?.getContext('2d')
  if (!ctx) return
  
  // 准备最近6个月的数据
  const months = []
  const foundCount = []
  const claimedCount = []
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(monthLabel)
    
    // 统计当月失物数量
    const monthlyFound = allFoundItems.value.filter(item => {
      const itemDate = new Date(item.found_time)
      return itemDate.getFullYear() === date.getFullYear() && 
             itemDate.getMonth() === date.getMonth()
    })
    foundCount.push(monthlyFound.length)
    
    // 统计当月已认领数量
    const monthlyClaimed = monthlyFound.filter(item => item.claim_status === 'claimed')
    claimedCount.push(monthlyClaimed.length)
  }
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: '失物总数',
          data: foundCount,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: '已认领数量',
          data: claimedCount,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      ...getBaseChartConfig(),
      plugins: {
        ...getBaseChartConfig().plugins,
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
  
  charts.value.push(chart)
}

// 初始化失物类型分布横向柱状图
const initItemTypeChart = () => {
  const ctx = itemTypeChart.value?.getContext('2d')
  if (!ctx) return
  
  // 统计各种物品类型的数量
  const typeCounts = {}
  allFoundItems.value.forEach(item => {
    typeCounts[item.item_name] = (typeCounts[item.item_name] || 0) + 1
  })
  
  // 转换为数组并排序
  const typeArray = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8) // 只显示前8种类型
  
  const labels = typeArray.map(([type]) => type)
  const data = typeArray.map(([, count]) => count)
  
  if (data.length === 0) {
    // 避免零数据导致的图表错误
    return
  }
  
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '失物数量',
        data: data,
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1
      }]
    },
    options: {
      ...getBaseChartConfig(),
      indexAxis: 'y', // 横向柱状图
      plugins: {
        ...getBaseChartConfig().plugins,
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
  
  charts.value.push(chart)
}

// 初始化失物高发地点环形图
const initLocationChart = () => {
  const ctx = locationChart.value?.getContext('2d')
  if (!ctx) return
  
  // 统计各地点的失物数量
  const locationCounts = {}
  allFoundItems.value.forEach(item => {
    locationCounts[item.found_location] = (locationCounts[item.found_location] || 0) + 1
  })
  
  // 转换为数组并排序
  const locationArray = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
  
  const labels = locationArray.map(([location]) => location)
  const data = locationArray.map(([, count]) => count)
  
  if (data.length === 0) {
    // 避免零数据导致的图表错误
    return
  }
  
  // 生成不同的颜色
  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)'
  ]
  
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }]
    },
    options: {
      ...getBaseChartConfig(),
      plugins: {
        ...getBaseChartConfig().plugins,
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%' // 环形图的中心空洞大小
    }
  })
  
  charts.value.push(chart)
}

// 处理窗口大小变化，重新渲染图表
const handleResize = () => {
  charts.value.forEach(chart => {
    if (chart && typeof chart.resize === 'function') {
      chart.resize()
    }
  })
}

// 初始化所有图表
const initCharts = async () => {
  // 确保在组件挂载后再初始化图表
  await nextTick()
  
  // 清理已有图表
  destroyCharts()
  
  // 从API加载真实数据
  await loadStatsData()
  
  // 初始化各个图表
  initClaimStatusChart()
  initMonthlyTrendChart()
  initItemTypeChart()
  initLocationChart()
}

// 组件更新时重新初始化图表
onUpdated(async () => {
  if (activeTab.value === 'visualization' && authStore.isLoggedIn) {
    await initCharts()
  }
})

// 组件卸载时清理图表
onBeforeUnmount(() => {
  destroyCharts()
  // 移除窗口大小变化事件监听
  window.removeEventListener('resize', handleResize)
})

// 已在文件顶部定义handleTabChange函数

onMounted(async () => {
  if (authStore.isLoggedIn) {
    loadData()
    // 如果初始标签是可视化，初始化图表
    if (activeTab.value === 'visualization') {
      await initCharts()
    }
    // 监听activeTab变化
    const unwatch = watch(activeTab, handleTabChange)
    // 清理函数
    onBeforeUnmount(() => unwatch())
    // 添加窗口大小变化事件监听
    window.addEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.login-form {
  max-width: 400px;
  margin: 100px auto;
}

.admin-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 20px;
    }

    .current-admin {
      margin-right: 15px;
    }

.current-admin {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  cursor: pointer;
}

.admin-name {
  font-size: 14px;
  color: #606266;
}

.el-table {
  margin-top: 20px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.admin-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-card,
.admin-list-card {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
}

/* 数据可视化相关样式 */
/* 概览卡片样式 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* 统计卡片样式 - 添加渐变背景和交互效果 */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* 不同卡片使用不同的渐变背景 */
.stats-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-card:nth-child(4) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 10px 0;
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 图表容器样式 */
.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.chart-card-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
}

.chart-wrapper {
  padding: 20px;
  flex: 1;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

/* 加载状态样式 */
.chart-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

/* 全局加载覆盖层样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
  color: #606266;
}

/* 标题样式 */
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 10px;
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    min-height: 250px;
  }
  
  .chart {
    min-height: 250px;
  }
  
  .admin-container {
    padding: 10px;
  }
}
</style>
