import request from './request'

export interface UploadResult {
  url: string
  key: string
}

/**
 * 上传文件到 COS
 * 使用 form-data 格式，字段名为 file
 */
export function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<UploadResult>('/api/v1/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
