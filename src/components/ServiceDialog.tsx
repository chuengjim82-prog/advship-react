import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Badge } from '@/components/ui/badge'

export interface ServiceItem {
  id: number
  code: string
  name: string
  isSale: boolean
  isBuy: boolean
  remark: string
}

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (service: ServiceItem) => void
}

const serviceColumns: ColumnDef<ServiceItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'code', header: '编码', size: 120 },
  { accessorKey: 'name', header: '名称', size: 180 },
  {
    accessorKey: 'isSale',
    header: '销售',
    size: 100,
    cell: ({ getValue }) => (
      getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
    )
  },
  {
    accessorKey: 'isBuy',
    header: '采购',
    size: 80,
    cell: ({ getValue }) => (
      getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
    )
  },
  { accessorKey: 'remark', header: '备注' }
]

export default function ServiceDialog({ open, onOpenChange, onSelect }: ServiceDialogProps) {
  return (
    <SelectDialogV2<ServiceItem>
      title="选择产品服务"
      apiUrl="/base/api/Service"
      columns={serviceColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入产品服务名称或代码"
    />
  )
}
