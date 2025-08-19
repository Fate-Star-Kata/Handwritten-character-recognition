<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Motion } from 'motion-v'
import {
  Refresh,
  User,
  Document,
  TrendCharts,
  Timer,
  PieChart,
  Bell,
  Monitor,
  Cpu,
  DataAnalysis,
} from '@element-plus/icons-vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import PieChartComponent from '@/components/charts/PieChart.vue'
import { getStatisticsAPI, getAdminSystemStatsAPI, getAdminModelInfoAPI, getSystemStatusAPI } from '@/api/admin/statistics'
import type { StatisticsData, StatisticsPeriod, AdminSystemStatsData, AdminSystemStatsParams } from '@/types/apis/statistics'
import { ElMessage } from 'element-plus'

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  transition: { duration: 0.3 }
}

const statsCardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  whileHover: { scale: 1.02, y: -2 },
  transition: { duration: 0.2 }
}

const iconVariants = {
  initial: { scale: 0.8, rotate: -10 },
  animate: { scale: 1, rotate: 0 },
  whileHover: { scale: 1.1, rotate: 10 },
  transition: { duration: 0.2 }
}

// 响应式数据
const chartTimeRange = ref<StatisticsPeriod>('week')
const loading = ref(false)
const statisticsData = ref<StatisticsData>({
  total_detections: 0,
  avg_accuracy: 0,
  daily_stats: [],
  type_stats: [],
  char_stats: [],
  date_range: {
    start_date: '',
    end_date: '',
    days: 0
  }
})

// 管理员系统统计数据
const adminSystemStats = ref<AdminSystemStatsData | null>(null)
const modelInfo = ref<any>(null)
const systemStatusInfo = ref<any>(null)

// 模型状态
const systemStatus = computed(() => {
  if (!modelInfo.value) {
    return {
      type: 'warning' as const,
      text: '模型信息加载中'
    }
  }

  const model = modelInfo.value
  if (model.model_loaded) {
    return {
      type: 'success' as const,
      text: '模型运行正常'
    }
  } else {
    return {
      type: 'danger' as const,
      text: '模型未加载'
    }
  }
})

// 模型信息指标 - 计算属性，从模型信息API数据动态获取
const systemMetrics = computed(() => {
  if (!modelInfo.value) {
    // 使用模拟数据而不是0值
    return [
      {
        name: '模型版本',
        value: 'v2.1.0',
        status: 'success' as const,
        icon: 'Setting',
        iconClass: 'text-blue-500',
        type: 'text'
      },
      {
        name: '模型状态',
        value: '未加载',
        status: 'warning' as const,
        icon: 'Monitor',
        iconClass: 'text-orange-500',
        type: 'text'
      },
      {
        name: '置信度阈值',
        value: 75,
        status: 'success' as const,
        icon: 'TrendCharts',
        iconClass: 'text-green-500',
        type: 'percentage'
      },
      {
        name: '支持字符数',
        value: 36,
        status: 'success' as const,
        icon: 'Document',
        iconClass: 'text-purple-500',
        type: 'count'
      }
    ]
  }

  const model = modelInfo.value
  const confidencePercentage = Math.round((model.confidence_threshold || 0.75) * 100)
  const supportedCharCount = model.char_classes_count || 0

  return [
    {
      name: '模型版本',
      value: model.model_version || 'Unknown',
      status: model.model_version ? 'success' as const : 'warning' as const,
      icon: 'Setting',
      iconClass: 'text-blue-500',
      type: 'text'
    },
    {
      name: '模型状态',
      value: model.model_loaded ? '已加载' : '未加载',
      status: model.model_loaded ? 'success' as const : 'danger' as const,
      icon: 'Monitor',
      iconClass: model.model_loaded ? 'text-green-500' : 'text-red-500',
      type: 'text'
    },
    {
      name: '置信度阈值',
      value: confidencePercentage,
      status: confidencePercentage >= 70 ? 'success' as const : confidencePercentage >= 50 ? 'warning' as const : 'danger' as const,
      icon: 'TrendCharts',
      iconClass: 'text-green-500',
      type: 'percentage'
    },
    {
      name: '支持字符数',
      value: supportedCharCount,
      status: supportedCharCount > 30 ? 'success' as const : supportedCharCount > 10 ? 'warning' as const : 'danger' as const,
      icon: 'Document',
      iconClass: 'text-purple-500',
      type: 'count'
    }
  ]
})

// 最近活动数据 - 使用 daily_stats 数据生成活动列表
const recentActivities = computed(() => {
  // 优先使用 recent_activities 数据
  if (adminSystemStats.value?.recent_activities && adminSystemStats.value.recent_activities.length > 0) {
    return adminSystemStats.value.recent_activities.map((activity, index) => ({
      id: index + 1,
      title: activity.action,
      description: activity.details,
      time: formatTime(activity.timestamp),
      icon: getActivityIcon(activity.action),
      iconClass: getActivityIconClass(activity.action)
    }))
  }

  // 使用 daily_stats 数据生成活动列表
  if (statisticsData.value?.daily_stats && statisticsData.value.daily_stats.length > 0) {
    return statisticsData.value.daily_stats
      .slice(-5) // 取最近5天的数据
      .reverse() // 最新的在前
      .map((stat, index) => {
        const daysDiff = Math.abs(new Date().getTime() - new Date(stat.date).getTime()) / (1000 * 60 * 60 * 24)
        const timeText = daysDiff < 1 ? '今天' : daysDiff < 2 ? '昨天' : `${Math.floor(daysDiff)}天前`

        return {
          id: index + 1,
          title: '字符识别统计',
          description: `共完成 ${stat.count} 次字符识别，准确率良好`,
          time: timeText,
          icon: 'Document',
          iconClass: stat.count > 100 ? 'bg-green-100 text-green-600' :
            stat.count > 50 ? 'bg-blue-100 text-blue-600' :
              'bg-orange-100 text-orange-600'
        }
      })
  }

  // 如果没有数据，返回空数组
  return []
})

// 格式化时间
const formatTime = (timestamp: string) => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffMs = now.getTime() - activityTime.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}天前`
}

// 获取活动图标
const getActivityIcon = (action: string) => {
  if (action.includes('识别') || action.includes('检测')) return 'Document'
  if (action.includes('用户') || action.includes('注册')) return 'User'
  if (action.includes('系统') || action.includes('优化')) return 'TrendCharts'
  return 'Bell'
}

// 获取活动图标样式
const getActivityIconClass = (action: string) => {
  if (action.includes('识别') || action.includes('检测')) return 'bg-blue-100 text-blue-600'
  if (action.includes('用户') || action.includes('注册')) return 'bg-green-100 text-green-600'
  if (action.includes('系统') || action.includes('优化')) return 'bg-purple-100 text-purple-600'
  return 'bg-orange-100 text-orange-600'
}

// 图表数据计算属性
const trendChartData = computed(() => {
  if (!statisticsData.value.daily_stats || statisticsData.value.daily_stats.length === 0) {
    return []
  }
  return statisticsData.value.daily_stats.map(stat => ({
    date: stat.date,
    count: stat.count,
    accuracy: statisticsData.value.avg_accuracy / 100
  }))
})

const typeDistributionData = computed(() => {
  if (!statisticsData.value.type_stats || statisticsData.value.type_stats.length === 0) {
    return []
  }
  return statisticsData.value.type_stats.map(stat => ({
    name: stat.detection_type === 'canvas' ? '画布识别' : stat.detection_type,
    value: stat.count
  }))
})

const charDistributionData = computed(() => {
  if (!statisticsData.value.char_stats || statisticsData.value.char_stats.length === 0) {
    return []
  }
  return statisticsData.value.char_stats.slice(0, 6).map(stat => ({
    name: stat.recognized_character ? stat.recognized_character.replace('Img/', '').replace('.png', '') : '未知字符',
    value: stat.count
  }))
})

// 计算属性
const formattedAccuracy = computed(() => {
  return `${statisticsData.value.avg_accuracy.toFixed(1)}%`
})

const todayDetections = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayStat = statisticsData.value.daily_stats.find(stat => stat.date === today)
  return todayStat?.count || 0
})

const detectionGrowth = computed(() => {
  const stats = statisticsData.value.daily_stats
  if (stats.length < 2) return '+0%'

  const today = stats[stats.length - 1]?.count || 0
  const yesterday = stats[stats.length - 2]?.count || 0

  if (yesterday === 0) return '+0%'
  const growth = ((today - yesterday) / yesterday * 100).toFixed(1)
  return growth.startsWith('-') ? growth + '%' : '+' + growth + '%'
})

// 获取统计数据
const fetchStatistics = async (period: StatisticsPeriod = 'week') => {
  try {
    loading.value = true
    const data = await getStatisticsAPI({ period })
    statisticsData.value = data
  } catch (error) {
    console.error('获取统计数据错误:', error)
    ElMessage.error('获取统计数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取管理员系统统计数据
const fetchAdminSystemStats = async (period: StatisticsPeriod = 'week') => {
  try {
    const params: AdminSystemStatsParams = {
      period,
      include_activities: true
    }
    const data = await getAdminSystemStatsAPI(params)
    adminSystemStats.value = data
  } catch (error) {
    console.error('获取管理员系统统计数据错误:', error)
    ElMessage.error('获取系统统计数据失败，请稍后重试')
  }
}

// 获取模型信息
const fetchModelInfo = async () => {
  try {
    const data = await getAdminModelInfoAPI()
    modelInfo.value = data
  } catch (error) {
    console.error('获取模型信息错误:', error)
    ElMessage.error('获取模型信息失败，请稍后重试')
  }
}

// 获取系统状态
const fetchSystemStatus = async () => {
  try {
    const data = await getSystemStatusAPI()
    systemStatusInfo.value = data
    // systemStatus 是 computed 属性，会自动从 modelInfo 计算得出，无需手动赋值
  } catch (error) {
    console.error('获取系统状态错误:', error)
    ElMessage.error('获取系统状态失败，请稍后重试')
  }
}

// 获取所有数据
const fetchAllData = async (period: StatisticsPeriod = 'week') => {
  await Promise.all([
    fetchStatistics(period),
    fetchAdminSystemStats(period),
    fetchModelInfo(),
    fetchSystemStatus()
  ])
}

// 刷新数据
const refreshData = () => {
  fetchAllData(chartTimeRange.value)
}

// 时间范围变化处理
const handleTimeRangeChange = (value: StatisticsPeriod) => {
  chartTimeRange.value = value
  fetchAllData(value)
}

// 组件挂载时的初始化
onMounted(() => {
  fetchAllData()
})
</script>

<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="cardVariants.transition as any">
      <el-card class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">手写字符识别系统 - 仪表板</h1>
            <p class="text-gray-600 mt-1">实时监控系统运行状态和数据统计</p>
          </div>
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :whileHover="{ scale: 1.05, rotate: 180 }" :transition="{ duration: 0.3, delay: 0.2 }">
            <el-button type="primary" :icon="Refresh" :loading="loading" circle @click="refreshData" />
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 核心统计卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
      <el-card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">

          <!-- 总用户数 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.4 } as any"
            class="bg-blue-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 text-sm font-medium">总识别次数</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.6 }">
                  <p class="text-2xl font-bold text-blue-900">{{ statisticsData.total_detections.toLocaleString() }}</p>
                </Motion>
                <p class="text-xs text-blue-500 mt-1">{{ statisticsData.date_range.days }}天统计</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.5 } as any" class="text-blue-500">
                <el-icon size="32">
                  <User />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <!-- 今日识别次数 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.5 } as any"
            class="bg-green-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-600 text-sm font-medium">今日识别</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.7 }">
                  <p class="text-2xl font-bold text-green-900">{{ todayDetections.toLocaleString() }}</p>
                </Motion>
                <p class="text-xs text-green-500 mt-1">{{ detectionGrowth }} 昨日</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.6 } as any" class="text-green-500">
                <el-icon size="32">
                  <Document />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <!-- 识别准确率 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.6 } as any"
            class="bg-orange-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-600 text-sm font-medium">识别准确率</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.8 }">
                  <p class="text-2xl font-bold text-orange-900">{{ formattedAccuracy }}</p>
                </Motion>
                <p class="text-xs text-orange-500 mt-1">{{ chartTimeRange === 'week' ? '本周' : chartTimeRange === 'month'
                  ? '本月' : '当前周期' }}</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.7 } as any" class="text-orange-500">
                <el-icon size="32">
                  <TrendCharts />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <!-- 系统响应时间 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.7 } as any"
            class="bg-purple-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-600 text-sm font-medium">平均响应</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.9 }">
                  <p class="text-2xl font-bold text-purple-900">
                    {{ adminSystemStats?.performance_stats?.avg_response_time ?
                      adminSystemStats.performance_stats.avg_response_time.toFixed(2) + 's' : '0.8s' }}
                  </p>
                </Motion>
                <p class="text-xs text-purple-500 mt-1">系统响应时间</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.8 } as any" class="text-purple-500">
                <el-icon size="32">
                  <Timer />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <!-- 总用户数 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.8 } as any"
            class="bg-indigo-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-indigo-600 text-sm font-medium">总用户数</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 1.0 }">
                  <p class="text-2xl font-bold text-indigo-900">
                    {{ adminSystemStats?.system_info?.total_users?.toLocaleString() || '0' }}
                  </p>
                </Motion>
                <p class="text-xs text-indigo-500 mt-1">注册用户总数</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.9 } as any" class="text-indigo-500">
                <el-icon size="32">
                  <User />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <!-- 今日活跃用户 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.9 } as any"
            class="bg-teal-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-teal-600 text-sm font-medium">今日活跃</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 1.1 }">
                  <p class="text-2xl font-bold text-teal-900">
                    {{ adminSystemStats?.system_info?.active_users_today?.toLocaleString() || '0' }}
                  </p>
                </Motion>
                <p class="text-xs text-teal-500 mt-1">今日活跃用户</p>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 1.0 } as any" class="text-teal-500">
                <el-icon size="32">
                  <Monitor />
                </el-icon>
              </Motion>
            </div>
          </Motion>

        </div>
      </el-card>
    </Motion>

    <!-- 图表和活动监控区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- 识别趋势图表 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.8 } as any"
        class="lg:col-span-2">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">识别趋势分析</span>
              <el-select v-model="chartTimeRange" size="small" style="width: 120px" @change="handleTimeRangeChange">
                <el-option label="最近7天" value="week" />
                <el-option label="最近30天" value="month" />
                <el-option label="最近一年" value="year" />
              </el-select>
            </div>
          </template>
          <div class="h-80">
            <TrendChart :data="trendChartData" :loading="loading" />
          </div>
        </el-card>
      </Motion>

      <!-- 实时活动监控 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.9 } as any">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">实时活动</span>
              <el-badge :value="5" class="item">
                <el-icon>
                  <Bell />
                </el-icon>
              </el-badge>
            </div>
          </template>
          <div class="h-80 overflow-y-auto">
            <div class="space-y-3">
              <div v-for="activity in recentActivities" :key="activity.id"
                class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-shrink-0">
                  <div :class="activity.iconClass" class="w-8 h-8 rounded-full flex items-center justify-center">
                    <el-icon size="16">
                      <component :is="activity.icon" />
                    </el-icon>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-xs text-gray-500">{{ activity.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </Motion>
    </div>

    <!-- 字符识别分布和系统状态 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 字符类型分布 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 1.0 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">字符类型分布</span>
          </template>
          <div class="h-64">
            <PieChartComponent :data="charDistributionData" :loading="loading" title="字符分布" />
          </div>
        </el-card>
      </Motion>

      <!-- 模型信息监控 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 1.1 } as any">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">模型信息</span>
              <el-tag :type="systemStatus.type" size="small">{{ systemStatus.text }}</el-tag>
            </div>
          </template>
          <div class="space-y-4">
            <div v-for="metric in systemMetrics" :key="metric.name" class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <el-icon :class="metric.iconClass">
                  <component :is="metric.icon" />
                </el-icon>
                <span class="text-sm font-medium">{{ metric.name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <!-- 根据数据类型显示不同的内容 -->
                <template v-if="metric.type === 'text'">
                  <el-tag :type="metric.status" size="small">{{ metric.value }}</el-tag>
                </template>
                <template v-else-if="metric.type === 'percentage'">
                  <el-progress :percentage="metric.value" :status="metric.status" :stroke-width="6"
                    style="width: 100px" />
                  <span class="text-sm text-gray-600 w-12 text-right">{{ metric.value }}%</span>
                </template>
                <template v-else-if="metric.type === 'count'">
                  <span class="text-sm font-medium" :class="{
                    'text-green-600': metric.status === 'success',
                    'text-orange-600': metric.status === 'warning',
                    'text-red-600': metric.status === 'danger'
                  }">{{ metric.value }}</span>
                </template>
              </div>
            </div>
          </div>
        </el-card>
      </Motion>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
}

/* 统计卡片增强样式 */
.cursor-pointer {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.cursor-pointer:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .cursor-pointer {
    transition: none;
  }
}

/* 增强卡片视觉效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>