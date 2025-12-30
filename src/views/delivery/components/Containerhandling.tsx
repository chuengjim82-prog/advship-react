import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ContainerPickupProps, TransportAgent } from '@/models/order.model'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Containerhandling({
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

  // 优先使用 props，其次 location.state，最后默认值
  const containerNo = propContainerNo ?? locationState?.deliveryItem?.containerNo ?? '-'
  const pickupCode = propPickupCode ?? locationState?.deliveryItem?.pickupCode ?? 'CSNU6927227'
  const containerType = propContainerType ?? locationState?.deliveryItem?.containerType ?? '40尺'

  const currentMode = propMode
  const isReadonly = currentMode === 'detail'
  const isEdit = currentMode === 'edit'

  const pageTitle = currentMode === 'create' ? '提柜处理' : currentMode === 'edit' ? '提柜处理' : '提柜处理'

  // 表单状态
  const [formData, setFormData] = useState({
    appointmentTime: null as Date | null,
    deliveryMethod: 'yard' as 'yard' | 'direct',
    remarks: '',
    transPikId: '',
    vehicleNo: '',
    transPikName: '',
    driverPhone: '',
    // 堆场信息
    YardContact: '',
    YardPhone: '',
    YardAddress: '',

    // 提货地信息（直接派送时使用）
    pickupContact: '',
    pickupPhone: '',
    pickupAddress: '',

    // 目的地信息（直接派送时使用）
    destinationContact: '',
    destinationPhone: '',
    destinationAddress: '',

    // 派送公司信息
    deliveryCall: '',
    deliveryPlateNumber: '',
    deliveryContact: '',
    deliveryCompanyId: '',
  })

  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 加载运输公司
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
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  // 初始化表单数据（edit / detail 模式）
  useEffect(() => {
    if (!initialData && !locationState?.deliveryItem) return

    const data: any = initialData || locationState?.deliveryItem

    setFormData((prev) => ({
      ...prev,
      appointmentTime: data.pickUpTimeE ? new Date(data.pickUpTimeE) : null,
      deliveryMethod: data.deliveryMethod || (data.deliveryType === 2 ? 'direct' : 'yard'),
      remarks: data.remark || '',

      transPikId: String(data.transPikId || ''),
      vehicleNo: data.transportationNumber || data.plateNumber || '',
      transPikName: data.shippingContact || data.transPikName || '',
      driverPhone: data.transPikPhone || data.driverPhone || '',

      YardContact: data.YardContact || '',
      YardPhone: data.YardPhone || '',
      YardAddress: data.YardAddress || '',

      pickupContact: data.pickupContact || data.contactName || '',
      pickupPhone: data.pickupPhone || data.contactPhone || '',
      pickupAddress: data.pickupAddress || data.contactAddress || '',

      destinationContact: data.destinationContact || data.yardContact || '',
      destinationPhone: data.destinationPhone || data.yardPhone || '',
      destinationAddress: data.destinationAddress || data.yardAddress || '',
    }))
  }, [initialData, locationState?.deliveryItem])

  const handleChange = (field: keyof typeof formData, value: string | Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validate = () => {
    if (!formData.appointmentTime) return '请选择预约时间'
    if (!formData.transPikId) return '请选择运输公司'
    if (!formData.vehicleNo.trim()) return '请输入车牌号码'
    if (!formData.transPikName.trim()) return '请输入司机姓名'
    if (!formData.driverPhone.trim()) return '请输入联系电话'

    if (formData.deliveryMethod === 'direct') {
      if (!formData.destinationContact.trim()) return '请输入收货联系人'
      if (!formData.destinationPhone.trim()) return '请输入收货联系电话'
      if (!formData.destinationAddress.trim()) return '请输入收货详细地址'
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
      const containerId = locationState?.deliveryItem?.id || (initialData as any)?.containerId || 0
      const orderId = locationState?.deliveryItem?.orderId || initialData?.orderId || 0

      const payload = {
        id: isEdit ? initialData?.id || 0 : 0,
        containerId,
        orderId,
        deliveryType: formData.deliveryMethod === 'direct' ? 2 : 1,
        Statusi: 2,
        newStatusi: formData.deliveryMethod === 'direct' ? 5 : 3,
        orderContainer: {
          containerId,
          plateNumber: formData.vehicleNo,
          transPikName: formData.transPikName,
          driverPhone: formData.driverPhone,
          appointmentTime: formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm:ss") : '',
          remark: formData.remarks,
          YardContact: formData.YardContact,
          YardPhone: formData.YardPhone,
          YardAddress: formData.YardAddress,
          contactName: formData.pickupContact,
          contactPhone: formData.pickupPhone,
          contactAddress: formData.pickupAddress,

          yardContact: formData.deliveryMethod === 'yard' ? formData.destinationContact : '',
          yardPhone: formData.deliveryMethod === 'yard' ? formData.destinationPhone : '',
          yardAddress: formData.deliveryMethod === 'yard' ? formData.destinationAddress : '',
        },
      }

      const method = isEdit ? 'put' : 'post'
      const endpoint = formData.deliveryMethod === 'direct' ? '/bzss/api/ContainerDetails/create' : '/bzss/api/ContainerDetails/OrderDelivery'

      await request[method](endpoint, payload)

      toast.success(isEdit ? '修改成功' : '预约提柜成功')
      onSubmit?.({ ...formData, transPikId: parseInt(formData.transPikId || '0', 10) })
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

      {/* 表单 */}
      <div className="px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                提柜时间<span className="text-red-600">*</span>
              </Label>
              <DateTimePicker
                value={formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(str) => {
                  handleChange('appointmentTime', str ? new Date(str) : null)
                }}
                placeholder="请选择提柜时间"
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

        {/* 提柜公司信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">提柜公司信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                运输公司<span className="text-red-600">*</span>
              </Label>
              <Select value={formData.transPikId} onValueChange={(v) => handleChange('transPikId', v)} disabled={loading || isReadonly}>
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
                value={formData.driverPhone}
                onChange={(e) => handleChange('driverPhone', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="text-base font-semibold">派送公司信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                派送公司<span className="text-red-600">*</span>
              </Label>
              <Select value={formData.deliveryCompanyId} onValueChange={(v) => handleChange('deliveryCompanyId', v)} disabled={loading || isReadonly}>
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
                派送号码<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.vehicleNo}
                onChange={(e) => handleChange('deliveryPlateNumber', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                派送司机<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.transPikName}
                onChange={(e) => handleChange('deliveryContact', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                联系电话<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.driverPhone}
                onChange={(e) => handleChange('deliveryCall', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </div>
        </section>
        {/* 堆场信息（放置堆场时显示） */}
        {formData.deliveryMethod === 'yard' && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">堆场信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium">堆场联系人</Label>
                <Input
                  value={formData.YardContact}
                  onChange={(e) => handleChange('YardContact', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium">堆场联系电话</Label>
                <Input
                  value={formData.YardPhone}
                  onChange={(e) => handleChange('YardPhone', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium">堆场详细地址</Label>
              <Input
                value={formData.YardAddress}
                onChange={(e) => handleChange('YardAddress', e.target.value)}
                className="h-9 flex-1"
                disabled={isReadonly}
              />
            </div>
          </section>
        )}

        {/* 直接派送时：提货地 + 目的地 */}
        {formData.deliveryMethod === 'direct' && (
          <>
            <section className="space-y-4">
              <h3 className="text-base font-semibold">提货地信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium">提货联系人</Label>
                  <Input
                    value={formData.pickupContact}
                    onChange={(e) => handleChange('pickupContact', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium">提货联系电话</Label>
                  <Input
                    value={formData.pickupPhone}
                    onChange={(e) => handleChange('pickupPhone', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium">提货详细地址</Label>
                <Input
                  value={formData.pickupAddress}
                  onChange={(e) => handleChange('pickupAddress', e.target.value)}
                  className="h-9 flex-1"
                  disabled={isReadonly}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-base font-semibold">目的地信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">
                    收货联系人<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.destinationContact}
                    onChange={(e) => handleChange('destinationContact', e.target.value)}
                    className="h-9 flex-1"
                    disabled={isReadonly}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-28 text-right font-medium whitespace-nowrap">
                    收货联系电话<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.destinationPhone}
                    onChange={(e) => handleChange('destinationPhone', e.target.value)}
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
                  value={formData.destinationAddress}
                  onChange={(e) => handleChange('destinationAddress', e.target.value)}
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
