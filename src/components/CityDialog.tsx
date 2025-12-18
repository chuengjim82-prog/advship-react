import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface CityItem {
  id: number
  code: string
  cnName: string
  enName: string
  remark: string
}

interface CityDialogProps {
  onSelect: (city: CityItem) => void
}

const CityDialog = forwardRef<SelectDialogRef, CityDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '中文名称', dataIndex: 'cnName', width: 140 },
    { title: '英文名称', dataIndex: 'enName', width: 140 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<CityItem>
      ref={ref}
      title="选择城市"
      apiUrl="/base/api/City"
      columns={columns}
      placeholder="请输入城市名称或代码"
      onSelect={onSelect}
    />
  )
})

CityDialog.displayName = 'CityDialog'

export default CityDialog
