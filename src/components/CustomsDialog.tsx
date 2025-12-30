import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface CustomsItem {
  id: number
  code: string
  cnName: string
  enName: string
  countryName: string
  cityName: string
  remark: string
}

interface CustomsDialogProps {
  onSelect: (customs: CustomsItem) => void
}

const CustomsDialog = forwardRef<SelectDialogRef, CustomsDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '中文名称', dataIndex: 'cnName', width: 140 },
    { title: '英文名称', dataIndex: 'enName', width: 140 },
    { title: '国家', dataIndex: 'countryName', width: 100 },
    { title: '城市', dataIndex: 'cityName', width: 100 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<CustomsItem>
      ref={ref}
      title="选择海关"
      apiUrl="/base/api/Customs"
      columns={columns}
      placeholder="请输入海关名称或代码"
      onSelect={onSelect}
    />
  )
})

CustomsDialog.displayName = 'CustomsDialog'

export default CustomsDialog
