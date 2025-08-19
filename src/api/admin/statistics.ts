import serviceAxios from '@/http'
import type { StatisticsResponse, StatisticsParams, StatisticsData, AdminSystemStatsResponse, AdminSystemStatsParams, AdminSystemStatsData } from '@/types/apis/statistics'

/**
 * 获取统计数据
 * @param params 统计参数
 * @returns 统计数据
 */
export const getStatisticsAPI = async (params?: StatisticsParams): Promise<StatisticsData> => {
  const response: StatisticsResponse = await serviceAxios({
    url: '/handwriting/api/statistics/',
    method: 'GET',
    params
  })
  return response.msg
}

/**
 * 获取管理员系统统计数据
 * @param params 统计参数
 * @returns 系统统计数据
 */
export const getAdminSystemStatsAPI = async (params?: AdminSystemStatsParams): Promise<AdminSystemStatsData> => {
  const response: AdminSystemStatsResponse = await serviceAxios({
    url: '/handwriting/api/admin/system/stats/',
    method: 'GET',
    params
  })
  return response.data
}

/**
 * 获取管理员模型信息
 * @returns 模型信息数据
 */
export const getAdminModelInfoAPI = async (): Promise<any> => {
  const response: StatisticsResponse = await serviceAxios({
    url: '/handwriting/api/admin/model/info/',
    method: 'GET'
  })
  return response.msg
}

/**
 * 获取系统状态信息
 * @returns 系统状态数据
 */
export const getSystemStatusAPI = async (): Promise<any> => {
  const response = await serviceAxios({
    url: '/api/websocket/system/status/',
    method: 'GET'
  })
  return response.data
}