import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface TransportAgent {
  value: number
  text: string
}

interface ContainerDeliveryConfirmProps {
  onClose?: () => void
  onSubmit?: (data: any) => void
  mode?: 'edit' | 'confirm'
  confirmType?: 'pickup' | 'yard' | 'delivery' | 'return' | 'returned'
  confirmTitle?: string
  confirmButtonText?: string
  confirmTimeField?: string
  initialData?: any
}

export default function ContainerDeliveryConfirm({
  onClose,
  onSubmit,
  mode = 'edit',
  confirmType = 'pickup',
  confirmTitle = '确认操作',
  confirmButtonText = '确认',
  confirmTimeField = 'giveBackTime',
  initialData: deliveryItem,
}: ContainerDeliveryConfirmProps) {
  const isConfirmMode = mode === 'confirm'
  const isReturnMode = confirmType === 'return'

  const [loading, setLoading] = useState(false)
  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])

  const [formData, setFormData] = useState({
    appointmentTime: null as Date | null,
    deliveryMethod: 'direct' as 'direct' | 'yard',
    remarks: '',
    transDlvId: 1,
    transDlvPlateNumber: '',
    transDlvName: '',
    transDlvPhone: '',
    yardContact: '',
    yardPhone: '',
    yardAddress: '',
    destinationContact: '',
    destinationPhone: '',
    destinationAddress: '',
    returnContact: '',
    returnPhone: '',
    returnAddress: '',
    returnTime: null as Date | null,
  })

  // 只读信息渲染
  const renderInfoField = (label: string, value?: string | null) => {
    if (!value?.trim()) return null
    return (
      <div className="flex items-center gap-4">
        <Label className="w-32 text-right font-medium text-gray-700">{label}</Label>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    )
  }

  const renderInfoDate = (label: string, date: Date | null) => {
    if (!date) return null
    return (
      <div className="flex items-center gap-4">
        <Label className="w-32 text-right font-medium text-gray-700">{label}</Label>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md border border-gray-300 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{format(date, 'yyyy-MM-dd HH:mm')}</span>
        </div>
      </div>
    )
  }

  // 数据加载（保持原有逻辑）
  useEffect(() => {
    const loadData = async () => {
      if (!deliveryItem?.id) return

      try {
        // if (!isConfirmMode) {
        const agentRes = await request.get('/base/api/TransAgent/GetTransAgentSelect')
        setTransportAgents(Array.isArray(agentRes?.data) ? agentRes.data : [])
        // }
        const res = await request.get(`/bzss/api/ContainerDetails/${deliveryItem.id}GetByContainerId`)
        const item = res?.data?.items?.[0] || res?.data || {}
        const hasYardInfo = formData.yardContact || formData.yardPhone || formData.yardAddress
        let appointmentTime: Date | null = null
        const timeStr = item.pickUpTimeE || item.deliveryDateE || item.giveBackTimeE
        if (timeStr) {
          const date = new Date(timeStr)
          if (!isNaN(date.getTime())) appointmentTime = date
        }

        let returnTime: Date | null = null
        if (item.giveBackTime || item.giveBackTimeE) {
          const rt = new Date(item.giveBackTime || item.giveBackTimeE)
          if (!isNaN(rt.getTime())) returnTime = rt
        }

        setFormData({
          appointmentTime,
          deliveryMethod: [1, 4].includes(item.deliveryType) ? 'yard' : 'direct',
          remarks: item.remark || '',
          transDlvId: item.transPikId,
          transDlvPlateNumber: item.transportationNumber || item.deliveryPlateNumber || '',
          transDlvName: item.transPikName || '',
          transDlvPhone: item.transPikPhone || '',
          yardContact: item.yardContact || '',
          yardPhone: item.yardPhone || '',
          yardAddress: item.yardAddress || '',
          destinationContact: item.recipientContact || '',
          destinationPhone: item.recipientPhone || '',
          destinationAddress: item.shippingAddress || '',
          returnContact: item.returnContact || '',
          returnPhone: item.returnPhone || '',
          returnAddress: item.returnAddress || '',
          returnTime: returnTime || new Date(), // 默认当前时间
        })
      } catch (err) {
        console.error('加载数据失败:', err)
        toast.error('加载数据失败')
      }
    }

    loadData()
  }, [deliveryItem, isConfirmMode])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // 归还模式下的前端必填校验
      if (isReturnMode) {
        if (!formData.returnTime) {
          toast.error('请选择还柜时间')
          return
        }
        if (!formData.returnContact.trim()) {
          toast.error('请填写还柜联系人')
          return
        }
        if (!formData.returnPhone.trim()) {
          toast.error('请填写还柜联系电话')
          return
        }
        if (!formData.returnAddress.trim()) {
          toast.error('请填写还柜详细地址')
          return
        }
      }

      // 基础 payload（所有确认类型都需传）
      const basePayload = {
        id: deliveryItem?.id || 0,
        orderId: deliveryItem?.orderId || 0,
        containerId: deliveryItem?.containerId || deliveryItem?.id || 0,
        statusi: deliveryItem.statusi,
        deliveryType: deliveryItem.deliveryType,
        newStatusi: getNewStatus(),
        [confirmTimeField]: formData.returnTime,
      }

      // 归还模式额外参数
      let payload = { ...basePayload }

      if (isReturnMode) {
        payload = {
          ...payload,
          returnContact: formData.returnContact.trim(),
          returnPhone: formData.returnPhone.trim(),
          returnAddress: formData.returnAddress.trim(),
        }
      }

      // 调用统一接口更新
      await request.put('/bzss/api/ContainerDetails/update', payload)

      toast.success(isReturnMode ? '归还确认成功' : '确认成功')
      onSubmit?.(payload)
      onClose?.()
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || '操作失败'
      toast.error(errorMsg)
      console.error('确认操作失败:', err)
    } finally {
      setLoading(false)
    }
  }
  // 状态映射函数（保持不变，清晰易维护）
  const getNewStatus = () => {
    switch (confirmType) {
      case 'pickup':
        return 3
      case 'yard':
        return 4
      case 'delivery':
        return 6
      case 'return':
        return 7
      default:
        return 5 // fallback，防止意外
    }
  }
  const hasReturnInfo = formData.returnContact || formData.returnPhone || formData.returnAddress
  const hasYardInfo = formData.yardContact || formData.yardPhone || formData.yardAddress
  const hasDestinationInfo = formData.destinationContact || formData.destinationPhone || formData.destinationAddress

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {confirmType != 'returned' && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <h1 className="text-lg font-semibold">{isConfirmMode ? confirmTitle : '派送预约'}</h1>
        </div>
        <div className="flex gap-3">
          {isConfirmMode && confirmType != 'returned' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirm} disabled={loading}>
              {loading ? '提交中...' : confirmButtonText}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={loading}>
            关闭
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {renderInfoField('提单号', deliveryItem?.orderNo)}
          {renderInfoField('柜号', deliveryItem?.number)}
          {renderInfoField('柜型', deliveryItem?.sizeType)}
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <section className="space-y-6">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="max-w-3xl space-y-5">
            {renderInfoDate(isReturnMode ? '预约归还时间' : '预约派送时间', formData.appointmentTime)}
            {renderInfoField('备注信息', formData.remarks || '无')}
          </div>
        </section>
        {/* 还柜信息（仅归还模式） */}
        {isReturnMode && (
          <>
            <section className="space-y-6">
              <h3 className="text-base font-semibold text-orange-700 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                还柜信息
              </h3>

              <div className="max-w-5xl space-y-6">
                {/* 第一排：还柜时间 + 还柜联系人 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 还柜时间（可选择，白色背景） */}
                  <div className="flex items-center gap-4">
                    <Label className="w-32 text-right font-medium text-gray-700">
                      还柜时间 <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative flex-1">
                      <Input
                        type="datetime-local"
                        value={formData.returnTime ? format(formData.returnTime, "yyyy-MM-dd'T'HH:mm") : ''}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val) {
                            const newDate = new Date(val)
                            if (!isNaN(newDate.getTime())) {
                              setFormData((p) => ({ ...p, returnTime: newDate }))
                            }
                          } else {
                            setFormData((p) => ({ ...p, returnTime: null }))
                          }
                        }}
                        className="h-10 pl-10 bg-white"
                      />
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* 还柜联系人 */}
                  <div className="flex items-center gap-4">
                    <Label className="w-32 text-right font-medium text-gray-700">
                      还柜联系人 <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      value={formData.returnContact}
                      onChange={(e) => setFormData((p) => ({ ...p, returnContact: e.target.value }))}
                      placeholder="请输入还柜联系人"
                      className="h-10 bg-white flex-1"
                    />
                  </div>
                </div>

                {/* 第二排：还柜联系电话 + 还柜详细地址 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 还柜联系电话 */}
                  <div className="flex items-center gap-4">
                    <Label className="w-32 text-right font-medium text-gray-700">
                      还柜联系电话 <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      value={formData.returnPhone}
                      onChange={(e) => setFormData((p) => ({ ...p, returnPhone: e.target.value }))}
                      placeholder="请输入还柜联系电话"
                      className="h-10 bg-white flex-1"
                    />
                  </div>

                  {/* 还柜详细地址 */}
                  <div className="flex items-center gap-4">
                    <Label className="w-32 text-right font-medium text-gray-700">
                      还柜详细地址 <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      value={formData.returnAddress}
                      onChange={(e) => setFormData((p) => ({ ...p, returnAddress: e.target.value }))}
                      placeholder="请输入还柜详细地址"
                      className="h-10 bg-white flex-1"
                    />
                  </div>
                </div>

                {/* （可选）已有还柜信息只读展示 */}
              </div>
            </section>
          </>
        )}
        {/* 堆场信息 - 有数据才显示整个块 */}
        {confirmType != 'return' && !hasYardInfo && formData.yardContact != '' && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">堆场信息</h3>
            <div className="space-y-6">
              {renderInfoField('堆场联系人', formData.yardContact)}
              {renderInfoField('堆场联系电话', formData.yardPhone)}
              {renderInfoField('堆场详细地址', formData.yardAddress)}
            </div>
          </section>
        )}{' '}
        {confirmType != 'return' && formData.returnContact != '' && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">还柜信息</h3>
            <div className="space-y-6">
              {renderInfoField('还柜联系人', formData.returnContact || '-')}
              {renderInfoField('还柜联系电话', formData.returnPhone || '-')}
              {renderInfoField('还柜详细地址', formData.returnAddress || '-')}
            </div>
          </section>
        )}
        {formData.destinationContact != '' && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">目的地信息</h3>
            <div className="space-y-6">
              {renderInfoField('收货联系人', formData.destinationContact)}
              {renderInfoField('收货联系电话', formData.destinationPhone)}
              {renderInfoField('收货详细地址', formData.destinationAddress)}
            </div>
          </section>
        )}
        {/* 派送信息 */}
        {/* <section className="space-y-4">
          <h3 className="text-base font-semibold">派送信息</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInfoField('运输公司', transportAgents.find((a) => String(a.value) === formData.transDlvId)?.text)}
              {renderInfoField('车牌号码', formData.transDlvPlateNumber)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInfoField('司机姓名', formData.transDlvName)}
              {renderInfoField('联系电话', formData.transDlvPhone)}
            </div>
          </div>
        </section> */}
        {/* 派送信息（非归还时显示） */}
        {/* {!isReturnMode && ( */}
        <section className="space-y-6">
          <h3 className="text-base font-semibold">派送信息</h3>
          <div className="max-w-3xl space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInfoField('运输公司', transportAgents.find((a) => String(a.value) === formData.transDlvId)?.text || '')}
              {renderInfoField('车牌号码', formData.transDlvPlateNumber)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInfoField('司机姓名', formData.transDlvName)}
              {renderInfoField('联系电话', formData.transDlvPhone)}
            </div>
          </div>
        </section>
        {/* )} */}
      </div>
    </div>
  )
}
