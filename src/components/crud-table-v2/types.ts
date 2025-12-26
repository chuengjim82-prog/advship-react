import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { z } from 'zod'

// 搜索字段配置
export interface SearchField {
  name: string           // 字段名（用于 API 参数）
  label: string          // 显示标签
  placeholder?: string   // 输入框占位符
  type?: 'text' | 'select' // 字段类型，默认 text
  options?: { label: string; value: string | number }[] // select 时的选项
}

// 固定列配置
export interface StickyColumnConfig {
  enabled?: boolean       // 是否启用固定，默认 false
  width?: number          // 固定列宽度，默认使用列定义的 size
}

export interface CrudTableV2Props<T extends FieldValues = FieldValues> {
  // Required props
  title: string
  apiUrl: string

  // TanStack Table columns definition
  columns: ColumnDef<T>[]

  // Form configuration
  formSchema: z.ZodSchema<T>
  renderFormFields: (form: UseFormReturn<T>) => ReactNode
  defaultValues: T

  // Optional props
  searchPlaceholder?: string
  dialogWidth?: string | number
  dialogClassName?: string

  // 多字段搜索配置
  searchFields?: SearchField[]
  // 默认显示的搜索行数（超出折叠），默认 2
  searchVisibleRows?: number

  // 固定列配置
  stickyFirstColumn?: StickyColumnConfig  // 首列固定配置
  stickyActionsColumn?: StickyColumnConfig // 操作列固定配置

  // Callbacks
  onLoaded?: (data: T[]) => void
  onBeforeSubmit?: (values: T) => T | Promise<T>
  onAfterSubmit?: (values: T) => void
}

export interface CrudTableV2Ref {
  loadData: () => Promise<void>
  openAddDialog: () => void
  openEditDialog: (record: any) => void
}
