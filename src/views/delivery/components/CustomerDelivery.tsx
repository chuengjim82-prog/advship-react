import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface ContainerPickupProps {
  containerNo?: string
  pickupCode?: string
  containerType?: string
  onClose?: () => void
  onSubmit?: (data: any) => void
}

export default function ContainerPickup({
  containerNo = '55-58558',
  pickupCode = 'CSNU6927227',
  containerType = '40尺',
  onClose,
  onSubmit,
}: ContainerPickupProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const deliveryItem = location.state?.deliveryItem

  const [formData, setFormData] = useState({
    appointmentTime: '2025/11/30 11:20',
    deliveryMethod: 'direct',
    remarks: '',
    shippingCompany: '运输公司1',
    vehicleNo: '车牌1',
    driverName: '司机1',
    driverPhone: '123111',
    destinationContact: '联系人2',
    destinationPhone: '123333',
    destinationAddress: '堆场详细地址',
    returnContact: '联系人3',
    returnPhone: '123222',
    returnAddress: '还柜详细地址',
    pickupContact: '联系人1',
    pickupPhone: '123222',
    pickupAddress: '海关详细地址',
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData)
    } else {
      console.log('提交预约数据:', formData)
      navigate(-1)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">客户派送预约</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
            确认
          </Button>
          <Button variant="outline" size="sm" onClick={handleClose}>
            关闭
          </Button>
        </div>
      </div>

      {/* 核心信息行 */}
      <div className="flex items-center gap-8 px-6 py-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">提单号</span>
          <span className="font-semibold text-blue-800">{deliveryItem?.containerNo || containerNo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">柜号</span>
          <span className="font-semibold text-blue-800">{deliveryItem?.pickupCode || pickupCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">柜子型号</span>
          <span className="font-semibold text-blue-800">{deliveryItem?.containerType || containerType}</span>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="px-6 py-6 space-y-8">
        {/* 预约信息 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">预约信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                预约时间<span className="text-red-600">*</span>
              </Label>
              <Input
                type="text"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                className="h-9 flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">派送方式</Label>
              <Select value={formData.deliveryMethod} onValueChange={(value) => handleInputChange('deliveryMethod', value)}>
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
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="选填"
              className="h-9 flex-1"
            />
          </div>
        </div>

        {/* 目的地信息（直接派送时显示） */}
        {formData.deliveryMethod === 'direct' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">目的地信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium whitespace-nowrap">
                  收货联系人<span className="text-red-600">*</span>
                </Label>
                <Input
                  value={formData.destinationContact}
                  onChange={(e) => handleInputChange('destinationContact', e.target.value)}
                  className="h-9 flex-1"
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-28 text-right font-medium whitespace-nowrap">
                  收货联系电话<span className="text-red-600">*</span>
                </Label>
                <Input
                  value={formData.destinationPhone}
                  onChange={(e) => handleInputChange('destinationPhone', e.target.value)}
                  className="h-9 flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                收货详细地址<span className="text-red-600">*</span>
              </Label>
              <Input
                value={formData.destinationAddress}
                onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                className="h-9 flex-1"
              />
            </div>
          </div>
        )}

        {/* 运输公司信息 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">运输公司信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                运输公司<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.shippingCompany} onChange={(e) => handleInputChange('shippingCompany', e.target.value)} className="h-9 flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                车牌号码<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.vehicleNo} onChange={(e) => handleInputChange('vehicleNo', e.target.value)} className="h-9 flex-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                司机<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.driverName} onChange={(e) => handleInputChange('driverName', e.target.value)} className="h-9 flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium whitespace-nowrap">
                联系电话<span className="text-red-600">*</span>
              </Label>
              <Input value={formData.driverPhone} onChange={(e) => handleInputChange('driverPhone', e.target.value)} className="h-9 flex-1" />
            </div>
          </div>
        </div>

        {/* 提货地信息 */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">提货地信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium">提货联系人</Label>
              <Input value={formData.pickupContact} onChange={(e) => handleInputChange('pickupContact', e.target.value)} className="h-9 flex-1" />
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-28 text-right font-medium">提货联系电话</Label>
              <Input value={formData.pickupPhone} onChange={(e) => handleInputChange('pickupPhone', e.target.value)} className="h-9 flex-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="w-28 text-right font-medium">提货详细地址</Label>
            <Input value={formData.pickupAddress} onChange={(e) => handleInputChange('pickupAddress', e.target.value)} className="h-9 flex-1" />
          </div>
        </div>

        {/* 提交按钮 */}
        {/* <div className="flex justify-center gap-6 pt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 px-12 h-10" onClick={handleSubmit}>
            确认
          </Button>
          <Button variant="outline" className="px-12 h-10" onClick={handleClose}>
            关闭
          </Button>
        </div> */}
      </div>
    </div>
  )
}
