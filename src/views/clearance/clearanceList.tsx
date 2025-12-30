import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ContainerPickupInfo, TransportAgent } from '@/models/order.model'
import request from '@/utils/request'
import { format } from 'date-fns'
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import PickupDrawer from './components/PickupDrawer'

interface RowData {
  id: number
  waybillNo: string // 提单号
  statuss: string // 状态
  number: string // 柜号
  custAgentId: number
  custPickup: string
  orderNo: string // 订单号
  custPortId: number
  shipperName: string // 船司名称
  consigneeName: string // 收件人名称
  createTime: string // 创建时间
  custPort: string // 清关口岸
  custAgentName: string // 清关代理名称
  custPortName: string // 清关口岸名称
}

interface ColumnConfig {
  key: keyof RowData | 'actions' | 'feeStatus'
  label: string
  visible: boolean
  sortable: boolean
}

interface ApiResponse {
  items: RowData[]
  total: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export default function ClearanceList() {
  const [tab, setTab] = useState('清关中')
  const [showFilters, setShowFilters] = useState(true)
  const [showColumnDialog, setShowColumnDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showPickupDialog, setShowPickupDialog] = useState(false)
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null)
  const [pickupData, setPickupData] = useState<ContainerPickupInfo[]>([])

  const [pickupLoading, setPickupLoading] = useState(false)
  const [transportAgents, setTransportAgents] = useState<TransportAgent[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof RowData | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RowData[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    waybillNo: '',
    orderNo: '',
    number: '',
    keyword: '',
  })

  // formData is kept for potential future use in the complete dialog
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_formData, _setFormData] = useState({
    appointmentTime: null as Date | null,
    deliveryMethod: 'direct',
  })
  const [completionTime, setCompletionTime] = useState('')
  // 列配置
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'waybillNo', label: '提单号', visible: true, sortable: true },
    { key: 'statuss', label: '状态', visible: true, sortable: true },
    { key: 'actions', label: '操作', visible: true, sortable: false },
    // { key: 'number', label: '柜号', visible: true, sortable: true },
    { key: 'shipperName', label: '船司', visible: true, sortable: true },
    { key: 'consigneeName', label: '收货人', visible: true, sortable: true },
    { key: 'custPortName', label: '清关口岸', visible: true, sortable: true },
    { key: 'orderNo', label: '订单号', visible: true, sortable: true },
    { key: 'custAgentName', label: '清关代理', visible: true, sortable: true },
    { key: 'createTime', label: '海关申报', visible: true, sortable: true },
  ])

  // 获取清关列表数据
  const fetchClearanceList = async () => {
    setLoading(true)
    try {
      const response = await request.get<ApiResponse>('/bzss/api/BaseInfo/ClearanceList', {
        params: {
          statuss: tab,
          waybillNo: filters.waybillNo,
          orderNo: filters.orderNo,
          number: filters.number,
          pageIndex,
          pageSize,
          keyword: filters.keyword,
          orderBy: sortConfig.key,
          isAsc: sortConfig.direction === 'asc',
        },
      })
      console.log('清关列表数据:', response)
      // 接口直接返回数据对象，不是包裹在ApiResult.data中
      setData((response as any).items || response.data?.items || [])
      setTotal((response as any).total || response.data?.total || 0)
    } catch (error) {
      console.error('获取清关列表失败:', error)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    fetchClearanceList()
  }, [tab, pageIndex, sortConfig])

  // 搜索
  const handleSearch = () => {
    setPageIndex(1)
    fetchClearanceList()
  }

  // 重置搜索
  const handleReset = () => {
    setFilters({
      waybillNo: '',
      orderNo: '',
      number: '',
      keyword: '',
    })
    setPageIndex(1)
    setTimeout(() => fetchClearanceList(), 0)
  }

  // 处理排序
  const handleSort = (key: keyof RowData) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 当前显示的数据（已经通过API排序）
  // 数据已经通过API获取，不需要currentData变量

  // 切换列可见性
  const toggleColumn = (key: keyof RowData | 'actions' | 'feeStatus') => {
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

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // 清除选中的文件
  const handleClearFile = () => {
    setSelectedFile(null)
    // 清除 file input 的值
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // 处理文件上传
  const handleUpload = () => {
    if (selectedFile && selectedRow) {
      console.log('上传文件:', selectedFile.name, '提单号:', selectedRow.waybillNo)
      // 这里添加实际的上传逻辑
      setShowUploadDialog(false)
      setSelectedFile(null)
      setSelectedRow(null)
    }
  }

  // 打开清关完成确认对话框

  // 打开清关完成确认对话框
  const openCompleteDialog = (row: RowData) => {
    setSelectedRow(row)
    setShowCompleteDialog(true)
  }

  // 处理清关完成
  const handleCompleteClearance = async () => {
    if (!selectedRow || !completionTime) {
      toast.error('请填写清关完成时间')
      return
    }

    try {
      console.log('清关完成，ID:', selectedRow.id, '完成时间:', completionTime)
      const timeStr = format(completionTime, "yyyy-MM-dd'T'HH:mm:ss")
      const response = await request.post<boolean>(`/bzss/api/BaseInfo/CompleteClearance`, {
        id: selectedRow.id,
        completionTime: timeStr,
      })

      if (response.data === false) {
        toast.error('完结异常')
      } else {
        toast.success('清关完成')
        // 刷新列表
        fetchClearanceList()
      }
    } catch (error) {
      console.error('清关完成失败:', error)
      toast.error('操作失败')
    } finally {
      setShowCompleteDialog(false)
      setSelectedRow(null)
    }
  }

  // 打开预约提柜对话框
  const openPickupDialog = async (row: RowData) => {
    setSelectedRow(row)
    setShowPickupDialog(true)
    setPickupLoading(true)

    try {
      // 同时获取预约信息和运输公司列表
      const [pickupResponse, agentsResponse] = await Promise.all([
        request.get<ContainerPickupInfo[]>(`/bzss/api/Containers/${row.id}GetOrderReserve`),
        request.get<TransportAgent[]>('/base/api/TransAgent/GetTransAgentSelect'),
      ])
      setPickupData(pickupResponse.data || [])
      setTransportAgents(agentsResponse.data || [])
    } catch (error) {
      console.error('获取预约提柜信息失败:', error)
      toast.error('获取预约提柜信息失败')
    } finally {
      setPickupLoading(false)
    }
  }

  // 更新预约提柜信息
  const handleUpdatePickupInfo = (
    index: number,
    field:
      | 'pickUpTimeE'
      | 'remark'
      | 'transPikId'
      | 'transDlvName'
      | 'transportationNumber'
      | 'transPikPhone'
      | 'transPikName'
      | 'transportMode'
      | 'deliveryType',
    value: string | number | Date
  ) => {
    const newPickupData = [...pickupData]
    if (field === 'pickUpTimeE' && value instanceof Date) {
      newPickupData[index] = { ...newPickupData[index], [field]: value.toISOString() }
    } else {
      newPickupData[index] = { ...newPickupData[index], [field]: value }
    }
    setPickupData(newPickupData)
  }

  // 确认预约提柜
  const handleConfirmPickup = async () => {
    if (!selectedRow || pickupData.length === 0) return

    try {
      await request.post(`/bzss/api/Containers/UpdateOrderReserve?OrderId=${selectedRow.id}`, pickupData)
      toast.success('预约提柜成功')
      setShowPickupDialog(false)
      fetchClearanceList()
    } catch (error) {
      console.error('预约提柜失败:', error)
      toast.error('预约提柜失败')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 上部：状态选择区 */}
      <div className="flex-shrink-0 px-6 border-b border-gray-200">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setTab('清关中')}
            className={`relative py-4 text-sm font-medium transition-colors ${
              tab === '清关中' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            清关中{tab === '清关中' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setTab('清关完成')}
            className={`relative py-4 text-sm font-medium transition-colors ${
              tab === '清关完成' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            清关完成{tab === '清关完成' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>
      </div>

      {/* 中部：可折叠的搜索区 */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div
          className="flex items-center justify-between px-6 py-3 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2">
            {/* <span className="text-sm font-medium text-gray-700">搜索筛选</span> */}
            {!showFilters && (
              <span className="text-xs text-gray-500">
                {Object.values(filters).filter((v) => v).length > 0 && `(已设置 ${Object.values(filters).filter((v) => v).length} 个条件)`}
              </span>
            )}
          </div>
          {showFilters ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>

        {showFilters && (
          <div className="px-6 py-4 bg-white">
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                placeholder="提单号"
                value={filters.waybillNo}
                onChange={(e) => setFilters((f) => ({ ...f, waybillNo: e.target.value }))}
                className="w-40 h-10"
              />
              <Input
                placeholder="订单号"
                value={filters.orderNo}
                onChange={(e) => setFilters((f) => ({ ...f, orderNo: e.target.value }))}
                className="w-40 h-10"
              />
              {/* <Input
                placeholder="柜号"
                value={filters.number}
                onChange={(e) => setFilters((f) => ({ ...f, number: e.target.value }))}
                className="w-40 h-10"
              /> */}
              {/* <Input
                placeholder="关键词"
                value={filters.keyword}
                onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                className="w-40 h-10"
              /> */}
              <Button className="h-10 px-8 bg-blue-500 hover:bg-blue-600" onClick={handleSearch}>
                搜索
              </Button>
              <Button variant="outline" className="h-10 px-6" onClick={handleReset}>
                重置
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 工具栏 */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowColumnDialog(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            自定义列
          </Button>
        </div>
      </div>

      {/* 下部：数据表格区 */}
      <div className="flex-1 overflow-auto">
        {!showPickupDialog && (
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                {columns.map((col) => {
                  if (!col.visible) return null
                  return (
                    <TableHead key={`col-${col.key}`} className="font-medium text-gray-700 whitespace-nowrap">
                      {col.sortable ? (
                        <div
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
                          onClick={() => handleSort(col.key as keyof RowData)}
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
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.filter((c) => c.visible).length} className="h-32 text-center text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={`row-${row.id}`} className="hover:bg-gray-50/50 border-b border-gray-100">
                    {columns.map((col) => {
                      if (!col.visible) return null

                      //   if (col.key === 'waybillNo') {
                      //     return (
                      //       <TableCell
                      //         key={col.key}
                      //         className="text-blue-600 font-medium underline cursor-pointer hover:text-blue-700"
                      //         // onClick={() => handleBillNoClick(row)}
                      //       >
                      //         {row.waybillNo}
                      //       </TableCell>
                      //     )
                      //   }

                      if (col.key === 'statuss') {
                        return (
                          <TableCell key={col.key} className="min-w-[100px]">
                            <Badge
                              className={
                                row.statuss === '清关中'
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 rounded px-2 py-1 whitespace-nowrap'
                                  : 'bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded px-2 py-1 whitespace-nowrap'
                              }
                            >
                              {row.statuss}
                            </Badge>
                          </TableCell>
                        )
                      }

                      if (col.key === 'actions') {
                        return (
                          <TableCell key={col.key} className="space-x-2">
                            {tab === '清关中' ? (
                              <>
                                {/* <Button variant="outline" size="sm" onClick={() => openUploadDialog(row)}>
                                  回传初步报关单
                                </Button> */}
                                <Button variant="outline" size="sm" onClick={() => openCompleteDialog(row)} className="text-green-600">
                                  清关完成
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => openPickupDialog(row)}>
                                预约提柜
                              </Button>
                            )}
                          </TableCell>
                        )
                      }

                      return (
                        <TableCell key={col.key} className="text-gray-700">
                          {row[col.key as keyof RowData]}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 分页 */}
      {!loading && data.length > 0 && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
                    key={`page-${page}`}
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
                className={`flex items-center space-x-2 p-2 rounded border bg-white cursor-move hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-200'
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

      {/* 使用组件化的预约提柜抽屉 */}
      <PickupDrawer
        open={showPickupDialog}
        onOpenChange={setShowPickupDialog}
        pickupLoading={pickupLoading}
        pickupData={pickupData}
        transportAgents={transportAgents}
        selectedRow={selectedRow}
        handleUpdatePickupInfo={handleUpdatePickupInfo}
        handleConfirmPickup={handleConfirmPickup}
      />

      {/* 清关完成确认对话框 */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>完成清关</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-medium text-right">提单号</label>
                  <div className="col-span-2">
                    <Input value={selectedRow?.waybillNo || ''} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm font-medium text-right">清关完成时间</label>
                  <div className="col-span-2">
                    <DateTimePicker
                      value={completionTime ? format(new Date(completionTime), "yyyy-MM-dd'T'HH:mm") : ''}
                      onChange={(str) => setCompletionTime(str)}
                      placeholder="请选择清关完成时间"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>关闭</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteClearance} className="bg-green-600 hover:bg-green-700">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 文件上传对话框 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>回传初步报销单</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-right">提单号</label>
              <div className="col-span-2">
                <Input value={selectedRow?.waybillNo || ''} disabled className="bg-gray-50" />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm font-medium text-right">初步报销单</label>
              <div className="col-span-2 flex gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer flex-1"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                  <Button variant="outline" size="sm" onClick={handleClearFile} className="whitespace-nowrap">
                    清除
                  </Button>
                )}
              </div>
            </div>
            {selectedFile && <div className="text-sm text-gray-600 text-center">已选择文件: {selectedFile.name}</div>}
            {/* <div className="text-xs text-gray-500 text-center">注：请先上传初步报销单，后续还需要上传最终报销单</div> */}
          </div>
          <div className="flex justify-center gap-4">
            <Button className="bg-orange-500 hover:bg-orange-600 px-8" onClick={handleUpload} disabled={!selectedFile}>
              上传
            </Button>
            <Button
              variant="outline"
              className="px-8"
              onClick={() => {
                setShowUploadDialog(false)
                setSelectedFile(null)
              }}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
