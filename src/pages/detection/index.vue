<template>
  <div class="detection-page">
    <!-- 页面标题 -->
    <motion.div
      :initial="{ opacity: 0, y: -30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8 }"
      class="page-header"
    >
      <h1 class="page-title">手写字检测</h1>
      <p class="page-subtitle">选择检测方式，开始识别您的手写字</p>
    </motion.div>

    <!-- 功能切换按钮 -->
    <motion.div
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.6, delay: 0.2 }"
      class="mode-selector"
    >
      <button
        v-for="mode in modes"
        :key="mode.id"
        @click="activeMode = mode.id"
        :class="['mode-btn', { active: activeMode === mode.id }]"
      >
        <component :is="mode.icon" class="mode-icon" />
        <span class="mode-text">{{ mode.name }}</span>
      </button>
    </motion.div>

    <!-- 检测区域 -->
    <motion.div
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8, delay: 0.4 }"
      class="detection-area"
    >
      <!-- 图片检测组件 -->
      <ImageDetection
        v-if="activeMode === 'image'"
        @recognize="handleImageRecognition"
        @clear="clearResult"
      />

      <!-- 摄像头检测组件 -->
      <CameraDetection
        v-else-if="activeMode === 'camera'"
        @recognize="handleCameraRecognition"
        @clear="clearResult"
      />

      <!-- 手写板检测组件 -->
      <HandwritingBoard
        v-else-if="activeMode === 'handwriting'"
        @recognize="handleHandwritingRecognition"
        @clear="clearResult"
      />
    </motion.div>

    <!-- 检测结果 -->
    <motion.div
      v-if="detectionResult"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.5 }"
      class="result-section"
    >
      <h3 class="result-title">检测结果</h3>
      <div class="result-content">
        <div class="result-text">
          <span class="result-label">识别文字：</span>
          <span class="result-value">{{ detectionResult.text }}</span>
        </div>
        <div class="result-confidence">
          <span class="result-label">置信度：</span>
          <span class="result-value">{{ (detectionResult.confidence * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { motion } from 'motion-v'
import ImageDetection from '@/components/pages/detection/ImageDetection.vue'
import CameraDetection from '@/components/pages/detection/CameraDetection.vue'
import HandwritingBoard from '@/components/pages/detection/HandwritingBoard.vue'

// 检测模式
interface DetectionMode {
  id: string
  name: string
  icon: any
}

// 检测结果
interface DetectionResult {
  text: string
  confidence: number
}

// 响应式数据
const activeMode = ref('image')
const detectionResult = ref<DetectionResult | null>(null)

// 图标组件
const ImageIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  })
])

const CameraIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
  }),
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z'
  })
])

const HandwritingIcon = () => h('svg', {
  class: 'w-6 h-6',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
  })
])

// 检测模式配置
const modes: DetectionMode[] = [
  { id: 'image', name: '图片检测', icon: ImageIcon },
  { id: 'camera', name: '摄像头检测', icon: CameraIcon },
  { id: 'handwriting', name: '手写板', icon: HandwritingIcon }
]

// 处理各组件的识别事件
const handleImageRecognition = async (imageData: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    detectionResult.value = {
      text: '图片识别结果',
      confidence: 0.95
    }
  } catch (error) {
    console.error('图片识别失败:', error)
  }
}

const handleCameraRecognition = async (imageData: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    detectionResult.value = {
      text: '摄像头识别结果',
      confidence: 0.88
    }
  } catch (error) {
    console.error('摄像头识别失败:', error)
  }
}

const handleHandwritingRecognition = async (imageData: string) => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    detectionResult.value = {
      text: '手写识别结果',
      confidence: 0.92
    }
  } catch (error) {
    console.error('手写识别失败:', error)
  }
}

// 清除结果
const clearResult = () => {
  detectionResult.value = null
}
</script>

<style scoped lang="scss">
.detection-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  font-weight: 400;
}

.mode-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
  
  &:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
    
    .mode-text {
      color: #3b82f6;
    }
    
    .mode-icon {
      color: #3b82f6;
    }
  }
  
  &.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
    
    .mode-text {
      color: white;
    }
    
    .mode-icon {
      color: white;
    }
  }
}

.mode-icon {
  width: 1.8rem;
  height: 1.8rem;
  transition: color 0.3s ease;
}

.mode-text {
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.detection-area {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

// 结果展示样式
.result-section {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.result-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-text,
.result-confidence {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.result-label {
  font-weight: 600;
  color: #374151;
}

.result-value {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .detection-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .mode-selector {
    flex-direction: column;
    gap: 1rem;
  }
  
  .mode-btn {
    flex-direction: row;
    justify-content: center;
    min-width: auto;
    width: 100%;
  }
  
  .result-text,
  .result-confidence {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
