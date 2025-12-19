import { useState, useEffect, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loading } from '@/components/ui/spinner'
import { Plus, Trash2 } from 'lucide-react'
import request from '@/utils/request'
import { toast } from 'sonner'
import {
  fetchServices,
  fetchCustAgents,
  fetchCustPorts,
  fetchTransAgents,
  fetchCountries,
  type ServiceItem,
  type AgentItem,
  type CustPortItem,
  type CountryItem
} from '@/api/baseData'

interface BaseInfoForm {
  id?: number | null
  orderNo: string
  orderDate: string | null
  serviceId: number | null
  custAgentId: number | null
  custPortId: number | null
  transAgentId: number | null
  custPickup: boolean
  remark: string
  statuss: string
  waybillNo: string
  countryId: number | null
}

interface WaybillForm {
  id?: number | null
  waybillNo: string
  waybillDate: string | null
  shipperName: string
  shipperAddress: string
  consigneeName: string
  consigneeAddress: string
  custPort: string
  quantity: number | null
  ttlWeight: number | null
  cubicVol: number | null
  remark: string
}

interface ContainerForm {
  id?: number | null
  number: string
  sizeType: string
  quantity: number | null
  weight: number | null
  goodsInfo: string
  remark: string
}

interface InvoiceForm {
  id?: number | null
  invoiceNo: string
  bussType: string
  transType: string
  currency: string
  ttlAmount: number | null
  exporter: string
  remark: string
}

interface OrderDetailResponse {
  baseInfo: Partial<BaseInfoForm>
  waybill?: Partial<WaybillForm>
  containers?: Array<Partial<ContainerForm>>
  invoices?: Array<Partial<InvoiceForm>>
}

interface OrderCreateDrawerProps {
  visible: boolean
  orderId?: number | null
  onClose: () => void
  onSuccess: (orderId?: number) => void
}

const createBaseInfoForm = (): BaseInfoForm => ({
  id: null,
  orderNo: '',
  orderDate: null,
  serviceId: null,
  custAgentId: null,
  custPortId: null,
  transAgentId: null,
  custPickup: false,
  remark: '',
  statuss: '',
  waybillNo: '',
  countryId: null
})

const createWaybillForm = (): WaybillForm => ({
  id: null,
  waybillNo: '',
  waybillDate: null,
  shipperName: '',
  shipperAddress: '',
  consigneeName: '',
  consigneeAddress: '',
  custPort: '',
  quantity: null,
  ttlWeight: null,
  cubicVol: null,
  remark: ''
})

const createContainerForm = (): ContainerForm => ({
  id: null,
  number: '',
  sizeType: '',
  quantity: null,
  weight: null,
  goodsInfo: '',
  remark: ''
})

const createInvoiceForm = (): InvoiceForm => ({
  id: null,
  invoiceNo: '',
  bussType: '',
  transType: '',
  currency: '',
  ttlAmount: null,
  exporter: '',
  remark: ''
})

const normalizeDateValue = (value?: string | null) => {
  if (!value) return null
  return value.length > 10 ? value.slice(0, 10) : value
}

export default function OrderCreateDrawer({
  visible,
  orderId,
  onClose,
  onSuccess
}: OrderCreateDrawerProps) {
  const [submitting, setSubmitting] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [baseInfoForm, setBaseInfoForm] = useState<BaseInfoForm>(createBaseInfoForm())
  const [waybillForm, setWaybillForm] = useState<WaybillForm>(createWaybillForm())
  const [containers, setContainers] = useState<ContainerForm[]>([createContainerForm()])
  const [invoices, setInvoices] = useState<InvoiceForm[]>([createInvoiceForm()])

  const [serviceOptions, setServiceOptions] = useState<ServiceItem[]>([])
  const [custAgentOptions, setCustAgentOptions] = useState<AgentItem[]>([])
  const [custPortOptions, setCustPortOptions] = useState<CustPortItem[]>([])
  const [transAgentOptions, setTransAgentOptions] = useState<AgentItem[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryItem[]>([])

  const isEditMode = useMemo(() => orderId != null, [orderId])

  const resetForms = () => {
    setBaseInfoForm(createBaseInfoForm())
    setWaybillForm(createWaybillForm())
    setContainers([createContainerForm()])
    setInvoices([createInvoiceForm()])
  }

  const loadBaseOptions = async () => {
    try {
      const [services, agents, ports, transAgents, countries] = await Promise.all([
        fetchServices(),
        fetchCustAgents(),
        fetchCustPorts(),
        fetchTransAgents(),
        fetchCountries()
      ])
      setServiceOptions(services)
      setCustAgentOptions(agents)
      setCustPortOptions(ports)
      setTransAgentOptions(transAgents)
      setCountryOptions(countries)
    } catch (error) {
      console.error('Failed to load base data options', error)
    }
  }

  const populateFromDetail = (detail: OrderDetailResponse) => {
    const newBaseInfo = {
      ...createBaseInfoForm(),
      ...detail.baseInfo,
      orderDate: normalizeDateValue(detail.baseInfo?.orderDate ?? null),
      id: detail.baseInfo?.id ?? null
    }
    setBaseInfoForm(newBaseInfo)

    if (detail.waybill) {
      setWaybillForm({
        ...createWaybillForm(),
        ...detail.waybill,
        waybillDate: normalizeDateValue(detail.waybill?.waybillDate ?? null)
      })
    } else {
      setWaybillForm(createWaybillForm())
    }

    setContainers(
      detail.containers && detail.containers.length > 0
        ? detail.containers.map((item) => ({
            id: item.id ?? null,
            number: item.number ?? '',
            sizeType: item.sizeType ?? '',
            quantity: item.quantity ?? null,
            weight: item.weight ?? null,
            goodsInfo: item.goodsInfo ?? '',
            remark: item.remark ?? ''
          }))
        : [createContainerForm()]
    )

    setInvoices(
      detail.invoices && detail.invoices.length > 0
        ? detail.invoices.map((item) => ({
            id: item.id ?? null,
            invoiceNo: item.invoiceNo ?? '',
            bussType: item.bussType ?? '',
            transType: item.transType ?? '',
            currency: item.currency ?? '',
            ttlAmount: item.ttlAmount ?? null,
            exporter: item.exporter ?? '',
            remark: item.remark ?? ''
          }))
        : [createInvoiceForm()]
    )
  }

  const loadOrderDetail = async (id: number) => {
    setDetailLoading(true)
    try {
      const res = await request.get<OrderDetailResponse>(`/bzss/api/orderbaseinfo/${id}/detail`)
      const data = res.data
      if (!data) {
        resetForms()
        return
      }
      populateFromDetail(data)
    } catch (error) {
      console.error('Failed to load order detail', error)
      toast.error('加载订单详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadBaseOptions()
  }, [])

  useEffect(() => {
    if (visible) {
      if (isEditMode && orderId) {
        loadOrderDetail(orderId)
      } else {
        resetForms()
      }
    } else {
      resetForms()
    }
  }, [visible, orderId])

  useEffect(() => {
    if (!baseInfoForm.custPortId) {
      setWaybillForm((prev) => ({ ...prev, custPort: '' }))
      return
    }
    const selected = custPortOptions.find((item) => item.id === baseInfoForm.custPortId)
    if (selected) {
      setWaybillForm((prev) => ({
        ...prev,
        custPort: selected.enName || selected.cnName || selected.code || ''
      }))
    }
  }, [baseInfoForm.custPortId, custPortOptions])

  const addContainer = () => setContainers([...containers, createContainerForm()])
  const removeContainer = (index: number) => {
    if (containers.length === 1) return
    setContainers(containers.filter((_, i) => i !== index))
  }
  const updateContainer = (index: number, field: keyof ContainerForm, value: any) => {
    const newContainers = [...containers]
    newContainers[index] = { ...newContainers[index], [field]: value }
    setContainers(newContainers)
  }

  const addInvoice = () => setInvoices([...invoices, createInvoiceForm()])
  const removeInvoice = (index: number) => {
    if (invoices.length === 1) return
    setInvoices(invoices.filter((_, i) => i !== index))
  }
  const updateInvoice = (index: number, field: keyof InvoiceForm, value: any) => {
    const newInvoices = [...invoices]
    newInvoices[index] = { ...newInvoices[index], [field]: value }
    setInvoices(newInvoices)
  }

  const handleSubmit = async () => {
    const normalizedContainers = containers.filter(
      (item) => item.number || item.sizeType || item.goodsInfo || item.quantity !== null || item.weight !== null
    )
    if (normalizedContainers.length === 0) {
      toast.warning('请至少添加一条柜型信息')
      return
    }

    const normalizedInvoices = invoices.filter(
      (item) => item.invoiceNo || item.bussType || item.transType || item.currency || item.exporter
    )
    if (normalizedInvoices.length === 0) {
      toast.warning('请至少添加一条发票信息')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        baseInfo: baseInfoForm,
        waybill: waybillForm,
        containers: normalizedContainers,
        invoices: normalizedInvoices
      }

      if (isEditMode) {
        await request.put<boolean>(`/bzss/api/orderbaseinfo/${orderId}`, payload)
        toast.success('订单更新成功')
        onSuccess(orderId!)
      } else {
        const response = await request.post<number>('/bzss/api/orderbaseinfo/create', payload)
        toast.success('订单创建成功')
        onSuccess(response.data ?? 0)
      }
      onClose()
      resetForms()
    } catch (error) {
      console.error('订单提交失败', error)
      toast.error('订单提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForms()
  }

  return (
    <Sheet open={visible} onOpenChange={(open: boolean) => !open && handleClose()}>
      <SheetContent className="w-[80vw] sm:max-w-[80vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? '更新订单' : '创建订单'}</SheetTitle>
        </SheetHeader>

        <Loading loading={detailLoading}>
          <div className="space-y-4 py-4">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>目的地海关</Label>
                  <Select value={String(baseInfoForm.custPortId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, custPortId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择目的地海关" /></SelectTrigger>
                    <SelectContent>
                      {custPortOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>航司名称</Label>
                  <Select value={String(baseInfoForm.transAgentId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, transAgentId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择航司" /></SelectTrigger>
                    <SelectContent>
                      {transAgentOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.name || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={baseInfoForm.custPickup} onCheckedChange={(checked) => setBaseInfoForm({ ...baseInfoForm, custPickup: checked })} />
                  <Label>代理清关</Label>
                </div>
                <div className="space-y-2">
                  <Label>清关公司</Label>
                  <Select value={String(baseInfoForm.custAgentId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, custAgentId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择清关公司" /></SelectTrigger>
                    <SelectContent>
                      {custAgentOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.name || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>经纪商授权码</Label>
                  <Input value={baseInfoForm.orderNo} onChange={(e) => setBaseInfoForm({ ...baseInfoForm, orderNo: e.target.value })} placeholder="请输入经纪商授权码" />
                </div>
                <div className="space-y-2">
                  <Label>订单日期</Label>
                  <Input type="date" value={baseInfoForm.orderDate || ''} onChange={(e) => setBaseInfoForm({ ...baseInfoForm, orderDate: e.target.value || null })} />
                </div>
                <div className="space-y-2">
                  <Label>运输服务</Label>
                  <Select value={String(baseInfoForm.serviceId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, serviceId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择运输服务" /></SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.name || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>目的国家</Label>
                  <Select value={String(baseInfoForm.countryId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, countryId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择国家" /></SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code2}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>备注</Label>
                  <Textarea value={baseInfoForm.remark} onChange={(e) => setBaseInfoForm({ ...baseInfoForm, remark: e.target.value })} placeholder="请输入备注" rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Waybill Info */}
            <Card>
              <CardHeader>
                <CardTitle>提单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>提单号</Label>
                  <Input value={waybillForm.waybillNo} onChange={(e) => setWaybillForm({ ...waybillForm, waybillNo: e.target.value })} placeholder="请输入提单号" />
                </div>
                <div className="space-y-2">
                  <Label>提单日期</Label>
                  <Input type="date" value={waybillForm.waybillDate || ''} onChange={(e) => setWaybillForm({ ...waybillForm, waybillDate: e.target.value || null })} />
                </div>
                <div className="space-y-2">
                  <Label>发货人</Label>
                  <Input value={waybillForm.shipperName} onChange={(e) => setWaybillForm({ ...waybillForm, shipperName: e.target.value })} placeholder="请输入发货人" />
                </div>
                <div className="space-y-2">
                  <Label>收货人</Label>
                  <Input value={waybillForm.consigneeName} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeName: e.target.value })} placeholder="请输入收货人" />
                </div>
                <div className="space-y-2">
                  <Label>发货地址</Label>
                  <Input value={waybillForm.shipperAddress} onChange={(e) => setWaybillForm({ ...waybillForm, shipperAddress: e.target.value })} placeholder="请输入发货地址" />
                </div>
                <div className="space-y-2">
                  <Label>收货地址</Label>
                  <Input value={waybillForm.consigneeAddress} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeAddress: e.target.value })} placeholder="请输入收货地址" />
                </div>
                <div className="space-y-2">
                  <Label>目的港</Label>
                  <Input value={waybillForm.custPort} onChange={(e) => setWaybillForm({ ...waybillForm, custPort: e.target.value })} placeholder="请输入目的港" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>件数</Label>
                    <Input type="number" value={waybillForm.quantity ?? ''} onChange={(e) => setWaybillForm({ ...waybillForm, quantity: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                  <div className="space-y-2">
                    <Label>总重量(kg)</Label>
                    <Input type="number" value={waybillForm.ttlWeight ?? ''} onChange={(e) => setWaybillForm({ ...waybillForm, ttlWeight: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                  <div className="space-y-2">
                    <Label>体积(m3)</Label>
                    <Input type="number" value={waybillForm.cubicVol ?? ''} onChange={(e) => setWaybillForm({ ...waybillForm, cubicVol: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Containers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>柜型信息</CardTitle>
                <Button variant="outline" size="sm" onClick={addContainer}><Plus className="h-4 w-4 mr-1" />新增</Button>
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
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {containers.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell><Input value={item.number} onChange={(e) => updateContainer(index, 'number', e.target.value)} placeholder="柜号" /></TableCell>
                          <TableCell><Input value={item.sizeType} onChange={(e) => updateContainer(index, 'sizeType', e.target.value)} placeholder="柜型" /></TableCell>
                          <TableCell><Input type="number" value={item.quantity ?? ''} onChange={(e) => updateContainer(index, 'quantity', e.target.value ? Number(e.target.value) : null)} /></TableCell>
                          <TableCell><Input type="number" value={item.weight ?? ''} onChange={(e) => updateContainer(index, 'weight', e.target.value ? Number(e.target.value) : null)} /></TableCell>
                          <TableCell><Input value={item.goodsInfo} onChange={(e) => updateContainer(index, 'goodsInfo', e.target.value)} placeholder="描述" /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" disabled={containers.length === 1} onClick={() => removeContainer(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>发票信息</CardTitle>
                <Button variant="outline" size="sm" onClick={addInvoice}><Plus className="h-4 w-4 mr-1" />新增</Button>
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
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell><Input value={item.invoiceNo} onChange={(e) => updateInvoice(index, 'invoiceNo', e.target.value)} placeholder="发票号" /></TableCell>
                          <TableCell><Input value={item.bussType} onChange={(e) => updateInvoice(index, 'bussType', e.target.value)} placeholder="业务类型" /></TableCell>
                          <TableCell><Input value={item.currency} onChange={(e) => updateInvoice(index, 'currency', e.target.value)} placeholder="SAR/USD" /></TableCell>
                          <TableCell><Input type="number" value={item.ttlAmount ?? ''} onChange={(e) => updateInvoice(index, 'ttlAmount', e.target.value ? Number(e.target.value) : null)} /></TableCell>
                          <TableCell><Input value={item.exporter} onChange={(e) => updateInvoice(index, 'exporter', e.target.value)} placeholder="出口商" /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" disabled={invoices.length === 1} onClick={() => removeInvoice(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </Loading>

        <SheetFooter>
          <Button variant="outline" onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : isEditMode ? '保存更新' : '提交'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
