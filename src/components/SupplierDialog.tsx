import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'

export interface SupplierItem {
  id: number
  code: string
  sName: string
  fName: string
  remark: string
}

interface SupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (supplier: SupplierItem) => void
}

const supplierColumns: ColumnDef<SupplierItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'code', header: '编码', size: 140 },
  { accessorKey: 'sName', header: '简称', size: 140 },
  { accessorKey: 'fName', header: '全称', size: 120 },
  { accessorKey: 'remark', header: '备注' }
]

export default function SupplierDialog({ open, onOpenChange, onSelect }: SupplierDialogProps) {
  return (
    <SelectDialogV2<SupplierItem>
      title="选择供应商"
      apiUrl="/base/api/SupplierItem"
      columns={supplierColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入供应商名称或代码"
    />
  )
}
