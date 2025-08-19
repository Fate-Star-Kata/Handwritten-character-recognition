// 统计数据相关类型定义

// 统计周期类型
export type StatisticsPeriod = 'day' | 'week' | 'month' | 'year'

// 日统计数据
export interface DailyStat {
  date: string
  count: number
}

// 类型统计数据
export interface TypeStat {
  detection_type: string
  count: number
  avg_conf: number
}

// 字符统计数据
export interface CharStat {
  recognized_character: string
  count: number
  avg_conf: number
}

// 日期范围
export interface DateRange {
  start_date: string
  end_date: string
  days: number
}

// 统计数据响应
export interface StatisticsData {
  total_detections: number
  avg_accuracy: number
  daily_stats: DailyStat[]
  type_stats: TypeStat[]
  char_stats: CharStat[]
  date_range: DateRange
}

// 统计数据API响应
export interface StatisticsResponse {
  code: number
  msg: StatisticsData
  data: string
}

// 统计数据请求参数
export interface StatisticsParams {
  period?: StatisticsPeriod
}

// 管理员系统统计数据
export interface AdminSystemStatsData {
  system_info: {
    total_users: number
    active_users_today: number
    total_detections: number
    detections_today: number
    system_uptime: string
    cpu_usage: number
    memory_usage: number
    disk_usage: number
  }
  model_info: {
    model_name: string
    model_version: string
    accuracy: number
    last_updated: string
    total_parameters: number
  }
  performance_stats: {
    avg_response_time: number
    requests_per_second: number
    error_rate: number
    success_rate: number
  }
  recent_activities: Array<{
    timestamp: string
    user_id: number
    action: string
    details: string
  }>
  daily_stats: DailyStat[]
  type_stats: TypeStat[]
  char_stats: CharStat[]
}

// 管理员系统统计API响应
export interface AdminSystemStatsResponse {
  code: number
  message: string
  data: AdminSystemStatsData
}

// 管理员系统统计请求参数
export interface AdminSystemStatsParams {
  period?: StatisticsPeriod
  include_activities?: boolean
}