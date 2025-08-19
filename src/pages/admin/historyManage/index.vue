<template>
  <div class="history-manage">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="cardVariants.transition as any">
      <el-card class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">历史管理</h1>
            <p class="text-gray-600 mt-1">管理系统历史记录和存储空间</p>
          </div>
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }" :whileHover="{ scale: 1.05 }"
            :transition="{ duration: 0.3, delay: 0.2 }">
            <div class="flex gap-2">
              <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
              <el-button type="warning" :icon="Delete" @click="cleanupHistory">清理历史</el-button>
            </div>
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 存储统计卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.1 } as any">
      <el-card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 text-sm font-medium">总存储空间</p>
                <p class="text-2xl font-bold text-blue-900">{{ storageStats.total }}</p>
                <p class="text-xs text-blue-500 mt-1">已分配空间</p>
              </div>
              <el-icon size="32" class="text-blue-500">
                <FolderOpened />
              </el-icon>
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-600 text-sm font-medium">已使用空间</p>
                <p class="text-2xl font-bold text-green-900">{{ storageStats.used }}</p>
                <p class="text-xs text-green-500 mt-1">使用率 {{ storageStats.usageRate }}%</p>
              </div>
              <el-icon size="32" class="text-green-500">
                <PieChart />
              </el-icon>
            </div>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-600 text-sm font-medium">历史记录数</p>
                <p class="text-2xl font-bold text-orange-900">{{ storageStats.recordCount }}</p>
                <p class="text-xs text-orange-500 mt-1">总记录数量</p>
              </div>
              <el-icon size="32" class="text-orange-500">
                <Document />
              </el-icon>
            </div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-600 text-sm font-medium">图片文件数</p>
                <p class="text-2xl font-bold text-purple-900">{{ storageStats.imageCount }}</p>
                <p class="text-xs text-purple-500 mt-1">存储的图片</p>
              </div>
              <el-icon size="32" class="text-purple-500">
                <Picture />
              </el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 筛选和搜索 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
      <el-card class="mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-64">
            <label class="block text-sm font-medium text-gray-700 mb-2">搜索历史记录</label>
            <el-input v-model="params.query" placeholder="输入用户名、操作类型或关键词搜索" :prefix-icon="Search" clearable
              @keyup.enter="search" />
          </div>
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">操作类型</label>
            <el-select v-model="params.actionType" placeholder="选择操作类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="字符识别" value="recognition" />
              <el-option label="用户登录" value="login" />
              <el-option label="文件上传" value="upload" />
              <el-option label="数据导出" value="export" />
              <el-option label="系统设置" value="setting" />
            </el-select>
          </div>
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
            <el-date-picker v-model="params.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
          <div class="flex gap-2">
            <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
            <el-button @click="resetParams">重置</el-button>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 历史记录表格 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-medium">历史记录列表</span>
            <div class="flex gap-2">
              <el-button size="small" :icon="Download" @click="exportHistory">导出历史</el-button>
              <el-button size="small" type="warning" :icon="Delete" @click="batchDelete"
                :disabled="!selectedIds.length">
                批量删除
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="clearAllHistory">清空历史</el-button>
            </div>
          </div>
        </template>

        <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange" stripe
          style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户" width="120" />
          <el-table-column prop="action_type" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getActionTypeColor(row.action_type)">
                {{ getActionTypeText(row.action_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="操作描述" min-width="200" />
          <el-table-column prop="ip_address" label="IP地址" width="140" />
          <el-table-column prop="user_agent" label="设备信息" width="200" show-overflow-tooltip />
          <el-table-column prop="file_size" label="文件大小" width="100">
            <template #default="{ row }">
              <span v-if="row.file_size">{{ formatFileSize(row.file_size) }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="操作时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="danger" @click="deleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-center mt-6">
          <el-pagination v-model:current-page="params.page" v-model:page-size="params.page_size"
            :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
            @size-change="getHistoryList" @current-change="getHistoryList" />
        </div>
      </el-card>
    </Motion>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="历史记录详情" width="700px" :before-close="closeDetail">
      <div v-if="currentRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-gray-600">记录ID:</label>
            <p class="font-medium">{{ currentRecord.id }}</p>
          </div>
          <div>
            <label class="text-gray-600">用户:</label>
            <p class="font-medium">{{ currentRecord.username }}</p>
          </div>
          <div>
            <label class="text-gray-600">操作类型:</label>
            <el-tag :type="getActionTypeColor(currentRecord.action_type)">
              {{ getActionTypeText(currentRecord.action_type) }}
            </el-tag>
          </div>
          <div>
            <label class="text-gray-600">操作时间:</label>
            <p class="font-medium">{{ formatDate(currentRecord.created_at) }}</p>
          </div>
          <div>
            <label class="text-gray-600">IP地址:</label>
            <p class="font-medium">{{ currentRecord.ip_address }}</p>
          </div>
          <div>
            <label class="text-gray-600">文件大小:</label>
            <p class="font-medium">{{ currentRecord.file_size ? formatFileSize(currentRecord.file_size) : '-' }}</p>
          </div>
        </div>
        <div>
          <label class="text-gray-600">操作描述:</label>
          <p class="font-medium mt-1">{{ currentRecord.description }}</p>
        </div>
        <div>
          <label class="text-gray-600">设备信息:</label>
          <p class="font-medium mt-1 text-sm">{{ currentRecord.user_agent }}</p>
        </div>
        <div v-if="currentRecord.extra_data">
          <label class="text-gray-600">额外数据:</label>
          <pre class="bg-gray-50 p-3 rounded mt-1 text-sm">{{ JSON.stringify(currentRecord.extra_data, null, 2) }}</pre>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <el-button @click="closeDetail">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 存储清理弹窗 -->
    <el-dialog v-model="cleanupVisible" title="存储空间清理" width="600px">
      <div class="space-y-4">
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-yellow-800 mb-2">清理选项</h3>
          <div class="space-y-2">
            <el-checkbox v-model="cleanupOptions.oldRecords">
              清理30天前的历史记录 ({{ cleanupStats.oldRecords }} 条)
            </el-checkbox>
            <el-checkbox v-model="cleanupOptions.tempFiles">
              清理临时文件 ({{ formatFileSize(cleanupStats.tempFiles) }})
            </el-checkbox>
            <el-checkbox v-model="cleanupOptions.failedUploads">
              清理失败的上传文件 ({{ cleanupStats.failedUploads }} 个)
            </el-checkbox>
            <el-checkbox v-model="cleanupOptions.duplicateImages">
              清理重复图片 ({{ formatFileSize(cleanupStats.duplicateImages) }})
            </el-checkbox>
          </div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-blue-800">
            预计可释放空间: <strong>{{ formatFileSize(estimatedSpace) }}</strong>
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="cleanupVisible = false">取消</el-button>
          <el-button type="primary" @click="executeCleanup">开始清理</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Search,
  Document,
  Download,
  Delete,
  FolderOpened,
  PieChart,
  Picture
} from '@element-plus/icons-vue'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  transition: { duration: 0.3 }
}

// 接口类型定义
interface HistoryRecord {
  id: number
  username: string
  action_type: string
  description: string
  ip_address: string
  user_agent: string
  file_size?: number
  extra_data?: any
  created_at: string
}

interface QueryParams {
  query: string
  actionType: string
  dateRange: string[]
  page: number
  page_size: number
}

// 响应式数据
const loading = ref(false)
const historyList = ref<HistoryRecord[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const detailVisible = ref(false)
const cleanupVisible = ref(false)
const currentRecord = ref<HistoryRecord | null>(null)

// 查询参数
const params = reactive<QueryParams>({
  query: '',
  actionType: '',
  dateRange: [],
  page: 1,
  page_size: 10
})

// 存储统计
const storageStats = ref({
  total: '500 GB',
  used: '156 GB',
  usageRate: 31.2,
  recordCount: 15678,
  imageCount: 8934
})

// 清理选项
const cleanupOptions = reactive({
  oldRecords: false,
  tempFiles: false,
  failedUploads: false,
  duplicateImages: false
})

// 清理统计
const cleanupStats = ref({
  oldRecords: 1234,
  tempFiles: 2.5 * 1024 * 1024 * 1024, // 2.5GB
  failedUploads: 56,
  duplicateImages: 1.2 * 1024 * 1024 * 1024 // 1.2GB
})

// 预计释放空间
const estimatedSpace = computed(() => {
  let space = 0
  if (cleanupOptions.tempFiles) space += cleanupStats.value.tempFiles
  if (cleanupOptions.duplicateImages) space += cleanupStats.value.duplicateImages
  if (cleanupOptions.oldRecords) space += cleanupStats.value.oldRecords * 50 * 1024 // 假设每条记录50KB
  if (cleanupOptions.failedUploads) space += cleanupStats.value.failedUploads * 2 * 1024 * 1024 // 假设每个文件2MB
  return space
})

// 获取历史记录列表
const getHistoryList = async () => {
  try {
    loading.value = true
    // 模拟API调用
    const mockData = {
      records: [
        {
          id: 1,
          username: '张三',
          action_type: 'recognition',
          description: '上传图片进行字符识别',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          file_size: 1024 * 256, // 256KB
          created_at: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          username: '李四',
          action_type: 'login',
          description: '用户登录系统',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          created_at: '2024-01-15 09:45:00'
        },
        {
          id: 3,
          username: '王五',
          action_type: 'upload',
          description: '批量上传训练图片',
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 5, // 5MB
          created_at: '2024-01-15 08:20:00'
        }
      ],
      total: 15678
    }

    historyList.value = mockData.records
    total.value = mockData.total
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  getHistoryList()
}

// 搜索
const search = () => {
  params.page = 1
  getHistoryList()
}

// 重置参数
const resetParams = () => {
  Object.assign(params, {
    query: '',
    actionType: '',
    dateRange: [],
    page: 1,
    page_size: 10
  })
  getHistoryList()
}

// 查看详情
const viewDetail = (record: HistoryRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 关闭详情
const closeDetail = () => {
  detailVisible.value = false
  currentRecord.value = null
}

// 删除记录
const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条历史记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 模拟API调用
    ElMessage.success('删除成功')
    getHistoryList()
  } catch (error) {
    console.log('取消删除')
  }
}

// 批量删除
const batchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要删除的记录')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 模拟API调用
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    getHistoryList()
  } catch (error) {
    console.log('取消批量删除')
  }
}

// 清空所有历史
const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？此操作不可恢复！', '危险操作', {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error'
    })

    // 模拟API调用
    ElMessage.success('历史记录已清空')
    getHistoryList()
  } catch (error) {
    console.log('取消清空')
  }
}

// 导出历史
const exportHistory = () => {
  ElMessage.success('导出功能开发中...')
}

// 清理历史
const cleanupHistory = () => {
  cleanupVisible.value = true
}

// 执行清理
const executeCleanup = async () => {
  const selectedOptions = Object.entries(cleanupOptions).filter(([_, selected]) => selected)

  if (!selectedOptions.length) {
    ElMessage.warning('请选择至少一个清理选项')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要执行选中的清理操作吗？预计释放 ${formatFileSize(estimatedSpace.value)} 空间`, '确认清理', {
      confirmButtonText: '开始清理',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 模拟清理过程
    ElMessage.success(`清理完成，释放了 ${formatFileSize(estimatedSpace.value)} 存储空间`)
    cleanupVisible.value = false

    // 重置清理选项
    Object.keys(cleanupOptions).forEach(key => {
      cleanupOptions[key as keyof typeof cleanupOptions] = false
    })

    // 刷新数据
    refreshData()
  } catch (error) {
    console.log('取消清理')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: HistoryRecord[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取操作类型颜色
const getActionTypeColor = (type: string) => {
  const colorMap = {
    recognition: 'success',
    login: 'primary',
    upload: 'warning',
    export: 'info',
    setting: 'danger'
  }
  return colorMap[type as keyof typeof colorMap] || 'info'
}

// 获取操作类型文本
const getActionTypeText = (type: string) => {
  const textMap = {
    recognition: '字符识别',
    login: '用户登录',
    upload: '文件上传',
    export: '数据导出',
    setting: '系统设置'
  }
  return textMap[type as keyof typeof textMap] || '未知操作'
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getHistoryList()
})
</script>

<style scoped>
.history-manage {
  width: 100%;
}

.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>