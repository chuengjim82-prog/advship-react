import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loading } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import request from '@/utils/request'
import { toast } from 'sonner'
import {
  fetchCustoms,
  fetchShippings,
  fetchCustomers,
  fetchCustAgents,
  fetchCustPorts,
  fetchCountries,
  type CustomsItem,
  type ShippingItem,
  type CustomerItem,
  type AgentItem,
  type CustPortItem,
  type CountryItem,
} from '@/api/baseData'

interface OrderAuditDrawerProps {
  visible: boolean
  orderId?: number | null
  onClose: () => void
  onSuccess?: (orderId?: number) => void
}

export default function OrderAuditDrawer({ visible, orderId, onClose, onSuccess }: OrderAuditDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<any | null>(null)

  const [customerOptions, setCustomerOptions] = useState<CustomerItem[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryItem[]>([])
  const [custPortOptions, setCustPortOptions] = useState<CustPortItem[]>([])
  const [customsOptions, setCustomsOptions] = useState<CustomsItem[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingItem[]>([])
  const [custAgentOptions, setCustAgentOptions] = useState<AgentItem[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedAttachments, setSelectedAttachments] = useState<Set<number>>(new Set())

  const loadDetail = async (id?: number | null) => {
    if (!id) {
      setDetail(null)
      setAttachments([])
      return
    }
    setLoading(true)
    try {
      const res = await request.get(`/bzss/api/orderbaseinfo/${id}/detail`)
      setDetail(res.data)
      setAttachments(res.data?.attachments ?? [])
    } catch (err) {
      console.error('load detail failed', err)
      toast.error('加载订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && orderId) loadDetail(orderId)
    if (!visible) setDetail(null)
  }, [visible, orderId])

  const loadBaseOptions = async () => {
    try {
      const [customs, shippings, customers, agents, ports, countries] = await Promise.all([
        fetchCustoms(),
        fetchShippings(),
        fetchCustomers(),
        fetchCustAgents(),
        fetchCustPorts(),
        fetchCountries(),
      ])
      setCustomsOptions(customs)
      setShippingOptions(shippings)
      setCustomerOptions(customers)
      setCustAgentOptions(agents)
      setCustPortOptions(ports)
      setCountryOptions(countries)
    } catch (err) {
      console.error('load base options failed', err)
    }
  }

  useEffect(() => {
    // load base options once when drawer is used
    if (visible) loadBaseOptions()
  }, [visible])

  const toggleAttachment = (id: number) => {
    setSelectedAttachments((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllAttachments = () => {
    if (selectedAttachments.size === attachments.length) {
      setSelectedAttachments(new Set())
    } else {
      setSelectedAttachments(new Set(attachments.map((a: any) => a.id)))
    }
  }

  const handleDownload = () => {
    const selected = attachments.filter((a: any) => selectedAttachments.has(a.id))
    selected.forEach((file: any) => {
      if (file.url || file.filePath) {
        const link = document.createElement('a')
        link.href = file.url || file.filePath || ''
        link.download = file.fileName || 'attachment'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const blob = new Blob([`模拟下载文件：${file.fileName}`], { type: 'text/plain;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = file.fileName || 'attachment.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
    toast.success(`已开始下载 ${selected.length} 个文件`)
  }

  const RECEIVABLE_METHOD_FIXED = '固定'
  const RECEIVABLE_METHOD_ACTUAL = '实报'

  const methodCodeToLabel = (code?: number | null) =>
    code === 1 ? RECEIVABLE_METHOD_FIXED : (code === 2 ? RECEIVABLE_METHOD_ACTUAL : '-')

  const customerDisplay = detail?.baseInfo?.customerName ?? customerOptions.find((c) => c.id === detail?.baseInfo?.customerId)?.name ?? '-'
  const orgCountryItem = countryOptions.find((c) => c.id === detail?.baseInfo?.orgCountryId)
  const orgCountryDisplay = detail?.baseInfo?.orgCountryName ?? (orgCountryItem ? (orgCountryItem.cnName || orgCountryItem.enName || orgCountryItem.code2) : '-')
  const countryItem = countryOptions.find((c) => c.id === detail?.baseInfo?.countryId)
  const countryDisplay = detail?.baseInfo?.countryName ?? (countryItem ? (countryItem.cnName || countryItem.enName || countryItem.code2) : '-')
  const custPortItem = custPortOptions.find((p) => p.id === detail?.waybill?.custPortId)
  const custPortDisplay = detail?.waybill?.custPortName ?? (custPortItem ? (custPortItem.enName || custPortItem.cnName || custPortItem.code) : '-')
  const shipperItem = shippingOptions.find((s) => s.id === detail?.waybill?.shipperId)
  const shipperDisplay = detail?.waybill?.shipperName ?? (shipperItem ? (shipperItem.sName || shipperItem.code) : '-')
  const custAgentDisplay = detail?.baseInfo?.custAgentName ?? custAgentOptions.find((a) => a.id === detail?.baseInfo?.custAgentId)?.name ?? '-'

  const customsItem = customsOptions.find((p) => p.id === detail?.baseInfo?.customsId)
  const customsDisplay = detail?.baseInfo?.customsName ?? (customsItem ? (customsItem.enName || customsItem.cnName || customsItem.code) : '-')

  return (
    <Sheet open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent className="w-[80vw] sm:max-w-[80vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>订单审核</SheetTitle>
        </SheetHeader>

        <Loading loading={loading}>
          <div className="py-4 space-y-4">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">客户名称</div>
                  <div className="font-medium">{customerDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">出口国家</div>
                  <div className="font-medium">{orgCountryDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">出口公司</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">进口国家</div>
                  <div className="font-medium">{countryDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的城市</div>
                  <div className="font-medium">{detail?.waybill?.destCityName ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的港口</div>
                  <div className="font-medium">{custPortDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的地海关</div>
                  <div className="font-medium">{customsDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">航司名称</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">代理清关</div>
                  <div className="font-medium">{detail?.baseInfo?.isAgentClear ? '是' : '否'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">清关公司</div>
                  <div className="font-medium">{custAgentDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">经纪商授权码</div>
                  <div className="font-medium">{detail?.baseInfo?.orderNo ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">申报类型</div>
                  <div className="font-medium">{detail?.baseInfo?.declarationType === 1 ? '进口申报' : detail?.baseInfo?.declarationType === 2 ? '立即清关' : '-'}</div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-sm text-muted-foreground">备注</div>
                  <div className="font-medium">{detail?.baseInfo?.remark ?? '-'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments (文件审核) */}
            {attachments && attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>附件(文件审核)</CardTitle>
                </CardHeader>
                <CardContent>
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
                          <TableHead className="w-[220px]">文件名</TableHead>
                          <TableHead className="w-[120px]">类型</TableHead>
                          <TableHead className="w-[120px]">状态</TableHead>
                          <TableHead>备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attachments.map((file: any) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <Checkbox checked={selectedAttachments.has(file.id)} onCheckedChange={() => toggleAttachment(file.id)} />
                            </TableCell>
                            <TableCell>
                              {file.fileName}
                            </TableCell>
                            <TableCell>{file.fileType ?? '-'}</TableCell>
                            <TableCell>{file.isAudit === 1 ? '已审核' : file.isAudit === 0 ? '待审核' : '-'}</TableCell>
                            <TableCell>{file.remark ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" disabled={selectedAttachments.size === 0} onClick={handleDownload}>下载</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Receivables */}
            {detail?.receivables && detail.receivables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>应收项目</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">类型</TableHead>
                          <TableHead className="w-[180px]">项目名称</TableHead>
                          <TableHead className="w-[120px]">方式</TableHead>
                          <TableHead className="w-[120px]">价格</TableHead>
                          <TableHead className="w-[100px]">币种</TableHead>
                          <TableHead className="w-[100px]">单位</TableHead>
                          <TableHead className="w-[120px]">数量</TableHead>
                          <TableHead className="w-[160px]">金额</TableHead>
                          <TableHead>备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.receivables.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{item.feeTypeName ?? '-'}</TableCell>
                            <TableCell>{item.feeItemName ?? '-'}</TableCell>
                            <TableCell>{methodCodeToLabel(item.itemType) ?? '-'}</TableCell>
                            <TableCell>{item.price ?? '-'}</TableCell>
                            <TableCell>{item.currency ?? '-'}</TableCell>
                            <TableCell>{item.itemUnit ?? '-'}</TableCell>
                            <TableCell>{item.quantity ?? '-'}</TableCell>
                            <TableCell>{item.amount ?? '-'}</TableCell>
                            <TableCell>{item.remark ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Waybill Info */}
            <Card>
              <CardHeader>
                <CardTitle>提单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货人名称</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货人名称</div>
                  <div className="font-medium">{detail?.waybill?.consigneeName ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货联系人</div>
                  <div className="font-medium">{detail?.waybill?.shipperContact ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货联系人电话</div>
                  <div className="font-medium">{detail?.waybill?.shipperContactTel ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货联系人</div>
                  <div className="font-medium">{detail?.waybill?.consigneeContact ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货联系人电话</div>
                  <div className="font-medium">{detail?.waybill?.consigneeContactTel ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货人地址</div>
                  <div className="font-medium">{detail?.waybill?.shipperAddress ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货人地址</div>
                  <div className="font-medium">{detail?.waybill?.consigneeAddress ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">提单号</div>
                  <div className="font-medium">{detail?.waybill?.waybillNo ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">提单日期</div>
                  <div className="font-medium">{detail?.waybill?.waybillDate ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的港</div>
                  <div className="font-medium">{custPortDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">件数</div>
                  <div className="font-medium">{detail?.waybill?.quantity ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">总重量(kg)</div>
                  <div className="font-medium">{detail?.waybill?.ttlWeight ?? '-'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">体积(m3)</div>
                  <div className="font-medium">{detail?.waybill?.cubicVol ?? '-'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Containers */}
            {detail?.containers && detail.containers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>货柜信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">柜号</TableHead>
                          <TableHead className="w-[120px]">柜型</TableHead>
                          <TableHead className="w-[100px]">数量</TableHead>
                          <TableHead className="w-[120px]">重量(kg)</TableHead>
                          <TableHead>货物描述</TableHead>
                          <TableHead className="w-[120px]">备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.containers.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.number ?? '-'}</TableCell>
                            <TableCell>{item.sizeType ?? '-'}</TableCell>
                            <TableCell>{item.quantity ?? '-'}</TableCell>
                            <TableCell>{item.weight ?? '-'}</TableCell>
                            <TableCell>{item.goodsInfo ?? '-'}</TableCell>
                            <TableCell>{item.remark ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoices */}
            {detail?.invoices && detail.invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>发票信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">发票号</TableHead>
                          <TableHead className="w-[120px]">业务类型</TableHead>
                          <TableHead className="w-[120px]">币种</TableHead>
                          <TableHead className="w-[120px]">金额</TableHead>
                          <TableHead>出口商</TableHead>
                          <TableHead className="w-[120px]">备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.invoices.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.invoiceNo ?? '-'}</TableCell>
                            <TableCell>{item.bussType ?? '-'}</TableCell>
                            <TableCell>{item.currency ?? '-'}</TableCell>
                            <TableCell>{item.ttlAmount ?? '-'}</TableCell>
                            <TableCell>{item.exporter ?? '-'}</TableCell>
                            <TableCell>{item.remark ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goods Info */}
            {detail?.goodsInfos && detail.goodsInfos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>产品信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[160px]">产品名称</TableHead>
                          <TableHead className="w-[140px]">HSCode</TableHead>
                          <TableHead className="w-[140px]">型号</TableHead>
                          <TableHead className="w-[120px]">数量(箱)</TableHead>
                          <TableHead className="w-[140px]">单价(CNF美元)</TableHead>
                          <TableHead className="w-[150px]">总CNF价格(美元)</TableHead>
                          <TableHead className="w-[160px]">SABER文件</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.goodsInfos.map((item: any, index: number) => (
                          <TableRow key={`goods-${index}`}>
                            <TableCell>{item.goodsName ?? '-'}</TableCell>
                            <TableCell>{item.hsCode ?? '-'}</TableCell>
                            <TableCell>{item.goodsSpec ?? '-'}</TableCell>
                            <TableCell>{item.quantity ?? '-'}</TableCell>
                            <TableCell>{item.price ?? '-'}</TableCell>
                            <TableCell>{item.amount ?? '-'}</TableCell>
                            <TableCell>{item.saber ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Loading>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
