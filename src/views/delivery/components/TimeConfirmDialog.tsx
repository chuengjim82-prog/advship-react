import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import request from '@/utils/request'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeliveryItem {
  id: number
  number: string
  sizeType: string
  orderNo: string
  transPikName: string
  goodsInfo?: string
  orderId: number
  deliveryType: number
}

interface TimeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  timeLabel: string
  selectedItem: DeliveryItem | null
  timeValue: string
  onTimeChange: (value: string) => void
  currentStatus: number // 当前状态码
  nextStatus: number // 目标状态码
  onSuccess?: () => void // 成功回调
}

export default function TimeConfirmDialog({
  open,
  onOpenChange,
  title,
  timeLabel,
  selectedItem,
  timeValue,
  onTimeChange,
  currentStatus,
  nextStatus,
  onSuccess,
}: TimeConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!selectedItem) return

    if (!timeValue) {
      toast.error(`请选择${timeLabel}`)
      return
    }

    setLoading(true)
    try {
      const response = await request.put('/bzss/api/ContainerDetails/Update', {
        id: selectedItem.id,
        orderId: selectedItem.orderId,
        containerId: selectedItem.id,
        statusi: currentStatus,
        newStatusi: nextStatus,
        operationTime: timeValue,
        deliveryType: selectedItem.deliveryType,
      })

      console.log('API响应:', response)
      toast.success(`${title}成功`)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error(`${title}失败:`, error)
      const errorMessage = error?.response?.data?.message || error?.message || `${title}失败`
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-5">
          {/* 货柜信息展示 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-center">
                <Label className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">柜号</Label>
                <div className="text-base font-semibold text-gray-900 ml-2">{selectedItem?.number || '-'}</div>
              </div>
              <div className="flex items-center">
                <Label className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">柜型号</Label>
                <div className="text-base font-semibold text-gray-900 ml-2">{selectedItem?.sizeType || '-'}</div>
              </div>
              <div className="flex items-center">
                <Label className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">订单号</Label>
                <div className="text-base font-semibold text-blue-600 ml-2 hover:underline cursor-pointer">{selectedItem?.orderNo || '-'}</div>
              </div>
              <div className="flex items-center">
                <Label className="text-sm font-medium text-gray-600 w-20 flex-shrink-0">运输公司</Label>
                <div className="text-base font-semibold text-gray-900 ml-2">{selectedItem?.transPikName || '-'}</div>
              </div>
            </div>
          </div>

          {/* 时间选择 */}
          <div className="space-y-3">
            <Label htmlFor="timeInput" className="text-base font-semibold text-gray-700 flex items-center">
              {timeLabel}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <DateTimePicker value={timeValue} onChange={onTimeChange} placeholder={`请选择${timeLabel}`} className="w-full" />
          </div>

          {/* 货物信息 */}
          {selectedItem?.goodsInfo && (
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">货物信息</Label>
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-200">{selectedItem.goodsInfo}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8 h-10 text-base font-medium" disabled={loading}>
            关闭
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white px-10 h-10 text-base font-medium shadow-sm"
            disabled={loading}
          >
            {loading ? '提交中...' : '确认'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
