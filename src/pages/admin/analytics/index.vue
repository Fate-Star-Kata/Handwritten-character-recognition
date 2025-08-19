<template>
  <div class="analytics">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="cardVariants.transition as any">
      <el-card class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">数据分析</h1>
            <p class="text-gray-600 mt-1">系统性能分析与数据统计报告</p>
          </div>
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :whileHover="{ scale: 1.05 }" :transition="{ duration: 0.3, delay: 0.2 }">
            <div class="flex gap-2">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="updateCharts"
              />
              <el-button type="primary" :icon="Refresh" @click="refreshData">刷新数据</el-button>
            </div>
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 核心指标卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.1 } as any">
      <el-card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium">总识别次数</p>
                <p class="text-3xl font-bold">{{ metrics.totalRecognitions.toLocaleString() }}</p>
                <div class="flex items-center mt-2">
                  <el-icon class="text-green-300 mr-1">
                    <TrendCharts />
                  </el-icon>
                  <span class="text-green-300 text-sm">+{{ metrics.recognitionGrowth }}%</span>
                </div>
              </div>
              <el-icon size="40" class="text-blue-200">
                <DataAnalysis />
              </el-icon>
            </div>
          </div>

          <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm font-medium">平均准确率</p>
                <p class="text-3xl font-bold">{{ metrics.averageAccuracy }}%</p>
                <div class="flex items-center mt-2">
                  <el-icon class="text-green-300 mr-1">
                    <ArrowUp />
                  </el-icon>
                  <span class="text-green-300 text-sm">+{{ metrics.accuracyImprovement }}%</span>
                </div>
              </div>
              <el-icon size="40" class="text-green-200">
                <SuccessFilled />
              </el-icon>
            </div>
          </div>

          <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm font-medium">平均响应时间</p>
                <p class="text-3xl font-bold">{{ metrics.averageResponseTime }}ms</p>
                <div class="flex items-center mt-2">
                  <el-icon class="text-green-300 mr-1">
                    <ArrowDown />
                  </el-icon>
                  <span class="text-green-300 text-sm">-{{ metrics.responseTimeImprovement }}%</span>
                </div>
              </div>
              <el-icon size="40" class="text-orange-200">
                <Timer />
              </el-icon>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium">活跃用户数</p>
                <p class="text-3xl font-bold">{{ metrics.activeUsers.toLocaleString() }}</p>
                <div class="flex items-center mt-2">
                  <el-icon class="text-green-300 mr-1">
                    <TrendCharts />
                  </el-icon>
                  <span class="text-green-300 text-sm">+{{ metrics.userGrowth }}%</span>
                </div>
              </div>
              <el-icon size="40" class="text-purple-200">
                <User />
              </el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 识别趋势图 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">识别趋势分析</span>
              <el-select v-model="trendPeriod" size="small" @change="updateTrendChart">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="最近90天" value="90d" />
              </el-select>
            </div>
          </template>
          <div ref="trendChartRef" class="h-80"></div>
        </el-card>
      </Motion>

      <!-- 准确率分布图 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">准确率分布</span>
          </template>
          <div ref="accuracyChartRef" class="h-80"></div>
        </el-card>
      </Motion>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 字符类型统计 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.4 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">字符类型统计</span>
          </template>
          <div ref="characterTypeChartRef" class="h-80"></div>
        </el-card>
      </Motion>

      <!-- 用户活跃度 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.5 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">用户活跃度热力图</span>
          </template>
          <div ref="heatmapChartRef" class="h-80"></div>
        </el-card>
      </Motion>
    </div>

    <!-- 性能监控 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.6 } as any">
      <el-card class="mb-6">
        <template #header>
          <span class="font-medium">系统性能监控</span>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- CPU使用率 -->
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">CPU使用率</h3>
            <div class="relative inline-block">
              <el-progress
                type="circle"
                :percentage="systemMetrics.cpuUsage"
                :width="120"
                :stroke-width="8"
                :color="getProgressColor(systemMetrics.cpuUsage)"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold">{{ systemMetrics.cpuUsage }}%</span>
              </div>
            </div>
          </div>

          <!-- 内存使用率 -->
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">内存使用率</h3>
            <div class="relative inline-block">
              <el-progress
                type="circle"
                :percentage="systemMetrics.memoryUsage"
                :width="120"
                :stroke-width="8"
                :color="getProgressColor(systemMetrics.memoryUsage)"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold">{{ systemMetrics.memoryUsage }}%</span>
              </div>
            </div>
          </div>

          <!-- 磁盘使用率 -->
          <div class="text-center">
            <h3 class="text-lg font-medium mb-4">磁盘使用率</h3>
            <div class="relative inline-block">
              <el-progress
                type="circle"
                :percentage="systemMetrics.diskUsage"
                :width="120"
                :stroke-width="8"
                :color="getProgressColor(systemMetrics.diskUsage)"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold">{{ systemMetrics.diskUsage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </Motion>

    <!-- 详细统计表格 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.7 } as any">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-medium">详细统计数据</span>
            <el-button size="small" :icon="Download" @click="exportReport">导出报告</el-button>
          </div>
        </template>

        <el-table :data="detailedStats" stripe style="width: 100%">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="recognitions" label="识别次数" width="120">
            <template #default="{ row }">
              {{ row.recognitions.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="accuracy" label="平均准确率" width="120">
            <template #default="{ row }">
              {{ row.accuracy }}%
            </template>
          </el-table-column>
          <el-table-column prop="responseTime" label="平均响应时间" width="140">
            <template #default="{ row }">
              {{ row.responseTime }}ms
            </template>
          </el-table-column>
          <el-table-column prop="activeUsers" label="活跃用户" width="120">
            <template #default="{ row }">
              {{ row.activeUsers.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="errorRate" label="错误率" width="100">
            <template #default="{ row }">
              <el-tag :type="row.errorRate > 5 ? 'danger' : row.errorRate > 2 ? 'warning' : 'success'">
                {{ row.errorRate }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="peakHour" label="高峰时段" width="120" />
          <el-table-column prop="totalProcessed" label="处理数据量" min-width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.totalProcessed) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Download,
  DataAnalysis,
  SuccessFilled,
  Timer,
  User,
  TrendCharts,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  transition: { duration: 0.3 }
}

// 响应式数据
const dateRange = ref<string[]>([])
const trendPeriod = ref('30d')

// 图表引用
const trendChartRef = ref<HTMLElement>()
const accuracyChartRef = ref<HTMLElement>()
const characterTypeChartRef = ref<HTMLElement>()
const heatmapChartRef = ref<HTMLElement>()

// 核心指标
const metrics = ref({
  totalRecognitions: 156789,
  recognitionGrowth: 12.5,
  averageAccuracy: 94.2,
  accuracyImprovement: 2.3,
  averageResponseTime: 156,
  responseTimeImprovement: 8.7,
  activeUsers: 2847,
  userGrowth: 15.6
})

// 系统性能指标
const systemMetrics = ref({
  cpuUsage: 45,
  memoryUsage: 67,
  diskUsage: 32
})

// 详细统计数据
const detailedStats = ref([
  {
    date: '2024-01-15',
    recognitions: 1234,
    accuracy: 94.5,
    responseTime: 145,
    activeUsers: 156,
    errorRate: 1.2,
    peakHour: '14:00-15:00',
    totalProcessed: 2.5 * 1024 * 1024 * 1024 // 2.5GB
  },
  {
    date: '2024-01-14',
    recognitions: 1156,
    accuracy: 93.8,
    responseTime: 152,
    activeUsers: 142,
    errorRate: 1.8,
    peakHour: '15:00-16:00',
    totalProcessed: 2.2 * 1024 * 1024 * 1024 // 2.2GB
  },
  {
    date: '2024-01-13',
    recognitions: 1089,
    accuracy: 94.1,
    responseTime: 148,
    activeUsers: 138,
    errorRate: 1.5,
    peakHour: '13:00-14:00',
    totalProcessed: 2.1 * 1024 * 1024 * 1024 // 2.1GB
  }
])

// 初始化图表
const initCharts = async () => {
  await nextTick()

  // 这里应该使用实际的图表库如 ECharts
  // 由于是UI展示，这里只是模拟图表容器
  if (trendChartRef.value) {
    trendChartRef.value.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-50 rounded">
        <div class="text-center">
          <div class="text-4xl mb-2">📈</div>
          <p class="text-gray-600">识别趋势图表</p>
          <p class="text-sm text-gray-500">ECharts 图表将在此显示</p>
        </div>
      </div>
    `
  }

  if (accuracyChartRef.value) {
    accuracyChartRef.value.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-50 rounded">
        <div class="text-center">
          <div class="text-4xl mb-2">🎯</div>
          <p class="text-gray-600">准确率分布图</p>
          <p class="text-sm text-gray-500">饼图或柱状图将在此显示</p>
        </div>
      </div>
    `
  }

  if (characterTypeChartRef.value) {
    characterTypeChartRef.value.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-50 rounded">
        <div class="text-center">
          <div class="text-4xl mb-2">🔤</div>
          <p class="text-gray-600">字符类型统计</p>
          <p class="text-sm text-gray-500">饼图将在此显示</p>
        </div>
      </div>
    `
  }

  if (heatmapChartRef.value) {
    heatmapChartRef.value.innerHTML = `
      <div class="flex items-center justify-center h-full bg-gray-50 rounded">
        <div class="text-center">
          <div class="text-4xl mb-2">🔥</div>
          <p class="text-gray-600">用户活跃度热力图</p>
          <p class="text-sm text-gray-500">热力图将在此显示</p>
        </div>
      </div>
    `
  }
}

// 刷新数据
const refreshData = async () => {
  try {
    // 模拟数据刷新
    ElMessage.success('数据已刷新')

    // 更新指标数据
    metrics.value = {
      totalRecognitions: Math.floor(Math.random() * 200000) + 150000,
      recognitionGrowth: Math.floor(Math.random() * 20) + 5,
      averageAccuracy: Math.floor(Math.random() * 10) + 90,
      accuracyImprovement: Math.floor(Math.random() * 5) + 1,
      averageResponseTime: Math.floor(Math.random() * 100) + 120,
      responseTimeImprovement: Math.floor(Math.random() * 15) + 5,
      activeUsers: Math.floor(Math.random() * 1000) + 2000,
      userGrowth: Math.floor(Math.random() * 25) + 10
    }

    // 更新系统指标
    systemMetrics.value = {
      cpuUsage: Math.floor(Math.random() * 40) + 30,
      memoryUsage: Math.floor(Math.random() * 30) + 50,
      diskUsage: Math.floor(Math.random() * 20) + 25
    }

    // 重新初始化图表
    await initCharts()
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  }
}

// 更新图表
const updateCharts = () => {
  ElMessage.info('正在更新图表数据...')
  initCharts()
}

// 更新趋势图表
const updateTrendChart = () => {
  ElMessage.info(`正在加载${trendPeriod.value}的趋势数据...`)
  initCharts()
}

// 导出报告
const exportReport = () => {
  ElMessage.success('报告导出功能开发中...')
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载
onMounted(() => {
  // 设置默认日期范围为最近30天
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]

  // 初始化图表
  initCharts()
})
</script>

<style scoped>
.analytics {
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

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>