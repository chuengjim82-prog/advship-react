import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'

// 增加运输方式字段
interface ContainerPickupInfo {
  id: number // 柜ID
  remark: string // 提柜备注说明
  number: string // 柜号
  transportationNumber: string // 车牌号
  transPikName: string // 司机姓名
  waybillNo?: string // 提单号
  customerName?: string // 客户名称
  status?: string // 运输状态

  pickUpTimeE: string | null // 预约提柜时间
  transPikId: number
  transPikPhone?: string // 添加缺失的属性
  deliveryType: number
}

interface TransportAgent {
  value: number
  text: string
}
interface PickupDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pickupLoading: boolean
  pickupData: ContainerPickupInfo[]
  transportAgents: TransportAgent[]
  selectedRow: { waybillNo?: string; customerName?: string; status?: string } | null
  handleUpdatePickupInfo: (
    index: number,
    field:
      | 'pickUpTimeE'
      | 'remark'
      | 'transPikId'
      | 'transportationNumber'
      | 'transPikPhone'
      | 'transPikName'
      | 'deliveryType',
    value: string | number | Date
  ) => void
  handleConfirmPickup: () => void
}

const PickupDrawer: React.FC<PickupDrawerProps> = ({
  open,
  onOpenChange,
  pickupLoading,
  pickupData,
  transportAgents,
  selectedRow,
  handleUpdatePickupInfo,
  handleConfirmPickup,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} position="right" className="w-[80%] max-h-screen overflow-y-auto bg-gray-50">
      <DrawerContent className="p-6">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-xl font-bold text-gray-800">预约提柜</DrawerTitle>
        </DrawerHeader>
        {pickupLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        ) : pickupData && pickupData.length > 0 ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4 bg-blue-100 rounded-lg border border-blue-200 p-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">提单号</label>
                <div className="font-semibold text-blue-900 text-base">{selectedRow?.waybillNo}</div>
              </div>
              {/* <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">客户名称</label>
                <div className="font-semibold text-gray-800 text-base">{selectedRow?.customerName || '未知客户'}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">运输状态</label>
                <div className="font-semibold text-gray-800 text-base">{selectedRow?.status || '未定义'}</div>
              </div> */}
            </div>
            <div className="border rounded-lg overflow-x-auto bg-white">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-100 z-10">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">柜号</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[240px]">
                      预约提柜时间<span className="text-red-500 ml-1">*</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      运输公司<span className="text-red-500 ml-1">*</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[240px]">司机</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[240px]">车牌号</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[240px]">手机号码</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">派送方式</TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[300px]">
                      提柜备注说明<span className="text-red-500 ml-1">*</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickupData.map((container, index) => (
                    <TableRow key={container.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{container.number}</TableCell>
                      <TableCell>
                        <DateTimePicker
                          value={container.pickUpTimeE || ''}
                          onChange={(val) => handleUpdatePickupInfo(index, 'pickUpTimeE', val)}
                          className="w-full border border-gray-300 rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={container.transPikId ? container.transPikId.toString() : ''}
                          onValueChange={(value) => handleUpdatePickupInfo(index, 'transPikId', parseInt(value))}
                        >
                          <SelectTrigger className="w-[120px] h-9 border border-gray-300 rounded-md">
                            <SelectValue placeholder="选择运输公司" />
                          </SelectTrigger>
                          <SelectContent>
                            {transportAgents.map((agent) => (
                              <SelectItem key={agent.value} value={agent.value.toString()}>
                                {agent.text}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={container.transPikName || ''}
                          onChange={(e) => handleUpdatePickupInfo(index, 'transPikName', e.target.value)}
                          placeholder="司机姓名"
                          className="w-full h-9 border border-gray-300 rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={container.transportationNumber || ''}
                          onChange={(e) => handleUpdatePickupInfo(index, 'transportationNumber', e.target.value)}
                          placeholder="车牌号"
                          className="w-full h-9 border border-gray-300 rounded-md"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={container.transPikPhone || ''}
                          onChange={(e) => handleUpdatePickupInfo(index, 'transPikPhone', e.target.value)}
                          placeholder="手机号码"
                          className="w-full h-9 border border-gray-300 rounded-md"
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          value={container.deliveryType ? container.deliveryType.toString() : ''}
                          onValueChange={(value) => handleUpdatePickupInfo(index, 'deliveryType', parseInt(value))}
                        >
                          <SelectTrigger className="w-[100px] h-9 border border-gray-300 rounded-md">
                            <SelectValue placeholder="选择派送方式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">放置堆场</SelectItem>
                            <SelectItem value="2">直接派送</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      {/* <TableCell>{container.deliveryType === 1 ? '放置堆场' : container.deliveryType === 2 ? '直接派送' : '未知'}</TableCell> */}
                      <TableCell>
                        <Input
                          value={container.remark}
                          onChange={(e) => handleUpdatePickupInfo(index, 'remark', e.target.value)}
                          placeholder="备注"
                          className="w-[300px] h-9 border border-gray-300 rounded-md"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <Alert variant="warning" className="py-12 text-center text-gray-500">
            暂无数据，请检查提柜信息。
          </Alert>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleConfirmPickup}
            disabled={pickupLoading || pickupData.length === 0}
            className="px-10 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            提交
          </Button>
          <Button
            variant="outline"
            className="px-10 h-9 border border-gray-300 rounded-md"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            关闭
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default PickupDrawer
