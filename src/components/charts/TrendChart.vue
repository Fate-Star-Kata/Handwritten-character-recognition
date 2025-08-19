<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册必要的组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

interface DailyStat {
  date: string
  count: number
  accuracy?: number
}

interface Props {
  data: DailyStat[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 图表配置
const option = computed(() => {
  const dates = props.data.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const counts = props.data.map(item => item.count)
  const accuracies = props.data.map(item => (item.accuracy || 0) * 100)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param: any) => {
          const unit = param.seriesName === '识别次数' ? '次' : '%'
          result += `${param.marker}${param.seriesName}: ${param.value}${unit}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['识别次数', '准确率'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        fontSize: 12,
        color: '#666'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '识别次数',
        position: 'left',
        axisLabel: {
          formatter: '{value}次',
          fontSize: 12,
          color: '#666'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      {
        type: 'value',
        name: '准确率',
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
          fontSize: 12,
          color: '#666'
        },
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '识别次数',
        type: 'line',
        yAxisIndex: 0,
        data: counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '准确率',
        type: 'line',
        yAxisIndex: 1,
        data: accuracies,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
})
</script>

<template>
  <div class="trend-chart">
    <VChart 
      :option="option" 
      :loading="loading"
      autoresize 
      style="height: 300px; width: 100%;"
    />
  </div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 300px;
}
</style>