import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface CustomerItem {
  id: number
  code: string
  name: string
  remark: string
}

interface CustomerDialogProps {
  onSelect: (customer: CustomerItem) => void
}

const CustomerDialog = forwardRef<SelectDialogRef, CustomerDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '中文名称', dataIndex: 'name', width: 140 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<CustomerItem>
      ref={ref}
      title="选择客户"
      apiUrl="/base/api/customer"
      columns={columns}
      placeholder="请输入客户名称或代码"
      onSelect={onSelect}
    />
  )
})

CustomerDialog.displayName = 'CustomerDialog'

export default CustomerDialog
