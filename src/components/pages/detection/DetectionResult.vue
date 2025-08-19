<template>
  <div class="detection-result-container">
    <motion.div
      v-if="result"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.5 }"
      class="result-card"
    >
      <div class="result-header">
        <div class="result-icon">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="result-title">识别结果</h3>
      </div>

      <div class="result-content">
        <div class="character-display">
          <span class="character">{{ result.character }}</span>
        </div>
        
        <div class="result-details">
          <div class="detail-item">
            <span class="detail-label">置信度:</span>
            <div class="confidence-bar">
              <div 
                class="confidence-fill" 
                :style="{ width: `${(result.confidence * 100)}%` }"
              ></div>
              <span class="confidence-text">{{ (result.confidence * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">识别时间:</span>
            <span class="detail-value">{{ formatTime(result.recognition_time) }}</span>
          </div>
          
          <div v-if="result.session_id" class="detail-item">
            <span class="detail-label">会话ID:</span>
            <span class="detail-value session-id">{{ result.session_id }}</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button @click="copyResult" class="copy-btn">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          复制结果
        </button>
        
        <button @click="saveToHistory" class="save-btn">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          保存到历史
        </button>
        
        <button @click="clearResult" class="clear-btn">
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
      class="error-card"
    >
      <div class="error-header">
        <div class="error-icon">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="error-title">识别失败</h3>
      </div>
      
      <div class="error-content">
        <p class="error-message">{{ error }}</p>
      </div>
      
      <div class="error-actions">
        <button @click="retry" class="retry-btn">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          重试
        </button>
        
        <button @click="clearError" class="clear-error-btn">
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
      class="loading-card"
    >
      <div class="loading-content">
        <div class="loading-spinner">
          <svg class="animate-spin w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="loading-text">正在识别中...</p>
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'

// 定义接口
interface DetectionResult {
  character: string
  confidence: number
  recognition_time: string
  session_id?: string
}

// Props
interface Props {
  result?: DetectionResult | null
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
  copy: [result: DetectionResult]
  save: [result: DetectionResult]
}>()

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
  
  try {
    await navigator.clipboard.writeText(props.result.character)
    // 这里可以添加提示消息
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

<style scoped lang="scss">
.detection-result-container {
  width: 100%;
  margin-top: 2rem;
}

.result-card,
.error-card,
.loading-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.result-header,
.error-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-title,
.error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.character-display {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 1rem;
  border: 2px solid #3b82f6;
}

.character {
  font-size: 4rem;
  font-weight: 900;
  color: #1e40af;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.detail-value {
  color: #6b7280;
  font-family: monospace;
}

.session-id {
  font-size: 0.875rem;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.confidence-bar {
  flex: 1;
  position: relative;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
  border-radius: 12px;
  transition: width 0.5s ease;
}

.confidence-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.result-actions,
.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-btn,
.save-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }
}

.save-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  
  &:hover {
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
}

.clear-btn,
.clear-error-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
  }
}

.retry-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
  }
}

.error-card {
  border-color: #fecaca;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.error-content {
  margin-bottom: 1.5rem;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.loading-card {
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0;
}

@media (max-width: 768px) {
  .result-card,
  .error-card,
  .loading-card {
    padding: 1.5rem;
  }
  
  .character {
    font-size: 3rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .confidence-bar {
    width: 100%;
  }
  
  .result-actions,
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .copy-btn,
  .save-btn,
  .clear-btn,
  .retry-btn,
  .clear-error-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>