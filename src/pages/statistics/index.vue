<template>
  <motion.div class="statistics-page" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.8 }">
    <!-- 页面标题 -->
    <motion.div 
      class="page-header" 
      ref="headerRef"
      :initial="{ opacity: 0, y: -30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, delay: 0.2 }"
    >
      <h1 class="page-title">检测统计</h1>
    </motion.div>

    <!-- 统计概览 -->
    <motion.div 
      class="stats-overview" 
      ref="overviewRef"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.7, delay: 0.4 }"
    >
      <motion.div 
         class="stat-card" 
         v-for="(card, index) in statCards" 
         :key="index" 
         :ref="el => setCardRef(el, index)"
         :initial="{ opacity: 0, y: 50, scale: 0.9 }"
         :animate="{ opacity: 1, y: 0, scale: 1 }"
         :transition="{ duration: 0.6, delay: 0.5 + index * 0.1 }"
       >
         <div class="stat-icon">
           <i :class="card.icon"></i>
         </div>
         <div class="stat-info">
           <h3>{{ card.value }}</h3>
           <p>{{ card.label }}</p>
         </div>
       </motion.div>
    </motion.div>

    <!-- 时间范围选择 -->
    <motion.div 
      class="time-range-selector" 
      ref="timeRangeRef"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.7, delay: 0.6 }"
    >
      <h2 class="time-range-title">统计时间范围</h2>
      <div class="filter-controls-horizontal">
        <div class="range-buttons">
          <button 
            v-for="range in timeRanges" 
            :key="range.value"
            :class="['range-btn', { active: selectedRange === range.value }]"
            @click="selectTimeRange(range.value)"
          >
            {{ range.label }}
          </button>
        </div>
        <div class="custom-range">
           <el-date-picker 
             v-model="startDate" 
             type="date"
             placeholder="开始日期"
             format="YYYY-MM-DD"
           />
           <span>至</span>
           <el-date-picker 
             v-model="endDate" 
             type="date"
             placeholder="结束日期"
             format="YYYY-MM-DD"
           />
           <el-button type="primary" @click="applyCustomRange">应用</el-button>
         </div>
         <div class="trend-selector">
           <label>趋势类型：</label>
           <el-select v-model="trendType" @change="updateTrendChart" placeholder="选择趋势类型">
             <el-option value="daily" label="按天"></el-option>
             <el-option value="weekly" label="按周"></el-option>
             <el-option value="monthly" label="按月"></el-option>
           </el-select>
         </div>
         <div class="top-count-selector">
           <label>热门汉字显示数量：</label>
           <el-select v-model="topCount" @change="updateTopCharsChart" placeholder="选择显示数量">
             <el-option value="10" label="前10名"></el-option>
             <el-option value="20" label="前20名"></el-option>
             <el-option value="50" label="前50名"></el-option>
           </el-select>
         </div>
      </div>
    </motion.div>

    <!-- 图表区域 -->
    <motion.div 
      class="charts-container" 
      ref="chartsRef"
      :initial="{ opacity: 0, y: 40 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, delay: 0.8 }"
    >
      <!-- 检测趋势图 -->
      <motion.div 
        class="chart-card" 
        :ref="el => setChartRef(el, 0)"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.6, delay: 1.0 }"
      >
        <div class="chart-header">
          <h3>检测趋势</h3>

        </div>
        <div class="chart-body">
          <v-chart :option="trendChartOption" style="height: 300px;"></v-chart>
        </div>
      </motion.div>

      <!-- 检测类型分布 -->
      <motion.div 
        class="chart-card" 
        :ref="el => setChartRef(el, 1)"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.6, delay: 1.1 }"
      >
        <div class="chart-header">
          <h3>检测类型分布</h3>
        </div>
        <div class="chart-body">
          <v-chart :option="typeChartOption" style="height: 300px;"></v-chart>
        </div>
      </motion.div>

      <!-- 准确率分布 -->
      <motion.div 
        class="chart-card" 
        :ref="el => setChartRef(el, 2)"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.6, delay: 1.2 }"
      >
        <div class="chart-header">
          <h3>准确率分布</h3>
        </div>
        <div class="chart-body">
          <v-chart :option="accuracyChartOption" style="height: 300px;"></v-chart>
        </div>
      </motion.div>

      <!-- 热门汉字排行 -->
      <motion.div 
        class="chart-card" 
        :ref="el => setChartRef(el, 3)"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.6, delay: 1.3 }"
      >
        <div class="chart-header">
          <h3>热门汉字排行</h3>

        </div>
        <div class="chart-body">
          <v-chart :option="topCharsChartOption" style="height: 300px;"></v-chart>
        </div>
      </motion.div>
    </motion.div>

    <!-- 详细统计表格 -->
    <motion.div 
      class="detailed-stats"
      :initial="{ opacity: 0, y: 50 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, delay: 1.4 }"
    >
      <div class="stats-header">
        <h3>详细统计数据</h3>
        <div class="stats-actions">
          <button class="btn btn-info" @click="exportStats">
            <i class="fas fa-download"></i>
            导出数据
          </button>
          <button class="btn btn-secondary" @click="refreshStats">
            <i class="fas fa-sync-alt"></i>
            刷新数据
          </button>
        </div>
      </div>
      <div class="stats-table">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>检测次数</th>
              <th>成功次数</th>
              <th>平均准确率</th>
              <th>最高准确率</th>
              <th>最低准确率</th>
              <th>主要检测类型</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in statsTableData" :key="row.date">
              <td>{{ row.date }}</td>
              <td>{{ row.totalDetections }}</td>
              <td>{{ row.successCount }}</td>
              <td>{{ row.avgAccuracy }}%</td>
              <td>{{ row.maxAccuracy }}%</td>
              <td>{{ row.minAccuracy }}%</td>
              <td>{{ row.mainType }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  </motion.div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart,
  PieChart,
  BarChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { provide } from 'vue'
import { motion } from 'motion-v'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 提供主题
provide(THEME_KEY, 'light')

// 响应式数据
const totalDetections = ref(0)
const avgAccuracy = ref(0)
const todayDetections = ref(0)
const uniqueChars = ref(0)

// 统计卡片数据
const statCards = ref([
  { icon: 'fas fa-search', value: totalDetections.value, label: '总检测次数' },
  { icon: 'fas fa-percentage', value: `${avgAccuracy.value}%`, label: '平均准确率' },
  { icon: 'fas fa-calendar-day', value: todayDetections.value, label: '今日检测' },
  { icon: 'fas fa-font', value: uniqueChars.value, label: '识别汉字种类' }
])

// 动画引用
const headerRef = ref()
const overviewRef = ref()
const timeRangeRef = ref()
const chartsRef = ref()
const cardRefs = ref([])
const chartRefs = ref([])

// 设置卡片引用
const setCardRef = (el: any, index: number) => {
  if (el) {
    cardRefs.value[index] = el
  }
}

// 设置图表引用
const setChartRef = (el: any, index: number) => {
  if (el) {
    chartRefs.value[index] = el
  }
}

// 时间范围选择
const selectedRange = ref(7)
const startDate = ref('')
const endDate = ref('')
const timeRanges = [
  { label: '最近7天', value: 7 },
  { label: '最近30天', value: 30 },
  { label: '最近90天', value: 90 },
  { label: '最近一年', value: 365 }
]

// 图表控制
const trendType = ref('daily')
const topCount = ref(10)

// 图表配置
const trendChartOption = ref({})
const typeChartOption = ref({})
const accuracyChartOption = ref({})
const topCharsChartOption = ref({})

// 表格数据
const statsTableData = ref([
  {
    date: '2024-01-15',
    totalDetections: 45,
    successCount: 42,
    avgAccuracy: 93.3,
    maxAccuracy: 98.5,
    minAccuracy: 85.2,
    mainType: '图片检测'
  },
  {
    date: '2024-01-14',
    totalDetections: 38,
    successCount: 35,
    avgAccuracy: 92.1,
    maxAccuracy: 97.8,
    minAccuracy: 82.4,
    mainType: '手写板'
  },
  {
    date: '2024-01-13',
    totalDetections: 52,
    successCount: 48,
    avgAccuracy: 94.2,
    maxAccuracy: 99.1,
    minAccuracy: 87.6,
    mainType: '摄像头检测'
  }
])

// 方法
const selectTimeRange = (range: number) => {
  selectedRange.value = range
  loadStatistics()
}

const applyCustomRange = () => {
  if (startDate.value && endDate.value) {
    loadStatistics()
  }
}

const loadStatistics = async () => {
  // 模拟数据加载
  totalDetections.value = 1247
  avgAccuracy.value = 93.5
  todayDetections.value = 28
  uniqueChars.value = 156
  
  // 更新图表
  await nextTick()
  updateAllCharts()
}

const updateTrendChart = () => {
  // 根据trendType更新数据
  const labels = trendType.value === 'daily' 
    ? ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16']
    : trendType.value === 'weekly'
    ? ['第1周', '第2周', '第3周', '第4周']
    : ['1月', '2月', '3月', '4月']
  
  const data = trendType.value === 'daily'
    ? [25, 32, 28, 45, 38, 52, 41]
    : trendType.value === 'weekly'
    ? [156, 189, 203, 178]
    : [645, 723, 598, 712]
  
  trendChartOption.value = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: labels
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '检测次数',
      type: 'line',
      data: data,
      smooth: true,
      lineStyle: {
        color: '#4f46e5'
      },
      itemStyle: {
        color: '#4f46e5'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(79, 70, 229, 0.3)'
          }, {
            offset: 1, color: 'rgba(79, 70, 229, 0.1)'
          }]
        }
      }
    }]
  }
}

const updateTopCharsChart = () => {
  const count = parseInt(topCount.value.toString())
  const chars = ['你', '我', '他', '的', '是', '在', '有', '不', '了', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去']
  const data = Array.from({ length: count }, (_, i) => Math.floor(Math.random() * 100) + 20)
  
  topCharsChartOption.value = {
    title: {
      text: '热门汉字排行',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: chars.slice(0, count)
    },
    series: [{
      name: '检测次数',
      type: 'bar',
      data: data,
      itemStyle: {
        color: '#f59e0b'
      }
    }]
  }
}

const initCharts = () => {
  // 检测趋势图
  trendChartOption.value = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '检测次数',
      type: 'line',
      data: [25, 32, 28, 45, 38, 52, 41],
      smooth: true,
      lineStyle: {
        color: '#4f46e5'
      },
      itemStyle: {
        color: '#4f46e5'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(79, 70, 229, 0.3)'
          }, {
            offset: 1, color: 'rgba(79, 70, 229, 0.1)'
          }]
        }
      }
    }]
  }

  // 检测类型分布
  typeChartOption.value = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '10%',
      left: 'center'
    },
    series: [{
      name: '检测类型',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: [
        { value: 45, name: '图片检测', itemStyle: { color: '#4f46e5' } },
        { value: 30, name: '手写板', itemStyle: { color: '#06b6d4' } },
        { value: 25, name: '摄像头检测', itemStyle: { color: '#10b981' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  // 准确率分布
  accuracyChartOption.value = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['90-95%', '95-98%', '98-100%']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '检测次数',
      type: 'bar',
      data: [156, 234, 178],
      itemStyle: {
        color: '#10b981'
      }
    }]
  }

  // 热门汉字排行
  topCharsChartOption.value = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['你', '我', '他', '的', '是', '在', '有', '不', '了', '人']
    },
    series: [{
      name: '检测次数',
      type: 'bar',
      data: [89, 76, 65, 58, 52, 48, 45, 42, 38, 35],
      itemStyle: {
        color: '#f59e0b'
      }
    }]
  }
}

const updateAllCharts = () => {
  updateTrendChart()
  updateTopCharsChart()
}

const exportStats = () => {
  // 导出统计数据
  console.log('导出统计数据')
}

const refreshStats = () => {
  // 刷新统计数据
  loadStatistics()
}

// 初始化动画
const initAnimations = () => {
  // motion-v 动画通过模板中的 motion 组件实现
  console.log('动画初始化完成')
}

// 生命周期
onMounted(async () => {
  await loadStatistics()
  await nextTick()
  initCharts()
  initAnimations()
})
</script>

<style scoped lang="scss">
.statistics-page {
  padding: 20px;
  background-color: #F8FAFC;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
  
  .page-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
}

// 统计概览
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    
    &:nth-child(1) {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
    }
  }
  
  .stat-info {
    h3 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }
  }
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

// 时间范围选择
.time-range-selector {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .time-range-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 20px 0;
  }
  
  .filter-controls-horizontal {
    display: flex;
    align-items: center;
    gap: 30px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  
  .range-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .range-btn {
    padding: 8px 16px;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    
    &:hover {
      border-color: #4f46e5;
      color: #4f46e5;
    }
    
    &.active {
      background: #4f46e5;
      border-color: #4f46e5;
      color: white;
    }
  }
  
  .custom-range {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    
    input[type="date"] {
      padding: 8px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      
      &:focus {
        outline: none;
        border-color: #4f46e5;
      }
    }
    
    span {
      color: #6b7280;
      font-size: 0.875rem;
    }
  }
  
  .trend-selector,
  .top-count-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    
    label {
      font-size: 0.875rem;
      color: #374151;
      font-weight: 500;
      margin: 0;
    }
    
    select {
      padding: 6px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
      
      &:focus {
        outline: none;
        border-color: #4f46e5;
      }
    }
  }
}

// 图表区域
.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  .chart-header {
    padding: 20px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    
    .chart-controls {
      select {
        padding: 6px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 0.875rem;
        background: white;
        
        &:focus {
          outline: none;
          border-color: #4f46e5;
        }
      }
    }
  }
  
  .chart-body {
    padding: 20px 24px 24px;
    height: 350px;
    
    canvas {
      max-height: 100%;
    }
  }
}

// 详细统计表格
.detailed-stats {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 70px;
  
  .stats-header {
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    
    .stats-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .stats-table {
    overflow-x: auto;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #f1f5f9;
      }
      
      th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        font-size: 0.875rem;
      }
      
      td {
        color: #6b7280;
        font-size: 0.875rem;
      }
      
      tbody tr:hover {
        background: #f8fafc;
      }
    }
  }
}

// 按钮样式
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  &.btn-primary {
    background: #4f46e5;
    color: white;
    
    &:hover {
      background: #4338ca;
    }
  }
  
  &.btn-info {
    background: #06b6d4;
    color: white;
    
    &:hover {
      background: #0891b2;
    }
  }
  
  &.btn-secondary {
    background: #6b7280;
    color: white;
    
    &:hover {
      background: #4b5563;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .statistics-page {
    padding: 16px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .time-range-selector {
    .range-buttons {
      flex-direction: column;
    }
    
    .custom-range {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  .stats-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    
    .stats-actions {
      justify-content: center;
    }
  }
}
</style>
