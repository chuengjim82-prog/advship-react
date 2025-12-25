// This component is deprecated - use CrudTableV2 instead
// Keeping this file to prevent import errors from legacy code

import React from 'react'

export interface CrudTableRef {
  loadData: () => Promise<void>
  openAddDialog: () => void
  openEditDialog: (record: unknown) => void
}

export interface CrudTableProps<T = Record<string, unknown>> {
  title?: string
  apiUrl?: string
  renderColumns?: () => React.ReactNode
  renderForm?: (formData: T) => React.ReactNode
  defaultFormData?: () => T
  onLoaded?: (data: T[]) => void
}

function CrudTableInner<T extends Record<string, unknown>>(
  _props: CrudTableProps<T>,
  _ref: React.Ref<CrudTableRef>
) {
  console.warn('CrudTable is deprecated. Please use CrudTableV2 instead.')
  return null
}

const CrudTable = React.forwardRef(CrudTableInner) as <T extends Record<string, unknown>>(
  props: CrudTableProps<T> & { ref?: React.Ref<CrudTableRef> }
) => React.ReactElement | null

export default CrudTable
