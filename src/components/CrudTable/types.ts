// This file is deprecated - use CrudTableV2 types instead
import type { ReactNode } from 'react'

export interface CrudTableColumn {
  title: string
  dataIndex: string
  width?: number
  render?: (value: unknown, record: unknown) => ReactNode
}

export interface CrudTableProps<T = Record<string, unknown>> {
  title?: string
  apiUrl?: string
  renderColumns?: () => ReactNode
  renderForm?: (formData: T) => ReactNode
  defaultFormData?: () => T
  onLoaded?: (data: T[]) => void
}

export interface CrudTableRef {
  loadData: () => Promise<void>
  openAddDialog: () => void
  openEditDialog: (record: unknown) => void
}
