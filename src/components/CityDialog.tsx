import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'

export interface CityItem {
  id: number
  code: string
  cnName: string
  enName: string
  remark: string
}

interface CityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (city: CityItem) => void
}

const cityColumns: ColumnDef<CityItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'code', header: '编码', size: 120 },
  { accessorKey: 'cnName', header: '中文名称', size: 140 },
  { accessorKey: 'enName', header: '英文名称', size: 140 },
  { accessorKey: 'remark', header: '备注' }
]

export default function CityDialog({ open, onOpenChange, onSelect }: CityDialogProps) {
  return (
    <SelectDialogV2<CityItem>
      title="选择城市"
      apiUrl="/base/api/City"
      columns={cityColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入城市名称或代码"
    />
  )
}
