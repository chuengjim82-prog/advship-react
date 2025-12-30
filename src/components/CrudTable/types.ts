import type { ReactNode } from 'react'
import type { FormRule, FormInstance } from 'antd'

export interface CrudTableProps<T = Record<string, any>> {
  // Required props
  title: string
  apiUrl: string

  // Render props (replacing Vue slots)
  renderColumns: () => ReactNode
  renderForm: (formData: T) => ReactNode

  // Optional props
  formRules?: Record<string, FormRule[]>
  defaultFormData?: () => T

  // Callbacks
  onLoaded?: (data: T[]) => void
}

export interface CrudTableRef {
  loadData: () => Promise<void>
  form: FormInstance
}
