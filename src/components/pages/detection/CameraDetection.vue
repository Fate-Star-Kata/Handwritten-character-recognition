<template>
  <div class="w-full h-full mx-auto">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
    >
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">摄像头实时检测</h2>
        <p class="text-gray-500 text-sm">开启摄像头进行实时手写字识别</p>
      </div>

      <div class="rounded-2xl overflow-hidden bg-gray-50 min-h-[300px] flex items-center justify-center relative">
        <!-- 摄像头占位符 -->
        <div v-if="!cameraActive" class="flex flex-col items-center gap-4 p-8">
          <div class="mb-2">
            <svg class="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p class="text-lg font-semibold text-gray-700 m-0">点击下方按钮开启摄像头</p>
          <p class="text-sm text-gray-500 m-0">请确保您的设备有可用的摄像头</p>
        </div>
        
        <!-- 摄像头视频区域 -->
        <div v-show="cameraActive" class="relative w-full h-full">
          <video
            ref="videoElement"
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover bg-black"
          ></video>
        </div>
        
        <!-- 隐藏的video元素，用于确保ref始终可用 -->
        <video
          v-if="!cameraActive"
          ref="videoElement"
          style="display: none;"
          autoplay
          playsinline
          muted
        ></video>
      </div>

      <!-- 设备选择器 -->
      <div v-if="!cameraActive && availableDevices.length > 1" class="mb-6 text-center">
        <label class="block text-sm font-semibold text-gray-700 mb-2">选择摄像头设备:</label>
        <select 
          v-model="selectedDeviceId" 
          @change="switchCamera(selectedDeviceId)"
          :disabled="isLoadingDevices"
          class="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 cursor-pointer transition-all duration-300 min-w-[200px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option v-for="device in availableDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label || `摄像头 ${availableDevices.indexOf(device) + 1}` }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-4 mt-6 items-center">
        <button
          v-if="!cameraActive"
          @click="startCamera"
          :disabled="isStarting"
          class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none rounded-xl px-8 py-4 text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center min-w-[200px] hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
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
          <!-- WebSocket连接状态 -->
          <div class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-4" :class="wsConnected ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'">
            <div class="w-2 h-2 rounded-full status-indicator" :class="wsConnected ? 'bg-green-500' : 'bg-red-500'"></div>
            <span>{{ wsConnected ? 'WebSocket已连接' : 'WebSocket未连接' }}</span>
          </div>
          
          <!-- 功能按钮组 - 横向排列 -->
          <div class="flex flex-wrap gap-3 justify-center">
            <!-- 实时检测控制 -->
            <button 
              v-if="wsConnected" 
              @click="isRealTimeMode ? stopRealTimeDetection() : startRealTimeDetection()" 
              :class="isRealTimeMode ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/30' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30'"
              class="text-white border-none rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg v-if="isRealTimeMode" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ isRealTimeMode ? '停止实时检测' : '开始实时检测' }}
            </button>
            
            <!-- 单次拍照识别 -->
            <button @click="captureImage" :disabled="isCapturing || isRealTimeMode" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
              <svg v-if="isCapturing" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {{ isCapturing ? '识别中...' : '拍照识别' }}
            </button>
            
            <button @click="stopCamera" class="bg-gray-100 text-gray-700 border border-gray-300 rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-gray-200 hover:-translate-y-0.5">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
              </svg>
              关闭摄像头
            </button>
          </div>
        </template>
      </div>
      
      <!-- 识别结果显示 -->
      <div v-if="detectionResult || detectionError" class="mt-8">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { motion } from 'motion-v'
import { detectImageAPI } from '@/api/user/userApi'
import DetectionResult from '@/components/pages/detection/DetectionResult.vue'
import WsVideoDetection from '@/api/websocket/WsVideoDetection'
import type { ImageDetectResponse } from '@/types/apis/user_T'
import type { RecognitionResult, CameraStatus } from '@/api/websocket/WsVideoDetection'

// 响应式数据
const cameraActive = ref(false)
const isStarting = ref(false)
const isCapturing = ref(false)
const videoElement = ref<HTMLVideoElement | null>(null)
const detectionResult = ref<ImageDetectResponse['data'] | null>(null)
const detectionError = ref<string | null>(null)
const wsConnected = ref(false)
const isRealTimeMode = ref(false)
const cameraStatus = ref<CameraStatus | null>(null)
const availableDevices = ref<MediaDeviceInfo[]>([])
const selectedDeviceId = ref<string>('')
const isLoadingDevices = ref(false)
let mediaStream: MediaStream | null = null
let wsClient: WsVideoDetection | null = null
let frameProcessingInterval: ReturnType<typeof setInterval> | null = null

// 事件定义
const emit = defineEmits<{
  capture: [imageData: string]
  error: [message: string]
  wsResult: [result: RecognitionResult]
}>()

// 初始化WebSocket客户端
const initWebSocket = () => {
  if (wsClient) {
    wsClient.disconnect()
  }
  
  wsClient = new WsVideoDetection({
    onConnectionEstablished: (message) => {
      console.log('WebSocket连接建立:', message)
      wsConnected.value = true
    },
    onCameraStarted: (message) => {
      console.log('摄像头启动成功:', message)
    },
    onCameraStatus: (status) => {
      cameraStatus.value = status
      console.log('摄像头状态:', status)
    },
    onRecognitionResult: (result) => {
      console.log('识别结果:', result)
      // 转换WebSocket结果格式为组件期望的格式
        detectionResult.value = {
          character: result.character,
          confidence: result.confidence,
          recognition_time: new Date(result.timestamp).toISOString(), // 使用ISO格式的时间字符串
          session_id: result.session_id
        }
      emit('wsResult', result)
    },
    onError: (error) => {
      console.error('WebSocket错误:', error)
      detectionError.value = error
      wsConnected.value = false
    },
    onDisconnected: () => {
      console.log('WebSocket连接断开')
      wsConnected.value = false
      stopRealTimeDetection()
    }
  })
  
  wsClient.connect()
}

// 开始实时检测
const startRealTimeDetection = () => {
  if (!wsClient || !wsClient.isConnected() || !videoElement.value) {
    console.warn('WebSocket未连接或视频元素不可用')
    return
  }
  
  isRealTimeMode.value = true
  
  // 每500ms发送一帧进行识别
  frameProcessingInterval = setInterval(() => {
    if (videoElement.value && isRealTimeMode.value) {
      captureFrameForWS()
    }
  }, 500)
}

// 停止实时检测
const stopRealTimeDetection = () => {
  isRealTimeMode.value = false
  if (frameProcessingInterval) {
    clearInterval(frameProcessingInterval)
    frameProcessingInterval = null
  }
}

// 获取可用的摄像头设备
const getAvailableDevices = async () => {
  isLoadingDevices.value = true
  try {
    // 请求权限以获取设备列表
    await navigator.mediaDevices.getUserMedia({ video: true })
    
    const devices = await navigator.mediaDevices.enumerateDevices()
    availableDevices.value = devices.filter(device => device.kind === 'videoinput')
    
    // 如果没有选择设备，默认选择第一个
    if (availableDevices.value.length > 0 && !selectedDeviceId.value) {
      selectedDeviceId.value = availableDevices.value[0].deviceId
    }
  } catch (error) {
    console.error('获取摄像头设备失败:', error)
    detectionError.value = '无法获取摄像头设备列表'
  } finally {
    isLoadingDevices.value = false
  }
}

// 切换摄像头设备
const switchCamera = async (deviceId: string) => {
  if (selectedDeviceId.value === deviceId) return
  
  selectedDeviceId.value = deviceId
  
  // 如果摄像头正在运行，重新启动以使用新设备
  if (cameraActive.value) {
    await stopCamera()
    await startCamera()
  }
}

// 捕获视频帧发送给WebSocket
const captureFrameForWS = () => {
  if (!videoElement.value || !wsClient) return
  
  try {
    console.log('开始捕获视频帧...')
    
    // 检查视频元素状态
    if (videoElement.value.videoWidth === 0 || videoElement.value.videoHeight === 0) {
      console.warn('视频尺寸无效，跳过帧捕获')
      return
    }
    
    const canvas = document.createElement('canvas')
    console.log('Canvas创建成功')
    
    // 尝试获取2d context，添加更详细的错误处理
    const context = canvas.getContext('2d', { willReadFrequently: true })
    
    if (!context) {
      console.error('无法获取canvas 2d context')
      // 尝试备用方法
      const fallbackContext = canvas.getContext('2d')
      if (!fallbackContext) {
        console.error('备用方法也无法获取canvas context')
        return
      }
      console.log('使用备用方法获取context成功')
    }
    
    console.log('Canvas context获取成功，开始绘制视频帧')
    
    canvas.width = videoElement.value.videoWidth
    canvas.height = videoElement.value.videoHeight
    
    const activeContext = context || canvas.getContext('2d')
    if (!activeContext) {
      console.error('最终无法获取有效的canvas context')
      return
    }
    
    activeContext.drawImage(videoElement.value, 0, 0)
    console.log('视频帧绘制完成')
    
    const frameData = canvas.toDataURL('image/jpeg', 0.7)
    console.log('帧数据转换完成，发送到WebSocket')
    
    wsClient.processVideoFrame(frameData)
  } catch (error) {
    console.error('捕获视频帧失败:', error)
    console.error('错误详情:', {
      videoElement: !!videoElement.value,
      wsClient: !!wsClient,
      videoWidth: videoElement.value?.videoWidth,
      videoHeight: videoElement.value?.videoHeight
    })
  }
}

// 开启摄像头
const startCamera = async () => {
  isStarting.value = true
  detectionError.value = null
  
  try {
    console.log('开始启动摄像头...')
    
    // 如果没有获取设备列表，先获取
    if (availableDevices.value.length === 0) {
      console.log('获取摄像头设备列表...')
      await getAvailableDevices()
    }
    
    // 构建视频约束
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      }
    }
    
    // 如果选择了特定设备，使用设备ID
    if (selectedDeviceId.value) {
      console.log('使用指定设备ID:', selectedDeviceId.value)
      ;(constraints.video as MediaTrackConstraints).deviceId = { exact: selectedDeviceId.value }
    } else {
      console.log('使用默认摄像头设备')
      // 否则优先使用后置摄像头
      ;(constraints.video as MediaTrackConstraints).facingMode = 'environment'
    }
    
    console.log('请求摄像头权限...', constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream = stream
    console.log('成功获取摄像头流:', stream)
    
    // 先设置摄像头为激活状态，触发DOM更新
    cameraActive.value = true
    
    // 等待DOM更新完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('检查video元素:', videoElement.value)
    if (!videoElement.value) {
      throw new Error('视频元素未找到')
    }
    
    videoElement.value.srcObject = stream
    console.log('设置视频源到video元素')
    
    // 使用Promise来确保视频加载完成
    await new Promise<void>((resolve, reject) => {
      if (!videoElement.value) {
        reject(new Error('视频元素不存在'))
        return
      }
      
      const video = videoElement.value
      
      // 设置视频属性
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      
      const onLoadedMetadata = () => {
        console.log('视频元数据加载完成')
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        
        // 尝试播放视频
        video.play().then(() => {
          console.log('视频开始播放')
          
          // 在摄像头成功启动后初始化WebSocket
          setTimeout(() => {
            initWebSocket()
          }, 500)
          
          resolve()
        }).catch(playError => {
          console.error('视频播放失败:', playError)
          reject(new Error('视频播放失败: ' + playError.message))
        })
      }
      
      const onError = (event: Event) => {
        console.error('视频加载错误:', event)
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        reject(new Error('视频加载失败'))
      }
      
      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('error', onError)
      
      // 如果视频已经加载完成，直接触发事件
      if (video.readyState >= 1) {
        onLoadedMetadata()
      }
    })
    
    console.log('摄像头启动完成')
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
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '摄像头设备不支持所请求的约束'
      }
    }
    
    detectionError.value = errorMessage
    cameraActive.value = false
    emit('error', errorMessage)
  } finally {
    isStarting.value = false
  }
}

// 关闭摄像头
const stopCamera = () => {
  // 停止实时检测
  stopRealTimeDetection()
  
  // 停止WebSocket摄像头
  if (wsClient) {
    wsClient.stopCamera()
    wsClient.disconnect()
    wsClient = null
  }
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  
  cameraActive.value = false
  wsConnected.value = false
  cameraStatus.value = null
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

// 组件挂载时的初始化
onMounted(async () => {
  // 获取可用的摄像头设备
  await getAvailableDevices()
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopCamera()
  
  // 清理WebSocket连接
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
  
  // 清理定时器
  if (frameProcessingInterval) {
    clearInterval(frameProcessingInterval)
    frameProcessingInterval = null
  }
})
</script>

<style scoped>
/* 自定义动画和特殊样式 */
.detection-frame {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-indicator {
  animation: pulse 2s infinite;
}
</style>
