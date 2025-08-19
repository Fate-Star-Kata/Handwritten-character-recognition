// 用户API相关类型定义

// 基础响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error_code?: string
}

// 图片识别相关类型
export interface ImageDetectRequest {
  image: string // base64编码的图片数据
}

export interface DetectionResult {
  character: string
  confidence: number
  recognition_time: string
  session_id: string
}

export type ImageDetectResponse = ApiResponse<DetectionResult>

// 画布识别相关类型
export interface CanvasDetectRequest {
  canvas_data: string // base64编码的画布数据
  width: number
  height: number
}

export type CanvasDetectResponse = ApiResponse<DetectionResult>

// 视频识别相关类型
export interface VideoDetectRequest {
  video_file: string // base64编码的视频数据
  frame_interval: number
}

export interface VideoCharacter {
  frame_number: number
  character: string
  confidence: number
  timestamp: string
}

export interface VideoDetectionResult {
  total_frames: number
  recognized_characters: VideoCharacter[]
  session_id: string
}

export type VideoDetectResponse = ApiResponse<VideoDetectionResult>

// 历史记录相关类型
export interface HistoryQueryParams {
  page?: number
  page_size?: number
  character?: string
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
}

// 候选字符类型
export interface CandidateCharacter {
  character: string
  confidence: number
  class_id: number
}

// 历史记录项类型
export interface HistoryRecord {
  id: number
  detection_type: string
  recognized_character: string
  confidence: number
  candidates: CandidateCharacter[]
  processing_time: number
  detection_time: string
  image_url: string
  is_correct: boolean | null
  user_feedback: string | null
}

// 分页信息类型
export interface PaginationInfo {
  current_page: number
  total_pages: number
  total_count: number
  has_next: boolean
  has_previous: boolean
}

// 历史数据响应类型
export interface HistoryData {
  records: HistoryRecord[]
  pagination: PaginationInfo
}

// 历史响应类型（匹配实际API响应格式）
export interface HistoryResponse {
  code: number
  msg: HistoryData
  data: string
}

// 统计数据相关类型
export interface StatisticsQueryParams {
  period?: 'day' | 'week' | 'month' | 'year'
}

export interface DailyStat {
  date: string
  count: number
  avg_confidence: number
}

export interface StatisticsData {
  total_recognitions: number
  avg_confidence: number
  most_recognized_character: string
  recognition_accuracy: number
  daily_stats: DailyStat[]
  character_distribution: Record<string, number>
}

export type StatisticsResponse = ApiResponse<StatisticsData>

// 反馈相关类型
export interface FeedbackRequest {
  record_id: number
  correct_character: string
  feedback_type: string
  comment: string
}

export interface FeedbackResult {
  feedback_id: number
  record_id: number
  status: string
  submit_time: string
}

export type FeedbackResponse = ApiResponse<FeedbackResult>