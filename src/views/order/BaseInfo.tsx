import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import dayjs from 'dayjs'
import { cn, displayValue } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Plus, RefreshCw, Search } from 'lucide-react'
import OrderCreateDrawer from './components/OrderCreateDrawer'
import OrderAuditDrawer from './components/OrderAuditDrawer'
import OrderDetailDrawer from './components/OrderDetailDrawer'
import { useOrderList } from '@/hooks/useOrderList' // 你刚整理的 hook
import { toast } from 'sonner'
import request from "@/utils/request";

const statusFilters = [
  { label: 'ALL', value: 'all' },
  { label: '资料待审核', value: '资料待审核' },
  { label: '资料已审核', value: '资料已审核' },
  { label: '清关中', value: '清关中' },
  { label: '清关完成', value: '清关完成' },
  { label: '已预订提柜', value: '已预订提柜' },
  { label: '已提柜/储备堆场', value: '已提柜/储备堆场' },
  { label: '出派中/已签收', value: '出派中/已签收' },
  { label: '已还柜', value: '已还柜' },
]

export default function BaseInfo() {
  const navigate = useNavigate()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [auditVisible, setAuditVisible] = useState(false)
  const [auditOrderId, setAuditOrderId] = useState<number | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null)

  const {
    orders,
    statusCounts,
    loading,
    currentStatus,
    keyword,
    pageIndex,
    pageSize,
    total,
    handleStatusChange,
    handleSearch,
    handlePageChange,
    refresh,
  } = useOrderList()

  const formatDate = (date?: string) => {
    if (!date) return '-'
    const parsed = dayjs(date)
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '-'
  }

  const statusBadgeVariant = (status?: string) => {
    if (!status) return 'outline'
    if (status.includes('完成') || status.includes('已签收')) return 'success'
    if (status.includes('待')) return 'warning'
    return 'default'
  }

  const totalStatusCount = Object.values(statusCounts).reduce((sum, c) => sum + c, 0)
  const formatFilterLabel = (filter: typeof statusFilters[number]) => {
    const count = filter.value === 'all' ? totalStatusCount : statusCounts[filter.value] || 0
    return `${filter.label}(${count})`
  }

  const handleCreate = () => {
    setCurrentOrderId(null)
    setDrawerVisible(true)
  }

  const editOrder = (row: any) => {
    setCurrentOrderId(row.id)
    setDrawerVisible(true)
  }

  const deleteOrder = async (row: any) => {
    try {
      await request.delete(`/bzss/api/BaseInfo/${row.id}`)
      toast.success('删除成功')
      refresh()
    } catch (err) {
      toast.error('删除失败')
    }
  }


  const auditOrder = (row: any) => {
    setAuditOrderId(row.id)
    setAuditVisible(true)
  }

  const viewOrderDetail = (row: any) => {
    setDetailOrderId(row.id)
    setDetailVisible(true)
  }

  const detailOrder = (row: any) => {
    navigate(`/order/detail?id=${row.id}&billNo=${row.waybillNo || ''}`)
  }

  const handleDrawerSuccess = () => {
    refresh()
  }

  const PaidCheck = ({ paid }: { paid?: boolean }) => {
    return (
      <span className={paid ? 'text-green-600 font-bold' : 'text-muted-foreground'}>
        {paid ? '✔' : '-'}
      </span>
    )
  }

  const parsePaymentBits = (value?: string) => {
    const v = (value ?? '000').padEnd(3, '0')
    return {
      doFee: v[0] === '1',
      portFee: v[1] === '1',
      tax: v[2] === '1',
    }
  }

  const PaymentStatusCell = ({ value }: { value?: string }) => {
    const status = parsePaymentBits(value)
    const allPaid = status.doFee && status.portFee && status.tax
    return (
      <div
        className={[
          'flex gap-3 text-sm whitespace-nowrap',
          allPaid ? 'text-green-600 font-semibold' : '',
        ].join(' ')}
      >
        <span>Do <PaidCheck paid={status.doFee} /></span>
        <span>港杂 <PaidCheck paid={status.portFee} /></span>
        <span>税 <PaidCheck paid={status.tax} /></span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">订单列表(跟单)</h2>
          <p className="text-muted-foreground">实时跟踪订单节点，掌握清关/派送进度</p>
        </div>
        <Button size="lg" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />订单创建
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={currentStatus === filter.value ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => handleStatusChange(filter.value)}
          >
            {formatFilterLabel(filter)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索提单号 / 柜号 / 客户代码"
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background w-[140px]">提单号</TableHead>
                  <TableHead className="sticky left-[140px] bg-background w-[160px]">操作</TableHead>
                  <TableHead className="w-[120px]">柜号</TableHead>
                  <TableHead className="w-[120px]">船司</TableHead>
                  <TableHead className="w-[140px]">清关口岸</TableHead>
                  <TableHead className="w-[160px]">客户代码</TableHead>
                  <TableHead className="w-[140px]">清关代理</TableHead>
                  <TableHead className="w-[140px]">提单收件人</TableHead>
                  <TableHead className="w-[150px]">预报日期</TableHead>
                  <TableHead className="w-[150px]">发运日期</TableHead>
                  <TableHead className="w-[150px]">到港日期</TableHead>
                  <TableHead className="w-[140px]">状态</TableHead>
                  <TableHead className="w-[120px]">缴费</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="sticky left-0 font-medium bg-background">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => detailOrder(row)}
                        >
                          {displayValue(row.waybillNo)}
                        </Button>
                      </TableCell>
                      <TableCell className="sticky left-[140px] bg-background">
                        <div className="flex gap-1">
                          {row.statusI > 1 ? (
                            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => viewOrderDetail(row)}>详情</Button>
                          ) : (
                            <>
                              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => editOrder(row)}>编辑</Button>                       
                              {row.statusI === 1 && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-red-500" onClick={() => deleteOrder(row)}>删除</Button>
                              )}
                              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => auditOrder(row)}>审核</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{displayValue(row.containerNo)}</TableCell>
                      <TableCell>{displayValue(row.shipperCompanyName)}</TableCell>
                      <TableCell>{displayValue(row.custPort)}</TableCell>
                      <TableCell>{displayValue(row.customerName) || '-'}</TableCell>
                      <TableCell>{displayValue(row.customsAgentName)}</TableCell>
                      <TableCell>{displayValue(row.consigneeName)}</TableCell>
                      <TableCell>{formatDate(row.orderDate)}</TableCell>
                      <TableCell>{formatDate(row.departureDate)}</TableCell>
                      <TableCell>{formatDate(row.arrivalDate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(row.statuss)}>{row.statuss || '未设置'}</Badge>
                      </TableCell>
                      <TableCell><PaymentStatusCell value={row.paymentStatus} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end p-4 border-t">
            <Pagination
              current={pageIndex}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>

      <OrderCreateDrawer
        visible={drawerVisible}
        orderId={currentOrderId}
        onClose={() => {
          setDrawerVisible(false)
        }}
        onSuccess={handleDrawerSuccess}
      />

      <OrderAuditDrawer
        visible={auditVisible}
        orderId={auditOrderId}
        onClose={() => {
          setAuditVisible(false)
          setAuditOrderId(null)
        }}
        onSuccess={handleDrawerSuccess}
      />

      <OrderDetailDrawer
        visible={detailVisible}
        orderId={detailOrderId}
        onClose={() => {
          setDetailVisible(false)
          setDetailOrderId(null)
        }}
      />
    </div>
  )
}
