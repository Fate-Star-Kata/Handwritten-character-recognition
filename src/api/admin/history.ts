import http from '@/http'
import type {
  HistoryListRequest,
  HistoryListResponse,
  DetectionListResponse,
  DetectionQueryParams,
  ApiResponse,
  DetectionApiResponse
} from '@/types/factory'

// 获取历史记录列表
export const getHistoryList = (params: HistoryListRequest): Promise<HistoryListResponse> => {
  return http.get('/handwriting/api/history/', { params })
}

// 获取检测记录列表（管理端）
export const getDetectionList = async (params: DetectionQueryParams): Promise<DetectionListResponse> => {
  const queryParams = new URLSearchParams()

  // 添加分页参数
  queryParams.append('page', params.page.toString())
  queryParams.append('page_size', params.page_size.toString())

  // 添加搜索参数
  if (params.search) {
    queryParams.append('search', params.search)
  }

  // 添加状态过滤
  if (params.status) {
    queryParams.append('status', params.status)
  }

  // 添加日期范围
  if (params.start_date) {
    queryParams.append('start_date', params.start_date)
  }
  if (params.end_date) {
    queryParams.append('end_date', params.end_date)
  }

  try {
    const response: ApiResponse<DetectionApiResponse> = await http.get(`/handwriting/api/admin/history/?${queryParams.toString()}`)

    // 适配API响应格式
    if (response.code === 200 && response.msg) {
      const { records, pagination } = response.msg

      return {
        success: true,
        message: '获取检测记录成功',
        data: {
          records: records,
          total: pagination.total_count,
          statistics: {
            total: pagination.total_count,
            success: records.filter((r: any) => r.is_correct === true).length,
            failed: records.filter((r: any) => r.is_correct === false).length,
            processing: records.filter((r: any) => r.is_correct === null).length,
            accuracy: records.length > 0 ? (records.filter((r: any) => r.is_correct === true).length / records.length) * 100 : 0
          }
        }
      }
    } else {
      throw new Error(response.msg?.toString() || '获取检测记录失败')
    }
  } catch (error: any) {
    console.error('获取检测记录失败:', error)
    throw new Error(error.message || '获取检测记录失败')
  }
}

// 重新处理检测记录
export const reprocessDetection = (id: number): Promise<ApiResponse> => {
  return http.post(`/handwriting/api/history/${id}/reprocess/`)
}

// 删除检测记录
export const deleteDetection = (id: number): Promise<ApiResponse> => {
  return http.delete(`/handwriting/api/admin/history/delete/${id}/`)
}

// 批量删除检测记录
export const batchDeleteDetections = (ids: number[]): Promise<ApiResponse> => {
  return http.post('/handwriting/api/history/batch-delete/', { ids })
}

// 导出检测数据
export const exportDetectionData = (params: DetectionQueryParams): Promise<Blob> => {
  const queryParams: any = {
    page: params.page,
    page_size: params.page_size,
    export: true
  }

  if (params.search) {
    queryParams.search = params.search
  }

  if (params.status) {
    queryParams.status = params.status
  }

  if (params.dateRange && params.dateRange.length === 2) {
    queryParams.start_date = params.dateRange[0]
    queryParams.end_date = params.dateRange[1]
  }

  return http.get('/handwriting/api/admin/history/', {
    params: queryParams,
    responseType: 'blob'
  })
}