<template>
  <div class="w-full mt-8">
    <motion.div
      v-if="result"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.5 }"
      class="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
    >
      <div class="flex items-center gap-4 mb-6">
        <div>
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 m-0">识别结果</h3>
      </div>

      <div>
        <!-- 图片显示区域（仅当有图片URL时显示） -->
        <div v-if="showImageUrl || showRecognizedBlock" class="flex gap-6 mb-6 flex-wrap justify-center">
          <!-- 用户上传的图片 -->
          <div v-if="showImageUrl" class="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 flex-1 min-w-[200px] max-w-[300px]">
            <h4 class="text-sm font-semibold text-gray-600 mb-3 m-0 uppercase tracking-wide">上传的图片</h4>
            <img 
              :src="getFullImageUrl((result as any).image_url)" 
              alt="用户上传的图片" 
              class="max-w-full max-h-[200px] object-contain rounded-lg shadow-md"
              @error="handleImageError"
            />
          </div>
          
          <!-- 识别到的标准字符图片（仅REST结果显示） -->
          <div v-if="showRecognizedBlock" class="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 flex-1 min-w-[200px] max-w-[300px]">
            <h4 class="text-sm font-semibold text-gray-600 mb-3 m-0 uppercase tracking-wide">识别结果</h4>
            <div class="text-center">
              <p class="text-2xl font-bold text-blue-700 mb-4 m-0 drop-shadow-sm">{{ displayChar }}</p>
              <img 
                v-if="recognizedImageSrc"
                :src="recognizedImageSrc" 
                alt="识别到的标准字符" 
                class="max-w-full max-h-[200px] object-contain rounded-lg shadow-md border-2 border-emerald-500 bg-green-50"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
        
        <div class="flex flex-col gap-4 mb-8">
          <!-- 识别字符显示 -->
          <div class="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span class="font-semibold text-gray-700 min-w-[80px]">识别字符:</span>
            <span class="text-2xl font-bold text-blue-700 bg-white px-4 py-2 rounded-lg border border-blue-300 shadow-sm">{{ displayChar }}</span>
          </div>
          
          <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700 min-w-[80px]">置信度:</span>
            <div class="flex-1 relative h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500" 
                :style="{ width: `${(result.confidence * 100)}%` }"
              ></div>
              <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-semibold text-gray-800 text-sm">{{ (result.confidence * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <div v-if="processingTime !== null" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700 min-w-[80px]">耗时:</span>
            <span class="text-gray-600 font-mono">{{ processingTime }}秒</span>
          </div>
          
          <div v-if="sessionId" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700 min-w-[80px]">会话ID:</span>
            <span class="text-gray-600 font-mono text-sm bg-gray-200 px-2 py-1 rounded">{{ sessionId }}</span>
          </div>

          <div v-if="timestampText" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700 min-w-[80px]">时间:</span>
            <span class="text-gray-600 font-mono">{{ timestampText }}</span>
          </div>
        </div>
      </div>

      <div class="flex gap-4 justify-center flex-wrap">
        <button @click="copyResult" class="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          复制结果
        </button>
        
        <button @click="saveToHistory" class="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-none rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          保存到历史
        </button>
        
        <button @click="clearResult" class="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:bg-gray-200 hover:-translate-y-0.5">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          清除结果
        </button>
      </div>
    </motion.div>

    <!-- 错误状态 -->
    <motion.div
      v-else-if="error"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.5 }"
      class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-xl border border-red-200"
    >
      <div class="flex items-center gap-4 mb-6">
        <div>
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 m-0">识别失败</h3>
      </div>
      
      <div class="mb-6">
        <p class="text-red-600 font-medium text-center m-0">{{ error }}</p>
      </div>
      
      <div class="flex gap-4 justify-center flex-wrap">
        <button @click="retry" class="bg-gradient-to-r from-amber-500 to-amber-700 text-white border-none rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 flex items-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          重试
        </button>
        
        <button @click="clearError" class="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-200 hover:-translate-y-0.5">
          关闭
        </button>
      </div>
    </motion.div>

    <!-- 加载状态 -->
    <motion.div
      v-else-if="loading"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.3 }"
      class="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center"
    >
      <div class="flex flex-col items-center gap-4">
        <div>
          <svg class="animate-spin w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="text-lg font-semibold text-blue-600 m-0">正在识别中...</p>
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import type { DetectionResult, WSDetectionResult } from '@/types/apis/user_T'

// 获取环境变量
const serverPath = import.meta.env.VITE_SERVER_PATH || 'http://localhost:8000/'

// 获取完整的图片URL
const getFullImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  // 确保serverPath以/结尾，imageUrl不以/开头
  const basePath = serverPath.endsWith('/') ? serverPath : serverPath + '/'
  const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
  return basePath + relativePath
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  console.error('图片加载失败:', event)
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Props
interface Props {
  result?: DetectionResult | WSDetectionResult | null
  error?: string | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  result: null,
  error: null,
  loading: false
})

// Events
const emit = defineEmits<{
  retry: []
  clear: []
  copy: [result: DetectionResult | WSDetectionResult]
  save: [result: DetectionResult | WSDetectionResult]
}>()

// 判定是否为WebSocket结果
const isWSResult = computed(() => {
  return !!props.result && 'character' in (props.result as any) && !('recognized_character' in (props.result as any))
})

// 展示字符（兼容两种格式）
const displayChar = computed(() => {
  if (!props.result) return ''
  return isWSResult.value
    ? (props.result as WSDetectionResult).character
    : (props.result as DetectionResult).recognized_character
})

// 是否显示上传图片
const showImageUrl = computed(() => {
  return !!props.result && 'image_url' in (props.result as any) && !!(props.result as any).image_url
})

// 是否显示识别结果图片块（仅REST）
const showRecognizedBlock = computed(() => {
  return !!props.result && !isWSResult.value && !!(props.result as DetectionResult).recognized_character
})

// 识别结果图片（仅REST）
const recognizedImageSrc = computed(() => {
  if (!props.result || isWSResult.value) return ''
  const rest = props.result as DetectionResult
  const display = (rest as any).display_character as string | undefined
  if (display) return display
  // 拼接 VITE_SERVER_PATH + /static/datasets/ + recognized_character
  const serverPath = import.meta.env.VITE_SERVER_PATH || 'http://localhost:8000/'
  const basePath = serverPath.endsWith('/') ? serverPath : serverPath + '/'
  return `${basePath}static/datasets/${rest.recognized_character}`
})

// 耗时（仅REST）
const processingTime = computed(() => {
  if (!props.result) return null
  return 'processing_time' in (props.result as any) ? (props.result as any).processing_time as number : null
})

// 会话ID（WS 结果可能有）
const sessionId = computed(() => {
  if (!props.result) return ''
  return 'session_id' in (props.result as any) ? (props.result as any).session_id as string : ''
})

// 时间（WS 结果可能有 timestamp）
const timestampText = computed(() => {
  if (!props.result) return ''
  const ts = 'timestamp' in (props.result as any) ? (props.result as any).timestamp as string : ''
  if (!ts) return ''
  return formatTime(ts)
})

// 格式化时间
const formatTime = (timeStr: string) => {
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return timeStr
  }
}

// 复制结果
const copyResult = async () => {
  if (!props.result) return
  const text = displayChar.value || ''
  try {
    await navigator.clipboard.writeText(text)
    console.log('复制成功')
    emit('copy', props.result)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 保存到历史
const saveToHistory = () => {
  if (!props.result) return
  emit('save', props.result)
}

// 清除结果
const clearResult = () => {
  emit('clear')
}

// 重试
const retry = () => {
  emit('retry')
}

// 清除错误
const clearError = () => {
  emit('clear')
}
</script>

<style scoped>
/* 移动端响应式样式 */
@media (max-width: 768px) {
  .bg-white.rounded-2xl.p-8 {
    @apply p-6;
  }
  
  .flex.gap-6.mb-6.flex-wrap.justify-center {
    @apply flex-col gap-4;
  }
  
  .text-center.p-4.bg-slate-50.rounded-2xl.border.border-slate-200.flex-1.min-w-\[200px\].max-w-\[300px\] {
    @apply max-w-full min-w-0;
  }
  
  .text-2xl.font-bold.text-blue-700.mb-4.m-0.drop-shadow-sm {
    @apply text-xl;
  }
  
  .flex.items-center.gap-4.p-3.bg-gray-50.rounded-lg {
    @apply flex-col items-start gap-2;
  }
  
  .font-semibold.text-gray-700.min-w-\[80px\] {
    @apply min-w-0;
  }
  
  .flex-1.relative.h-6.bg-gray-200.rounded-full.overflow-hidden {
    @apply w-full;
  }
  
  .flex.gap-4.justify-center.flex-wrap {
    @apply flex-col items-center;
  }
  
  .bg-gradient-to-r.from-blue-500.to-blue-700.text-white.border-none.rounded-lg.px-6.py-3.font-semibold.cursor-pointer.transition-all.duration-300.flex.items-center.hover\:-translate-y-0\.5.hover\:shadow-lg.hover\:shadow-blue-500\/30,
  .bg-gradient-to-r.from-emerald-500.to-emerald-700.text-white.border-none.rounded-lg.px-6.py-3.font-semibold.cursor-pointer.transition-all.duration-300.flex.items-center.hover\:-translate-y-0\.5.hover\:shadow-lg.hover\:shadow-emerald-500\/30,
  .bg-gray-100.text-gray-700.border.border-gray-300.rounded-lg.px-6.py-3.font-semibold.cursor-pointer.transition-all.duration-300.flex.items-center.hover\:bg-gray-200.hover\:-translate-y-0\.5,
  .bg-gradient-to-r.from-amber-500.to-amber-700.text-white.border-none.rounded-lg.px-6.py-3.font-semibold.cursor-pointer.transition-all.duration-300.flex.items-center.hover\:-translate-y-0\.5.hover\:shadow-lg.hover\:shadow-amber-500\/30 {
    @apply w-full justify-center;
  }
}
</style>
