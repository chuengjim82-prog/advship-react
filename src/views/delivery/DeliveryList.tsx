import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import request from '@/utils/request'
import { ArrowUpDown, GripVertical, MoreVertical, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContainerPickup from './components/ContainerPickup'

// 数据类型定义
interface DeliveryItem {
  id: number
  creatorId: number
  creatorNic: string | null
  number: string // 柜号
  goodsInfo: string // 货物信息
  sizeType: string // 货柜型号
  pickUpTimeE: string | null // 预约提柜时间
  quantity: number // 数量
  weight: number // 重量
  orderNo: string // 订单号
  statusi: number // 状态码
  statuss: string // 状态
  orderId: number // 订单ID
  transPikId: number // 运输公司ID
  transPikName: string // 运输公司名称
}

interface ApiResponse {
  items: DeliveryItem[]
  total: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

interface ColumnConfig {
  key: keyof DeliveryItem | 'actions'
  label: string
  visible: boolean
  sortable: boolean
}

export default function DeliveryList() {
  // 状态管理
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [isSearchExpanded, setIsSearchExpanded] = useState(true)
  const [showPickup, setShowPickup] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DeliveryItem | null>(null)
  const [showCustomerDelivery, setShowCustomerDelivery] = useState(false)
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<DeliveryItem | null>(null)
  const [showColumnDialog, setShowColumnDialog] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof DeliveryItem | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' })
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

  // 列配置
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'number', label: '柜号', visible: true, sortable: true },
    { key: 'orderNo', label: '订单号', visible: true, sortable: true },
    { key: 'actions', label: '操作', visible: true, sortable: false },
    { key: 'sizeType', label: '货柜型号', visible: true, sortable: true },
    // { key: 'statuss', label: '状态', visible: true, sortable: true },
    { key: 'goodsInfo', label: '货物信息', visible: true, sortable: false },
    { key: 'quantity', label: '数量', visible: true, sortable: true },
    { key: 'weight', label: '重量(kg)', visible: true, sortable: true },
    { key: 'transPikName', label: '运输公司', visible: true, sortable: true },
    { key: 'pickUpTimeE', label: '预约提柜时间', visible: true, sortable: true },
  ])

  // 获取列表数据
  const fetchContainerList = async () => {
    setLoading(true)
    try {
      // 根据activeTab确定状态过滤
      let statusFilter = ''
      if (activeTab === 'waiting') statusFilter = '待预约提柜'
      else if (activeTab === 'appointed') statusFilter = '已预约提柜'
      else if (activeTab === 'pickedUp') statusFilter = '已提柜'
      else if (activeTab === 'yardPlacement') statusFilter = '放置堆场'
      else if (activeTab === 'loading') statusFilter = '出装中'
      else if (activeTab === 'signed') statusFilter = '已签收'
      else if (activeTab === 'returned') statusFilter = '已还柜'

      const response = await request.get<ApiResponse>('/bzss/api/Containers/GetContainerList', {
        params: {
          pageIndex,
          pageSize,
          statuss: statusFilter || undefined,
          // 可以添加其他搜索参数
        },
      })
      console.log('货柜列表数据:', response)
      setData(response.data?.items || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('获取货柜列表失败:', error)
      toast.error('获取货柜列表失败')
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    fetchContainerList()
  }, [pageIndex, activeTab])

  // 统计数据（可以从API获取或根据数据计算）
  const stats = {
    all: total,
    waitingAppointment: data.filter((item) => item.statuss === '待预约提柜').length,
    appointed: data.filter((item) => item.statuss === '已预约提柜').length,
    pickedUp: data.filter((item) => item.statuss === '已提柜').length,
    yardPlacement: data.filter((item) => item.statuss === '放置堆场').length,
    loading: data.filter((item) => item.statuss === '出装中').length,
    signed: data.filter((item) => item.statuss === '已签收').length,
    returned: data.filter((item) => item.statuss === '已还柜').length,
  }

  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({ ...prev, [field]: value }))
  }

  // 处理预约提柜操作
  const handleAppointment = (item: DeliveryItem) => {
    setSelectedItem(item)
    setShowPickup(true)
  }

  // 处理派送预约操作
  const handleAppointment1 = (item: DeliveryItem) => {
    navigate('/delivery/CustomerDelivery', { state: { deliveryItem: item } })
  }

  // 处理缴费操作
  const handlePayment = (item: DeliveryItem) => {
    console.log('缴费:', item)
  }

  // 处理排序
  const handleSort = (key: keyof DeliveryItem) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 排序数据
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // 搜索
  const handleSearch = () => {
    setPageIndex(1)
    fetchContainerList()
  }

  // 重置搜索
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
    setTimeout(() => fetchContainerList(), 0)
  }

  // 切换列可见性
  const toggleColumn = (key: keyof DeliveryItem | 'actions') => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)))
  }

  // 处理拖拽开始
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // 处理拖拽进入
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newColumns = [...columns]
    const draggedColumn = newColumns[draggedIndex]
    newColumns.splice(draggedIndex, 1)
    newColumns.splice(index, 0, draggedColumn)

    setColumns(newColumns)
    setDraggedIndex(index)
  }

  return (
    <div className="p-3 space-y-3 bg-white">
      {!showPickup ? (
        <>
          {/* 顶部标签统计 */}
          <div className="flex items-center gap-6 pb-2 border-b text-sm">
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'all' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('all')
                setPageIndex(1)
              }}
            >
              ALL ({stats.all})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'waiting' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('waiting')
                setPageIndex(1)
              }}
            >
              待预约提柜({stats.waitingAppointment})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'appointed' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('appointed')
                setPageIndex(1)
              }}
            >
              已预约提柜({stats.appointed})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'pickedUp' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('pickedUp')
                setPageIndex(1)
              }}
            >
              已提柜({stats.pickedUp})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'yardPlacement' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('yardPlacement')
                setPageIndex(1)
              }}
            >
              放置堆场({stats.yardPlacement})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'loading' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('loading')
                setPageIndex(1)
              }}
            >
              出装中({stats.loading})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'signed' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('signed')
                setPageIndex(1)
              }}
            >
              已签收({stats.signed})
            </span>
            <span
              className={`cursor-pointer px-3 py-1.5 rounded transition-colors ${activeTab === 'returned' ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => {
                setActiveTab('returned')
                setPageIndex(1)
              }}
            >
              已还柜({stats.returned})
            </span>
          </div>

          {/* 搜索表单 */}
          <div className="border rounded-lg bg-white">
            <div
              className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <span className="text-sm text-gray-600">{isSearchExpanded ? '收起' : '展开'}</span>
            </div>

            {isSearchExpanded && (
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      value={searchForm.containerNo}
                      onChange={(e) => handleInputChange('containerNo', e.target.value)}
                      className="h-9"
                      placeholder="柜号"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.billNo}
                      onChange={(e) => handleInputChange('billNo', e.target.value)}
                      className="h-9"
                      placeholder="提单号"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.shippingCompany}
                      onChange={(e) => handleInputChange('shippingCompany', e.target.value)}
                      className="h-9"
                      placeholder="派送公司"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.customsName}
                      onChange={(e) => handleInputChange('customsName', e.target.value)}
                      className="h-9"
                      placeholder="海关名称"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.vehicleNo}
                      onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                      className="h-9"
                      placeholder="车辆号码"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.customsPort}
                      onChange={(e) => handleInputChange('customsPort', e.target.value)}
                      className="h-9"
                      placeholder="清关口岸"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={searchForm.driverName}
                      onChange={(e) => handleInputChange('driverName', e.target.value)}
                      className="h-9"
                      placeholder="司机姓名"
                    />
                  </div>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-9" onClick={handleSearch}>
                    搜索
                  </Button>
                  <Button variant="outline" className="h-9 px-6" onClick={handleReset}>
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

          {/* 数据表格 */}
          <div className="border rounded-lg">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.filter((c) => c.visible).length} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
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
                              <span className="text-blue-600 cursor-pointer hover:underline">{item.number}</span>
                            </TableCell>
                          )
                        }

                        if (col.key === 'orderNo') {
                          return (
                            <TableCell key={col.key}>
                              <span className="text-blue-600 cursor-pointer hover:underline">{item.orderNo || '-'}</span>
                            </TableCell>
                          )
                        }

                        if (col.key === 'statuss') {
                          return (
                            <TableCell key={col.key}>
                              <Badge
                                className={
                                  item.statuss === '待预约提柜'
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0'
                                    : 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                                }
                              >
                                {item.statuss}
                              </Badge>
                            </TableCell>
                          )
                        }

                        if (col.key === 'actions') {
                          return (
                            <TableCell key={col.key}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleAppointment(item)}>预约提柜</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAppointment1(item)}>派送预约</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
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

                        return <TableCell key={col.key}>{item[col.key as keyof DeliveryItem] || '-'}</TableCell>
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {!loading && sortedData.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {total} 条记录，第 {pageIndex} / {Math.ceil(total / pageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPageIndex(Math.max(1, pageIndex - 1))} disabled={pageIndex === 1}>
                  上一页
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pageIndex === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPageIndex(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
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
        </>
      ) : (
        /* 预约提柜页面 */
        selectedItem && (
          <ContainerPickup
            containerNo={selectedItem.number}
            pickupCode={selectedItem.number}
            containerType={selectedItem.sizeType}
            onClose={() => setShowPickup(false)}
            onSubmit={(data) => {
              console.log('提交预约数据:', data)
              // 这里可以调用API提交数据
              setShowPickup(false)
              fetchContainerList()
            }}
          />
        )
      )}

      {/* 列配置对话框 */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>自定义列显示和排序</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-500 mb-2">可以拖拽调整列的顺序</div>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {columns.map((col, index) => (
              <div
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                className={`flex items-center space-x-2 p-2 rounded border bg-white cursor-move hover:bg-gray-50 transition-colors ${draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-200'
                  }`}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <Checkbox id={col.key} checked={col.visible} onCheckedChange={() => toggleColumn(col.key)} />
                <label
                  htmlFor={col.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {col.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
