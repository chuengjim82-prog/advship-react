import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ContainerPickupProps, DeliveryItem, TransportAgent } from '@/models/order.model'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function ContainerPickup({
  containerNo: propContainerNo,
  pickupCode: propPickupCode = 'CSNU6927227',
  containerType: propContainerType = '40尺',
  mode: propMode = 'create',
  initialData,
  onClose,
  onSubmit,
}: ContainerPickupProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { deliveryItem?: any } | null
  const deliveryItem = location.state?.deliveryItem

  console.log('ContainerPickup location.state:', locationState)
  // 显示信息优先级：props > location.state > 默认值
  const containerNo = locationState?.deliveryItem?.number ?? '-'
  const pickupCode = locationState?.deliveryItem?.number ?? '-'
  const containerType = locationState?.deliveryItem?.sizeType ?? '-'

  const currentMode = propMode
  const isReadonly = currentMode === 'detail'
  const isEdit = currentMode === 'edit'
  const pageTitle = currentMode === 'create' ? '预约提柜' : currentMode === 'edit' ? '编辑预约' : '预约详情'

  // 表单状态（与后端字段一一对应）
  const [formData, setFormData] = useState({
    pickUpTimeA: null as Date | null,
    deliveryMethod: 'yard' as 'yard' | 'direct',
    remarks: '',
    transPikId: '0',
    vehicleNo: '',
    transPikName: '', // 司机姓名
    transPikPhone: '', // 司机电话（同时用于提货电话）

    // 堆场信息
    yardContact: '',
    yardPhone: '',
    yardAddress: '',

    // 目的地信息（直接派送时必填）
    recipientContact: '',
    recipientPhone: '',
    shippingAddress: '',
  })

  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 加载运输公司列表
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true)
      try {
        const res = await request.get('/base/api/TransAgent/GetTransAgentSelect')
        const agents = res?.data || []
        if (Array.isArray(agents)) {
          setTransportAgents(agents)
        }
      } catch (err) {
        toast.error('获取运输公司失败')
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  // 初始化表单数据（edit / detail / create with item）
  useEffect(() => {
    const data: Partial<DeliveryItem> = initialData || {} // 确保类型安全
    if (!data) return
    setFormData({
      appointmentTime: data.pickUpTimeE,
      deliveryMethod: data.deliveryType === 2 ? 'direct' : 'yard',
      remarks: data.remark || '',

      transPikId: Number(data.transPikId) || 0, // 修复类型为 number
      vehicleNo: data.transportationNumber || '',
      transPikName: data.transPikName || '',
      transPikPhone: data.transPikPhone || '',

      yardContact: data.yardContact || '',
      yardPhone: data.yardPhone || '',
      yardAddress: data.yardAddress || '',

      recipientContact: data.recipientContact || '',
      recipientPhone: data.recipientPhone || '',
      shippingAddress: data.shippingAddress || '',
    })
  }, [initialData, locationState?.deliveryItem])

  // 额外：如果是从列表进入 create 模式，尝试加载详情初始化
  useEffect(() => {
    // if (currentMode !== 'create' || !locationState?.deliveryItem?.containerId) return

    const fetchDetails = async () => {
      try {
        console.log('加载详情，containerId=', locationState?.deliveryItem)
        const res = await request.get(`/bzss/api/ContainerDetails/${deliveryItem.id}GetByContainerId`, {
          params: { containerId: deliveryItem.id },
        })
        // const data = res?.data || {}
        const data = res.data || {}
        setFormData((prev) => ({
          ...prev,
          appointmentTime: data.pickUpTimeE ? new Date(data.pickUpTimeE) : null,
          deliveryMethod: (data.deliveryType === 2 ? 'direct' : 'yard') as 'yard' | 'direct',
          remarks: data.remark || '',
          transPikId: Number(data.transPikId) || 0, // 修复类型为 number
          vehicleNo: data.transportationNumber || '',
          transPikName: data.transPikName || '',
          transPikPhone: data.transPikPhone || '',
          yardContact: data.yardContact || '',
          yardPhone: data.yardPhone || '',
          yardAddress: data.yardAddress || '',
          recipientContact: data.recipientContact || '',
          recipientPhone: data.recipientPhone || '',
          shippingAddress: data.shippingAddress || '',
        }))
      } catch (err) {
        console.error('加载详情失败', err)
      }
    }

    fetchDetails()
  }, [currentMode, locationState?.deliveryItem?.containerId])

  // 确保 transPikId 的值为字符串类型
  const handleChange = (field: keyof typeof formData, value: string | Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'transPikId' ? String(value) : value,
    }))
  }

  // 添加调试日志，确保数据正确
  console.log('transPikId (after conversion):', formData.transPikId)
  console.log('transportAgents:', transportAgents)

  const validate = () => {
    if (!formData.appointmentTime) return '请选择预约时间'
    if (!formData.transPikId) return '请选择运输公司'
    if (!formData.vehicleNo.trim()) return '请输入车牌号码'
    if (!formData.transPikName.trim()) return '请输入司机姓名'
    if (!formData.transPikPhone.trim()) return '请输入联系电话'

    if (formData.deliveryMethod === 'direct') {
      if (!formData.recipientContact.trim()) return '请输入收货联系人'
      if (!formData.recipientPhone.trim()) return '请输入收货联系电话'
      if (!formData.shippingAddress.trim()) return '请输入收货详细地址'
    }

    return null
  }

  const handleSubmit = async () => {
    if (isReadonly) return

    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setSubmitting(true)
    try {
      const orderId = locationState?.deliveryItem?.orderId || initialData?.orderId || 0

      const payload = {
        id: isEdit ? initialData?.id || 0 : 0, // 修改 Id 为 id
        orderId,
        containerId: deliveryItem.id,
        deliveryType: formData.deliveryMethod === 'direct' ? 2 : 1,
        statusi: 2,
        newStatusi: 2,
        operationTime: formData.pickUpTimeA ? format(formData.pickUpTimeA, "yyyy-MM-dd'T'HH:mm:ss") : new Date().toISOString(),

        orderContainer: {
          remark: formData.remarks,
          transAgentId: parseInt(formData.transPikId || '0'),
          transPikId: parseInt(formData.transPikId || '0'),
          // 运输信息
          transPikName: formData.transPikName,
          transPikPhone: formData.transPikPhone,
          transportationNumber: formData.vehicleNo,

          // 堆场信息（仅放置堆场时有效）
          yardContact: formData.deliveryMethod === 'yard' ? formData.yardContact : '',
          yardPhone: formData.deliveryMethod === 'yard' ? formData.yardPhone : '',
          yardAddress: formData.deliveryMethod === 'yard' ? formData.yardAddress : '',

          // 目的地信息（仅直接派送时有效）
          recipientContact: formData.deliveryMethod === 'direct' ? formData.recipientContact : '',
          recipientPhone: formData.deliveryMethod === 'direct' ? formData.recipientPhone : '',
          shippingAddress: formData.deliveryMethod === 'direct' ? formData.shippingAddress : '',

          // 其他兼容字段（可根据实际接口调整）
          deliveryContact: formData.transPikName,
          deliveryPlateNumber: formData.vehicleNo,
          deliveryCall: formData.transPikPhone,
        },
      }

      const method = isEdit ? 'put' : 'post'
      const endpoint = isEdit ? '/bzss/api/ContainerDetails/update' : '/bzss/api/ContainerDetails/create'

      await request[method](endpoint, payload)

      toast.success(isEdit ? '修改成功' : '预约提柜成功')
      onSubmit?.(formData)
      if (!onSubmit) navigate(-1)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose?.() || navigate(-1)
  }

  // 添加日志和检查以确保 location.state 的安全性
  console.log('location.state:', location.state)
  if (location.state && typeof location.state !== 'object') {
    console.error('Invalid location.state:', location.state)
    throw new Error('location.state must be an object')
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          {!isReadonly && (
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '提交中...' : '确认'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClose} disabled={submitting}>
            关闭
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="flex items-center gap-8 px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">提单号</span>
          <span className="font-semibold text-blue-800">{containerNo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">柜号</span>
          <span className="font-semibold text-blue-800">{pickupCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">柜子型号</span>
          <span className="font-semibold text-blue-800">{containerType}</span>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                预约时间<span className="text-red-600">*</span>
              </Label>
              <DateTimePicker
                value={formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(str) => handleChange('appointmentTime', str ? new Date(str) : null)}
                placeholder="请选择预约时间"
                className="flex-1"
                disabled={isReadonly}
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">派送方式</Label>
              <Select
                value={formData.deliveryMethod}
                onValueChange={(v) => handleChange('deliveryMethod', v as 'yard' | 'direct')}
                disabled={isReadonly}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yard">放置堆场</SelectItem>
                  <SelectItem value="direct">直接派送</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="w-28 text-right font-medium">备注信息</Label>
            <Input
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="选填"
              className="h-9 flex-1"
              disabled={isReadonly}
            />
          </div>
        </section>

        {/* 运输公司信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">运输公司信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                运输公司<span className="text-red-600">*</span>
                {formData.transPikId}
              </Label>
              {/* <Select value={formData.transPikId} onValueChange={(v) => handleChange('transPikId', v)} disabled={loading || isReadonly}>
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="请选择运输公司" />
                </SelectTrigger>
                <SelectContent>
                  {transportAgents.map((agent) => (
                    <SelectItem key={agent.value} value={String(agent.value)}>
                      {agent.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              <Select
                value={String(formData.transPikId)} // 强制转字符串
                onValueChange={(v) => handleChange('transPikId', v)}
                disabled={loading || isReadonly}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="请选择运输公司" />
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
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                车牌号码<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.vehicleNo}
                onChange={(e) => handleChange('vehicleNo', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                司机<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.transPikName}
                onChange={(e) => handleChange('transPikName', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                联系电话<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.transPikPhone}
                onChange={(e) => handleChange('transPikPhone', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </div>
        </section>

        {/* 堆场信息 */}
        {formData.deliveryMethod === 'yard' && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">堆场信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium">堆场联系人</Label>
                <Input
                  value={formData.yardContact}
                  onChange={(e) => handleChange('yardContact', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium">堆场联系电话</Label>
                <Input
                  value={formData.yardPhone}
                  onChange={(e) => handleChange('yardPhone', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium">堆场详细地址</Label>
              <Input
                value={formData.yardAddress}
                onChange={(e) => handleChange('yardAddress', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </section>
        )}

        {/* 直接派送：目的地信息 */}
        {formData.deliveryMethod === 'direct' && (
          <>
            {/* <section className="space-y-4">
              <h3 className="text-base font-semibold">还柜信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">还柜联系人</Label>
                  <Input
                    value={formData.recipientContact}
                    onChange={(e) => handleChange('returnContact', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">还柜联系电话</Label>
                  <Input
                    value={formData.recipientPhone}
                    onChange={(e) => handleChange('returnPhone', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium whitespace-nowrap">还柜详细地址</Label>
                <Input
                  value={formData.shippingAddress}
                  onChange={(e) => handleChange('returnAddress', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
            </section> */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold">目的地信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">
                    收货联系人<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.recipientContact}
                    onChange={(e) => handleChange('recipientContact', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">
                    收货联系电话<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.recipientPhone}
                    onChange={(e) => handleChange('recipientPhone', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium whitespace-nowrap">
                  收货详细地址<span className="text-red-600">*</span>
                </Label>
                <Input
                  value={formData.shippingAddress}
                  onChange={(e) => handleChange('shippingAddress', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
