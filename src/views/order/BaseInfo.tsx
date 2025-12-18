import { useState, useEffect } from 'react'
import { Card, Button, Input, Table, Tag, Pagination, Space } from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'
import OrderCreateDrawer from './components/OrderCreateDrawer'
import './BaseInfo.css'

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
  { label: '已还柜', value: '已还柜' }
]

export default function BaseInfo() {
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
          statuss: currentStatus === 'all' ? undefined : currentStatus
        }
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
      const res = await request.get<Array<{ statuss?: string | null; count: number }>>(
        '/bzss/api/orderbaseinfo/status-summary'
      )
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

  const statusTagType = (status?: string): 'success' | 'warning' | 'default' | 'error' => {
    if (!status) return 'default'
    if (status.includes('完成') || status.includes('已签收')) return 'success'
    if (status.includes('待')) return 'warning'
    if (status.includes('清关')) return 'default'
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

  const viewDetail = (row: OrderBaseInfo) => {
    console.log('View detail:', row)
    // TODO: Implement detail view
  }

  const editOrder = (row: OrderBaseInfo) => {
    setCurrentOrderId(row.id)
    setDrawerVisible(true)
  }

  const handleDrawerSuccess = () => {
    loadOrders()
    loadStatusSummary()
  }

  const columns = [
    {
      title: '提单号',
      dataIndex: 'waybillNo',
      width: 140,
      fixed: 'left' as const
    },
    {
      title: '操作',
      dataIndex: 'id',
      width: 160,
      fixed: 'left' as const,
      render: (_: any, record: OrderBaseInfo) => (
        <Space>
          <Button type="link" onClick={() => viewDetail(record)}>
            查看
          </Button>
          <Button type="link" onClick={() => editOrder(record)}>
            编辑
          </Button>
        </Space>
      )
    },
    {
      title: '柜号',
      dataIndex: 'containerNo',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: '船司',
      dataIndex: 'shipperName',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: '清关口岸',
      dataIndex: 'custPort',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '客户代码',
      dataIndex: 'customerCode',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      width: 160,
      render: (text: string) => text || '-'
    },
    {
      title: '出口国家',
      dataIndex: 'exportCountryCnName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '出口公司',
      dataIndex: 'exportCompanyName',
      width: 160,
      render: (text: string) => text || '-'
    },
    {
      title: '进口国家',
      dataIndex: 'importCountryCnName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '目的城市',
      dataIndex: 'destinationCityCnName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '目的港口',
      dataIndex: 'destinationPortCnName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '清关代理',
      dataIndex: 'customsAgentName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '提单收件人',
      dataIndex: 'consigneeName',
      width: 140,
      render: (text: string) => text || '-'
    },
    {
      title: '预报日期',
      dataIndex: 'forecastDate',
      width: 150,
      render: (text: string) => formatDate(text)
    },
    {
      title: '发运日期',
      dataIndex: 'departureDate',
      width: 150,
      render: (text: string) => formatDate(text)
    },
    {
      title: '到港日期',
      dataIndex: 'arrivalDate',
      width: 150,
      render: (text: string) => formatDate(text)
    },
    {
      title: '状态',
      dataIndex: 'statuss',
      width: 140,
      render: (text: string) => <Tag color={statusTagType(text)}>{text || '未设置'}</Tag>
    },
    {
      title: '缴费',
      dataIndex: 'paymentStatus',
      width: 120,
      render: (text: string) => text || '-'
    }
  ]

  return (
    <div className="order-follow">
      <div className="order-follow__header">
        <div>
          <h2>订单列表(跟单)</h2>
          <p className="order-follow__subtitle">实时跟踪订单节点，掌握清关/派送进度</p>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
          订单创建
        </Button>
      </div>

      <div className="order-follow__filters">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            type={currentStatus === filter.value ? 'primary' : 'default'}
            size="small"
            onClick={() => handleStatusChange(filter.value)}
            style={{ borderRadius: 16 }}
          >
            {formatFilterLabel(filter)}
          </Button>
        ))}
      </div>

      <Card className="order-follow__card">
        <div className="order-follow__toolbar">
          <Input
            placeholder="搜索提单号 / 柜号 / 客户代码"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            allowClear
            style={{ maxWidth: 320 }}
          />
          <div className="toolbar-actions">
            <Button loading={loading} icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          bordered
        />

        <div className="order-follow__pagination">
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[10, 20, 50]}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={handlePageChange}
          />
        </div>
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
