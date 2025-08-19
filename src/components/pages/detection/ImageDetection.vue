<template>
  <div class="image-detection-container">
    <motion.div
      :initial="{ opacity: 0, y: 20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="detection-card"
    >
      <div class="card-header">
        <h2 class="card-title">上传图片进行检测</h2>
        <p class="card-description">支持 JPG、PNG、JPEG 格式，最大 10MB</p>
      </div>

      <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover="handleDragOver" @dragleave="handleDragLeave" :class="{ 'drag-over': isDragOver }">
        <div v-if="!uploadedImage" class="upload-placeholder">
          <div class="upload-icon">
            <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <p class="upload-text">点击或拖拽图片到此处</p>
          <p class="upload-hint">支持 JPG、PNG、JPEG 格式</p>
        </div>
        
        <div v-else class="image-preview">
          <img :src="uploadedImage" alt="上传的图片" class="preview-image" />
          <div class="image-overlay">
            <button @click.stop="removeImage" class="remove-btn">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>

      <div v-if="uploadedImage" class="action-buttons">
        <button @click="detectImage" :disabled="isDetecting" class="detect-btn">
          <svg v-if="isDetecting" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isDetecting ? '检测中...' : '开始检测' }}
        </button>
        <button @click="resetUpload" class="reset-btn">
          重新上传
        </button>
      </div>
    </motion.div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'

// 响应式数据
const uploadedImage = ref<string | null>(null)
const isDragOver = ref(false)
const isDetecting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 事件定义
const emit = defineEmits<{
  detect: [image: string]
  reset: []
}>()

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

// 处理文件
const processFile = (file: File) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  // 验证文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('文件大小不能超过 10MB')
    return
  }
  
  // 读取文件
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 移除图片
const removeImage = () => {
  uploadedImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 检测图片
const detectImage = async () => {
  if (!uploadedImage.value) return
  
  isDetecting.value = true
  try {
    emit('detect', uploadedImage.value)
  } finally {
    isDetecting.value = false
  }
}

// 重置上传
const resetUpload = () => {
  removeImage()
  emit('reset')
}
</script>

<style scoped lang="scss">
.image-detection-container {
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

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: #3b82f6;
    background-color: #f8fafc;
  }
  
  &.drag-over {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.upload-hint {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.image-preview {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.detect-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 2rem;
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

.reset-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
  }
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .detection-card {
    padding: 1.5rem;
  }
  
  .upload-area {
    padding: 2rem 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .detect-btn,
  .reset-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
