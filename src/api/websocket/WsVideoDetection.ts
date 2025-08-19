import WebSocketClient from './WebSocket'

// WebSocket消息类型定义
interface WSMessage {
  type: string
  [key: string]: any
}

// 摄像头状态
interface CameraStatus {
  is_streaming: boolean
  camera_opened: boolean
  frame_width: number
  frame_height: number
  fps: number
}

// 识别结果
interface RecognitionResult {
  character: string
  confidence: number
  timestamp: string
  session_id: string
}

// 回调函数类型
interface VideoDetectionCallbacks {
  onConnectionEstablished?: (message: string) => void
  onCameraStarted?: (message: string) => void
  onCameraStatus?: (status: CameraStatus) => void
  onRecognitionResult?: (result: RecognitionResult) => void
  onError?: (error: string) => void
  onDisconnected?: () => void
}

export class WsVideoDetection {
  private wsClient: WebSocketClient
  private callbacks: VideoDetectionCallbacks
  private sessionId: string | null = null

  constructor(callbacks: VideoDetectionCallbacks = {}) {
    this.callbacks = callbacks
    
    // 从环境变量获取WebSocket地址
    const wsBaseUrl =
      import.meta.env.VITE_WEBSOCKET_PATH || "ws://localhost:8000";
    const wsUrl = `${wsBaseUrl}/ws/camera/`
    
    this.wsClient = new WebSocketClient(
      wsUrl,
      {
        onOpen: this.handleOpen.bind(this),
        onMessage: this.handleMessage.bind(this),
        onClose: this.handleClose.bind(this),
        onError: this.handleError.bind(this)
      },
      {
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000,
        heartbeatMsg: JSON.stringify({ type: 'ping' })
      }
    )
  }

  // 连接WebSocket
  connect() {
    this.wsClient.connect()
  }

  // 断开连接
  disconnect() {
    this.wsClient.close()
  }

  // 启动摄像头
  startCamera() {
    this.sendMessage({ type: 'start_camera' })
  }

  // 停止摄像头
  stopCamera() {
    this.sendMessage({ type: 'stop_camera' })
  }

  // 查询摄像头状态
  getCameraStatus() {
    this.sendMessage({ type: 'get_camera_status' })
  }

  // 发送视频帧进行识别
  processVideoFrame(frameData: string) {
    console.log('发送视频帧进行识别')
    this.sendMessage({
      type: "process_video_frame",
      frame_data: frameData,
      timestamp: new Date().toISOString()
    });
  }

  // 发送消息
  private sendMessage(message: WSMessage) {
    if (this.wsClient.isConnected()) {
      this.wsClient.send(message)
    } else {
      console.warn('WebSocket未连接，无法发送消息:', message)
    }
  }

  // 处理连接打开
  private handleOpen() {
    console.log('视频检测WebSocket连接已建立')
  }

  // 处理消息
  private handleMessage(data: string | ArrayBuffer | Blob) {
    try {
      let message: WSMessage
      
      if (typeof data === 'string') {
        message = JSON.parse(data)
      } else {
        console.warn('收到非字符串消息，暂不支持处理')
        return
      }

      switch (message.type) {
        case 'connection_established':
          this.sessionId = message.session_id || null
          this.callbacks.onConnectionEstablished?.(message.message)
          break

        case 'camera_started':
          this.callbacks.onCameraStarted?.(message.message)
          break

        case 'camera_status':
          this.callbacks.onCameraStatus?.(message.data)
          break

        case 'recognition_result':
          this.callbacks.onRecognitionResult?.(message.data)
          break

        case 'error':
          this.callbacks.onError?.(message.message || '未知错误')
          break

        case 'pong':
          // 心跳响应，无需处理
          break

        default:
          console.log('收到未知消息类型:', message.type, message)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
      this.callbacks.onError?.('消息解析失败')
    }
  }

  // 处理连接关闭
  private handleClose(event: CloseEvent) {
    console.log('视频检测WebSocket连接已关闭:', event.code, event.reason)
    this.sessionId = null
    this.callbacks.onDisconnected?.()
  }

  // 处理连接错误
  private handleError(event: Event) {
    console.error('视频检测WebSocket连接错误:', event)
    this.callbacks.onError?.('WebSocket连接错误')
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.wsClient.isConnected()
  }

  // 获取会话ID
  getSessionId(): string | null {
    return this.sessionId
  }
}

export default WsVideoDetection

// 导出类型
export type {
  CameraStatus,
  RecognitionResult,
  VideoDetectionCallbacks,
  WSMessage
}
