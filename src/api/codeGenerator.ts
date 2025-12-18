import request from '@/utils/request'

// 表信息接口
export interface TableInfo {
  name: string
  description: string | null
}

// 列信息接口
export interface ColumnInfo {
  name: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isIdentity: boolean
  description: string | null
  length: number
  defaultValue: string | null
}

// 代码生成请求接口
export interface GenerateRequest {
  tableNames: string[]
}

// 获取所有表
export function getTables() {
  return request.get<TableInfo[]>('/base/api/CodeGenerator/tables')
}

// 获取表的列信息
export function getColumns(tableName: string) {
  return request.get<ColumnInfo[]>(`/base/api/CodeGenerator/columns/${tableName}`)
}

// 生成实体类
export function generateEntities(data: GenerateRequest) {
  return request.post<string>('/base/api/CodeGenerator/generate', data)
}
