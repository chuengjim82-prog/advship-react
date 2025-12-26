import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { ApiResponse, ColumnConfig, DeliveryItem } from '@/models/order.model'
import request from '@/utils/request'
import { ArrowUpDown, GripVertical, Settings2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContainerDeliveryConfirm from './components/ContainerDeliveryConfirm'
import TimeConfirmDialog from './components/TimeConfirmDialog'

// Tab 配置
const TABS = [
  { key: 'all', label: 'ALL' },
  { key: 'waiting', label: '待预约提柜' },
  { key: 'appointed', label: '已预约提柜' },
  { key: 'pickedUp', label: '已提柜' },
  { key: 'yardPlacement', label: '放置堆场' },
  { key: 'loading', label: '出派中' },
  { key: 'signed', label: '已签收' },
  { key: 'returned', label: '已还柜' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function DeliveryList() {
  const navigate = useNavigate()
  const prevTabRef = useRef<TabKey>('all')

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [isSearchExpanded, setIsSearchExpanded] = useState(true)
  const [showColumnDialog, setShowColumnDialog] = useState(false)

  // 确认弹窗相关状态
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmItem, setConfirmItem] = useState<DeliveryItem | null>(null)
  const [confirmType, setConfirmType] = useState<'pickup' | 'yard' | 'delivery' | 'return' | 'returned' | null>(null)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof DeliveryItem | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  })

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DeliveryItem[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)

  const [searchForm, setSearchForm] = useState({
    containerNo: '',
    billNo: '',
    shippingCompany: '',
    customsName: '',
    vehicleNo: '',
    customsPort: '',
    driverName: '',
  })

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'number' as keyof DeliveryItem, label: '柜号', visible: true, sortable: true },
    { key: 'orderNo' as keyof DeliveryItem, label: '订单号', visible: true, sortable: true },
    { key: 'actions' as 'actions', label: '操作', visible: true, sortable: false },
    { key: 'sizeType' as keyof DeliveryItem, label: '货柜型号', visible: true, sortable: true },
    { key: 'statuss' as keyof DeliveryItem, label: '状态', visible: true, sortable: true },
    { key: 'deliveryType' as keyof DeliveryItem, label: '派送方式', visible: true, sortable: true },
    { key: 'goodsInfo' as keyof DeliveryItem, label: '货物信息', visible: true, sortable: false },
    { key: 'quantity' as keyof DeliveryItem, label: '数量', visible: true, sortable: true },
    { key: 'weight' as keyof DeliveryItem, label: '重量(kg)', visible: true, sortable: true },
    { key: 'transPikName' as keyof DeliveryItem, label: '运输公司', visible: true, sortable: true },
    { key: 'pickUpTimeE' as keyof DeliveryItem, label: '预约提柜时间', visible: true, sortable: true },
  ])

  // 获取列表数据
  const fetchContainerList = async (forcePage1 = false) => {
    if (loading) return
    const targetPage = forcePage1 ? 1 : pageIndex
    setLoading(true)
    try {
      let statusFilter = ''
      if (activeTab === 'waiting') statusFilter = '待预约提柜'
      else if (activeTab === 'appointed') statusFilter = '已预约提柜'
      else if (activeTab === 'pickedUp') statusFilter = '已提柜'
      else if (activeTab === 'yardPlacement') statusFilter = '放置堆场'
      else if (activeTab === 'loading') statusFilter = '出派中'
      else if (activeTab === 'signed') statusFilter = '已签收'
      else if (activeTab === 'returned') statusFilter = '已还柜'

      const response = await request.get<ApiResponse>('/bzss/api/Containers/GetContainerList', {
        params: {
          pageIndex: targetPage,
          pageSize,
          statuss: statusFilter || undefined,
        },
      })

      setData(response.data?.items || [])
      setTotal(response.data?.total || 0)
      if (forcePage1) setPageIndex(1)
    } catch (error) {
      console.error('获取货柜列表失败:', error)
      toast.error('获取货柜列表失败')
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const forceFirstPage = activeTab !== prevTabRef.current
    fetchContainerList(forceFirstPage)
    prevTabRef.current = activeTab
  }, [activeTab, pageIndex])

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }))
  }

  // 预约操作
  const handleAppointment = (item: DeliveryItem) => {
    navigate('/delivery/ContainerPickup', { state: { mode: 'edit', deliveryItem: item } })
  }

  const handleAppointment1 = (item: DeliveryItem) => {
    navigate('/delivery/CustomerDelivery', { state: { mode: 'edit', deliveryItem: item } })
  }

  // 打开确认弹窗
  const openConfirmDialog = (item: DeliveryItem, type: 'pickup' | 'yard' | 'delivery' | 'return' | 'returned') => {
    setConfirmItem(item)
    setConfirmType(type)
    setConfirmOpen(true)
  }

  // 确认成功回调
  const handleConfirmSuccess = () => {
    toast.success('确认成功')
    setConfirmOpen(false)
    setConfirmItem(null)
    setConfirmType(null)
    fetchContainerList()
  }

  // 关闭弹窗
  const handleConfirmClose = () => {
    setConfirmOpen(false)
    setConfirmItem(null)
    setConfirmType(null)
  }

  const handleSort = (key: keyof DeliveryItem) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue == null) return 1
    if (bValue == null) return -1
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSearch = () => {
    setPageIndex(1)
    fetchContainerList(true)
  }

  const handleReset = () => {
    setSearchForm({
      containerNo: '',
      billNo: '',
      shippingCompany: '',
      customsName: '',
      vehicleNo: '',
      customsPort: '',
      driverName: '',
    })
    setPageIndex(1)
    fetchContainerList(true)
  }

  const toggleColumn = (key: keyof DeliveryItem | 'actions') => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)))
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragEnd = () => setDraggedIndex(null)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const newColumns = [...columns]
    const dragged = newColumns[draggedIndex]
    newColumns.splice(draggedIndex, 1)
    newColumns.splice(index, 0, dragged)
    setColumns(newColumns)
    setDraggedIndex(index)
  }

  // 添加缺失的状态和方法
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogTimeLabel, setDialogTimeLabel] = useState('')
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null)
  const [confirmPickupTime, setConfirmPickupTime] = useState('')
  const [deliveryAppointmentTime, setDeliveryAppointmentTime] = useState('')
  const [deliveryAcceptTime, setDeliveryAcceptTime] = useState('')
  const [returnContainerTime, setReturnContainerTime] = useState('')

  const handleSuccess = () => {
    console.log('操作成功')
  }

  // 添加缺失的状态变量
  const [showDeliveryAppointmentDialog, setShowDeliveryAppointmentDialog] = useState(false)
  const [showDeliveryAcceptDialog, setShowDeliveryAcceptDialog] = useState(false)
  const [showReturnContainerDialog, setShowReturnContainerDialog] = useState(false)

  return (
    <div className="p-3 space-y-3 bg-white">
      {/* Tab 栏 */}
      <div className="flex items-center gap-2 pb-3 border-b overflow-x-auto scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => activeTab !== tab.key && setActiveTab(tab.key)}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-fit',
              'hover:bg-blue-50 hover:text-blue-600',
              activeTab === tab.key ? 'bg-blue-100 text-blue-700 shadow-sm ring-2 ring-blue-200' : 'text-gray-600'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 搜索表单 */}
      <div className="border rounded-lg bg-white">
        <div
          className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          <span className="text-sm text-gray-600">{isSearchExpanded ? '收起' : '展开'}搜索</span>
        </div>
        {isSearchExpanded && (
          <div className="p-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="柜号"
                value={searchForm.containerNo}
                onChange={(e) => handleInputChange('containerNo', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="提单号"
                value={searchForm.billNo}
                onChange={(e) => handleInputChange('billNo', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="派送公司"
                value={searchForm.shippingCompany}
                onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="海关名称"
                value={searchForm.customsName}
                onChange={(e) => handleInputChange('customsName', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="车辆号码"
                value={searchForm.vehicleNo}
                onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="清关口岸"
                value={searchForm.customsPort}
                onChange={(e) => handleInputChange('customsPort', e.target.value)}
                className="h-9 w-40"
              />
              <Input
                placeholder="司机姓名"
                value={searchForm.driverName}
                onChange={(e) => handleInputChange('driverName', e.target.value)}
                className="h-9 w-40"
              />
              <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 h-9">
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-9">
                重置
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 工具栏 */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowColumnDialog(true)}>
          <Settings2 className="w-4 h-4 mr-2" />
          自定义列
        </Button>
      </div>

      {/* 表格 */}
      <div className="relative border rounded-lg">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((col) => {
                if (!col.visible) return null
                return (
                  <TableHead key={col.key}>
                    {col.sortable ? (
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                        onClick={() => handleSort(col.key as keyof DeliveryItem)}
                      >
                        {col.label}
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.filter((c) => c.visible).length} className="h-32 text-center text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    if (!col.visible) return null

                    if (col.key === 'number') {
                      return (
                        <TableCell key={col.key}>
                          <span
                            className="text-blue-600 cursor-pointer hover:underline"
                            // onClick={() => navigate('/delivery/ContainerPickupReadonly', { state: { deliveryItem: item, mode: 'detail' } })}
                            onClick={() => openConfirmDialog(item, 'returned')}
                          >
                            {item.number}
                          </span>
                        </TableCell>
                      )
                    }
                    if (col.key === 'orderNo') return <TableCell key={col.key}>{item.orderNo || '-'}</TableCell>
                    if (col.key === 'statuss') {
                      return (
                        <TableCell key={col.key}>
                          <Badge className={item.statuss === '待预约提柜' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {item.statuss}
                          </Badge>
                        </TableCell>
                      )
                    }
                    if (col.key === 'deliveryType') {
                      return (
                        <TableCell key={col.key}>{item.deliveryType === 1 ? '放置堆场' : item.deliveryType === 2 ? '直接派送' : '未知'}</TableCell>
                      )
                    }
                    if (col.key === 'pickUpTimeE') {
                      return <TableCell key={col.key}>{item.pickUpTimeE ? new Date(item.pickUpTimeE).toLocaleString('zh-CN') : '-'}</TableCell>
                    }
                    if (col.key === 'goodsInfo') {
                      return (
                        <TableCell key={col.key} className="max-w-xs truncate" title={item.goodsInfo}>
                          {item.goodsInfo || '-'}
                        </TableCell>
                      )
                    }

                    // 操作列
                    if (col.key === 'actions') {
                      return (
                        <TableCell key={col.key} className="space-x-2">
                          {item.statuss === '待预约提柜' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAppointment(item)}
                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full"
                              >
                                预约提柜
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAppointment1(item)}
                                className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full"
                              >
                                派送预约
                              </Button>
                            </>
                          )}

                          {item.statuss === '已预约提柜' && (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(item, 'pickup')}
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full"
                            >
                              确认提柜
                            </Button>
                          )}

                          {item.statuss === '放置堆场' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAppointment1(item)}
                                className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full"
                              >
                                派送预约
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openConfirmDialog(item, 'yard')}
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full"
                              >
                                派送应约
                              </Button>
                            </>
                          )}
                          {item.statuss === '已提柜' && (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(item, 'return')}
                              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full"
                            >
                              放置堆场
                            </Button>
                          )}

                          {item.statuss === '出派中' && (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(item, 'delivery')}
                              className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full"
                            >
                              确认交货
                            </Button>
                          )}

                          {item.statuss === '已签收' && (
                            <Button
                              size="sm"
                              onClick={() => openConfirmDialog(item, 'return')}
                              className="bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-full"
                            >
                              归还货柜
                            </Button>
                          )}
                        </TableCell>
                      )
                    }

                    return <TableCell key={col.key}>{(item as any)[col.key] || '-'}</TableCell>
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-gray-600">
            共 {total} 条，第 {pageIndex} / {Math.ceil(total / pageSize)} 页
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPageIndex(Math.max(1, pageIndex - 1))} disabled={pageIndex === 1}>
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(Math.min(Math.ceil(total / pageSize), pageIndex + 1))}
              disabled={pageIndex >= Math.ceil(total / pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 列配置对话框 */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>自定义列显示和排序</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-500 mb-2">拖拽调整顺序</div>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {columns.map((col, index) => (
              <div
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded border bg-white cursor-move hover:bg-gray-50',
                  draggedIndex === index && 'opacity-50 border-blue-500'
                )}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <Checkbox id={col.key} checked={col.visible} onCheckedChange={() => toggleColumn(col.key)} />
                <label htmlFor={col.key} className="flex-1 text-sm cursor-pointer">
                  {col.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 确认操作弹窗 */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {confirmItem && confirmType && (
            <ContainerDeliveryConfirm
              mode="confirm"
              initialData={confirmItem}
              onClose={handleConfirmClose}
              onSubmit={handleConfirmSuccess}
              confirmType={confirmType}
              confirmTitle={
                confirmType === 'pickup'
                  ? '确认提柜时间'
                  : confirmType === 'yard'
                  ? confirmItem.deliveryType === 2
                    ? '确认直接派送'
                    : '确认放置堆场'
                  : confirmType === 'delivery'
                  ? '确认交货时间'
                  : confirmType === 'return'
                  ? '确认已还柜'
                  : '详情'
              }
              confirmButtonText={
                confirmType === 'pickup'
                  ? '确认已提柜'
                  : confirmType === 'yard'
                  ? confirmItem.deliveryType === 2
                    ? '确认直接派送'
                    : '确认放置堆场'
                  : confirmType === 'delivery'
                  ? '确认已交货'
                  : confirmType === 'return'
                  ? '确认已还柜'
                  : '详情'
              }
              confirmTimeField={
                confirmType === 'pickup'
                  ? 'pickUpTimeA'
                  : confirmType === 'yard'
                  ? confirmItem.deliveryType === 2
                    ? 'deliveryDateA'
                    : 'tempStoreTime'
                  : confirmType === 'delivery'
                  ? 'deliveryDateA'
                  : confirmType === 'return'
                  ? 'signForTime'
                  : 'giveBackTime'
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 确认对话框 */}
      <TimeConfirmDialog
        open={showConfirmDialog} // 确保绑定状态
        onOpenChange={(isOpen) => {
          setShowConfirmDialog(isOpen)
          if (!isOpen) {
            setDialogTitle('')
            setDialogTimeLabel('')
            setSelectedItem(null)
            setConfirmPickupTime('')
          }
        }}
        title={dialogTitle || '确认交货'} // 默认标题
        timeLabel={dialogTimeLabel || '交货时间'} // 默认时间标签
        selectedItem={selectedItem} // 确保传递选中项
        timeValue={confirmPickupTime} // 时间值
        onTimeChange={(newTime) => {
          setConfirmPickupTime(newTime)
          console.log('交货时间更新:', newTime) // 添加日志以调试时间更新
        }}
        currentStatus={4} // 默认当前状态
        nextStatus={5} // 默认下一状态
        onSuccess={() => {
          handleSuccess()
          console.log('交货确认成功，状态更新为:', 5) // 添加日志以调试成功逻辑
          toast.success('交货确认成功')
        }}
      />

      {/* 放置堆场对话框 */}

      {/* 派送预约对话框 */}
      <TimeConfirmDialog
        open={showDeliveryAppointmentDialog}
        onOpenChange={setShowDeliveryAppointmentDialog}
        title="派送预约"
        timeLabel="预约派送时间"
        selectedItem={selectedItem}
        timeValue={deliveryAppointmentTime}
        onTimeChange={setDeliveryAppointmentTime}
        currentStatus={2}
        nextStatus={4}
        onSuccess={handleSuccess}
      />

      {/* 派送应约对话框 */}
      <TimeConfirmDialog
        open={showDeliveryAcceptDialog}
        onOpenChange={setShowDeliveryAcceptDialog}
        title="派送应约"
        timeLabel="派送应约时间"
        selectedItem={selectedItem}
        timeValue={deliveryAcceptTime}
        onTimeChange={setDeliveryAcceptTime}
        currentStatus={4}
        nextStatus={5}
        onSuccess={handleSuccess}
      />

      {/* 归还货柜对话框 */}
      <TimeConfirmDialog
        open={showReturnContainerDialog} // 确保绑定状态
        onOpenChange={(isOpen) => {
          setShowReturnContainerDialog(isOpen)
          if (!isOpen) {
            setDialogTitle('')
            setDialogTimeLabel('')
            setSelectedItem(null)
            setReturnContainerTime('')
          }
        }}
        title="归还货柜" // 标题
        timeLabel="归还时间" // 时间标签
        selectedItem={selectedItem} // 确保传递选中项
        timeValue={returnContainerTime} // 时间值
        onTimeChange={(newTime) => {
          setReturnContainerTime(newTime)
          console.log('归还时间更新:', newTime) // 添加日志以调试时间更新
        }}
        currentStatus={6} // 当前状态
        nextStatus={7} // 下一状态
        onSuccess={() => {
          handleSuccess()
          console.log('归还货柜成功，状态更新为:', 7) // 添加日志以调试成功逻辑
          toast.success('归还货柜成功')
        }}
      />
    </div>
  )
}
