import type { PageResult } from '@/utils/request'
import request from '@/utils/request'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Plus, RefreshCw, Search } from 'lucide-react'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import OrderCreateDrawer from './components/OrderCreateDrawer'

interface OrderBaseInfo {
  id: number
  orderNo?: string
  waybillNo?: string
  containerNo?: string
  shipperName?: string
  custPort?: string
  customerCode?: string
  customerName?: string
  exportCompanyName?: string
  exportCountryCnName?: string
  importCountryCnName?: string
  destinationCityCnName?: string
  destinationPortCnName?: string
  customsAgentName?: string
  consigneeName?: string
  forecastDate?: string
  departureDate?: string
  arrivalDate?: string
  statuss?: string
  paymentStatus?: string
}

interface StatusFilter {
  label: string
  value: string
}

const statusFilters: StatusFilter[] = [
  { label: 'ALL', value: 'all' },
  { label: '资料待审核', value: '资料待审核' },
  { label: '资料已审核', value: '资料已审核' },
  { label: '清关中', value: '清关中' },
  { label: '清关完成', value: '清关完成' },
  { label: '已预订柜提', value: '已预订柜提' },
  { label: '已提柜/储备堆场', value: '已提柜/储备堆场' },
  { label: '出派中/已签收', value: '出派中/已签收' },
  { label: '已还柜', value: '已还柜' },
]

export default function BaseInfo() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderBaseInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await request.get<PageResult<OrderBaseInfo>>('/bzss/api/dynamic/order-base-info', {
        params: {
          pageIndex,
          pageSize,
          keyword: keyword || undefined,
          statuss: currentStatus === 'all' ? undefined : currentStatus,
        },
      })
      setOrders(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('Failed to load orders', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatusSummary = async () => {
    try {
      const res = await request.get<Array<{ statuss?: string | null; count: number }>>('/bzss/api/orderbaseinfo/status-summary')
      const summary = res.data || []
      const nextCounts: Record<string, number> = {}
      summary.forEach((item) => {
        const key = item.statuss?.trim() || '未设置'
        nextCounts[key] = item.count || 0
      })
      setStatusCounts(nextCounts)
    } catch (error) {
      console.error('Failed to load status summary', error)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [pageIndex, pageSize, currentStatus])

  useEffect(() => {
    loadStatusSummary()
    loadOrders()
  }, [])

  const handleStatusChange = (value: string) => {
    if (currentStatus === value) return
    setCurrentStatus(value)
    setPageIndex(1)
  }

  const handleSearch = () => {
    setPageIndex(1)
    loadOrders()
  }

  const handleRefresh = () => {
    loadOrders()
    loadStatusSummary()
  }

  const handlePageChange = (page: number, newPageSize?: number) => {
    setPageIndex(page)
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setPageIndex(1)
    }
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    const parsed = dayjs(date)
    if (!parsed.isValid()) return '-'
    return parsed.format('YYYY-MM-DD')
  }

  const statusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "blue" => {
    if (!status) return 'outline'
    if (status.includes('完成') || status.includes('已签收')) return 'success'
    if (status.includes('待')) return 'warning'
    return 'default'
  }

  const totalStatusCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)

  const formatFilterLabel = (filter: StatusFilter) => {
    const count = filter.value === 'all' ? totalStatusCount : statusCounts[filter.value] || 0
    return `${filter.label}(${count})`
  }

  const handleCreate = () => {
    setCurrentOrderId(null)
    setDrawerVisible(true)
  }

  const editOrder = (row: OrderBaseInfo) => {
    setCurrentOrderId(row.id)
    setDrawerVisible(true)
  }

  const detailOrder = (row: OrderBaseInfo) => {
    navigate(`/order/detail?id=${row.id}&billNo=${row.waybillNo || ''}`)
  }

  const handleDrawerSuccess = () => {
    loadOrders()
    loadStatusSummary()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">订单列表(跟单)</h2>
          <p className="text-muted-foreground">实时跟踪订单节点，掌握清关/派送进度</p>
        </div>
        <Button size="lg" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />订单创建
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索提单号 / 柜号 / 客户代码"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-80 pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
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
                  <TableHead className="w-[120px]">客户代码</TableHead>
                  <TableHead className="w-[160px]">客户名称</TableHead>
                  <TableHead className="w-[140px]">出口国家</TableHead>
                  <TableHead className="w-[160px]">出口公司</TableHead>
                  <TableHead className="w-[140px]">进口国家</TableHead>
                  <TableHead className="w-[140px]">目的城市</TableHead>
                  <TableHead className="w-[140px]">目的港口</TableHead>
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
                    <TableCell colSpan={19} className="text-center text-muted-foreground h-32">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center text-muted-foreground h-32">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="sticky left-0 bg-background font-medium">{row.waybillNo || '-'}</TableCell>
                      <TableCell className="sticky left-[140px] bg-background">
                        <div className="flex gap-1">
                          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => editOrder(row)}>编辑</Button>
                          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => detailOrder(row)}>详情</Button>
                        </div>
                      </TableCell>
                      <TableCell>{row.containerNo || '-'}</TableCell>
                      <TableCell>{row.shipperName || '-'}</TableCell>
                      <TableCell>{row.custPort || '-'}</TableCell>
                      <TableCell>{row.customerCode || '-'}</TableCell>
                      <TableCell>{row.customerName || '-'}</TableCell>
                      <TableCell>{row.exportCountryCnName || '-'}</TableCell>
                      <TableCell>{row.exportCompanyName || '-'}</TableCell>
                      <TableCell>{row.importCountryCnName || '-'}</TableCell>
                      <TableCell>{row.destinationCityCnName || '-'}</TableCell>
                      <TableCell>{row.destinationPortCnName || '-'}</TableCell>
                      <TableCell>{row.customsAgentName || '-'}</TableCell>
                      <TableCell>{row.consigneeName || '-'}</TableCell>
                      <TableCell>{formatDate(row.forecastDate)}</TableCell>
                      <TableCell>{formatDate(row.departureDate)}</TableCell>
                      <TableCell>{formatDate(row.arrivalDate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(row.statuss)}>{row.statuss || '未设置'}</Badge>
                      </TableCell>
                      <TableCell>{row.paymentStatus || '-'}</TableCell>
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
        onClose={() => setDrawerVisible(false)}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}
