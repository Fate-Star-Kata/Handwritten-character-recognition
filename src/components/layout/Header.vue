<script setup lang="ts">
import { provide, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import LanguageSwitch from './btns/LanguageSwitch.vue'
import Search from './btns/search.vue'
import ThemeSwitch from './btns/ThemeSwitch.vue'
import MenuItems from './MenuItems.vue'
import serverConfig, { defaultMenuItems } from '@/configs'
import { useUserStore } from '@/stores/auth/user'
import { storeToRefs } from "pinia"

const { t } = useI18n()
const expandedMenus = ref<Set<string>>(new Set())

const store = useUserStore()

const { userInfo, getUserAvatar } = storeToRefs(store)

// 使用store中的头像方法
const avatar = getUserAvatar

// 用户头像下拉菜单项
const userMenuItems = ref([
  {
    title: '个人资料',
    class: 'justify-between',
    badge: '新',
    event: () => {
      console.log('跳转到个人资料页面')
      router.push('/userInfo')
    }
  },
  {
    title: '设置',
    class: '',
    hide: true,
    event: () => {
      console.log('跳转到设置页面')
      // router.push('/settings')
    }
  },
  {
    title: '退出登录',
    class: '',
    event: () => {
      console.log('执行退出登录')
      router.push("/auth/login")
    }
  }
])

// 从configs获取菜单项并应用国际化
const menuItems = computed(() => {
  const applyI18n = (items: any[]): any[] => {
    return items.map(item => ({
      ...item,
      label: t(item.label),
      children: item.children ? applyI18n(item.children) : undefined
    }))
  }
  return applyI18n(defaultMenuItems)
})

function toggleSubmenu(menuId: string) {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  }
  else {
    expandedMenus.value.add(menuId)
  }
}

function isMenuExpanded(menuId: string) {
  return expandedMenus.value.has(menuId)
}

// 提供菜单状态管理函数给子组件
provide('isMenuExpanded', isMenuExpanded)
provide('toggleSubmenu', toggleSubmenu)
</script>

<template>
  <div class="navbar bg-base-100 shadow-sm">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
          <MenuItems :menu-items="menuItems" />
        </ul>
      </div>
      <a href="/" class="btn btn-ghost text-xl">
      <svg t="1755580598691" class="icon" viewBox="0 0 1217 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6313" width="32" height="32"><path d="M441.759135 795.897081a34.594595 34.594595 0 0 1 63.930811 26.43027c-6.199351 15.027892-18.874811 35.369514-39.880649 55.48973-30.636973 29.336216-70.46227 48.570811-119.475892 52.583784a34.594595 34.594595 0 0 1-5.645837-68.940108c32.463568-2.684541 57.648432-14.834162 77.24281-33.598271 11.789838-11.264 19.234595-22.361946 22.694054-29.50227l1.134703-2.490811zM492.682378 502.451892a34.594595 34.594595 0 0 1 46.135352-2.490811l2.795243 2.490811 151.939459 151.939459a34.594595 34.594595 0 0 1-46.107675 51.476757l-2.795243-2.546162-151.93946-151.93946a34.594595 34.594595 0 0 1 0-48.930594z" fill="#2c2c2c" p-id="6314"></path><path d="M1000.143568 52.860541C1052.256865 7.057297 1129.167568 0.719568 1173.088865 43.727568c42.980324 42.122378 38.164757 115.269189-5.009297 166.496864l-4.317406 4.898595-398.944865 435.283027-157.114811 153.876757-0.166054 3.957621c-3.127351 46.799568-23.911784 90.803892-60.277621 128.747244l-5.867243 5.922594c-47.408432 46.605838-123.461189 68.718703-220.519784 73.478919-58.700108 2.905946-121.108757-0.83027-182.438054-8.745513a1185.044757 1185.044757 0 0 1-36.670271-5.31373l-15.636756-2.656865-9.907892-1.85427-64.733406-13.007568 47.546811-45.803243c0.968649-0.940973 2.739892-2.767568 5.258379-5.479784l4.289729-4.73254c8.38573-9.40973 17.850811-20.895135 28.090811-34.483892 29.640649-39.382486 59.447351-87.593514 87.344433-144.937514a1117.709838 1117.709838 0 0 0 41.59654-97.141621c26.43027-70.572973 101.209946-95.42573 185.288649-78.239135l7.472432 1.66054 9.40973 2.186378 156.118486 152.908109 107.298595-105.056865-162.096432-158.803027 471.04-414.028108zM389.756541 640.415135c-50.646486-8.579459-87.731892 4.981622-99.355676 36.089081a1186.788324 1186.788324 0 0 1-44.170379 103.119568c-27.398919 56.32-56.679784 104.724757-86.237405 145.408l-8.053622 10.904216-2.546162 3.321081 17.158919 2.103351a981.656216 981.656216 0 0 0 132.732541 6.586811l18.210594-0.664216c81.643243-4.012973 142.972541-21.863784 175.436108-53.718486 32.629622-32.048432 47.93427-67.722378 45.581838-105.444325l-0.498162-5.452108-144.494703-141.561081-3.763891-0.691892zM1124.656432 93.184c-14.612757-14.308324-48.017297-12.371027-74.475243 8.081297l-4.345081 3.570162L630.728649 469.628541l108.516324 106.30227L1112.755892 168.378811c22.638703-24.686703 26.485622-56.956541 14.114594-72.731676l-2.214054-2.490811z" fill="#2c2c2c" p-id="6315"></path></svg>
        
        {{ serverConfig.VITE_APP_TITLE }}</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu lg:menu-horizontal rounded-box">
        <MenuItems :menu-items="menuItems" />
      </ul>
    </div>
    <div class="navbar-end">
      <div class="flex items-center gap-2">
        <LanguageSwitch />
        <ThemeSwitch />

        <!-- 用户头像显示区域 -->
        <div class="dropdown dropdown-end" v-if="userInfo?.username">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-online">
            <div class="w-10 rounded-full">
              <img alt="用户头像" height="30" :src="avatar" />
            </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li v-for="(item, index) in userMenuItems" :key="index" v-show="!item.hide">
              <a :class="item.class" :title="item.title" @click="item.event">
                {{ item.title }}
                <span v-if="item.badge" class="badge">{{ item.badge }}</span>
              </a>
            </li>
          </ul>
        </div>

        <div v-else>
          <button class="btn btn-soft btn-success w-28 mr-1" @click="router.push('/auth/login')">
            {{ t('header.login') }}
          </button>
          <button class="btn btn-soft btn-warning w-28" @click="router.push('/auth/register')">
            {{ t('header.register') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='stylus' scoped></style>
