import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface SupplierItem {
  id: number
  code: string
  sName: string
  fName: string
  remark: string
}

interface SupplierDialogProps {
  onSelect: (country: SupplierItem) => void
}

const SupplierDialog = forwardRef<SelectDialogRef, SupplierDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '编码', dataIndex: 'code', width: 140 },
    { title: '简称', dataIndex: 'sName', width: 140 },
    { title: '全称', dataIndex: 'fName', width: 120 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<SupplierItem>
      ref={ref}
      title="选择供应商"
      apiUrl="/base/api/SupplierItem"
      columns={columns}
      placeholder="请输入供应商名称或代码"
      onSelect={onSelect}
    />
  )
})

SupplierDialog.displayName = 'SupplierDialog'

export default SupplierDialog
