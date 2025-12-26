import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'

export interface CustomerItem {
  id: number
  code: string
  name: string
  remark: string
}

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (customer: CustomerItem) => void
}

const customerColumns: ColumnDef<CustomerItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'code', header: '编码', size: 120 },
  { accessorKey: 'name', header: '中文名称', size: 140 },
  { accessorKey: 'remark', header: '备注' }
]

export default function CustomerDialog({ open, onOpenChange, onSelect }: CustomerDialogProps) {
  return (
    <SelectDialogV2<CustomerItem>
      title="选择客户"
      apiUrl="/base/api/customer"
      columns={customerColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入客户名称或代码"
    />
  )
}
