import request from './request'
import { BASE_URL } from './request'
import { getToken } from '../utils/auth'

export interface ExportTaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  progress: number
  message: string
  total_houses: number
  processed_houses: number
  created_at: string
  error: string | null
}

export interface ExportParams {
  export_type?: 'all' | 'filtered'
  keyword?: string
  status?: string
  decoration?: string
  key_type?: string
  community_id?: number
  house_use_type?: 'sale' | 'rent'
}

/** 创建导出任务，返回 task_id */
export function createExportTask(params: ExportParams) {
  return request.post<{ task_id: string }>('/api/v1/export', null, { params })
}

/** 查询导出任务进度 */
export function getExportStatus(taskId: string) {
  return request.get<ExportTaskStatus>(`/api/v1/export/${taskId}/status`)
}

/**
 * 下载导出的 ZIP 文件
 * 使用原生 fetch + blob 方式，绕过 axios 拦截器（拦截器会提取 data 字段）
 */
export async function downloadExportFile(taskId: string): Promise<void> {
  const token = getToken()
  const url = `${BASE_URL}/api/v1/export/${taskId}/download`

  const resp = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!resp.ok) {
    const errData = await resp.json().catch(() => null)
    throw new Error(errData?.msg || `下载失败 (${resp.status})`)
  }

  // 从 Content-Disposition 提取文件名
  const disposition = resp.headers.get('Content-Disposition') || ''
  let filename = '房源导出.zip'
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i)
  if (match && match[1]) {
    filename = decodeURIComponent(match[1])
  }

  const blob = await resp.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

/** 取消/清理导出任务 */
export function cancelExportTask(taskId: string) {
  return request.delete(`/api/v1/export/${taskId}`)
}
