import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Table, Space, message, Spin } from 'antd'
import type { TableColumnsType } from 'antd'
import request from '@/utils/request'
import './OrderDetail.css'

// 接口数据类型
interface OrderDetailField {
  label: string
  value: string
}

interface BillItem {
  waybillNo: string
  remark: string
  quantity: string
  ttlWeight: string
}

interface AttachmentDetail {
  name: string
  fileKey?: string
  url?: string
  status: string
  remark?: string
  reviewedAt: string
  reviewer: string
}

interface OrderDetailData {
  completedAt: string
  declarationFields: OrderDetailField[]
  blSummary: OrderDetailField[]
  blItems: BillItem[]
  transactionFields: OrderDetailField[]
  goodsSummary: OrderDetailField[]
  attachments: AttachmentDetail[]
}

interface InvoiceGoodsItem {
  id: number
  Amount: number
  GoodsSpec: string
  HsCode: string
  Price: number
  Quantity: number
}

interface OrderBaseInfoDto {
  id: number
  countryId: number
  customsCnName: string | null
  creatorNic: string
  custAgentId: number
  custAgentName: string | null
  custPickup: boolean
  currencyName: string
  custPortId: number
  custPortName: string | null
  orderDate: string
  orderNo: string
  remark: string
  serviceId: number
  status1: number
  statusi: number
  statuss: string
  transAgentId: number
  transAgentName: string | null
}

export default function OrderDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const orderId = useMemo(() => Number(searchParams.get('id')), [searchParams])
  const displayBillNo = useMemo(() => searchParams.get('billNo') || '-', [searchParams])

  const [detailData] = useState<OrderDetailData>({
    completedAt: '2025/12/12 14:30',
    declarationFields: [
      { label: '海关港口', value: '达曼港' },
      { label: '申报类型', value: '进口即时清关' },
      { label: '付款方式', value: '现金政府保险' },
      { label: '进口国', value: 'SA' },
      { label: '海关出口口岸', value: '达曼海关' },
      { label: '经纪商授权码', value: 'xxxxxxxxxxx' },
    ],
    blSummary: [{ label: '提单日期', value: '2025/11/28' }],
    blItems: [],
    transactionFields: [
      { label: '交易类型', value: 'C&I' },
      { label: '发票号码', value: 'RHD202510067' },
      { label: '发票货币币种', value: 'USD' },
      { label: '发票共计费用', value: '4,024.65' },
      { label: '出口公司名称', value: 'SHENZHEN CHUANGGONG IMP&EXP CO. LTD' },
    ],
    goodsSummary: [
      { label: '提单总重量', value: '2142' },
      { label: '提单总数量', value: '2028' },
      { label: '业务类型', value: '固定金额已投保 // 商业保险 / 免税' },
      { label: '货物最终到达位置', value: '达曼' },
    ],
    attachments: [
      { name: '提单文件 (td.pdf)', fileKey: 'td.pdf', url: '', status: '已审核', reviewedAt: '2025/11/22', reviewer: 'steven' },
      { name: '装箱单 (z.pdf)', fileKey: 'z.pdf', url: '', status: '已审核', remark: '£', reviewedAt: '2025/11/22', reviewer: 'steven' },
      { name: '发票 (f.pdf)', fileKey: 'f.pdf', url: '', status: '已审核', reviewedAt: '2025/11/22', reviewer: 'steven' },
      { name: 'SABER (a.pdf; b.pdf)', fileKey: 'saber.pdf', url: '', status: '已审核', reviewedAt: '2025/11/22', reviewer: 'steven' },
    ],
  })

  const [waybillList, setWaybillList] = useState<BillItem[]>([])
  const [orderBaseInfo, setOrderBaseInfo] = useState<OrderBaseInfoDto | null>(null)
  const [invoiceGoods, setInvoiceGoods] = useState<InvoiceGoodsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<AttachmentDetail[]>([])

  const hasSelectedAttachment = selectedAttachments.length > 0

  // 格式化货币
  const formatCurrency = useCallback((value?: number | null) => {
    if (value == null) return '-'
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [])

  // 复制文本
  const copyText = useCallback(async (text: string) => {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text)
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }, [])

  const handleCopyBillNo = useCallback(async () => {
    try {
      await copyText(displayBillNo)
      message.success('提单号已复制')
    } catch {
      message.error('复制失败')
    }
  }, [copyText, displayBillNo])

  // 下载附件
  const downloadBlob = useCallback((name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  const handleDownload = useCallback(() => {
    selectedAttachments.forEach((file) => {
      if (file.url) {
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.fileKey || file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        downloadBlob(file.fileKey || 'attachment.txt', `模拟下载文件：${file.name}`)
      }
    })
    message.success(`已开始下载 ${selectedAttachments.length} 个文件`)
  }, [selectedAttachments, downloadBlob])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleSubmit = useCallback(() => {
    message.success('提交成功')
  }, [])

  // 加载数据
  const loadWaybillList = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await request.get<BillItem[]>(`/api/Waybill/${orderId}GetWaybillOrder`)
      setWaybillList(res.data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const loadOrderBaseInfo = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await request.get<OrderBaseInfoDto>(`/api/BaseInfo/${orderId}GetWaybillOrder`)
      setOrderBaseInfo(res.data ?? null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    loadOrderBaseInfo()
    loadWaybillList()
  }, [loadOrderBaseInfo, loadWaybillList])

  // 表格列定义
  const waybillColumns: TableColumnsType<BillItem> = useMemo(() => [
    { title: '柜号', dataIndex: 'waybillNo', width: 120 },
    { title: '货物描述', dataIndex: 'remark', width: 160 },
    { title: '数量', dataIndex: 'quantity', width: 100 },
    { title: '重量', dataIndex: 'ttlWeight', width: 100 },
  ], [])

  const invoiceGoodsColumns: TableColumnsType<InvoiceGoodsItem> = useMemo(() => [
    { title: '物品规格', dataIndex: 'GoodsSpec', width: 160 },
    { title: 'HSCode', dataIndex: 'HsCode', width: 120 },
    { title: '数量', dataIndex: 'Quantity', width: 100 },
    {
      title: '单价(CNF美元)',
      dataIndex: 'Price',
      width: 140,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: '总CNF价格(美元)',
      dataIndex: 'Amount',
      width: 160,
      render: (value: number) => formatCurrency(value)
    },
  ], [formatCurrency])

  const attachmentColumns: TableColumnsType<AttachmentDetail> = useMemo(() => [
    { title: '文件名', dataIndex: 'name', width: 180 },
    { title: '状态', dataIndex: 'status', width: 120 },
    { title: '备注', dataIndex: 'remark', width: 140, render: (text) => text || '-' },
    { title: '审核日期', dataIndex: 'reviewedAt', width: 140 },
    { title: '审核人', dataIndex: 'reviewer', width: 120 },
  ], [])

  const attachmentRowSelection = {
    onChange: (_: React.Key[], selectedRows: AttachmentDetail[]) => {
      setSelectedAttachments(selectedRows)
    },
  }

  return (
    <div className="order-detail-page">
      {/* 头部 */}
      <div className="detail-header">
        <div>
          <p className="detail-header__title">海关申报</p>
          <p className="detail-header__subtitle">完成海关申报时间 {detailData.completedAt}</p>
        </div>
        <div className="detail-header__actions">
          <Button onClick={handleBack}>返回</Button>
          <Button type="primary" onClick={handleSubmit}>提交</Button>
        </div>
      </div>

      {/* 订单信息 */}
      <section className="detail-section">
        <h3 className="detail-section__title">订单信息</h3>
        <div className="detail-grid">
          <div className="detail-field detail-field--copyable">
            <span className="detail-label">提单号码</span>
            <div className="detail-value detail-value--with-action">
              <span>{orderBaseInfo?.orderNo || displayBillNo}</span>
              <Button type="link" size="small" onClick={handleCopyBillNo}>
                复制
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 申报详情 */}
      <section className="detail-section">
        <h3 className="detail-section__title">第1步 申报详情 - 录入货物信息</h3>
        <div className="detail-grid">
          {detailData.declarationFields.map((item) => (
            <div key={item.label} className="detail-field">
              <span className="detail-label">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 提单详情 */}
      <section className="detail-section">
        <h3 className="detail-section__title">第2步 提单详情 - 添加BL提单信息</h3>
        <div className="detail-grid detail-grid--compact">
          <div className="detail-field">
            <span className="detail-label">提单号码</span>
            <span className="detail-value">{displayBillNo}</span>
          </div>
          {detailData.blSummary.map((item) => (
            <div key={item.label} className="detail-field">
              <span className="detail-label">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>

        <Spin spinning={loading}>
          <Table
            dataSource={waybillList}
            columns={waybillColumns}
            rowKey="waybillNo"
            bordered
            pagination={false}
            className="detail-table"
          />
        </Spin>

        <div className="detail-grid detail-grid--compact">
          {detailData.transactionFields.map((item) => (
            <div key={item.label} className="detail-field">
              <span className="detail-label">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 发票物品 */}
      <section className="detail-section">
        <h3 className="detail-section__title">第3步 发票与物品 - SABER海关编码</h3>
        <Spin spinning={loading}>
          <Table
            dataSource={invoiceGoods}
            columns={invoiceGoodsColumns}
            rowKey="id"
            bordered
            pagination={false}
            className="detail-table"
          />
        </Spin>

        <div className="detail-grid detail-grid--compact">
          {detailData.goodsSummary.map((item) => (
            <div key={item.label} className="detail-field">
              <span className="detail-label">{item.label}</span>
              <span className="detail-value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 附件 */}
      <section className="detail-section">
        <h3 className="detail-section__title">第4步 附加详情 - 提交发票和SABER证书</h3>
        <Table
          dataSource={detailData.attachments}
          columns={attachmentColumns}
          rowKey="name"
          rowSelection={attachmentRowSelection}
          bordered
          pagination={false}
          className="detail-table"
        />
        <div className="detail-attachments__actions">
          <Space>
            <Button disabled={!hasSelectedAttachment} onClick={handleDownload}>
              下载
            </Button>
            <Button type="primary">选择文件</Button>
          </Space>
        </div>
      </section>
    </div>
  )
}
