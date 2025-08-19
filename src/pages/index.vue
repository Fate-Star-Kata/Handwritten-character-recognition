<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <motion.div
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 1.2 }"
      class="relative overflow-hidden h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <!-- 背景装饰元素 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-2xl"></div>
      </div>
      
      <!-- 主要内容 -->
      <div class="relative z-10 container mx-auto px-6 h-full flex items-center">
        <div class="w-full my-grid lg:grid-cols-2 gap-12 items-center">
          <!-- 左侧内容区域 -->
          <div class="space-y-8">
            <motion.div
              :initial="{ opacity: 0, y: 30 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.8, delay: 0.2 }"
              class="space-y-6"
            >
              <div class="lg:text-4xl font-bold leading-tight">
                <span class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  智能汉字识别系统
                </span>
              </div>
              
              <p class="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                基于深度学习的高精度汉字识别技术，支持多种字体、多种场景的实时图像文本检测，为您提供专业可靠的识别服务
              </p>
            </motion.div>
            
            <motion.div
              :initial="{ opacity: 0, y: 30 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.8, delay: 0.4 }"
              class="flex flex-col sm:flex-row gap-4"
            >
              <d-button
                variant="solid"
                color="primary"
                size="lg"
                class="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                @click="startRecognition"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  开始识别
                </span>
              </d-button>
              <d-button
                variant="outline"
                size="lg"
                class="px-10 py-4 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 backdrop-blur-sm bg-white/80"
                @click="learnMore"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  了解更多
                </span>
              </d-button>
            </motion.div>
          </div>
          
          <!-- 右侧演示区域 -->
          <motion.div
            :initial="{ opacity: 0, scale: 0.9, rotateY: 15 }"
            :animate="{ opacity: 1, scale: 1, rotateY: 0 }"
            :transition="{ duration: 1, delay: 0.4 }"
            class="flex justify-center lg:justify-end"
          >
            <div class="relative">
              <!-- 装饰性背景 -->
              <div class="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              
              <!-- 主要上传区域 -->
              <div class="relative w-96 h-96 lg:w-[450px] lg:h-[400px] bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-white/50">
                <ReceiveFiles
                  model="image"
                  :custom-title="'拖拽图片到此处或点击上传'"
                  :custom-desc="'支持 JPG、PNG、JPEG 格式，最大 10MB'"
                  @file-selected="handleFileSelected"
                />
              </div>
              
              <!-- 浮动装饰元素 -->
              <div class="absolute -top-6 -right-6 w-12 h-12 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div class="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500/20 rounded-full animate-pulse" style="animation-delay: 1s"></div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <!-- 滚动提示 -->
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, delay: 1 }"
        class="absolute bottom-25 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div class="flex flex-col items-center space-y-2 text-gray-500">
          <span class="text-sm font-medium">向下滚动探索更多</span>
          <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </motion.div>

    <!-- Divider -->

    <!-- Features Section -->
    <section class="py-40 bg-gray-50 mt-0">
      <div class="container mx-auto px-6">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8 }"
          :viewport="{ once: true, amount: 0.3 }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl font-bold text-gray-800 mb-4">系统功能特性</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">先进的AI技术为您提供精准、快速、可靠的汉字识别服务</p>
        </motion.div>
        
        <div class="my-grid my-grid-cols-1 md:my-grid-cols-3 my-grid-gap-8">
          <motion.div
            v-for="(feature, index) in features"
            :key="index"
            :initial="{ opacity: 0, y: 30 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8, delay: index * 0.2 }"
            :viewport="{ once: true, amount: 0.3 }"
            :whileHover="{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }"
            class="cursor-pointer"
          >
            <d-card class="h-full text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <template #content>
                <div class="p-3">
                  <div class="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.iconPath"></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-800 mb-4">{{ feature.title }}</h3>
                  <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
                </div>
              </template>
            </d-card>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- Divider -->
    <div class="h-32 bg-gradient-to-b from-gray-50 via-white to-white opacity-80"></div>

    <!-- Statistics Section -->
    <section class="py-40 bg-white text-gray-800 mt-0">
      <div class="container mx-auto px-6">
        <motion.div
          :initial="{ opacity: 0, y: 30 }"
          :whileInView="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8 }"
          :viewport="{ once: true, amount: 0.3 }"
          class="text-center mb-16"
        >
          <h2 class="text-4xl font-bold mb-4">使用统计</h2>
          <p class="text-xl text-gray-600">数据见证我们的专业与可靠</p>
        </motion.div>
        
        <div class="my-grid my-grid-cols-1 md:my-grid-cols-4 my-grid-gap-8">
          <motion.div
            v-for="(stat, index) in statistics"
            :key="index"
            :initial="{ opacity: 0, scale: 0.5 }"
            :whileInView="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.8, delay: index * 0.1 }"
            :viewport="{ once: true, amount: 0.3 }"
            class="text-center"
          >
            <div class="text-5xl font-bold mb-2">{{ stat.value }}</div>
            <div class="text-gray-500 text-lg">{{ stat.label }}</div>
          </motion.div>
        </div>
      </div>
    </section>


    <!-- Footer Section -->
    <footer class="bg-gray-800 text-white py-10 mt-0">
      <div class="container mx-auto px-6">
        <div class="my-grid my-grid-cols-1 md:my-grid-cols-3 my-grid-gap-8">
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8 }"
            :viewport="{ once: true, amount: 0.3 }"
          >
            <h3 class="text-xl font-semibold mb-4">手写汉字识别系统</h3>
            <p class="text-gray-400 leading-relaxed">基于深度学习的高精度汉字识别技术解决方案</p>
          </motion.div>
          
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8, delay: 0.2 }"
            :viewport="{ once: true, amount: 0.3 }"
          >
            <h3 class="text-xl font-semibold mb-4">快速链接</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">产品介绍</a></li>
              <li><a href="#" class="hover:text-white transition-colors">技术文档</a></li>
              <li><a href="#" class="hover:text-white transition-colors">使用指南</a></li>
            </ul>
          </motion.div>
          
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8, delay: 0.4 }"
            :viewport="{ once: true, amount: 0.3 }"
          >
            <h3 class="text-xl font-semibold mb-4">联系我们</h3>
            <div class="space-y-2 text-gray-400">
              <p>邮箱: contact@handwriting.com</p>
              <p>电话: 400-123-4567</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          :initial="{ opacity: 0 }"
          :whileInView="{ opacity: 1 }"
          :transition="{ duration: 0.8, delay: 0.6 }"
          :viewport="{ once: true, amount: 0.3 }"
          class="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400"
        >
          <p>&copy; 2024 手写汉字识别系统. 保留所有权利.</p>
        </motion.div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { motion } from 'motion-v'
import { useRouter } from 'vue-router'
import ReceiveFiles from '@/components/common/FileUpload/ReceiveFiles.vue'

const router = useRouter()

// 功能特性数据
const features = ref([
  {
    title: '高精度识别',
    description: '采用先进的深度学习算法，识别准确率高达99.5%，支持多种字体和书写风格',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: '实时处理',
    description: '毫秒级响应速度，支持批量处理，满足高并发场景下的识别需求',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    title: '多场景适配',
    description: '支持手写文档、表单、笔记等多种场景，适应不同的应用需求',
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  }
])

// 统计数据
const statistics = ref([
  { value: '99.5%', label: '识别准确率' },
  { value: '50ms', label: '平均响应时间' },
  { value: '10万+', label: '注册用户数' },
  { value: '500万+', label: '识别次数' }
])

// 方法
const startRecognition = () => {
  router.push('/detection')
}

const learnMore = () => {
  // 滚动到功能特性区域
  const featuresSection = document.querySelector('.features-section')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// 处理文件选择
const handleFileSelected = (file: File) => {
  console.log('选择的文件:', file)
  // 这里可以添加文件处理逻辑，比如预览或上传
  router.push('/detection')
}
</script>

<style scoped lang="scss">
// 自定义样式
.container {
  max-width: 1200px;
}

// 卡片悬停效果
.d-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

// 按钮样式增强
.d-button {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.my-grid {
  display: grid;
}
.my-grid-gap-8 {
  gap: 2rem;
}
.my-grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}
@media (min-width: 768px) {
  .md\:my-grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .md\:my-grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
