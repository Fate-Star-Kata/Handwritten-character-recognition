<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="max-w-6xl mx-auto"
    >
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">检测历史</h1>
        <p class="text-gray-500 text-lg">查看和管理您的手写字识别历史记录</p>
      </div>

      <!-- 搜索和筛选区域 -->
      <div class="flex gap-4 mb-8 flex-wrap items-stretch bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div class="relative flex-1 min-w-[300px]">
          <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索识别结果..."
            class="w-full h-11 pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm transition-all duration-300 bg-gray-50 box-border focus:outline-none focus:border-blue-500 focus:shadow-blue-100 focus:shadow-[0_0_0_3px] focus:bg-white hover:bg-white hover:border-gray-400"
            @input="handleSearch"
          />
        </div>

        <div class="flex gap-4 items-stretch">
          <select
            v-model="selectedType"
            class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            @change="handleFilterChange"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <select
            v-model="selectedTimeRange"
            class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            @change="handleFilterChange"
          >
            <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <!-- 批量操作头部 -->
        <div class="p-6 bg-gray-50 border-b border-gray-200 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <label class="flex items-center cursor-pointer font-semibold text-gray-700">
                <input
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
                <span class="ml-2">全选</span>
              </label>
              <span v-if="selectedItems.size > 0" class="text-blue-600 font-semibold">
                已选择 {{ selectedItems.size }} 项
              </span>
            </div>

            <div class="flex gap-4">
              <button
                @click="deleteSelected"
                :disabled="selectedItems.size === 0"
                class="bg-red-500 text-white border-0 rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:bg-red-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
                删除选中
              </button>

              <button
                @click="exportSelected"
                :disabled="selectedItems.size === 0"
                class="bg-emerald-500 text-white border-0 rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:bg-emerald-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
                导出选中
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
          <div class="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="filteredHistory.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-500 text-center">
          <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-semibold mb-2">暂无历史记录</h3>
          <p>您还没有进行过手写字识别，快去试试吧！</p>
        </div>

        <div v-else class="p-4">
          <motion.div
            v-for="(item, index) in paginatedHistory"
            :key="item.id"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.3, delay: index * 0.1 }"
            class="flex items-center gap-4 p-6 border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 last:border-b-0"
          >
            <div class="flex-shrink-0">
              <input
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                :checked="selectedItems.has(item.id)"
                @change="toggleItemSelection(item.id)"
              />
            </div>

            <div class="flex-shrink-0 w-16 h-16">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.recognized_character" class="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
              <div v-else class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-4 mb-2">
                <h3 class="text-xl font-semibold text-gray-800 m-0">{{ getCharacterFromPath(item.recognized_character) }}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="{
                  'bg-blue-100 text-blue-800': getDetectionTypeClass(item.detection_type) === 'image',
                  'bg-green-100 text-green-800': getDetectionTypeClass(item.detection_type) === 'camera',
                  'bg-yellow-100 text-yellow-800': getDetectionTypeClass(item.detection_type) === 'handwriting',
                  'bg-purple-100 text-purple-800': getDetectionTypeClass(item.detection_type) === 'video'
                }">
                  {{ item.detection_type }}
                </span>
              </div>

              <div class="flex gap-6 text-gray-500 text-sm">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ formatTime(item.detection_time) }}
                </span>

                <span class="flex items-center" v-if="item.confidence">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  置信度: {{ (item.confidence * 100).toFixed(1) }}%
                </span>

                <span class="flex items-center" v-if="item.processing_time">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  处理时间: {{ (item.processing_time * 1000).toFixed(2) }}ms
                </span>
              </div>

              <!-- 候选字符列表 -->
              <div v-if="item.candidates && item.candidates.length > 1" class="mt-3">
                <span class="text-sm text-gray-600 mr-2">候选字符:</span>
                <div class="inline-flex gap-2">
                  <span
                    v-for="(candidate, index) in item.candidates.slice(0, 3)"
                    :key="index"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {{ getCharacterFromPath(candidate.character) }} ({{ (candidate.confidence * 100).toFixed(1) }}%)
                  </span>
                </div>
              </div>
            </div>

            <div class="item-actions">
              <button @click="viewDetails(item)" class="action-btn view-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
              </button>

              <button @click="deleteItem(item.id)" class="action-btn delete-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
        <button
          @click="handlePageChange(Math.max(1, currentPage - 1))"
          :disabled="currentPage === 1"
          class="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer transition-all duration-300 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          上一页
        </button>

        <div class="text-gray-600 font-semibold">
          <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页 (总计 {{ totalCount }} 条记录)</span>
        </div>

        <button
          @click="handlePageChange(Math.min(totalPages, currentPage + 1))"
          :disabled="currentPage === totalPages"
          class="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-semibold cursor-pointer transition-all duration-300 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { motion } from 'motion-v'
import { getHistoryAPI } from '@/api/user/userApi'
import type { HistoryQueryParams, HistoryRecord, HistoryData, HistoryResponse } from '@/types/apis/user_T'

// 历史记录项接口 - 基于API类型定义
// interface HistoryItem {
//   id: number
//   character: string
//   confidence: number
//   recognition_time: string
//   image_path: string
//   session_id: string
//   type?: 'image' | 'camera' | 'handwriting' // 前端扩展字段
// }

// 响应式数据
const allHistoryData = ref<HistoryRecord[]>([]) // 存储所有数据
const historyData = ref<HistoryRecord[]>([])
const selectedItems = ref<Set<number>>(new Set())
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedType = ref('all')
const selectedTimeRange = ref('all')
const loading = ref(false)
const totalCount = ref(0)
const totalPages = ref(0)

// 下拉框选项
const typeOptions = [
  { label: '全部类型', value: 'all' },
  { label: '图片识别', value: '图片识别' },
  { label: '手写板识别', value: '手写板识别' },
  { label: '视频识别', value: '视频识别' },
  { label: '摄像头识别', value: '摄像头识别' }
]

const timeRangeOptions = [
  { label: '全部时间', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]



// 计算属性 - 客户端筛选
const filteredHistory = computed(() => {
  let filtered = allHistoryData.value

  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    filtered = filtered.filter(item => {
      const character = getCharacterFromPath(item.recognized_character).toLowerCase()
      return character.includes(query)
    })
  }

  // 检测类型筛选
  if (selectedType.value && selectedType.value !== 'all' && selectedType.value !== '') {
    filtered = filtered.filter(item => {
      return item.detection_type === selectedType.value
    })
  }

  // 时间范围筛选
  if (selectedTimeRange.value && selectedTimeRange.value !== 'all' && selectedTimeRange.value !== '') {
    const now = new Date()
    let startDate: Date

    switch (selectedTimeRange.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0)
    }

    filtered = filtered.filter(item => {
      const itemDate = new Date(item.detection_time)
      return itemDate >= startDate && itemDate <= now
    })
  }

  return filtered
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

const isAllSelected = computed(() => {
  return paginatedHistory.value.length > 0 &&
         paginatedHistory.value.every(item => selectedItems.value.has(item.id))
})

// 更新总数和总页数
const updatePagination = () => {
  totalCount.value = filteredHistory.value.length
  totalPages.value = Math.ceil(totalCount.value / pageSize.value)

  // 如果当前页超出范围，重置到第一页
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = 1
  }
}

// 加载历史数据 - 只在初始化时加载所有数据
const loadHistoryData = async () => {
  try {
    loading.value = true

    // 获取所有数据，不传筛选参数
    const params: HistoryQueryParams = {
      page: 1,
      page_size: 1000 // 获取大量数据，实际应用中可能需要分批获取
    }

    const response: HistoryResponse = await getHistoryAPI(params)
    console.log("历史记录", response)

    if (response.success && response.data) {
      allHistoryData.value = response.data.records || []
      updatePagination()
    } else {
      console.error('获取历史数据失败:', response.message)
      allHistoryData.value = []
      totalCount.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('加载历史数据时出错:', error)
    allHistoryData.value = []
    totalCount.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

// 方法
const getDetectionTypeClass = (type: string) => {
  const typeMap: Record<string, string> = {
    '图片识别': 'image',
    '手写板识别': 'handwriting',
    '摄像头识别': 'camera',
    '视频识别': 'video'
  }
  return typeMap[type] || 'image'
}

// 从图片路径提取字符名称
const getCharacterFromPath = (imagePath: string) => {
  if (!imagePath) return '未知'
  // 从路径如 "Img/img001-045.png" 提取文件名
  const fileName = imagePath.split('/').pop() || ''
  // 移除扩展名
  return fileName.replace(/\.[^/.]+$/, '')
}

const getTypeLabel = (type: string) => {
  // detection_type 现在直接是中文值，无需映射
  return type || '未知类型'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    paginatedHistory.value.forEach(item => {
      selectedItems.value.delete(item.id)
    })
  } else {
    paginatedHistory.value.forEach(item => {
      selectedItems.value.add(item.id)
    })
  }
}

const toggleItemSelection = (id: number) => {
  if (selectedItems.value.has(id)) {
    selectedItems.value.delete(id)
  } else {
    selectedItems.value.add(id)
  }
}

const deleteSelected = () => {
  if (confirm(`确定要删除选中的 ${selectedItems.value.size} 项记录吗？`)) {
    historyData.value = historyData.value.filter(
      item => !selectedItems.value.has(item.id)
    )
    selectedItems.value.clear()
  }
}

const exportSelected = () => {
  const selectedData = historyData.value.filter(
    item => selectedItems.value.has(item.id)
  )

  const csvContent = [
    ['识别结果', '类型', '置信度', '创建时间', '处理时间'],
    ...selectedData.map(item => [
      getCharacterFromPath(item.recognized_character),
      item.detection_type,
      item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : '',
      new Date(item.detection_time).toLocaleString('zh-CN'),
      item.processing_time ? `${(item.processing_time * 1000).toFixed(2)}ms` : ''
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `识别历史_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

const viewDetails = (item: HistoryRecord) => {
  // 显示详情弹窗或跳转到详情页
  console.log('查看详情:', item)
}

const deleteItem = (id: number) => {
  if (confirm('确定要删除这条记录吗？')) {
    historyData.value = historyData.value.filter(item => item.id !== id)
    selectedItems.value.delete(id)
    // TODO: 调用删除API
  }
}

// 监听搜索和筛选条件变化 - 客户端处理
const handleSearch = () => {
  currentPage.value = 1
  updatePagination()
}

const handleFilterChange = () => {
  currentPage.value = 1
  updatePagination()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 监听筛选条件变化，自动更新分页
watch([searchQuery, selectedType, selectedTimeRange], () => {
  updatePagination()
})

// 组件挂载时加载数据
onMounted(() => {
  loadHistoryData()
})
</script>

<style scoped lang="scss">
.history-container {
  min-height: 100vh;
  background: #F8FAFC;
  padding: 2rem;
}

.history-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  color: #6b7280;
  font-size: 1.1rem;
}

.search-filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: stretch;
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 12px 16px 12px 48px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f9fafb;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: white;
  }

  &:hover {
    background: white;
    border-color: #9ca3af;
  }
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}



.list-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 1rem 1rem 0 0;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.select-all {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
}

.selected-count {
  color: #3b82f6;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.export-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.history-list {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.history-items {
  padding: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-checkbox {
  flex-shrink: 0;

  :deep(.devui-checkbox) {
    margin: 0;
  }
}

.item-preview {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
}

.placeholder-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #9ca3af;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.item-result {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.item-type {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;

  &.type-image {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.type-camera {
    background: #dcfce7;
    color: #166534;
  }

  &.type-handwriting {
    background: #fef3c7;
    color: #92400e;
  }
}

.item-meta {
  display: flex;
  gap: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.item-time,
.item-confidence {
  display: flex;
  align-items: center;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.view-btn {
    background: #f3f4f6;
    color: #374151;

    &:hover {
      background: #e5e7eb;
    }
  }

  &.delete-btn {
    background: #fef2f2;
    color: #dc2626;

    &:hover {
      background: #fee2e2;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.pagination-info {
  color: #6b7280;
  font-weight: 600;
}

@media (max-width: 768px) {
  .history-container {
    padding: 1rem;
  }

  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    justify-content: center;
  }

  .bulk-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
