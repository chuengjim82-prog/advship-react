import { forwardRef } from 'react'
import { Badge } from '@/components/ui/badge'
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
    { title: '主键', dataIndex: 'id' as const, width: 80 },
    { title: '编码', dataIndex: 'code' as const, width: 120 },
    { title: '名称', dataIndex: 'name' as const, width: 180 },
    {
      title: '销售',
      dataIndex: 'isSale' as const,
      width: 100,
      render: (isSale: unknown) => (isSale ? <Badge variant="default">是</Badge> : <Badge variant="secondary">否</Badge>)
    },
    {
      title: '采购',
      dataIndex: 'isBuy' as const,
      width: 80,
      render: (isBuy: unknown) => (isBuy ? <Badge variant="default">是</Badge> : <Badge variant="secondary">否</Badge>)
    },
    { title: '备注', dataIndex: 'remark' as const }
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
