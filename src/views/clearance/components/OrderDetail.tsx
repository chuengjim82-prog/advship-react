import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import CopyButton from '@/components/ui/CopyButton'
import { Loading } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import request from '@/utils/request'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

interface ContainerGoodsItem {
  id: number
  number: string
  remark: string
  sizeType: number
  weight: number
}

interface AttachmentDetail {
  id: number
  auditMemo: string
  auditResult: number
  auditTime: string
  creatorNic: string
  fileName: string
  dirtType: number
  fileType: string
  isAudit: number
  isExtract: number
  remark: string
  url?: string
  fileKey?: string
  filePath?: string
}

interface InvoiceGoodsItem {
  id: number
  amount: number
  goodsName: string
  goodsSpec: string | null
  hsCode: string
  price: number
  quantity: number
  remark: string | null
  saber: string | null
}

interface OrderBaseInfoDto {
  id: number
  countryId: number
  countryName: string | null
  customsCnName: string | null
  creatorNic: string
  custAgentId: number
  custAgentName: string | null
  custPickup: boolean
  currencyName: string | null
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

interface WaybillDto {
  id: number
  consigneeAddress: string
  consigneeName: string
  cubicVol: number
  custPort: string
  quantity: number
  remark: string
  shipperAddress: string
  shipperName: string
  ttlWeight: number
  waybillDate: string
  waybillNo: string
}

interface BaseInfoResponse {
  baseInfo: OrderBaseInfoDto
  waybill: WaybillDto
  orderContainerOrderIds: ContainerGoodsItem[]
}

export default function OrderDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const orderId = useMemo(() => Number(searchParams.get('id')), [searchParams])
  const displayBillNo = useMemo(() => searchParams.get('billNo') || '-', [searchParams])

  const [orderBaseInfo, setOrderBaseInfo] = useState<OrderBaseInfoDto | null>(null)
  const [waybillInfo, setWaybillInfo] = useState<WaybillDto | null>(null)
  const [invoiceGoods, setInvoiceGoods] = useState<InvoiceGoodsItem[]>([])
  const [containerGoods, setContainerGoods] = useState<ContainerGoodsItem[]>([])
  const [attachments, setAttachments] = useState<AttachmentDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<Set<number>>(new Set())

  const formatCurrency = useCallback((value?: number | null) => {
    if (value == null) return '-'
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [])

  const formatDate = useCallback((date?: string | null) => {
    if (!date) return '-'
    try {
      return new Date(date).toLocaleDateString('zh-CN')
    } catch {
      return '-'
    }
  }, [])

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
      toast.success('提单号已复制')
    } catch {
      toast.error('复制失败')
    }
  }, [copyText, displayBillNo])

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
    const selected = attachments.filter((a) => selectedAttachments.has(a.id))
    selected.forEach((file) => {
      if (file.url || file.filePath) {
        const link = document.createElement('a')
        link.href = file.url || file.filePath || ''
        link.download = file.fileName || 'attachment'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        downloadBlob(file.fileName || 'attachment.txt', `模拟下载文件：${file.fileName}`)
      }
    })
    toast.success(`已开始下载 ${selected.length} 个文件`)
  }, [attachments, selectedAttachments, downloadBlob])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleSubmit = useCallback(() => {
    toast.success('提交成功')
  }, [])

  const loadOrderBaseInfo = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await request.get<BaseInfoResponse>(`/bzss/api/BaseInfo/${orderId}GetBaseInfoOrder`)
      if (res.data) {
        setOrderBaseInfo(res.data.baseInfo ?? null)
        setWaybillInfo(res.data.waybill ?? null)
        setContainerGoods(res.data.orderContainerOrderIds ?? [])
      }
    } catch (err) {
      console.error('加载基础信息失败:', err)
      toast.error('加载基础信息失败')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  //   const loadContainerGoods = useCallback(async () => {
  //     if (!orderId) return
  //     try {
  //       const res = await request.get<ContainerGoodsItem[]>(`/bzss/api/Containers/${orderId}GetOrderGoodsInfoOrder`)
  //       setContainerGoods(res.data ?? [])
  //     } catch (err) {
  //       console.error('加载货物信息失败:', err)
  //     }
  //   }, [orderId])

  const loadInvoiceGoods = useCallback(async () => {
    if (!orderId) return
    try {
      const res = await request.get<InvoiceGoodsItem[]>(`/bzss/api/GoodsInfo/${orderId}GetGoodsInfoOrder`)
      setInvoiceGoods(res.data ?? [])
    } catch (err) {
      console.error('加载物品规格失败:', err)
    }
  }, [orderId])

  const loadAttachments = useCallback(async () => {
    if (!orderId) return
    try {
      const res = await request.get<AttachmentDetail[]>(`/bzss/api/Attachment/${orderId}GetAttachmentOrder`)
      setAttachments(res.data ?? [])
    } catch (err) {
      console.error('加载附件失败:', err)
    }
  }, [orderId])

  useEffect(() => {
    loadOrderBaseInfo()

    loadInvoiceGoods()
    loadAttachments()
  }, [loadOrderBaseInfo, loadInvoiceGoods, loadAttachments])

  const toggleAttachment = (id: number) => {
    setSelectedAttachments((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAllAttachments = () => {
    if (selectedAttachments.size === attachments.length) {
      setSelectedAttachments(new Set())
    } else {
      setSelectedAttachments(new Set(attachments.map((a) => a.id)))
    }
  }

  return (
    <Loading loading={loading}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">订单详情</h2>
            <p className="text-muted-foreground">订单号: {orderBaseInfo?.orderNo || '-'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              返回
            </Button>
            <Button onClick={handleSubmit}>提交</Button>
          </div>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">订单号码</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{orderBaseInfo?.orderNo || '-'}</span>
                  <CopyButton text={orderBaseInfo?.orderNo || '-'} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">订单日期</p>
                {/* <p className="font-medium">{formatDate(orderBaseInfo?.orderDate)}</p> */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">{orderBaseInfo?.orderDate || '-'}</span>
                  <CopyButton text={orderBaseInfo?.orderDate || '-'} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">清关代理</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{orderBaseInfo?.custAgentName || '-'}</span>
                  <CopyButton text={orderBaseInfo?.custAgentName || '-'} />
                </div>
                {/* <p className="font-medium">{orderBaseInfo?.custAgentName || '-'}</p> */}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">海关名称</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{orderBaseInfo?.customsCnName || '-'}</span>
                  <CopyButton text={orderBaseInfo?.customsCnName || '-'} />
                </div>
                {/* <p className="font-medium">{orderBaseInfo?.customsCnName || '-'}</p> */}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">清关口岸</p>

                <p className="font-medium">{orderBaseInfo?.custPortName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">运输代理</p>
                <p className="font-medium">{orderBaseInfo?.transAgentName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">货币</p>
                <p className="font-medium">{orderBaseInfo?.currencyName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">状态</p>
                <p className="font-medium">{orderBaseInfo?.statuss || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">备注</p>
                <p className="font-medium">{orderBaseInfo?.remark || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waybill Details */}
        <Card>
          <CardHeader>
            <CardTitle>第2步 提单详情 - 添加BL提单信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">提单号码</p>
                <p className="font-medium">{waybillInfo?.waybillNo || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">提单日期</p>
                <p className="font-medium">{formatDate(waybillInfo?.waybillDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">发件人名称</p>
                <p className="font-medium">{waybillInfo?.shipperName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">发件人地址</p>
                <p className="font-medium">{waybillInfo?.shipperAddress || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">收件人名称</p>
                <p className="font-medium">{waybillInfo?.consigneeName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">收件人地址</p>
                <p className="font-medium">{waybillInfo?.consigneeAddress || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">清关口岸</p>
                <p className="font-medium">{waybillInfo?.custPort || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总数量</p>
                <p className="font-medium">{waybillInfo?.quantity || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总重量</p>
                <p className="font-medium">{waybillInfo?.ttlWeight || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">体积</p>
                <p className="font-medium">{waybillInfo?.cubicVol || '-'}</p>
              </div>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">柜号</TableHead>
                    <TableHead className="w-[160px]">货物描述</TableHead>
                    <TableHead className="w-[100px]">数量</TableHead>
                    <TableHead className="w-[100px]">重量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {containerGoods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    containerGoods.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.number}</TableCell>
                        <TableCell>{item.remark}</TableCell>
                        <TableCell>{item.sizeType}</TableCell>
                        <TableCell>{item.weight}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>第3步 发票与物品 - SABER海关编码</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">物品规格</TableHead>
                    <TableHead className="w-[120px]">HSCode</TableHead>
                    <TableHead className="w-[100px]">数量</TableHead>
                    <TableHead className="w-[140px]">单价(CNF美元)</TableHead>
                    <TableHead className="w-[160px]">总CNF价格(美元)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceGoods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoiceGoods.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.goodsSpec || '-'}</TableCell>
                        <TableCell>{item.hsCode}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>第4步 附加详情 - 提交发票和SABER证书</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedAttachments.size === attachments.length && attachments.length > 0}
                        onCheckedChange={toggleAllAttachments}
                      />
                    </TableHead>
                    <TableHead className="w-[180px]">文件名</TableHead>
                    <TableHead className="w-[120px]">状态</TableHead>
                    <TableHead className="w-[140px]">备注</TableHead>
                    <TableHead className="w-[140px]">审核日期</TableHead>
                    <TableHead className="w-[120px]">审核人</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    attachments.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox checked={selectedAttachments.has(item.id)} onCheckedChange={() => toggleAttachment(item.id)} />
                        </TableCell>
                        <TableCell>{item.fileName}</TableCell>
                        <TableCell>{item.isAudit === 1 ? '已审核' : item.isAudit === 0 ? '待审核' : '-'}</TableCell>
                        <TableCell>{item.remark || '-'}</TableCell>
                        <TableCell>{item.auditTime ? new Date(item.auditTime).toLocaleDateString('zh-CN') : '-'}</TableCell>
                        <TableCell>{item.creatorNic}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={selectedAttachments.size === 0} onClick={handleDownload}>
                下载
              </Button>
              <Button>选择文件</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Loading>
  )
}
