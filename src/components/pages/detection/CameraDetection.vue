<template>
  <div class="camera-detection-container">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="detection-card"
    >
      <div class="card-header">
        <h2 class="card-title">摄像头实时检测</h2>
        <p class="card-description">开启摄像头进行实时手写字识别</p>
      </div>

      <div class="camera-area">
        <div v-if="!cameraActive" class="camera-placeholder">
          <div class="camera-icon">
            <svg class="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p class="camera-text">点击下方按钮开启摄像头</p>
          <p class="camera-hint">请确保您的设备有可用的摄像头</p>
        </div>
        
        <div v-else class="camera-view">
          <video
            ref="videoElement"
            autoplay
            playsinline
            muted
            class="camera-video"
          ></video>
          <div class="camera-overlay">
            <div class="detection-frame"></div>
            <div class="detection-tips">
              <p>请将手写字放在框内</p>
            </div>
          </div>
        </div>
      </div>

      <div class="control-buttons">
        <button
          v-if="!cameraActive"
          @click="startCamera"
          :disabled="isStarting"
          class="start-camera-btn"
        >
          <svg v-if="isStarting" class="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          {{ isStarting ? '启动中...' : '开启摄像头' }}
        </button>
        
        <template v-else>
          <button @click="captureImage" :disabled="isCapturing" class="capture-btn">
            <svg v-if="isCapturing" class="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            {{ isCapturing ? '识别中...' : '拍照识别' }}
          </button>
          
          <button @click="stopCamera" class="stop-camera-btn">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
            </svg>
            关闭摄像头
          </button>
        </template>
      </div>
      
      <!-- 识别结果显示 -->
      <div v-if="detectionResult || detectionError" class="detection-results">
        <DetectionResult
          :result="detectionResult"
          :error="detectionError"
          @retry="handleResultRetry"
          @clear="handleResultClear"
          @copy="handleResultCopy"
          @save="handleResultSave"
        />
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { motion } from 'motion-v'
import { detectImageAPI } from '@/api/admin/userApi'
import DetectionResult from '@/components/common/DetectionResult.vue'
import type { ImageDetectResponse } from '@/types/apis/user_T'

// 响应式数据
const cameraActive = ref(false)
const isStarting = ref(false)
const isCapturing = ref(false)
const videoElement = ref<HTMLVideoElement | null>(null)
const detectionResult = ref<ImageDetectResponse['data'] | null>(null)
const detectionError = ref<string | null>(null)
let mediaStream: MediaStream | null = null

// 事件定义
const emit = defineEmits<{
  capture: [imageData: string]
  error: [message: string]
}>()

// 开启摄像头
const startCamera = async () => {
  isStarting.value = true
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'environment' // 优先使用后置摄像头
      }
    })
    
    mediaStream = stream
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      cameraActive.value = true
    }
  } catch (error) {
    console.error('摄像头启动失败:', error)
    let errorMessage = '摄像头启动失败'
    
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        errorMessage = '请允许访问摄像头权限'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '未找到可用的摄像头设备'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '摄像头被其他应用占用'
      }
    }
    
    emit('error', errorMessage)
  } finally {
    isStarting.value = false
  }
}

// 关闭摄像头
const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  
  cameraActive.value = false
}

// 拍照识别
const captureImage = async () => {
  if (!videoElement.value || !cameraActive.value) return
  
  isCapturing.value = true
  detectionError.value = null
  detectionResult.value = null
  
  try {
    // 创建canvas来捕获视频帧
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('无法创建canvas上下文')
    }
    
    // 设置canvas尺寸
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    // 绘制当前视频帧
    context.drawImage(videoElement.value, 0, 0)
    
    // 转换为base64图片数据
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // 调用识别API
    const response = await detectImageAPI({
      image: imageData
    })
    
    if (response.success) {
      detectionResult.value = response.data
      emit('capture', imageData)
    } else {
      detectionError.value = response.message || '识别失败'
    }
  } catch (error) {
    console.error('拍照识别失败:', error)
    detectionError.value = '网络错误，请检查连接后重试'
  } finally {
    isCapturing.value = false
  }
}

// 处理结果操作
const handleResultRetry = () => {
  captureImage()
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

// 组件卸载时清理资源
onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped lang="scss">
.camera-detection-container {
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

.camera-area {
  border-radius: 1rem;
  overflow: hidden;
  background: #f9fafb;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.camera-icon {
  margin-bottom: 0.5rem;
}

.camera-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.camera-hint {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.camera-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.detection-frame {
  width: 200px;
  height: 200px;
  border: 3px solid #3b82f6;
  border-radius: 1rem;
  background: rgba(59, 130, 246, 0.1);
  animation: pulse 2s infinite;
}

.detection-tips {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.control-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.start-camera-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.capture-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.stop-camera-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .detection-card {
    padding: 1.5rem;
  }
  
  .camera-area {
    min-height: 250px;
  }
  
  .detection-frame {
    width: 150px;
    height: 150px;
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .start-camera-btn,
  .capture-btn,
  .stop-camera-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
