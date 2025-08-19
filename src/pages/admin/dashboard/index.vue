<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
} from '@element-plus/icons-vue'

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
const chartTimeRange = ref('7d')

// 系统状态
const systemStatus = ref({
  type: 'success' as const,
  text: '运行正常'
})

// 系统指标
const systemMetrics = ref([
  {
    name: 'CPU使用率',
    value: 45,
    status: 'success' as const,
    icon: 'Cpu',
    iconClass: 'text-blue-500'
  },
  {
    name: '内存使用',
    value: 68,
    status: 'warning' as const,
    icon: 'Monitor',
    iconClass: 'text-orange-500'
  },
  {
    name: '磁盘空间',
    value: 32,
    status: 'success' as const,
    icon: 'HardDrive',
    iconClass: 'text-green-500'
  },
  {
    name: '网络状态',
    value: 95,
    status: 'success' as const,
    icon: 'Wifi',
    iconClass: 'text-purple-500'
  }
])

// 最近活动数据
const recentActivities = ref([
  {
    id: 1,
    title: '用户识别汉字',
    description: '用户 张三 成功识别了字符 "学"',
    time: '2分钟前',
    icon: 'Document',
    iconClass: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    title: '新用户注册',
    description: '新用户 李四 完成注册',
    time: '5分钟前',
    icon: 'User',
    iconClass: 'bg-green-100 text-green-600'
  },
  {
    id: 3,
    title: '系统优化',
    description: '识别算法响应时间优化 0.2s',
    time: '10分钟前',
    icon: 'TrendCharts',
    iconClass: 'bg-purple-100 text-purple-600'
  },
  {
    id: 4,
    title: '批量识别',
    description: '用户 王五 完成 50 个字符批量识别',
    time: '15分钟前',
    icon: 'Document',
    iconClass: 'bg-orange-100 text-orange-600'
  },
  {
    id: 5,
    title: '准确率提升',
    description: '今日平均识别准确率达到 94.8%',
    time: '30分钟前',
    icon: 'TrendCharts',
    iconClass: 'bg-green-100 text-green-600'
  }
])

// 组件挂载时的初始化
onMounted(() => {
  // 这里可以添加数据获取逻辑
  console.log('Dashboard mounted')
})
</script>

<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="cardVariants.transition as any">
      <el-card class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">手写字符识别系统 - 仪表板</h1>
            <p class="text-gray-600 mt-1">实时监控系统运行状态和数据统计</p>
          </div>
          <Motion :initial="{ opacity: 0, x: 20 }" :animate="{ opacity: 1, x: 0 }"
            :whileHover="{ scale: 1.05, rotate: 180 }" :transition="{ duration: 0.3, delay: 0.2 }">
            <el-button type="primary" :icon="Refresh" circle />
          </Motion>
        </div>
      </el-card>
    </Motion>

    <!-- 核心统计卡片 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
      :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
      <el-card class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- 总用户数 -->
          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.4 } as any"
            class="bg-blue-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 text-sm font-medium">注册用户</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.6 }">
                  <p class="text-2xl font-bold text-blue-900">2,847</p>
                </Motion>
                <p class="text-xs text-blue-500 mt-1">+12% 本月</p>
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
                  <p class="text-2xl font-bold text-green-900">1,456</p>
                </Motion>
                <p class="text-xs text-green-500 mt-1">+8% 昨日</p>
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
                  <p class="text-2xl font-bold text-orange-900">94.8%</p>
                </Motion>
                <p class="text-xs text-orange-500 mt-1">+2.1% 本周</p>
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
                  <p class="text-2xl font-bold text-purple-900">0.8s</p>
                </Motion>
                <p class="text-xs text-purple-500 mt-1">-0.2s 优化</p>
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
              <el-select v-model="chartTimeRange" size="small" style="width: 120px">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="最近90天" value="90d" />
              </el-select>
            </div>
          </template>
          <div class="h-80 flex items-center justify-center text-gray-500">
            <Motion :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }"
              :whileHover="{ scale: 1.05 }" :transition="{ duration: 0.5, delay: 1.0 }" class="text-center">
              <Motion :initial="{ y: -20, opacity: 0 }" :animate="{ y: 0, opacity: 1 }"
                :transition="{ duration: 0.4, delay: 1.2 }">
                <el-icon size="48" class="mb-2">
                  <TrendCharts />
                </el-icon>
              </Motion>
              <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.3, delay: 1.4 }">
                <p>识别趋势图表</p>
                <p class="text-sm mt-1">显示每日识别次数和准确率变化</p>
              </Motion>
            </Motion>
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
                <el-icon><Bell /></el-icon>
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
          <div class="h-64 flex items-center justify-center text-gray-500">
            <Motion :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }"
              :whileHover="{ scale: 1.1, rotate: 5 }" :transition="{ duration: 0.5, delay: 1.2 }" class="text-center">
              <Motion :initial="{ y: -20, opacity: 0 }" :animate="{ y: 0, opacity: 1 }"
                :transition="{ duration: 0.4, delay: 1.4 }">
                <el-icon size="48" class="mb-2">
                  <PieChart />
                </el-icon>
              </Motion>
              <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.3, delay: 1.6 }">
                <p>字符分布饼图</p>
                <p class="text-sm mt-1">汉字、数字、字母识别占比</p>
              </Motion>
            </Motion>
          </div>
        </el-card>
      </Motion>

      <!-- 系统状态监控 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 1.1 } as any">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-medium">系统状态</span>
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
                <el-progress
                  :percentage="metric.value"
                  :status="metric.status"
                  :stroke-width="6"
                  style="width: 100px"
                />
                <span class="text-sm text-gray-600 w-12 text-right">{{ metric.value }}%</span>
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