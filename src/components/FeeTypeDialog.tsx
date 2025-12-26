import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'

export interface FeeTypeItem {
  id: number
  cnName: string
  enName: string
  remark: string
}

interface FeeTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (feeType: FeeTypeItem) => void
}

const feeTypeColumns: ColumnDef<FeeTypeItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'cnName', header: '中文名称', size: 140 },
  { accessorKey: 'enName', header: '英文名称', size: 300 },
  { accessorKey: 'remark', header: '备注' }
]

export default function FeeTypeDialog({ open, onOpenChange, onSelect }: FeeTypeDialogProps) {
  return (
    <SelectDialogV2<FeeTypeItem>
      title="选择费用类别"
      apiUrl="/base/api/FeeType"
      columns={feeTypeColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入费用类别"
    />
  )
}
