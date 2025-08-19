import type { AdminHeader } from '@/types/factory'
import type { MenuItem } from '@/types/components/header'

//获得资源服务地址
const FileUploadUrl: string = (import.meta.env.VITE_FILE_UPLOAD_URL as string)
  .startsWith("http") ? import.meta.env.VITE_FILE_UPLOAD_URL : window.location.protocol + "//" + window.location.host + "/api" + import.meta.env.VITE_FILE_UPLOAD_URL;

// 主菜单配置（用于Header组件）
export const defaultMenuItems: MenuItem[] = [
  {
    id: "home",
    label: "首页",
    href: "/",
    icon: null,
  },
  {
    id: "detection",
    label: "检测识别",
    href: "/detection",
    icon: null,
  },
  {
    id: "history",
    label: "检测历史",
    href: "/history",
    icon: null,
  },
  {
    id: "statistics",
    label: "统计分析",
    href: "/statistics",
    icon: null,
  },
  {
    id: "admin",
    label: "管理后台",

    href: "/admin",
    icon: null,
  },
];

// 管理后台菜单配置
export const adminMenuItems: AdminHeader[] = [
  {
    id: '1',
    title: '仪表板',
    icon: 'Odometer',
    path: '/admin/dashboard',
  },
  {
    id: '2',
    title: '用户管理',
    icon: 'User',
    path: '/admin/userManage',
  },
  {
    id: '3',
    title: '检测管理',
    icon: 'Search',
    path: '/admin/detectionManage',
  },
  {
    id: '4',
    title: '历史管理',
    icon: 'Clock',
    path: '/admin/historyManage',
  },
  {
    id: '5',
    title: '统计分析',
    icon: 'DataAnalysis',
    path: '/admin/analytics',
  },
]

const serverConfig = {
  baseURL: '/api', // 请求基础地址,可根据环境自定义

  useTokenAuthorization: false, // 是否开启 token 认证

  FileUploadUrl,

  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,

  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,

  SERVER_PATH: import.meta.env.VITE_SERVER_PATH || '/api',

  WEBSPCLET_PATH: import.meta.env.VITE_WEBSOCKET_PATH || '/api',
}
export default serverConfig
