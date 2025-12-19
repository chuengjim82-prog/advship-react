import { forwardRef } from 'react'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface FeeTypeItem {
  id: number
  cnName: string
  enName: string
  remark: string
}

interface FeeTypeDialogProps {
  onSelect: (feeType: FeeTypeItem) => void
}

const FeeTypeDialog = forwardRef<SelectDialogRef, FeeTypeDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '中文名称', dataIndex: 'cnName', width: 140 },
    { title: '英文名称', dataIndex: 'enName', width: 300 },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<FeeTypeItem>
      ref={ref}
      title="选择费用类别"
      apiUrl="/base/api/FeeType"
      columns={columns}
      placeholder="请输入费用类别"
      onSelect={onSelect}
    />
  )
})

FeeTypeDialog.displayName = 'FeeTypeDialog'

export default FeeTypeDialog
