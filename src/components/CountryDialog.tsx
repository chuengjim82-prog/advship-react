import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

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
  onSelect: (country: CountryItem) => void
}

const CountryDialog = forwardRef<SelectDialogRef, CountryDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '中文名称', dataIndex: 'cnName', width: 140 },
    { title: '英文名称', dataIndex: 'enName', width: 140 },
    { title: '二字码', dataIndex: 'code2', width: 120 },
    { title: '三字码', dataIndex: 'code3', width: 140 },
    { title: '时区', dataIndex: 'timeZone', width: 100 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<CountryItem>
      ref={ref}
      title="选择国家"
      apiUrl="/base/api/Country"
      columns={columns}
      placeholder="请输入国家名称或代码"
      onSelect={onSelect}
    />
  )
})

CountryDialog.displayName = 'CountryDialog'

export default CountryDialog
