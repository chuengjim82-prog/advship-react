import type { ColumnDef } from '@tanstack/react-table'
import SelectDialogV2 from '@/components/select-dialog-v2'

export interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
  timeZone: number
  remark: string
}

interface CountryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (country: CountryItem) => void
}

const countryColumns: ColumnDef<CountryItem>[] = [
  { accessorKey: 'id', header: '主键', size: 80 },
  { accessorKey: 'cnName', header: '中文名称', size: 140 },
  { accessorKey: 'enName', header: '英文名称', size: 140 },
  { accessorKey: 'code2', header: '二字码', size: 120 },
  { accessorKey: 'code3', header: '三字码', size: 140 },
  { accessorKey: 'timeZone', header: '时区', size: 100 },
  { accessorKey: 'remark', header: '备注' }
]

export default function CountryDialog({ open, onOpenChange, onSelect }: CountryDialogProps) {
  return (
    <SelectDialogV2<CountryItem>
      title="选择国家"
      apiUrl="/base/api/Country"
      columns={countryColumns}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      searchPlaceholder="请输入国家名称或代码"
    />
  )
}
