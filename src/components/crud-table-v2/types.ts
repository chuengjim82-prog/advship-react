import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { z } from 'zod'

export interface SearchField {
  name: string
  label: string
  placeholder?: string
  type?: 'text' | 'select' | 'custom'
  options?: { label: string; value: string }[]
  /** 自定义渲染函数，onSearch用于选择后自动触发搜索 */
  render?: (value: string, onChange: (value: string) => void, onSearch: () => void) => ReactNode
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

  // Multi-field search
  searchFields?: SearchField[]
  searchVisibleRows?: number

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
