// import { Button } from '@/components/ui/button'
// import { DateTimePicker } from '@/components/ui/date-time-picker'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import type { ContainerPickupProps, TransportAgent } from '@/models/order.model'
// import request from '@/utils/request'
// import { format } from 'date-fns'
// import { ArrowLeft } from 'lucide-react'
// import { useEffect, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { toast } from 'sonner'

// export default function ContainerPickup({
//   containerNo: propContainerNo,
//   pickupCode: propPickupCode = 'CSNU6927227',
//   containerType: propContainerType = '40尺',
//   mode: propMode = 'create',
//   initialData,
//   onClose,
//   onSubmit,
// }: ContainerPickupProps) {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const locationState = location.state as { deliveryItem?: any } | null
//   const deliveryItem = location.state?.deliveryItem
//   // 显示信息优先级：props > location.state > 默认值
//   const containerNo = propContainerNo ?? locationState?.deliveryItem?.containerNo ?? '-'
//   const pickupCode = propPickupCode ?? locationState?.deliveryItem?.number ?? 'CSNU6927227'
//   const containerType = propContainerType ?? locationState?.deliveryItem?.sizeType ?? '40尺'

//   const currentMode = propMode
//   const isReadonly = currentMode === 'detail'
//   const isEdit = currentMode === 'edit'
//   const pageTitle = currentMode === 'create' ? '预约提柜' : currentMode === 'edit' ? '编辑预约' : '预约详情'

//   // 表单状态（与后端字段一一对应）
//   const [formData, setFormData] = useState({
//     appointmentTime: null as Date | null,
//     deliveryMethod: 'yard' as 'yard' | 'direct',
//     remarks: '',
//     transPikId: '',
//     vehicleNo: '',
//     transPikName: '', // 司机姓名
//     transPikPhone: '', // 司机电话（同时用于提货电话）

//     recipientContact: '',
//     recipientPhone: '',
//     shippingAddress: '',

//     // 堆场信息
//     yardContact: '',
//     yardPhone: '',
//     yardAddress: '',

//     // // 目的地信息（直接派送时必填）
//     // recipientContact: '',
//     // recipientPhone: '',
//     // shippingAddress: '',
//   })

//   const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])
//   const [loading, setLoading] = useState(false)
//   const [submitting, setSubmitting] = useState(false)

//   // 加载运输公司列表
//   useEffect(() => {
//     const fetchAgents = async () => {
//       setLoading(true)
//       try {
//         const res = await request.get('/base/api/TransAgent/GetTransAgentSelect')
//         const agents = res?.data || []
//         if (Array.isArray(agents)) {
//           setTransportAgents(agents)
//         }
//       } catch (err) {
//         toast.error('获取运输公司失败')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchAgents()
//   }, [])

//   // 初始化表单数据（edit / detail / create with item）
//   useEffect(() => {
//     const data = initialData || locationState?.deliveryItem
//     if (!data) return

//     setFormData({
//       appointmentTime: data.pickUpTimeE ? new Date(data.pickUpTimeE) : null,
//       deliveryMethod: data.deliveryType === 2 ? 'direct' : 'yard',
//       remarks: data.remark || '',

//       transPikId: String(data.transPikId || ''),
//       vehicleNo: data.transportationNumber || '',
//       transPikName: data.transPikName || '',
//       transPikPhone: data.transPikPhone || '',

//       yardContact: data.yardContact || '',
//       yardPhone: data.yardPhone || '',
//       yardAddress: data.yardAddress || '',

//       recipientContact: data.recipientContact || '',
//       recipientPhone: data.recipientPhone || '',
//       shippingAddress: data.shippingAddress || '',
//     })
//   }, [initialData, locationState?.deliveryItem])

//   // 额外：如果是从列表进入 create 模式，尝试加载详情初始化
//   useEffect(() => {
//     // if (currentMode !== 'create' || !locationState?.deliveryItem?.containerId) return

//     const fetchDetails = async () => {
//       try {
//         console.log('加载详情，containerId=', locationState?.deliveryItem)
//         const res = await request.get(`/bzss/api/ContainerDetails/${deliveryItem.id}GetByContainerId`, {
//           params: { containerId: deliveryItem.id },
//         })
//         // const data = res?.data || {}
//         const data = res.data || {}
//         setFormData((prev) => ({
//           ...prev,
//           appointmentTime: data.deliveryDateE ? new Date(data.deliveryDateE) : null,
//           deliveryMethod: (data.deliveryType === 2 ? 'direct' : 'yard') as 'yard' | 'direct',
//           remarks: data.remark || '',
//           transPikId: String(data.transPikId || ''),
//           vehicleNo: data.transportationNumber || '',
//           transPikName: data.transPikName || '',
//           transPikPhone: data.transPikPhone || '',
//           yardContact: data.yardContact || '',
//           yardPhone: data.yardPhone || '',
//           yardAddress: data.yardAddress || '',
//           recipientContact: data.recipientContact || '',
//           recipientPhone: data.recipientPhone || '',
//           shippingAddress: data.shippingAddress || '',
//         }))
//       } catch (err) {
//         console.error('加载详情失败', err)
//       }
//     }

//     fetchDetails()
//   }, [currentMode, locationState?.deliveryItem?.containerId])

//   const handleChange = (field: keyof typeof formData, value: string | Date | null) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const validate = () => {
//     if (!formData.appointmentTime) return '请选择预约时间'
//     if (!formData.transPikId) return '请选择运输公司'
//     if (!formData.vehicleNo.trim()) return '请输入车牌号码'
//     if (!formData.transPikName.trim()) return '请输入司机姓名'
//     if (!formData.transPikPhone.trim()) return '请输入联系电话'

//     if (formData.deliveryMethod === 'direct') {
//       if (!formData.recipientContact.trim()) return '请输入收货联系人'
//       if (!formData.recipientPhone.trim()) return '请输入收货联系电话'
//       if (!formData.shippingAddress.trim()) return '请输入收货详细地址'
//     }

//     return null
//   }

//   const handleSubmit = async () => {
//     if (isReadonly) return

//     const error = validate()
//     if (error) {
//       toast.error(error)
//       return
//     }

//     setSubmitting(true)
//     try {
//       const containerId = locationState?.deliveryItem?.containerId || initialData?.containerId || 0
//       const orderId = locationState?.deliveryItem?.orderId || initialData?.orderId || 0

//       const payload = {
//         id: isEdit ? initialData?.Id || 0 : 0,
//         orderId,
//         containerId: deliveryItem.id,
//         deliveryType: formData.deliveryMethod === 'direct' ? 2 : 1,
//         statusi: 2,
//         newStatusi: 2,
//         operationTime: formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm:ss") : new Date().toISOString(),

//         orderContainer: {
//           remark: formData.remarks,
//           transAgentId: parseInt(formData.transPikId || '0'),

//           // 运输信息
//           transPikName: formData.transPikName,
//           transPikPhone: formData.transPikPhone,
//           transportationNumber: formData.vehicleNo,

//           // 堆场信息（仅放置堆场时有效）
//           yardContact: formData.yardContact != '' ? formData.yardContact : '',
//           yardPhone: formData.deliveryMethod === 'yard' ? formData.yardPhone : '',
//           yardAddress: formData.deliveryMethod === 'yard' ? formData.yardAddress : '',

//           // 目的地信息（仅直接派送时有效）
//           recipientContact: formData.recipientContact != '' ? formData.recipientContact : '',
//           recipientPhone: formData.recipientPhone != '' ? formData.recipientPhone : '',
//           shippingAddress: formData.shippingAddress != '' ? formData.shippingAddress : '',

//           // 其他兼容字段（可根据实际接口调整）
//           deliveryContact: formData.transPikName,
//           deliveryPlateNumber: formData.vehicleNo,
//           deliveryCall: formData.transPikPhone,
//         },
//       }

//       const method = isEdit ? 'put' : 'post'
//       const endpoint = isEdit ? '/bzss/api/ContainerDetails/update' : '/bzss/api/ContainerDetails/create'

//       await request[method](endpoint, payload)

//       toast.success(isEdit ? '修改成功' : '预约提柜成功')
//       onSubmit?.(formData)
//       if (!onSubmit) navigate(-1)
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || '操作失败')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleClose = () => {
//     onClose?.() || navigate(-1)
//   }

//   return (
//     <div className="bg-white min-h-screen">
//       {/* 顶部栏 */}
//       <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={handleClose}>
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <h1 className="text-lg font-semibold">{pageTitle}</h1>
//         </div>
//         <div className="flex items-center gap-4">
//           {!isReadonly && (
//             <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={submitting}>
//               {submitting ? '提交中...' : '确认'}
//             </Button>
//           )}
//           <Button variant="outline" size="sm" onClick={handleClose} disabled={submitting}>
//             关闭
//           </Button>
//         </div>
//       </div>

//       {/* 基本信息 */}
//       <div className="flex items-center gap-8 px-6 py-4 bg-blue-50 border-b border-blue-200">
//         <div className="flex items-center gap-2">
//           <span className="font-medium text-gray-700">提单号</span>
//           <span className="font-semibold text-blue-800">{containerNo}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="font-medium text-gray-700">柜号</span>
//           <span className="font-semibold text-blue-800">{pickupCode}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="font-medium text-gray-700">柜子型号</span>
//           <span className="font-semibold text-blue-800">{containerType}</span>
//         </div>
//       </div>

//       {/* 表单内容 */}
//       <div className="px-6 py-6 space-y-8">
//         {/* 预约信息 */}
//         <section className="space-y-4">
//           <h3 className="text-base font-semibold">预约信息</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 预约时间<span className="text-red-600">*</span>
//               </Label>
//               <DateTimePicker
//                 value={formData.appointmentTime ? format(formData.appointmentTime, "yyyy-MM-dd'T'HH:mm") : ''}
//                 onChange={(str) => handleChange('appointmentTime', str ? new Date(str) : null)}
//                 placeholder="请选择预约时间"
//                 className="flex-1"
//                 disabled={isReadonly}
//               />
//             </div>

//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">派送方式</Label>
//               <Select
//                 value={formData.deliveryMethod}
//                 onValueChange={(v) => handleChange('deliveryMethod', v as 'yard' | 'direct')}
//                 disabled={isReadonly}
//               >
//                 <SelectTrigger className="h-9 flex-1">
//                   <SelectValue placeholder="请选择" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="yard">放置堆场</SelectItem>
//                   <SelectItem value="direct">直接派送</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <Label className="w-28 text-right font-medium">备注信息</Label>
//             <Input
//               value={formData.remarks}
//               onChange={(e) => handleChange('remarks', e.target.value)}
//               placeholder="选填"
//               className="h-9 flex-1"
//               disabled={isReadonly}
//             />
//           </div>
//         </section>

//         {/* 运输公司信息 */}
//         <section className="space-y-4">
//           <h3 className="text-base font-semibold">运输公司信息</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 运输公司<span className="text-red-600">*</span>
//               </Label>
//               <Select value={formData.transPikId} onValueChange={(v) => handleChange('transPikId', v)} disabled={loading || isReadonly}>
//                 <SelectTrigger className="h-9 flex-1">
//                   <SelectValue placeholder="请选择运输公司" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {transportAgents.map((agent) => (
//                     <SelectItem key={agent.value} value={String(agent.value)}>
//                       {agent.text}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 车牌号码<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.vehicleNo}
//                 onChange={(e) => handleChange('vehicleNo', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 司机<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.transPikName}
//                 onChange={(e) => handleChange('transPikName', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 联系电话<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.transPikPhone}
//                 onChange={(e) => handleChange('transPikPhone', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//           </div>
//         </section>

//         {/* 堆场信息 */}
//         {formData.deliveryMethod === 'yard' && (
//           <section className="space-y-4">
//             <h3 className="text-base font-semibold">堆场信息</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex items-center gap-4">
//                 <Label className="w-28 text-right font-medium">堆场联系人</Label>
//                 <Input
//                   value={formData.yardContact}
//                   onChange={(e) => handleChange('yardContact', e.target.value)}
//                   className="h-9 flex-1"
//                   disabled={isReadonly}
//                 />
//               </div>
//               <div className="flex items-center gap-4">
//                 <Label className="w-28 text-right font-medium">堆场联系电话</Label>
//                 <Input
//                   value={formData.yardPhone}
//                   onChange={(e) => handleChange('yardPhone', e.target.value)}
//                   className="h-9 flex-1"
//                   disabled={isReadonly}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium">堆场详细地址</Label>
//               <Input
//                 value={formData.yardAddress}
//                 onChange={(e) => handleChange('yardAddress', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//           </section>
//         )}
//         <section className="space-y-4">
//           <h3 className="text-base font-semibold">目的地信息</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 收货联系人<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.recipientContact}
//                 onChange={(e) => handleChange('recipientContact', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 收货联系电话<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.recipientPhone}
//                 onChange={(e) => handleChange('recipientPhone', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <Label className="w-28 text-right font-medium whitespace-nowrap">
//               收货详细地址<span className="text-red-600">*</span>
//             </Label>
//             <Input
//               value={formData.shippingAddress}
//               onChange={(e) => handleChange('shippingAddress', e.target.value)}
//               className="h-9 flex-1"
//               disabled={isReadonly}
//             />
//           </div>
//         </section>
//         {/* 直接派送：目的地信息 */}
//         {formData.deliveryMethod === 'direct' && (
//           <section className="space-y-4">
//             <h3 className="text-base font-semibold">目的地信息</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex items-center gap-4">
//                 <Label className="w-28 text-right font-medium whitespace-nowrap">
//                   收货联系人<span className="text-red-600">*</span>
//                 </Label>
//                 <Input
//                   value={formData.recipientContact}
//                   onChange={(e) => handleChange('recipientContact', e.target.value)}
//                   className="h-9 flex-1"
//                   disabled={isReadonly}
//                 />
//               </div>
//               <div className="flex items-center gap-4">
//                 <Label className="w-28 text-right font-medium whitespace-nowrap">
//                   收货联系电话<span className="text-red-600">*</span>
//                 </Label>
//                 <Input
//                   value={formData.recipientPhone}
//                   onChange={(e) => handleChange('recipientPhone', e.target.value)}
//                   className="h-9 flex-1"
//                   disabled={isReadonly}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <Label className="w-28 text-right font-medium whitespace-nowrap">
//                 收货详细地址<span className="text-red-600">*</span>
//               </Label>
//               <Input
//                 value={formData.shippingAddress}
//                 onChange={(e) => handleChange('shippingAddress', e.target.value)}
//                 className="h-9 flex-1"
//                 disabled={isReadonly}
//               />
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//   )
// }
// src/components/ContainerDeliveryConfirm.tsx

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
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
  confirmType?: 'pickup' | 'yard' | 'delivery' | 'return'
  confirmTitle?: string
  confirmButtonText?: string
  confirmTimeField?: string
  initialData?: any
}

export default function ContainerDeliveryConfirm({
  onClose,
  onSubmit,
  mode = 'edit',
  confirmType,
  confirmTitle = '确认操作',
  confirmButtonText = '确认',
  confirmTimeField = 'deliveryDateA',
  initialData: propInitialData,
}: ContainerDeliveryConfirmProps) {
  const isConfirmMode = mode === 'confirm'
  const deliveryItem = propInitialData

  const [loading, setLoading] = useState(false)
  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])

  const [formData, setFormData] = useState({
    appointmentTime: null as Date | null,
    remarks: '',
    transDlvId: '',
    transDlvPlateNumber: '',
    transDlvName: '',
    transDlvPhone: '',
    yardContact: '',
    yardPhone: '',
    yardAddress: '',
    destinationContact: '',
    destinationPhone: '',
    destinationAddress: '',
  })

  // 加载运输公司（仅编辑模式需要）
  useEffect(() => {
    if (isConfirmMode) return
    const fetchAgents = async () => {
      try {
        const res = await request.get('/base/api/TransAgent/GetTransAgentSelect')
        const agents = res?.data || []
        setTransportAgents(Array.isArray(agents) ? agents : [])
      } catch {}
    }
    fetchAgents()
  }, [isConfirmMode])

  // 数据初始化
  useEffect(() => {
    // if (!deliveryItem) return
    const initData = async () => {
      try {
        debugger
        const res = await request.get(`/bzss/api/ContainerDetails/${deliveryItem.id}GetByContainerId`)
        const item = res?.data?.items?.[0] || deliveryItem

        let appointmentTime: Date | null = null
        if (item.pickUpTimeE || item.deliveryDateE) {
          const date = new Date(item.deliveryDateE || item.pickUpTimeE)
          if (!isNaN(date.getTime())) appointmentTime = date
        }
        console.log('初始化详情数据', item)
        setFormData({
          appointmentTime,
          remarks: item.remark || '',
          transDlvId: String(item.transDlvId || item.transPikId || ''),
          transDlvPlateNumber: item.transDlvPlateNumber || item.deliveryPlateNumber || item.transportationNumber || '',
          transDlvName: item.transDlvName || item.deliveryContact || item.transPikName || '',
          transDlvPhone: item.transDlvPhone || item.deliveryCall || item.transPikPhone || '',
          yardContact: item.yardContact || '',
          yardPhone: item.yardPhone || '',
          yardAddress: item.yardAddress || '',
          destinationContact: item.recipientContact || '',
          destinationPhone: item.recipientPhone || '',
          destinationAddress: item.shippingAddress || '',
        })
      } catch (err) {
        console.error('加载详情失败，使用传入数据', err)
        setFormData((prev) => ({
          ...prev,
          remarks: deliveryItem.remark || '',
          transDlvPlateNumber: deliveryItem.transportationNumber || '',
          transDlvName: deliveryItem.transPikName || '',
          transDlvPhone: deliveryItem.transPikPhone || '',
        }))
      }
    }

    initData()
  }, [deliveryItem])

  // confirm 提交
  const handleConfirm = async () => {
    setLoading(true)
    try {
      const payload = {
        id: deliveryItem?.Id || deliveryItem?.id || 0,
        orderId: deliveryItem?.orderId || 0,
        containerId: deliveryItem?.containerId || deliveryItem?.id || 0,
        statusi: getNewStatus(),
        newStatusi: getNewStatus(),
        [confirmTimeField]: new Date().toISOString(),
      }
      await request.put('/bzss/api/ContainerDetails/update', payload)
      toast.success('确认成功')
      onSubmit?.(payload)
      onClose?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || '确认失败')
    } finally {
      setLoading(false)
    }
  }

  const getNewStatus = () => {
    switch (confirmType) {
      case 'pickup':
        return 3
      case 'yard':
        return 4
      case 'delivery':
        return 5
      case 'return':
        return 6
      default:
        return 5
    }
  }

  const handleClose = () => onClose?.()

  // 辅助渲染：有值才显示
  const renderField = (label: string, value?: string | null) => {
    if (!value?.trim()) return null
    return (
      <div className="flex items-center gap-4">
        <Label className="w-32 text-right font-medium text-gray-700 shrink-0">{label}</Label>
        <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900">{value}</div>
      </div>
    )
  }

  const renderDate = (label: string, date: Date | null) => {
    if (!date) return null
    return (
      <div className="flex items-center gap-4">
        <Label className="w-32 text-right font-medium text-gray-700 shrink-0">{label}</Label>
        <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-900">{format(date, 'yyyy-MM-dd HH:mm')}</div>
      </div>
    )
  }

  const hasYardInfo = formData.yardContact || formData.yardPhone || formData.yardAddress
  const hasDestinationInfo = formData.destinationContact || formData.destinationPhone || formData.destinationAddress

  return (
    <div className="bg-white">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isConfirmMode ? confirmTitle : '派送预约'}</h1>
        </div>
        <div className="flex items-center gap-4">
          {isConfirmMode && (
            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleConfirm} disabled={loading}>
              {loading ? '提交中...' : confirmButtonText}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            关闭
          </Button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="font-medium text-gray-700">提单号</span>{' '}
            <span className="font-semibold text-blue-800">{deliveryItem?.orderNo || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">柜号</span> <span className="font-semibold text-blue-800">{deliveryItem?.number || '-'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">柜型</span>{' '}
            <span className="font-semibold text-blue-800">{deliveryItem?.sizeType || '-'}</span>
          </div>
        </div>
      </div>

      {/* 内容区域 - 有数据才显示 */}
      <div className="px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="space-y-6">
            {renderDate('预约派送时间', formData.appointmentTime)}
            {renderField('备注信息', formData.remarks)}
          </div>
        </section>

        {/* 堆场信息 - 只要有任意一个字段有值就显示整个 section */}
        {hasYardInfo && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">堆场信息</h3>
            <div className="space-y-6">
              {renderField('堆场联系人', formData.yardContact)}
              {renderField('堆场联系电话', formData.yardPhone)}
              {renderField('堆场详细地址', formData.yardAddress)}
            </div>
          </section>
        )}

        {/* 目的地信息 - 只要有任意一个字段有值就显示整个 section */}
        {/* {hasDestinationInfo && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">目的地信息</h3>
            <div className="space-y-6">
              {renderField('收货联系人', formData.destinationContact)}
              {renderField('收货联系电话', formData.destinationPhone)}
              {renderField('收货详细地址', formData.destinationAddress)}
            </div>
          </section>
        )} */}
        {/* 目的地信息：只要有任意一个字段有值就显示 */}
        {(formData.destinationContact || formData.destinationPhone || formData.destinationAddress) && (
          <section className="space-y-4">
            <h3 className="text-base font-semibold">目的地信息</h3>
            <div className="space-y-6">
              {renderField('收货联系人', formData.destinationContact)}
              {renderField('收货联系电话', formData.destinationPhone)}
              {renderField('收货详细地址', formData.destinationAddress)}
            </div>
          </section>
        )}
        {/* 派送信息 */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold">派送信息</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('运输公司', transportAgents.find((a) => String(a.value) === formData.transDlvId)?.text || formData.transDlvName || '-')}
              {renderField('车牌号码', formData.transDlvPlateNumber)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('司机姓名', formData.transDlvName)}
              {renderField('联系电话', formData.transDlvPhone)}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
