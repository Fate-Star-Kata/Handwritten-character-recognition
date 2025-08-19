<template>
  <div class="detection-manage">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="cardVariants.transition as any">
      <el-card class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">检测管理</h1>
            <p class="text-gray-600 mt-1">管理所有字符识别检测记录</p>
          </div>
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }" :whileHover="{ scale: 1.05 }"
            :transition="{ duration: 0.3, delay: 0.2 }">
            <el-button type="primary" :icon="Refresh" @click="getList">刷新数据</el-button>
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 搜索和筛选 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.1 } as any">
      <el-card class="mb-6">
        <div class="flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-64">
            <label class="block text-sm font-medium text-gray-700 mb-2">搜索检测记录</label>
            <el-input v-model="params.query" placeholder="输入用户名、识别内容或文件名搜索" :prefix-icon="Search" clearable
              @keyup.enter="search" />
          </div>
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-2">检测状态</label>
            <el-select v-model="params.status" placeholder="选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failed" />
              <el-option label="处理中" value="processing" />
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

    <!-- 统计卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
      <el-card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 text-sm font-medium">总检测次数</p>
                <p class="text-2xl font-bold text-blue-900">{{ statistics.total }}</p>
              </div>
              <el-icon size="32" class="text-blue-500">
                <Document />
              </el-icon>
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-600 text-sm font-medium">成功识别</p>
                <p class="text-2xl font-bold text-green-900">{{ statistics.success }}</p>
              </div>
              <el-icon size="32" class="text-green-500">
                <SuccessFilled />
              </el-icon>
            </div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-red-600 text-sm font-medium">识别失败</p>
                <p class="text-2xl font-bold text-red-900">{{ statistics.failed }}</p>
              </div>
              <el-icon size="32" class="text-red-500">
                <CircleCloseFilled />
              </el-icon>
            </div>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-600 text-sm font-medium">平均准确率</p>
                <p class="text-2xl font-bold text-orange-900">{{ statistics.accuracy }}%</p>
              </div>
              <el-icon size="32" class="text-orange-500">
                <TrendCharts />
              </el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 检测记录表格 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-medium">检测记录列表</span>
            <div class="flex gap-2">
              <el-button size="small" :icon="Download" @click="exportData">导出数据</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="batchDelete" :disabled="!selectedIds.length">
                批量删除
              </el-button>
            </div>
          </div>
        </template>

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange" stripe style="width: 100%"
          table-layout="auto" border>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户" min-width="120" />
          <el-table-column label="原始图片" min-width="120">
            <template #default="{ row }">
              <el-image :src="row.original_image" :preview-src-list="[row.original_image]" fit="cover"
                class="w-16 h-16 rounded cursor-pointer" preview-teleported />
            </template>
          </el-table-column>
          <el-table-column prop="recognized_text" label="识别结果" min-width="150">
            <template #default="{ row }">
              <el-tag v-if="row.recognized_text" type="success">{{ row.recognized_text }}</el-tag>
              <el-tag v-else type="info">未识别</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="confidence" label="置信度" min-width="100">
            <template #default="{ row }">
              <el-progress :percentage="Math.round(row.confidence * 100)"
                :status="row.confidence > 0.8 ? 'success' : row.confidence > 0.6 ? 'warning' : 'exception'"
                :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="processing_time" label="处理时间" min-width="120">
            <template #default="{ row }">
              {{ row.processing_time }}ms
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="检测时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewDetail(row)">详情</el-button>
              <el-button size="small" type="warning" @click="reprocess(row.id)">重新处理</el-button>
              <el-button size="small" type="danger" @click="deleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-center mt-6">
          <el-pagination v-model:current-page="params.page" v-model:page-size="params.page_size"
            :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
            @size-change="getList" @current-change="getList" />
        </div>
      </el-card>
    </Motion>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="检测详情" width="800px" :before-close="closeDetail">
      <div v-if="currentRecord" class="space-y-6">
        <!-- 基本信息 -->
        <div class="grid grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium mb-4">基本信息</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">检测ID:</span>
                <span>{{ currentRecord.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">用户:</span>
                <span>{{ currentRecord.username }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">状态:</span>
                <el-tag :type="currentRecord.status === 'success' ? 'success' : 'danger'">
                  {{ getStatusText(currentRecord.status) }}
                </el-tag>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">处理时间:</span>
                <span>{{ currentRecord.processing_time }}ms</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">检测时间:</span>
                <span>{{ formatDate(currentRecord.created_at) }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-medium mb-4">识别结果</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">识别文字:</span>
                <span class="font-medium">{{ currentRecord.recognized_text || '未识别' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">置信度:</span>
                <span>{{ Math.round(currentRecord.confidence * 100) }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">字符类型:</span>
                <span>{{ currentRecord.character_type || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片对比 -->
        <div>
          <h3 class="text-lg font-medium mb-4">图片信息</h3>
          <div class="grid grid-cols-2 gap-6">
            <div class="text-center">
              <p class="text-gray-600 mb-2">原始图片</p>
              <el-image :src="currentRecord.original_image" fit="contain" class="w-full h-48 border rounded"
                :preview-src-list="[currentRecord.original_image]" preview-teleported />
            </div>
            <div class="text-center" v-if="currentRecord.processed_image">
              <p class="text-gray-600 mb-2">处理后图片</p>
              <el-image :src="currentRecord.processed_image" fit="contain" class="w-full h-48 border rounded"
                :preview-src-list="[currentRecord.processed_image]" preview-teleported />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="closeDetail">关闭</el-button>
          <el-button type="primary" @click="currentRecord?.id && reprocess(currentRecord.id)">重新处理</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Search,
  Document,
  Download,
  Delete,
  SuccessFilled,
  CircleCloseFilled,
  TrendCharts
} from '@element-plus/icons-vue'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  transition: { duration: 0.3 }
}

// 接口类型定义
interface DetectionRecord {
  id: number
  username: string
  original_image: string
  processed_image?: string
  recognized_text: string
  confidence: number
  status: 'success' | 'failed' | 'processing'
  processing_time: number
  character_type?: string
  created_at: string
}

interface QueryParams {
  query: string
  status: string
  dateRange: string[]
  page: number
  page_size: number
}

// 响应式数据
const loading = ref(false)
const list = ref<DetectionRecord[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const detailVisible = ref(false)
const currentRecord = ref<DetectionRecord | null>(null)

// 查询参数
const params = reactive<QueryParams>({
  query: '',
  status: '',
  dateRange: [],
  page: 1,
  page_size: 10
})

// 统计数据
const statistics = ref({
  total: 0,
  success: 0,
  failed: 0,
  accuracy: 0
})

// 获取检测记录列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用
    const mockData = {
      records: [
        {
          id: 1,
          username: '张三',
          original_image: '/api/images/sample1.jpg',
          recognized_text: '学',
          confidence: 0.95,
          status: 'success' as const,
          processing_time: 120,
          character_type: '汉字',
          created_at: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          username: '李四',
          original_image: '/api/images/sample2.jpg',
          recognized_text: 'A',
          confidence: 0.88,
          status: 'success' as const,
          processing_time: 95,
          character_type: '字母',
          created_at: '2024-01-15 09:45:00'
        }
      ],
      total: 156,
      statistics: {
        total: 156,
        success: 142,
        failed: 14,
        accuracy: 91.0
      }
    }

    list.value = mockData.records
    total.value = mockData.total
    statistics.value = mockData.statistics
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取检测记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const search = () => {
  params.page = 1
  getList()
}

// 重置参数
const resetParams = () => {
  Object.assign(params, {
    query: '',
    status: '',
    dateRange: [],
    page: 1,
    page_size: 10
  })
  getList()
}

// 查看详情
const viewDetail = (record: DetectionRecord) => {
  currentRecord.value = record
  detailVisible.value = true
}

// 关闭详情
const closeDetail = () => {
  detailVisible.value = false
  currentRecord.value = null
}

// 重新处理
const reprocess = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要重新处理这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 模拟API调用
    ElMessage.success('重新处理成功')
    getList()
  } catch (error) {
    console.log('取消重新处理')
  }
}

// 删除记录
const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 模拟API调用
    ElMessage.success('删除成功')
    getList()
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
    getList()
  } catch (error) {
    console.log('取消批量删除')
  }
}

// 导出数据
const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

// 表格选择变化
const handleSelectionChange = (selection: DetectionRecord[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    processing: '处理中'
  }
  return statusMap[status as keyof typeof statusMap] || '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  getList()
})
</script>

<style scoped>
.detection-manage {
  width: 100%;
  overflow-x: hidden;
}

.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>