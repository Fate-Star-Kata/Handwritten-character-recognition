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
            <el-button type="primary" :icon="Refresh" :loading="loading" circle @click="getList" />
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
            <el-input v-model="params.search" placeholder="输入用户名、识别内容或文件名搜索" :prefix-icon="Search" clearable
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

        <el-table v-loading="loading" :data="paginatedList" @selection-change="handleSelectionChange" stripe
          style="width: 100%" table-layout="auto" border>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="detection_type" label="用户" min-width="120" />
          <el-table-column prop="recognized_character" label="识别结果" min-width="150">
            <template #default="{ row }">
              <el-tag v-if="row.recognized_character" type="success">{{ row.recognized_character }}</el-tag>
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
          <el-table-column prop="is_correct" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_correct === true ? 'success' : row.is_correct === false ? 'danger' : 'warning'">
                {{ getStatusText(row.is_correct) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="processing_time" label="处理时间" min-width="120">
            <template #default="{ row }">
              {{ row.processing_time }}ms
            </template>
          </el-table-column>
          <el-table-column prop="detection_time" label="检测时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.detection_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="100" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="deleteRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="flex justify-center mt-6">
          <el-pagination v-model:current-page="params.page" v-model:page-size="params.page_size"
            :page-sizes="[10, 20, 50, 100]" :total="filteredTotal" layout="total, sizes, prev, pager, next, jumper" />
        </div>
      </el-card>
    </Motion>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
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
import {
  getDetectionList,
  deleteDetection,
  exportDetectionData
} from '@/api/admin/history'
import type {
  DetectionRecord,
  DetectionQueryParams,
  HistoryStatistics
} from '@/types/factory'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  transition: { duration: 0.3 }
}

// 使用从factory导入的类型定义

// 响应式数据
const loading = ref(false)
const list = ref<DetectionRecord[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])


// 查询参数
const params = reactive<DetectionQueryParams>({
  search: '',
  status: '',
  dateRange: [],
  page: 1,
  page_size: 10
})

// 统计数据
const statistics = ref<HistoryStatistics>({
  total: 0,
  success: 0,
  failed: 0,
  processing: 0,
  accuracy: 0
})

// 获取检测记录列表
const getList = async () => {
  try {
    loading.value = true
    const response = await getDetectionList(params)
    console.log(response)
    if (response.success && response.data) {
      list.value = response.data.records || []
      total.value = response.data.total || 0
      // 使用API返回的统计数据
      statistics.value = response.data.statistics || {
        total: 0,
        success: 0,
        failed: 0,
        accuracy: 0
      }
    } else {
      ElMessage.error(response.message || '获取检测记录失败')
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取检测记录失败')
  } finally {
    loading.value = false
  }
}

// 本地搜索和筛选
const filteredList = computed(() => {
  let result = list.value

  // 搜索筛选
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    result = result.filter(item =>
      item.detection_type?.toLowerCase().includes(searchTerm) ||
      item.recognized_character?.toLowerCase().includes(searchTerm) ||
      item.id.toString().includes(searchTerm)
    )
  }

  // 状态筛选
  if (params.status) {
    result = result.filter(item => {
      if (params.status === 'success') return item.is_correct === true
      if (params.status === 'failed') return item.is_correct === false
      if (params.status === 'processing') return item.is_correct === null
      return true
    })
  }

  // 时间范围筛选
  if (params.dateRange && params.dateRange.length === 2) {
    const [startDate, endDate] = params.dateRange
    result = result.filter(item => {
      const itemDate = new Date(item.detection_time).toISOString().slice(0, 10)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

// 分页后的数据
const paginatedList = computed(() => {
  const start = (params.page - 1) * params.page_size
  const end = start + params.page_size
  return filteredList.value.slice(start, end)
})

// 更新总数
const filteredTotal = computed(() => filteredList.value.length)

// 搜索（本地搜索，重置页码）
const search = () => {
  params.page = 1
}

// 重置参数
const resetParams = () => {
  Object.assign(params, {
    search: '',
    status: '',
    dateRange: [],
    page: 1,
    page_size: 10
  })
}



// 删除记录
const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteDetection(id)
    console.log(response)
    if (response.data) {
      ElMessage.success(response.message || response.data || '删除成功')
      getList()
    } else {
      ElMessage.error(response.message || response.data || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
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

    loading.value = true
    let successCount = 0
    let failCount = 0

    // 循环调用单个删除接口
    for (const id of selectedIds.value) {
      try {
        const response = await deleteDetection(id)
        if (response.data) {
          successCount++
        } else {
          failCount++
          console.error(`删除记录 ${id} 失败:`, response.message)
        }
      } catch (error) {
        failCount++
        console.error(`删除记录 ${id} 失败:`, error)
      }
    }

    // 显示结果消息
    if (failCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 条记录`)
    } else if (successCount === 0) {
      ElMessage.error(`删除失败，共 ${failCount} 条记录删除失败`)
    } else {
      ElMessage.warning(`删除完成：成功 ${successCount} 条，失败 ${failCount} 条`)
    }

    selectedIds.value = []
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    const blob = await exportDetectionData(params)
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `检测记录_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 表格选择变化
const handleSelectionChange = (selection: DetectionRecord[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取状态文本
const getStatusText = (isCorrect: boolean | null) => {
  if (isCorrect === true) return '成功'
  if (isCorrect === false) return '失败'
  return '处理中'
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