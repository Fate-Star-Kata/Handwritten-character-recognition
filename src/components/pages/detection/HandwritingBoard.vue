<template>
  <div class="handwriting-board-container">
    <motion.div :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.6 }"
      class="detection-card">
      <div class="card-header">
        <h2 class="card-title">手写板识别</h2>
        <p class="card-description">在下方画板上书写汉字进行识别</p>
      </div>

      <div class="canvas-container">
        <canvas ref="canvasElement" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
          @mouseleave="stopDrawing" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="stopDrawing"
          class="drawing-canvas"></canvas>

        <div class="canvas-overlay">
          <div class="drawing-tips">
            <p>{{ drawingTip }}</p>
          </div>
        </div>
      </div>

      <div class="tool-bar">
        <div class="brush-controls">
          <label class="control-label">笔刷大小:</label>
          <input v-model="brushSize" type="range" min="2" max="20" class="brush-slider" />
          <span class="brush-size-display">{{ brushSize }}px</span>
        </div>

        <div class="color-controls">
          <label class="control-label">颜色:</label>
          <div class="color-palette">
            <button v-for="color in colors" :key="color" @click="selectColor(color)"
              :class="['color-btn', { active: selectedColor === color }]" :style="{ backgroundColor: color }"></button>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="clearCanvas" class="clear-btn">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16">
            </path>
          </svg>
          清空画板
        </button>

        <button @click="undoLastStroke" :disabled="strokes.length === 0" class="undo-btn">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          撤销
        </button>

        <button @click="recognizeHandwriting" :disabled="isRecognizing || strokes.length === 0" class="recognize-btn">
          <svg v-if="isRecognizing" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
            </path>
          </svg>
          {{ isRecognizing ? '识别中...' : '开始识别' }}
        </button>
      </div>

      <!-- 识别结果显示 -->
      <DetectionResult
        v-if="detectionResult || detectionError"
        :result="detectionResult"
        :error="detectionError"
        :is-loading="isRecognizing"
        @retry="handleResultRetry"
        @clear="handleResultClear"
        @copy="handleResultCopy"
        @save="handleResultSave"
        class="mt-6"
      />
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { motion } from 'motion-v'
import { detectCanvasAPI } from '@/api/user/userApi'
import DetectionResult from '@/components/pages/detection/DetectionResult.vue'
import type { CanvasDetectResponse } from '@/types/apis/user_T'

// 画笔相关数据
interface Point {
  x: number
  y: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
}

// 响应式数据
const canvasElement = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const isRecognizing = ref(false)
const brushSize = ref(8)
const selectedColor = ref('#000000')
const strokes = ref<Stroke[]>([])
const currentStroke = ref<Stroke | null>(null)
const detectionResult = ref<CanvasDetectResponse['data'] | null>(null)
const detectionError = ref<string | null>(null)

let canvasContext: CanvasRenderingContext2D | null = null
let lastPoint: Point | null = null

// 颜色选项
const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']

// 绘制提示
const drawingTip = computed(() => {
  if (strokes.value.length === 0) {
    return '请在画板上书写汉字'
  } else if (isRecognizing.value) {
    return '正在识别中...'
  } else {
    return '继续书写或点击识别按钮'
  }
})

// 事件定义
const emit = defineEmits<{
  recognize: [imageData: string]
  clear: []
}>()

// 初始化画布
const initCanvas = () => {
  if (!canvasElement.value) return

  const canvas = canvasElement.value
  const container = canvas.parentElement

  if (container) {
    // 设置画布尺寸为容器的100%
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width - 32 // 减去padding
    canvas.height = rect.height - 32 // 减去padding
  }

  canvasContext = canvas.getContext('2d')
  if (canvasContext) {
    // 设置画布样式
    canvasContext.lineCap = 'round'
    canvasContext.lineJoin = 'round'
    canvasContext.fillStyle = '#ffffff'
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  }
}

// 获取鼠标/触摸位置
const getEventPos = (event: MouseEvent | TouchEvent): Point => {
  if (!canvasElement.value) return { x: 0, y: 0 }

  const rect = canvasElement.value.getBoundingClientRect()

  if (event instanceof MouseEvent) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  } else {
    const touch = event.touches[0] || event.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }
}

// 开始绘制
const startDrawing = (event: MouseEvent) => {
  event.preventDefault()
  isDrawing.value = true

  const point = getEventPos(event)
  lastPoint = point

  currentStroke.value = {
    points: [point],
    color: selectedColor.value,
    size: brushSize.value
  }
}

// 绘制
const draw = (event: MouseEvent) => {
  if (!isDrawing.value || !canvasContext || !lastPoint || !currentStroke.value) return

  event.preventDefault()
  const currentPoint = getEventPos(event)

  // 绘制线条
  canvasContext.globalCompositeOperation = 'source-over'
  canvasContext.strokeStyle = selectedColor.value
  canvasContext.lineWidth = brushSize.value

  canvasContext.beginPath()
  canvasContext.moveTo(lastPoint.x, lastPoint.y)
  canvasContext.lineTo(currentPoint.x, currentPoint.y)
  canvasContext.stroke()

  // 记录点
  currentStroke.value.points.push(currentPoint)
  lastPoint = currentPoint
}

// 停止绘制
const stopDrawing = () => {
  if (isDrawing.value && currentStroke.value) {
    strokes.value.push(currentStroke.value)
    currentStroke.value = null
  }

  isDrawing.value = false
  lastPoint = null
}

// 触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  isDrawing.value = true

  const point = getEventPos(event)
  lastPoint = point

  currentStroke.value = {
    points: [point],
    color: selectedColor.value,
    size: brushSize.value
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDrawing.value || !canvasContext || !lastPoint || !currentStroke.value) return

  event.preventDefault()
  const currentPoint = getEventPos(event)

  // 绘制线条
  canvasContext.globalCompositeOperation = 'source-over'
  canvasContext.strokeStyle = selectedColor.value
  canvasContext.lineWidth = brushSize.value

  canvasContext.beginPath()
  canvasContext.moveTo(lastPoint.x, lastPoint.y)
  canvasContext.lineTo(currentPoint.x, currentPoint.y)
  canvasContext.stroke()

  // 记录点
  currentStroke.value.points.push(currentPoint)
  lastPoint = currentPoint
}

// 选择颜色
const selectColor = (color: string) => {
  selectedColor.value = color
}

// 清空画布
const clearCanvas = () => {
  if (!canvasContext || !canvasElement.value) return

  canvasContext.fillStyle = '#ffffff'
  canvasContext.fillRect(0, 0, canvasElement.value.width, canvasElement.value.height)

  strokes.value = []
  currentStroke.value = null

  detectionResult.value = null
  detectionError.value = null

  emit('clear')
}

// 处理结果操作
const handleResultRetry = () => {
  recognizeHandwriting()
}

const handleResultClear = () => {
  detectionResult.value = null
  detectionError.value = null
}

const handleResultCopy = (result: any) => {
  console.log('复制结果:', result.character)
}

const handleResultSave = (result: any) => {
  console.log('保存结果:', result)
  // 这里可以调用保存到历史记录的API
}

// 撤销最后一笔
const undoLastStroke = () => {
  if (strokes.value.length === 0) return

  strokes.value.pop()
  redrawCanvas()
}

// 重绘画布
const redrawCanvas = () => {
  if (!canvasContext || !canvasElement.value) return

  // 清空画布
  canvasContext.fillStyle = '#ffffff'
  canvasContext.fillRect(0, 0, canvasElement.value.width, canvasElement.value.height)

  // 重绘所有笔画
  strokes.value.forEach(stroke => {
    if (stroke.points.length < 2) return

    canvasContext!.strokeStyle = stroke.color
    canvasContext!.lineWidth = stroke.size
    canvasContext!.beginPath()

    canvasContext!.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
      canvasContext!.lineTo(stroke.points[i].x, stroke.points[i].y)
    }

    canvasContext!.stroke()
  })
}

// 识别手写字
const recognizeHandwriting = async () => {
  if (!canvasElement.value || strokes.value.length === 0) return

  isRecognizing.value = true
  detectionError.value = null
  detectionResult.value = null

  try {
    // 将画布内容转换为图片数据
    const imageData = canvasElement.value.toDataURL('image/png')
    const response = await detectCanvasAPI({
      canvas_data: imageData,
      width: canvasElement.value.width,
      height: canvasElement.value.height
    })

    if (response.success) {
      detectionResult.value = response.data
      emit('recognize', imageData)
    } else {
      detectionError.value = response.message || '识别失败'
    }
  } catch (error) {
    console.error('画布识别失败:', error)
    detectionError.value = '网络错误，请检查连接后重试'
  } finally {
    isRecognizing.value = false
  }
}

// 窗口大小改变时重新初始化画布
const handleResize = () => {
  setTimeout(() => {
    initCanvas()
    redrawCanvas()
  }, 100)
}

// 组件挂载
onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.handwriting-board-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.detection-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  font-size: 0.95rem;
}

.canvas-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: #f9fafb;
  border-radius: 1rem;
  padding: 1rem;
  width: 100%;
  height: 500px;
  min-height: 400px;
}

.drawing-canvas {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: crosshair;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;

  &:hover {
    border-color: #3b82f6;
  }
}

.canvas-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  pointer-events: none;
}

.drawing-tips {
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  text-align: center;

  p {
    margin: 0;
  }
}

.tool-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.brush-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.brush-slider {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.brush-size-display {
  font-weight: 600;
  color: #3b82f6;
  min-width: 40px;
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-palette {
  display: flex;
  gap: 0.5rem;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    border-color: #3b82f6;
    transform: scale(1.15);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  }
}

.undo-btn {
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.recognize-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .detection-card {
    padding: 1.5rem;
  }

  .tool-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .brush-controls,
  .color-controls {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .clear-btn,
  .undo-btn,
  .recognize-btn {
    width: 100%;
  }

  .canvas-container {
    height: 350px;
    min-height: 300px;
  }

  .drawing-canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
