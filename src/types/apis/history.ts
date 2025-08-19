// 历史记录相关类型定义

// 历史记录项
export interface HistoryRecord {
  id: number
  character: string
  confidence: number
  recognition_time: string
  image_path: string
  session_id: string
}

// 获取历史记录请求参数
export interface HistoryListRequest {
  page?: number
  page_size?: number
  character?: string
  start_date?: string
  end_date?: string
  search?: string
}

// 获取历史记录响应数据
export interface HistoryListResponse {
  success: boolean
  message: string
  data: {
    total_count: number
    page: number
    page_size: number
    total_pages: number
    records: HistoryRecord[]
  }
}

// 历史记录统计数据
export interface HistoryStatistics {
  total: number
  success: number
  failed: number
  processing: number
  accuracy: number
}

// 检测记录（用于管理端）
export interface DetectionRecord {
  id: number
  username?: string
  detection_type: string
  image_url: string
  recognized_character: string
  confidence: number
  is_correct: boolean | null
  processing_time: number
  detection_time: string
  created_at?: string
  updated_at?: string
}

// 检测记录查询参数
export interface DetectionQueryParams {
  search: string
  status: string
  dateRange: string[]
  page: number
  page_size: number
  start_date?: string
  end_date?: string
}

// 检测记录列表响应
export interface DetectionListResponse {
  success: boolean
  message: string
  data: {
    records: DetectionRecord[]
    total: number
    statistics: HistoryStatistics
  }
}

// API原始响应格式
export interface ApiResponse<T = any> {
  code: number
  msg?: T
  data?: T
  message?: string
}

// 检测记录API响应格式
export interface DetectionApiResponse {
  records: DetectionRecord[]
  pagination: {
    total_count: number
    page: number
    page_size: number
    total_pages: number
  }
}