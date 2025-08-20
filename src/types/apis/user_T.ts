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
  image: File // 图片文件对象
}

export interface DetectionResult {
  record_id: number // 记录ID
  recognized_character: string // 识别的字符
  confidence: number // 置信度
  candidates: CandidateCharacter[] // 候选字符列表
  processing_time: number // 处理时间（秒）
  image_url: string // 识别后的图片URL
}

// WebSocket实时识别结果类型（匹配实际API响应）
export interface WSDetectionResult {
  character: string // 识别的字符（匹配响应示例.json）
  confidence: number // 置信度
  timestamp: string // 时间戳
  session_id: string // 会话ID
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
  detection_type?: string
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

// 历史响应类型（严格匹配实际API响应：success/message/data）
export type HistoryResponse = ApiResponse<HistoryData>

// 统计数据相关类型
export interface StatisticsQueryParams {
  period?: 'day' | 'week' | 'month' | 'year'
}

export interface DailyStat {
  date: string
  count: number
  avg_confidence: number
}

// 详细统计数据项类型
export interface DailyStatDetail {
  date: string
  totalDetections: number
  successCount: number
  avgAccuracy: number
  maxAccuracy: number
  minAccuracy: number
  mainType: string
}

// 实际API返回的统计数据结构
export interface ActualStatisticsData {
  total_detections: number;
  avg_accuracy: number;
  daily_stats: DailyStatDetail[];
  type_stats: {
    detection_type: string;
    count: number;
    avg_conf: number;
  }[];
  char_stats: {
    recognized_character: string;
    count: number;
    avg_conf: number;
  }[];
  date_range: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

// 实际API响应格式
export interface ActualStatisticsResponse {
  code: number;
  msg: ActualStatisticsData;
  data: string;
}

// 前端使用的统计数据类型（与实际API返回结构保持一致）
export type StatisticsData = ActualStatisticsData;

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
