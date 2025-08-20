import type {
  ImageDetectRequest,
  ImageDetectResponse,
  CanvasDetectRequest,
  CanvasDetectResponse,
  VideoDetectRequest,
  VideoDetectResponse,
  HistoryQueryParams,
  HistoryResponse,
  StatisticsQueryParams,
  StatisticsResponse,
  ActualStatisticsResponse,
  FeedbackRequest,
  FeedbackResponse
} from '@/types/apis/user_T'
import serviceAxios from '@/http'

// 图片识别接口
export function detectImageAPI(data: ImageDetectRequest): Promise<ImageDetectResponse> {
  const formData = new FormData()
  formData.append('image', data.image)
  
  return serviceAxios({
    url: '/handwriting/api/detect/image/',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 画布识别接口
export function detectCanvasAPI(data: CanvasDetectRequest): Promise<CanvasDetectResponse> {
  return serviceAxios({
    url: '/handwriting/api/detect/canvas/',
    method: 'post',
    data
  })
}

// 视频识别接口
export function detectVideoAPI(data: VideoDetectRequest): Promise<VideoDetectResponse> {
  return serviceAxios({
    url: '/handwriting/api/detect/video/',
    method: 'post',
    data
  })
}

// 获取历史记录接口
export function getHistoryAPI(params: HistoryQueryParams): Promise<HistoryResponse> {
  return serviceAxios({
    url: '/handwriting/api/history/',
    method: 'get',
    params
  })
}

// 获取统计数据接口
export function getStatisticsAPI(params: StatisticsQueryParams): Promise<ActualStatisticsResponse> {
  return serviceAxios({
    url: '/handwriting/api/statistics/',
    method: 'get',
    params
  })
}

// 提交反馈接口
export function submitFeedbackAPI(data: FeedbackRequest): Promise<FeedbackResponse> {
  return serviceAxios({
    url: '/handwriting/api/feedback/',
    method: 'post',
    data
  })
}
