import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface TransportAgent {
  value: number
  text: string
}

interface ContainerPickupProps {
  onClose?: () => void
  onSubmit?: (data: any) => void
}

export default function ContainerPickup({ onClose, onSubmit }: ContainerPickupProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const deliveryItem = location.state?.deliveryItem as any

  const [loading, setLoading] = useState(false)
  const [agentsLoading, setAgentsLoading] = useState(false)
  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])

  const [formData, setFormData] = useState({
    appointmentTime: null as Date | null,
    deliveryMethod: 'direct' as 'direct' | 'yard',
    remarks: '',
    transDlvId: '',
    transDlvPlateNumber: '',
    transDlvName: '',
    transDlvPhone: '',
    // 目的地信息（直派必填）
    destinationContact: '',
    destinationPhone: '',
    destinationAddress: '',
    // 堆场信息（暂未启用）
    YardContact: '',
    YardPhone: '',
    YardAddress: '',
  })

  // 加载运输公司列表
  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true)
      try {
        const res = await request.get('/base/api/TransAgent/GetTransAgentSelect')
        const agents = res?.data || []
        setTransportAgents(Array.isArray(agents) ? agents : [])
      } catch (err) {
        toast.error('获取运输公司列表失败')
        console.error(err)
      } finally {
        setAgentsLoading(false)
      }
    }
    fetchAgents()
  }, [])

  // 编辑模式：加载已有派送信息
  useEffect(() => {
    // if (!deliveryItem || deliveryItem.statusi !== 2) return // 假设 statusi === 2 表示已提柜待派送

    const fetchExistingDelivery = async () => {
      try {
        const res = await request.get(`/bzss/api/ContainerDetails/${deliveryItem.id}GetByContainerId`)
        const item = res?.data
        if (!item) return

        let appointmentDate: Date | null = null
        if (item.deliveryDateE || item.pickUpTimeE) {
          const dateStr = item.deliveryDateE || item.pickUpTimeE
          const date = new Date(dateStr)
          if (!isNaN(date.getTime())) {
            appointmentDate = date
          }
        }

        setFormData((prev) => ({
          ...prev,
          appointmentTime: appointmentDate,
          remarks: item.remark || '',
          transDlvId: item.deliveryCompanyId?.toString() || '',
          transDlvName: item.deliveryContact || item.deliveryContact || '',
          transDlvPlateNumber: item.deliveryPlateNumber || item.deliveryPlateNumber || '',
          transDlvPhone: item.deliveryCall || item.deliveryCall || '',
          destinationContact: item.recipientContact || item.recipientContact || '',
          destinationPhone: item.recipientContact || item.recipientContact || '',
          destinationAddress: item.shippingAddress || item.shippingAddress || '',
          //   deliveryMethod: item.deliveryType === 1 ? 'yard' : 'direct',
        }))
      } catch (err) {
        console.error('加载派送信息失败:', err)
        toast.error('加载派送信息失败')
      }
    }

    fetchExistingDelivery()
  }, [deliveryItem])

  const handleChange = (field: keyof typeof formData, value: string | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.appointmentTime) return '请选择预约派送时间'
    if (!formData.transDlvId) return '请选择运输公司'
    if (!formData.transDlvPlateNumber.trim()) return '请输入车牌号码'
    if (!formData.transDlvName.trim()) return '请输入司机姓名'
    if (!formData.transDlvPhone.trim()) return '请输入司机联系电话'

    if (formData.deliveryMethod === 'direct') {
      if (!formData.destinationContact.trim()) return '请输入收货联系人'
      if (!formData.destinationPhone.trim()) return '请输入收货联系电话'
      if (!formData.destinationAddress.trim()) return '请输入收货详细地址'
    }

    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    if (onSubmit) {
      onSubmit(formData)
      return
    }

    setLoading(true)
    try {
      const payload = {
        orderId: deliveryItem?.orderId || 0,
        containerId: deliveryItem?.id || 0,
        deliveryType: formData.deliveryMethod === 'direct' ? 2 : 1,
        newStatusi: 4,
        statusi: deliveryItem?.statusi || 2,
        transDlvId: Number(formData.transDlvId),
        transDlvName: formData.transDlvName,
        transDlvPlateNumber: formData.transDlvPlateNumber,
        transDlvPhone: formData.transDlvPhone,
        operationTime: format(formData.appointmentTime!, "yyyy-MM-dd'T'HH:mm:ss"),
        remark: formData.remarks,
        orderContainer: {
          recipientContact: formData.destinationContact,
          recipientPhone: formData.destinationPhone,
          shippingAddress: formData.destinationAddress,
        },
      }

      await request.post('/bzss/api/ContainerDetails/OrderDelivery', payload)

      toast.success('派送预约成功')
      navigate(-1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || '派送预约失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose ? onClose() : navigate(-1)
  }

  const isDirect = formData.deliveryMethod === 'direct'

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">派送预约</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            关闭
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">提单号</span>
            <span className="font-semibold text-blue-800">{deliveryItem?.orderNo || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">柜号</span>
            <span className="font-semibold text-blue-800">{deliveryItem?.number || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">柜型</span>
            <span className="font-semibold text-blue-800">{deliveryItem?.sizeType || '-'}</span>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                预约派送时间<span className="text-red-600">*</span>
              </Label>
              <DateTimePicker
                value={formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(str) => {
                  handleChange('appointmentTime', str ? new Date(str) : null)
                }}
                placeholder="请选择时间"
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium">派送方式</Label>
              <Select value={formData.deliveryMethod} onValueChange={(v) => handleChange('deliveryMethod', v as any)}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">直接派送</SelectItem>
                  {/* 如需支持堆场派送，取消注释 */}
                  {/* <SelectItem value="yard">堆场派送</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-32 text-right font-medium">备注信息</Label>
            <Input value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} placeholder="选填" className="h-9 flex-1" />
          </div>
        </section>

        {/* 仅直接派送时显示目的地信息 */}
        {isDirect && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">目的地信息（收货人）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="w-32 text-right font-medium whitespace-nowrap">
                  收货联系人<span className="text-red-600">*</span>
                </Label>
                <Input
                  value={formData.destinationContact}
                  onChange={(e) => handleChange('destinationContact', e.target.value)}
                  className="h-9 flex-1"
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32 text-right font-medium whitespace-nowrap">
                  收货联系电话<span className="text-red-600">*</span>
                </Label>
                <Input value={formData.destinationPhone} onChange={(e) => handleChange('destinationPhone', e.target.value)} className="h-9 flex-1" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                收货详细地址<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.destinationAddress}
                onChange={(e) => handleChange('destinationAddress', e.target.value)}
                className="h-9 flex-1"
              />
            </div>
          </section>
        )}

        {/* 派送信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">派送信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                运输公司<span className="text-red-600">*</span>
              </Label>
              <Select value={formData.transDlvId} onValueChange={(v) => handleChange('transDlvId', v)} disabled={agentsLoading}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder={agentsLoading ? '加载中...' : '请选择运输公司'} />
                </SelectTrigger>
                <SelectContent>
                  {transportAgents.map((agent) => (
                    <SelectItem key={agent.value} value={String(agent.value)}>
                      {agent.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                车牌号码<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.transDlvPlateNumber}
                onChange={(e) => handleChange('transDlvPlateNumber', e.target.value)}
                className="h-9 flex-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                司机<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.transDlvName} onChange={(e) => handleChange('transDlvName', e.target.value)} className="h-9 flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-32 text-right font-medium whitespace-nowrap">
                联系电话<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.transDlvPhone} onChange={(e) => handleChange('transDlvPhone', e.target.value)} className="h-9 flex-1" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
