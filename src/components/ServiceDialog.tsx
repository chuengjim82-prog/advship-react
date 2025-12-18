import { forwardRef } from 'react'
import { Tag } from 'antd'
import SelectDialog, { type SelectDialogRef } from '@/components/SelectDialog'

export interface ServiceItem {
  id: number
  code: string
  name: string
  isSale: boolean
  isBuy: boolean
  remark: string
}

interface ServiceDialogProps {
  onSelect: (service: ServiceItem) => void
}

const ServiceDialog = forwardRef<SelectDialogRef, ServiceDialogProps>((props, ref) => {
  const { onSelect } = props

  const columns = [
    { title: '主键', dataIndex: 'id', width: 80 },
    { title: '编码', dataIndex: 'code', width: 120 },
    { title: '名称', dataIndex: 'name', width: 180 },
    {
      title: '销售',
      dataIndex: 'isSale',
      width: 100,
      render: (isSale: boolean) => (isSale ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>)
    },
    {
      title: '采购',
      dataIndex: 'isBuy',
      width: 80,
      render: (isBuy: boolean) => (isBuy ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>)
    },
    { title: '备注', dataIndex: 'remark' }
  ]

  return (
    <SelectDialog<ServiceItem>
      ref={ref}
      title="选择产品服务"
      apiUrl="/base/api/Service"
      columns={columns}
      placeholder="请输入产品服务名称或代码"
      onSelect={onSelect}
    />
  )
})

ServiceDialog.displayName = 'ServiceDialog'

export default ServiceDialog
