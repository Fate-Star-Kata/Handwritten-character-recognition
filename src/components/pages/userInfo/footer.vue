<template>
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
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
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
  
