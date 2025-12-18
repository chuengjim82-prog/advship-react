import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { z } from 'zod'

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
