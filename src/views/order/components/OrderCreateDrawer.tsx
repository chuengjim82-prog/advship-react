import { useState, useEffect, useMemo, useRef } from 'react'
import { useSmartEffect } from '@/hooks/useSmartEffect'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loading } from '@/components/ui/spinner'
import { Plus, Trash2, Upload } from 'lucide-react'
import request from '@/utils/request'
import { toast } from 'sonner'
import {
  fetchCustoms,
  fetchShippings,
  fetchCustomers,
  fetchCustAgents,
  fetchCustPorts,
  fetchCountries,
  fetchFeeItems,
  fetchFeeTypes,
  type CustomsItem,
  type ShippingItem,
  type CustomerItem,
  type AgentItem,
  type CustPortItem,
  type CountryItem,
  type FeeItem,
  type FeeTypeItem,
} from '@/api/baseData'
import dayjs from 'dayjs'

interface Attatchment {
    id?: number | null
    auditerId?: number | null
    auditMemo?: string | null
    auditResult?: number | null
    auditTime?: string | null
    dirtType?: number | null
    fileName?: string | null
    fileNameN?: string | null
    fileNameO?: string | null
    fileSize?: number | null
    fileType?: string | null
    isAudit?: boolean | null
    isExtract?: boolean | null
    isUpload?: boolean | null
    neAudit?: boolean | null
    neExtract?: boolean | null
    orderId?: number | null
    remark?: string | null
    progress?: number | null
    status?: string | null
    logs?: string[] | null
}

type ExtractNode = {
  id: string
  label: string
  done: boolean
}

const EXTRACTION_STEPS: { id: string; label: string }[] = [
  { id: 'start', label: '开始' },
  { id: 'downloading', label: '下载文件' },
  { id: 'parsing', label: '处理文件' },
  { id: 'ocr', label: '提取信息' },
  { id: 'saving', label: '保存信息' },
  { id: 'success', label: '处理完成' }
]

const EXTRACTION_STEP_KEYWORDS: Record<string, string[]> = {
  start: ['start', '开始'],
  downloading: ['downloading', 'download', '下载文件', '下载'],
  parsing: ['parsing', 'parse', '处理文件', '解析'],
  ocr: ['ocr', '提取信息', '识别'],
  saving: ['saving', '保存信息', '保存'],
  success: ['success', '完成', '处理完成']
}

const createDefaultExtractionNodes = (): ExtractNode[] =>
  EXTRACTION_STEPS.map((step) => ({ ...step, done: false }))

const matchExtractionStepFromText = (text?: string | null): string | null => {
  if (text == null) return null
  const raw = String(text).trim()
  if (!raw) return null
  const normalized = raw.toLowerCase()
  for (const step of EXTRACTION_STEPS) {
    const keywords = EXTRACTION_STEP_KEYWORDS[step.id] || []
    for (const keyword of keywords) {
      if (keyword && normalized.includes(keyword.toLowerCase())) {
        return step.id
      }
    }
  }
  return null
}

interface BaseInfoForm {
  id?: number | null
  orderNo: string
  orderDate: string | null
  serviceId: number | null
  custAgentId: number | null
  customerId: number | null
  customsId: number | null
  transAgentId: number | null
  declarationType: number | null
  isAgentClear: boolean
  custPickup: boolean
  remark: string
  statuss: string
  waybillNo: string
  orgCountryId: number | null
  countryId: number | null
}

interface WaybillForm {
  id?: number | null
  custPortId: number | null
  destCityName: string | null
  waybillNo: string
  waybillDate: string | null
  shipperId?: number | null
  shipperName: string
  shipperContact: string
  shipperContactTel: string
  shipperAddress: string
  consigneeName: string
  consigneeContact: string
  consigneeContactTel: string
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

interface ReceivableForm {
  id?: number | null
  feeTypeId: number | null
  feeTypeName: string
  feeItemId: number | null
  feeItemName: string
  method: string
  price: number | null
  currency: string
  unit: string
  quantity: number | null
  amount: number | null
  remark: string
}

interface GoodsInfoForm {
  id?: number | null
  goodsName: string
  hsCode: string
  goodsSpec: string
  quantity: number | null
  price: number | null
  amount: number | null
  saber: string
}

interface GoodsInfoResponse {
  id?: number | null
  goodsName?: string | null
  hsCode?: string | null
  goodsSpec?: string | null
  quantity?: number | null
  price?: number | null
  amount?: number | null
  saber?: string | null
}

type GoodsInfoSubmit = {
  id: number | null
  goodsName: string
  hsCode: string
  goodsSpec: string
  quantity: number | null
  price: number | null
  amount: number | null
  saber: string
}

interface SalesQuoteItem {
  feeTypeId: number
  feeTypeName: string
  feeItemId: number
  feeItemName: string
  method: string
  price: number
  currency: string
  unit: string
  quantity: number
  remark?: string
}

interface SalesQuote {
  id: string
  name: string
  customer: string
  items: SalesQuoteItem[]
}

interface OrderDetailResponse {
  baseInfo: Partial<BaseInfoForm>
  waybill?: Partial<WaybillForm>
  containers?: Array<Partial<ContainerForm>>
  invoices?: Array<Partial<InvoiceForm>>
  receivables?: ReceivableResponse[]
  goodsInfos?: GoodsInfoResponse[]
  attachments?: Attatchment[]
}

interface OrderCreateDrawerProps {
  visible: boolean
  orderId?: number | null
  onClose: () => void
  onSuccess: (orderId?: number) => void
}

const createBaseInfoForm = (): BaseInfoForm => ({
  id: 0,
  orderNo: '',
  orderDate: null,
  serviceId: null,
  isAgentClear: false,
  declarationType: null,
  custAgentId: null,
  customerId: null,
  customsId: null,
  transAgentId: null,
  custPickup: false,
  remark: '',
  statuss: '',
  waybillNo: '',
  orgCountryId: null,
  countryId: null
})

const createWaybillForm = (): WaybillForm => ({
  id: 0,
  custPortId: 0,
  destCityName: '',
  waybillNo: '',
  waybillDate: null,
  shipperId: 0,
  shipperName: '',
  shipperContact: '',
  shipperContactTel: '',
  shipperAddress: '',
  consigneeName: '',
  consigneeContact: '',
  consigneeContactTel: '',
  consigneeAddress: '',
  custPort: '',
  quantity: null,
  ttlWeight: null,
  cubicVol: null,
  remark: ''
})

const createContainerForm = (): ContainerForm => ({
  id: 0,
  number: '',
  sizeType: '',
  quantity: null,
  weight: null,
  goodsInfo: '',
  remark: ''
})

const createInvoiceForm = (): InvoiceForm => ({
  id: 0,
  invoiceNo: '',
  bussType: '',
  transType: '',
  currency: '',
  ttlAmount: 0,
  exporter: '',
  remark: ''
})

interface ReceivableResponse {
  id?: number | null
  feeTypeId?: number | null
  feeTypeName?: string | null
  feeItemId?: number | null
  feeItemName?: string | null
  itemType?: number | null
  price?: number | null
  currency?: string | null
  itemUnit?: string | null
  quantity?: number | null
  amount?: number | null
  remark?: string | null
}

type ReceivableSubmit = {
  id: number | null
  feeTypeId: number | null
  feeItemId: number | null
  itemType: number
  price: number | null
  currency?: string
  itemUnit?: string
  quantity: number | null
  amount: number | null
  remark?: string
}

const RECEIVABLE_METHOD_FIXED = '固定'
const RECEIVABLE_METHOD_ACTUAL = '实报'

const methodCodeToLabel = (code?: number | null) =>
    code === 1 ? RECEIVABLE_METHOD_FIXED : (code === 2 ? RECEIVABLE_METHOD_ACTUAL : '-')
const methodLabelToCode = (label?: string) => (label === RECEIVABLE_METHOD_FIXED ? 1 : 0)
const formatFeeTypeName = (item?: FeeTypeItem) => item?.enName || item?.cnName || ''
const formatFeeItemName = (item?: FeeItem) => item?.enName || item?.cnName || ''
const normalizeName = (value?: string | null) => value?.trim().toLowerCase() ?? ''
const namesMatch = (a?: string | null, b?: string | null) =>
  Boolean(a && b && normalizeName(a) === normalizeName(b))

const createReceivableForm = (): ReceivableForm => ({
  id: 0,
  feeTypeId: null,
  feeTypeName: '',
  feeItemId: null,
  feeItemName: '',
  method: RECEIVABLE_METHOD_ACTUAL,
  price: null,
  currency: '',
  unit: '',
  quantity: null,
  amount: null,
  remark: ''
})

const createGoodsInfoForm = (): GoodsInfoForm => ({
  id: 0,
  goodsName: '',
  hsCode: '',
  goodsSpec: '',
  quantity: null,
  price: null,
  amount: null,
  saber: ''
})

const salesQuotes: SalesQuote[] = [
  {
    id: 'quote-1',
    name: '报价1',
    customer: '客户A',
    items: [
      {
        feeTypeId: 1001,
        feeTypeName: '装卸箱',
        feeItemId: 2001,
        feeItemName: '港口费',
        method: RECEIVABLE_METHOD_FIXED,
        price: 100,
        currency: 'SAR',
        unit: '柜',
        quantity: 1
      },
      {
        feeTypeId: 1001,
        feeTypeName: '装卸箱',
        feeItemId: 2002,
        feeItemName: '港口操作',
        method: RECEIVABLE_METHOD_FIXED,
        price: 100,
        currency: 'SAR',
        unit: '柜',
        quantity: 1
      },
      {
        feeTypeId: 1001,
        feeTypeName: '装卸箱',
        feeItemId: 2003,
        feeItemName: '宫殿费',
        method: RECEIVABLE_METHOD_ACTUAL,
        price: 100,
        currency: 'SAR',
        unit: '柜',
        quantity: 1
      }
    ]
  },
  {
    id: 'quote-2',
    name: '报价2',
    customer: '客户B',
    items: [
      {
        feeTypeId: 1101,
        feeTypeName: '运输',
        feeItemId: 2101,
        feeItemName: '干线运输',
        method: RECEIVABLE_METHOD_FIXED,
        price: 320,
        currency: 'SAR',
        unit: '票',
        quantity: 1
      },
      {
        feeTypeId: 1101,
        feeTypeName: '运输',
        feeItemId: 2102,
        feeItemName: '落地配送',
        method: RECEIVABLE_METHOD_ACTUAL,
        price: 180,
        currency: 'SAR',
        unit: '票',
        quantity: 1
      }
    ]
  }
]

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
  const [receivables, setReceivables] = useState<ReceivableForm[]>([createReceivableForm()])
  const [goodsInfos, setGoodsInfos] = useState<GoodsInfoForm[]>([createGoodsInfoForm()])
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('')
  const [customsOptions, setCustomsOptions] = useState<CustomsItem[]>([])
  const [customerOptions, setCustomerOptions] = useState<CustomerItem[]>([])
  const [custAgentOptions, setCustAgentOptions] = useState<AgentItem[]>([])
  const [custPortOptions, setCustPortOptions] = useState<CustPortItem[]>([])
  const [shippingOptions, setShippingOptions] = useState<ShippingItem[]>([])
  const [countryOptions, setCountryOptions] = useState<CountryItem[]>([])
  const [feeTypeOptions, setFeeTypeOptions] = useState<FeeTypeItem[]>([])
  const [feeItemOptions, setFeeItemOptions] = useState<FeeItem[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const eventSourcesRef = useRef<Record<number, EventSource | null>>({})
  const [extractModalOpen, setExtractModalOpen] = useState(false)
  const [extractingAttachmentId, setExtractingAttachmentId] = useState<number | null>(null)
  const [extractNodesMap, setExtractNodesMap] = useState<Record<number, ExtractNode[]>>({})

  const updateNodesForAttachment = (attachmentId: number, updater: (nodes: ExtractNode[]) => ExtractNode[]) => {
    setExtractNodesMap((prev) => {
      const base = prev[attachmentId]
      const nodes = base ? base.map((node) => ({ ...node })) : createDefaultExtractionNodes()
      const updatedNodes = updater(nodes)
      return { ...prev, [attachmentId]: updatedNodes }
    })
  }

  const mergeNodesFromPayload = (attachmentId: number, payloadNodes: any[]) => {
    if (!Array.isArray(payloadNodes) || payloadNodes.length === 0) return
    updateNodesForAttachment(attachmentId, (currentNodes) => {
      const updatedNodes = [...currentNodes]
      payloadNodes.forEach((nodePayload, idx) => {
        if (!nodePayload) return
        const labelText = nodePayload.label ?? nodePayload.name ?? nodePayload.status ?? ''
        const matchedStepId = matchExtractionStepFromText(labelText)
        if (matchedStepId) {
          const stepIdx = updatedNodes.findIndex((node) => node.id === matchedStepId)
          if (stepIdx >= 0) {
            const explicitDone = typeof nodePayload.done === 'boolean' ? nodePayload.done : undefined
            updatedNodes[stepIdx] = {
              ...updatedNodes[stepIdx],
              label: EXTRACTION_STEPS.find((step) => step.id === matchedStepId)?.label ?? updatedNodes[stepIdx].label,
              done: explicitDone ?? updatedNodes[stepIdx].done
            }
          }
          return
        }
        const fallbackId = String(nodePayload.id ?? nodePayload.name ?? idx)
        const fallbackLabel = labelText || fallbackId
        const existingIdx = updatedNodes.findIndex((node) => node.id === fallbackId || node.label === fallbackLabel)
        if (existingIdx >= 0) {
          const explicitDone = typeof nodePayload.done === 'boolean' ? nodePayload.done : undefined
          updatedNodes[existingIdx] = {
            ...updatedNodes[existingIdx],
            label: fallbackLabel,
            done: explicitDone ?? updatedNodes[existingIdx].done
          }
        } else {
          updatedNodes.push({
            id: fallbackId,
            label: fallbackLabel,
            done: Boolean(nodePayload.done)
          })
        }
      })
      return updatedNodes
    })
  }

  const markStepByText = (attachmentId: number, text?: string | null) => {
    const stepId = matchExtractionStepFromText(text)
    if (!stepId) return
    updateNodesForAttachment(attachmentId, (nodes) =>
      nodes.map((node) => (node.id === stepId ? { ...node, done: true } : node))
    )
  }

  const isEditMode = useMemo(() => orderId != null, [orderId])
  const goodsTotalAmount = useMemo(
    () => goodsInfos.reduce((sum, item) => sum + (item.amount ?? 0), 0),
    [goodsInfos]
  )

  const resetForms = () => {
    setBaseInfoForm(createBaseInfoForm())
    setWaybillForm(createWaybillForm())
    setContainers([createContainerForm()])
    setInvoices([createInvoiceForm()])
    setReceivables([createReceivableForm()])
    setGoodsInfos([createGoodsInfoForm()])
    setSelectedQuoteId('')
    setAttachments([])
    setExtractNodesMap({})
  }

  const loadBaseOptions = async () => {
    try {
      const [customs, shippings, customers, agents, ports, countries, feeTypes, feeItems] = await Promise.all([
        fetchCustoms(),
        fetchShippings(),
        fetchCustomers(),
        fetchCustAgents(),
        fetchCustPorts(),
        fetchCountries(),
        fetchFeeTypes(),
        fetchFeeItems(),
      ])
      setCustomsOptions(customs)
      setShippingOptions(shippings)
      setCustomerOptions(customers)
      setCustAgentOptions(agents)
      setCustPortOptions(ports)
      setCountryOptions(countries)
      setFeeTypeOptions(feeTypes)
      setFeeItemOptions(feeItems)
    } catch (err) {
      console.error('load base options failed', err)
    }
  }

  const populateFromDetail = (detail: OrderDetailResponse) => {
    const newBaseInfo = {
      ...createBaseInfoForm(),
      ...detail.baseInfo,
      orderDate: normalizeDateValue(detail.baseInfo?.orderDate ?? dayjs().format('YYYY-MM-DD')),
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

    setReceivables(
      detail.receivables && detail.receivables.length > 0
        ? detail.receivables.map((item) => ({
            id: item.id ?? null,
            feeTypeId: item.feeTypeId ?? null,
            feeTypeName: item.feeTypeName ?? '',
            feeItemId: item.feeItemId ?? null,
            feeItemName: item.feeItemName ?? '',
            method: methodCodeToLabel(item.itemType),
            price: item.price ?? null,
            currency: item.currency ?? '',
            unit: item.itemUnit ?? '',
            quantity: item.quantity ?? null,
            amount: item.amount ?? null,
            remark: item.remark ?? ''
          }))
        : [createReceivableForm()]
    )

    setGoodsInfos(
      detail.goodsInfos && detail.goodsInfos.length > 0
        ? detail.goodsInfos.map((item) => ({
            id: item.id ?? null,
            goodsName: item.goodsName ?? '',
            hsCode: item.hsCode ?? '',
            goodsSpec: item.goodsSpec ?? '',
            quantity: item.quantity ?? null,
            price: item.price ?? null,
            amount: item.amount ?? null,
            saber: item.saber ?? ''
          }))
        : [createGoodsInfoForm()]
    )

    setExtractNodesMap({})
    setAttachments(detail.attachments && detail.attachments.length > 0 ? detail.attachments : [])
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

useSmartEffect({
  once: true,
  effect: () => {
    loadBaseOptions()
  },
})

  useSmartEffect<number>({
  enabled: visible,
  key: orderId,
  effect: (id) => {
    if (id) loadOrderDetail(id)
    else resetForms()
  },
})

  useEffect(() => {
    if (!waybillForm.custPortId) {
      setWaybillForm((prev) => ({ ...prev, custPort: '' }))
      return
    }
    const selected = custPortOptions.find((item) => item.id === waybillForm.custPortId)
    if (selected) {
      setWaybillForm((prev) => ({
        ...prev,
        custPort: selected.enName || selected.cnName || selected.code || ''
      }))
    }
  }, [waybillForm.custPortId, custPortOptions])

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

  const addGoodsInfo = () => setGoodsInfos([...goodsInfos, createGoodsInfoForm()])
  const removeGoodsInfo = (index: number) => {
    if (goodsInfos.length === 1) return
    setGoodsInfos(goodsInfos.filter((_, i) => i !== index))
  }
  const updateGoodsInfo = (index: number, field: keyof GoodsInfoForm, value: any) => {
    const updated = [...goodsInfos]
    const nextItem = { ...updated[index], [field]: value }
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? (value as number | null) : nextItem.quantity
      const price = field === 'price' ? (value as number | null) : nextItem.price
      nextItem.amount =
        quantity != null && price != null ? Number((quantity * price).toFixed(2)) : null
    }
    updated[index] = nextItem
    setGoodsInfos(updated)
  }

  const addReceivable = () => setReceivables([...receivables, createReceivableForm()])
  const removeReceivable = (index: number) => {
    if (receivables.length === 1) return
    setReceivables(receivables.filter((_, i) => i !== index))
  }
  const updateReceivable = (index: number, field: keyof ReceivableForm, value: any) => {
    const updated = [...receivables]
    const nextItem = { ...updated[index], [field]: value }
    if (field === 'price' || field === 'quantity') {
      const price = field === 'price' ? (value as number | null) : nextItem.price
      const quantity = field === 'quantity' ? (value as number | null) : nextItem.quantity
      nextItem.amount =
        price != null && quantity != null ? Number((price * quantity).toFixed(2)) : null
    }
    updated[index] = nextItem
    setReceivables(updated)
  }

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuoteId(quoteId)
    const quote = salesQuotes.find((item) => item.id === quoteId)
    if (!quote) return
    const mapped = quote.items.map((item) => {
      const matchedType =
        feeTypeOptions.find((type) => type.id === item.feeTypeId) ??
        feeTypeOptions.find(
          (type) =>
            namesMatch(type.cnName, item.feeTypeName) ||
            namesMatch(type.enName, item.feeTypeName)
        )
      const matchedItem =
        feeItemOptions.find((feeItem) => feeItem.id === item.feeItemId) ??
        feeItemOptions.find(
          (feeItem) =>
            namesMatch(feeItem.cnName, item.feeItemName) ||
            namesMatch(feeItem.enName, item.feeItemName)
        )
      const derivedTypeId =
        matchedType?.id ??
        matchedItem?.feeTypeId ??
        (item.feeTypeId != null && feeTypeOptions.some((type) => type.id === item.feeTypeId)
          ? item.feeTypeId
          : null)
      const fallbackType =
        matchedItem?.feeTypeId != null
          ? feeTypeOptions.find((type) => type.id === matchedItem.feeTypeId)
          : undefined
      const derivedTypeName =
        matchedType != null
          ? formatFeeTypeName(matchedType)
          : fallbackType != null
          ? formatFeeTypeName(fallbackType)
          : item.feeTypeName
      const derivedItemId =
        matchedItem?.id ??
        (item.feeItemId != null && feeItemOptions.some((option) => option.id === item.feeItemId)
          ? item.feeItemId
          : null)

      return {
        id: 0,
        feeTypeId: derivedTypeId,
        feeTypeName: derivedTypeName || '',
        feeItemId: derivedItemId,
        feeItemName: matchedItem ? formatFeeItemName(matchedItem) : item.feeItemName,
        method: item.method,
        price: item.price,
        currency: item.currency,
        unit: item.unit,
        quantity: item.quantity,
        amount: Number((item.price * item.quantity).toFixed(2)),
        remark: item.remark ?? ''
      }
    })
    setReceivables(mapped)
  }

  const handleReceivableTypeChange = (index: number, value: string) => {
    const updated = [...receivables]
    const numericValue = value ? Number(value) : null
    const typeOption = feeTypeOptions.find((type) => type.id === numericValue)
    updated[index] = {
      ...updated[index],
      feeTypeId: numericValue,
      feeTypeName: typeOption ? formatFeeTypeName(typeOption) : '',
    }

    const currentItemId = updated[index].feeItemId
    if (
      currentItemId != null &&
      !feeItemOptions.some((item) => item.id === currentItemId && item.feeTypeId === numericValue)
    ) {
      updated[index].feeItemId = null
      updated[index].feeItemName = ''
    }

    setReceivables(updated)
  }

  const handleReceivableItemChange = (index: number, value: string) => {
    const updated = [...receivables]
    const numericValue = value ? Number(value) : null
    const itemOption = feeItemOptions.find((item) => item.id === numericValue)
    const typeOption =
      itemOption?.feeTypeId != null
        ? feeTypeOptions.find((type) => type.id === itemOption.feeTypeId)
        : undefined

    const existingUnit = updated[index].unit
    const resolvedUnit =
      existingUnit && existingUnit.length > 0 ? existingUnit : itemOption?.itemUnit ?? ''

    updated[index] = {
      ...updated[index],
      feeItemId: numericValue,
      feeItemName: itemOption ? formatFeeItemName(itemOption) : '',
      feeTypeId: itemOption?.feeTypeId ?? updated[index].feeTypeId,
      feeTypeName:
        itemOption?.feeTypeId != null
          ? formatFeeTypeName(typeOption)
          : updated[index].feeTypeName,
      unit: resolvedUnit
    }

    setReceivables(updated)
  }

  const handleSubmit = async () => {
    const normalizedContainers = containers.filter(
      (item) => item.number || item.sizeType || item.goodsInfo || item.quantity !== null || item.weight !== null
    )

    const normalizedInvoices = invoices.filter(
      (item) => item.invoiceNo || item.bussType || item.transType || item.currency || item.exporter
    )

    const normalizedGoodsInfos: GoodsInfoSubmit[] = goodsInfos
      .map<GoodsInfoSubmit | null>((item) => {
        const computedTotal =
          item.amount ??
          (item.quantity != null && item.price != null
            ? Number((item.quantity * item.price).toFixed(2))
            : null)
        const payload: GoodsInfoSubmit = {
          id: item.id ?? null,
          goodsName: item.goodsName.trim(),
          hsCode: item.hsCode.trim(),
          goodsSpec: item.goodsSpec.trim(),
          quantity: item.quantity ?? null,
          price: item.price ?? null,
          amount: computedTotal,
          saber: typeof item.saber === 'string' ? item.saber.trim() : (item.saber ?? '')
        }
        const shouldKeep =
          payload.goodsName ||
          payload.hsCode ||
          payload.goodsSpec ||
          payload.quantity != null ||
          payload.price != null ||
          payload.amount != null ||
          payload.saber
        return shouldKeep ? payload : null
      })
      .filter((item): item is GoodsInfoSubmit => item !== null)

    const normalizedReceivables: ReceivableSubmit[] = receivables
      .map<ReceivableSubmit | null>((item) => {
        const computedAmount =
          item.amount ??
          (item.price != null && item.quantity != null
            ? Number((item.price * item.quantity).toFixed(2))
            : null)
        const payload: ReceivableSubmit = {
          id: item.id ?? null,
          feeTypeId: item.feeTypeId,
          feeItemId: item.feeItemId,
          itemType: methodLabelToCode(item.method),
          price: item.price ?? null,
          currency: item.currency || undefined,
          itemUnit: item.unit || undefined,
          quantity: item.quantity ?? null,
          amount: computedAmount,
          remark: item.remark || undefined
        }
        const shouldKeep =
          item.feeItemId != null ||
          item.feeTypeId != null ||
          item.feeItemName ||
          item.feeTypeName ||
          item.method ||
          item.price != null ||
          item.currency ||
          item.unit ||
          item.quantity != null
        return shouldKeep ? payload : null
      })
      .filter((item): item is ReceivableSubmit => item !== null)

    setSubmitting(true)
    try {
      const payload = {
        baseInfo: baseInfoForm,
        waybill: waybillForm,
        containers: normalizedContainers,
        invoices: normalizedInvoices,
        goodsInfos: normalizedGoodsInfos,
        receivables: normalizedReceivables
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

  const handleFileUpload = async (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return
    if (!orderId) {
      toast.warning('只有在编辑订单时才能上传文件')
      return
    }

    const file = files[0]
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucketName', 'advship-hn1-tc')
      formData.append('appName', 'advship')
      formData.append('areaName', 'bzss')
      formData.append('ownerKey', 'order')
      formData.append('ownerId', String(orderId))
      
      const res = await request.post('/oss/api/OSS/UploadFile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const updatedAttachments = [...attachments]
      const newAttachment = {
        ...updatedAttachments[index],
        //fileName: (res.data as any)?.fileName || file.name,
        isAudit: 0,
        fileNameN: (res.data as any)?.fileNameN || file.name,
        fileNameO: (res.data as any)?.fileNameO || file.name,
        fileType: (res.data as any)?.fileType || file.name.split('.').pop() || 'unknown',
        url: (res.data as any)?.url || (res.data as any)?.filePath || '',
        isUpload: 1
      }
      updatedAttachments[index] = newAttachment
      setAttachments(updatedAttachments)
      
      // Save attachment to tb_Order_Attachment
      try {
        if (newAttachment.id) {
          // Update existing attachment
          await request.put('/bzss/api/Attachment', {
            id: newAttachment.id,
            orderId: orderId,
            fileName: newAttachment.fileName,
            fileNameN: newAttachment.fileNameN,
            fileNameO: newAttachment.fileNameO,
            fileType: newAttachment.fileType,
            neAudit: newAttachment.neAudit,
            isAudit: newAttachment.isAudit,
            neExtract: newAttachment.neExtract,
            dirtType: newAttachment.dirtType,
            remark: newAttachment.remark || '',
            isUpload: newAttachment.isUpload
          })
        }
      } catch (saveError) {
        console.error('Failed to save attachment', saveError)
      }
      
      toast.success('文件上传成功')
    } catch (error) {
      console.error('upload failed', error)
      toast.error('文件上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleExtractAttachment = async (attachmentId: number) => {
    try {
      setUploading(true)
      await request.post(`/bzss/api/Attachment/${attachmentId}/Extract`)
      toast.success('已开始提取，实时进度正在显示')

      // open SSE (EventSource) to subscribe to progress
      const orderId = baseInfoForm.id
      if (!orderId) return

      // avoid duplicate connections
      if (eventSourcesRef.current[attachmentId]) {
        return
      }

      const rawBase = import.meta.env.VITE_API_BASE_URL || ''
      const base = String(rawBase).replace(/\/$/, '')
      const esUrl = base
        ? `${base}/bzss/api/Attachment/${orderId}/Extract/Subscribe?attachmentId=${attachmentId}`
        : `/bzss/api/Attachment/${orderId}/Extract/Subscribe?attachmentId=${attachmentId}`
      const es = new EventSource(esUrl)
      eventSourcesRef.current[attachmentId] = es
      // open modal to show progress
      setExtractingAttachmentId(attachmentId)
      setExtractModalOpen(true)
      setExtractNodesMap((prev) => {
        if (prev[attachmentId]) return prev
        return { ...prev, [attachmentId]: createDefaultExtractionNodes() }
      })

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data)

          // update generic attachment fields (status/progress/logs) as before
          setAttachments((prev) => prev.map((f: any) => {
            if (f.id === attachmentId) {
              const logs = [...(f.logs || [])]
              const incomingText = payload.message ?? payload.status ?? ''
              if (incomingText) {
                const lastLog = logs[logs.length - 1]
                if (lastLog !== incomingText) {
                  logs.push(incomingText)
                }
              }
              return {
                ...f,
                progress: payload.progress ?? f.progress,
                status: payload.status ?? payload.message ?? f.status,
                logs,
              }
            }
            return f
          }))

          if (payload.nodes && Array.isArray(payload.nodes)) {
            mergeNodesFromPayload(attachmentId, payload.nodes)
          }

          if (payload.node) {
            mergeNodesFromPayload(attachmentId, [payload.node])
          }

          markStepByText(attachmentId, payload.status)
          markStepByText(attachmentId, payload.message)

          if (payload.done === true) {
            // mark all nodes done
            updateNodesForAttachment(attachmentId, (nodes) => nodes.map((n) => ({ ...n, done: true })))

            // close EventSource for this attachment
            try { es.close() } catch {}
            delete eventSourcesRef.current[attachmentId]
            toast.success('文件信息提取完成')
            if (extractingAttachmentId === attachmentId) {
              setExtractModalOpen(false)
              setExtractingAttachmentId(null)
            }
          }
        } catch (err) {
          console.error('Failed to parse SSE message', err)
        }
      }

      es.onerror = () => {
        try { es.close() } catch {}
        delete eventSourcesRef.current[attachmentId]
        toast.error('实时进度连接已断开')
      }

      toast.success('已开始提取，请稍后查看结果')
    } catch (error) {
      console.error('Extract failed', error)
      toast.error('文件信息提取失败')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForms()
  }

  // Cleanup EventSources on unmount
  useEffect(() => {
    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => {
        try { es?.close() } catch {}
      })
      eventSourcesRef.current = {}
    }
  }, [])

  const currentAttachment = attachments.find((a) => a.id === extractingAttachmentId)
  const currentAttachmentNodes = useMemo(() => {
    if (!currentAttachment || typeof currentAttachment.id !== 'number') {
      return createDefaultExtractionNodes()
    }
    return extractNodesMap[currentAttachment.id] ?? createDefaultExtractionNodes()
  }, [currentAttachment, extractNodesMap])

  return (
    <Sheet open={visible} onOpenChange={(open: boolean) => !open && handleClose()}>
      <SheetContent className="w-[80vw] sm:max-w-[80vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? '更新订单' : '创建订单'}</SheetTitle>
        </SheetHeader>

        <Loading loading={detailLoading}>
          <div className="py-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>客户名称</Label>
                  <Select value={String(baseInfoForm.customerId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, customerId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择客户" /></SelectTrigger>
                    <SelectContent>
                      {customerOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>出口国家</Label>
                  <Select value={String(baseInfoForm.orgCountryId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, orgCountryId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择出口国家" /></SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code2}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>出口公司</Label>
                  <Input readOnly value={waybillForm.shipperName || ''} placeholder="请输入出口公司" />
                </div>
                <div className="space-y-2">
                  <Label>进口国家</Label>
                  <Select value={String(baseInfoForm.countryId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, countryId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择进口国家" /></SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code2}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>目的城市</Label>
                  <Input value={waybillForm.destCityName || ''} onChange={(e) => setWaybillForm({ ...waybillForm, destCityName: e.target.value })} placeholder="请输入目的城市" />
                </div>
                <div className="space-y-2">
                  <Label>目的港口</Label>
                  <Select value={String(waybillForm.custPortId || '')} onValueChange={(v) => setWaybillForm({ ...waybillForm, custPortId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择目的港口" /></SelectTrigger>
                    <SelectContent>
                      {custPortOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>                 
                </div>
                <div className="space-y-2">
                  <Label>目的地海关</Label>
                  <Select value={String(baseInfoForm.customsId || '')} onValueChange={(v) => setBaseInfoForm({ ...baseInfoForm, customsId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择目的地海关" /></SelectTrigger>
                    <SelectContent>
                      {customsOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.cnName || item.enName || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>                 
                </div>
                <div className="space-y-2">
                  <Label>航司名称</Label>
                  <Select value={String(waybillForm.shipperId || '')} onValueChange={(v) => setWaybillForm({ ...waybillForm, shipperId: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="选择航司" /></SelectTrigger>
                    <SelectContent>
                      {shippingOptions.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>{item.sName || item.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>代理清关</Label>
                  <Select value={baseInfoForm.isAgentClear ? "true" : "false"} onValueChange={(value) => setBaseInfoForm({ ...baseInfoForm, isAgentClear: value === "true" })}>
                    <SelectTrigger><SelectValue placeholder="代理清关" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>                  
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
                  <Label>申报类型</Label>
                  <Select value={String(baseInfoForm.declarationType || 0)} onValueChange={(value) => setBaseInfoForm({ ...baseInfoForm, declarationType: value ? Number(value) : 0 })}>
                    <SelectTrigger><SelectValue placeholder="申报类型" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">进口申报</SelectItem>
                      <SelectItem value="2">立即清关</SelectItem>
                    </SelectContent>
                  </Select>                  
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>备注</Label>
                  <Textarea value={baseInfoForm.remark} onChange={(e) => setBaseInfoForm({ ...baseInfoForm, remark: e.target.value })} placeholder="请输入备注" rows={2} />
                </div>
            </CardContent>
          </Card>

            {/* Attachments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>附件(文件上传)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttachments([...attachments, { id: Math.random(), fileName: '', fileNameN: '', fileNameO: '', fileType: '', dirtType: 0, isUpload: 0, remark: '', isAudit: 0 }])}
                  disabled={!isEditMode}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加记录
                </Button>
              </CardHeader>
              <CardContent>
                {attachments.length === 0 ? (
                  <div className="py-6 text-center text-muted-foreground">暂无附件</div>
                ) : (
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">文件类型</TableHead>
                          <TableHead className="w-[240px]">文件上传</TableHead>
                          <TableHead className="w-[200px]">文件名(原)</TableHead>
                          <TableHead className="w-[100px]">状态</TableHead>
                          <TableHead>备注</TableHead>
                          <TableHead className="w-[80px]">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attachments.map((file: any, index: number) => {
                          const numericAttachmentId =
                            typeof file.id === 'number'
                              ? file.id
                              : typeof file.id === 'string' && file.id.trim() !== ''
                                ? Number(file.id)
                                : null
                          const nodeList =
                            typeof numericAttachmentId === 'number' && !Number.isNaN(numericAttachmentId)
                              ? extractNodesMap[numericAttachmentId]
                              : undefined
                          return (
                          <TableRow key={file.id}>
                            <TableCell>
                              <Input
                                type="text"
                                placeholder="请输入文件类型"
                                value={String(file.fileName || '')}
                                readOnly
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="file"
                                id={`file-input-${index}`}
                                accept=".pdf,.xlsx,.xls,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e.target.files, index)}
                                disabled={uploading || !isEditMode}
                                className="hidden"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                                disabled={uploading || !isEditMode}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                {uploading ? '上传中' : '选择'}
                              </Button>
                              {file.isUpload === 1 && file.neExtract === true && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExtractAttachment(file.id)}
                                  disabled={uploading}
                                  className="ml-2"
                                >
                                  提取
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={file.fileNameO || ''}
                                readOnly
                                className="text-xs"
                                placeholder="-"
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              {file.isAudit === 1 ? '已审核' : file.isUpload === 1 ? '已上传':'待上传'}
                              <div className="mt-2 space-y-2">
                                <div className="text-xs text-muted-foreground">
                                  {file.status ? `最新状态：${file.status}` : '暂无最新状态'}
                                </div>
                                {nodeList && nodeList.length > 0 ? (
                                  <div className="max-h-32 space-y-1 overflow-y-auto rounded border bg-muted/40 p-2">
                                    {nodeList.map((node) => (
                                      <label key={`${numericAttachmentId ?? index}-${node.id}`} className="flex items-center space-x-2 text-xs">
                                        <input type="checkbox" checked={node.done} readOnly className="h-3 w-3" />
                                        <span className={node.done ? 'text-muted-foreground line-through' : ''}>{node.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : file.logs && file.logs.length > 0 ? (
                                  <div className="text-xs text-muted-foreground">最新消息：{file.logs[file.logs.length - 1]}</div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">暂无节点信息</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={file.remark || ''}
                                onChange={(e) => {
                                  const updated = [...attachments]
                                  updated[index].remark = e.target.value
                                  setAttachments(updated)
                                }}
                                placeholder="备注"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              {file.isUpload === 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={async () => {
                                    // Clear the file input
                                    const fileInput = document.getElementById(`file-input-${index}`) as HTMLInputElement
                                    if (fileInput) {
                                      fileInput.value = ''
                                    }
                                    // Reset attachment fields
                                    const updatedAttachments = [...attachments]
                                    updatedAttachments[index] = {
                                      ...updatedAttachments[index],
                                      fileNameN: '',
                                      fileNameO: '',
                                      fileType: '',
                                      isUpload: 0
                                    }
                                    setAttachments(updatedAttachments)
                                    const clearedAttachmentId =
                                      typeof file.id === 'number'
                                        ? file.id
                                        : typeof file.id === 'string' && file.id.trim() !== ''
                                          ? Number(file.id)
                                          : NaN
                                    if (!Number.isNaN(clearedAttachmentId)) {
                                      setExtractNodesMap((prev) => {
                                        if (!prev[clearedAttachmentId]) return prev
                                        const next = { ...prev }
                                        delete next[clearedAttachmentId]
                                        return next
                                      })
                                    }

                                    // Update to backend
                                    try {
                                      if (file.id) {
                                        await request.put('/bzss/api/Attachment', {
                                          id: file.id,
                                          orderId: orderId,
                                          fileName: updatedAttachments[index].fileName,
                                          fileNameN: '',
                                          fileNameO: '',
                                          isAudit: updatedAttachments[index].isAudit,
                                          fileType: updatedAttachments[index].fileType,
                                          neAudit: updatedAttachments[index].neAudit,
                                          neExtract: updatedAttachments[index].neExtract,
                                          dirtType: updatedAttachments[index].dirtType,
                                          remark: updatedAttachments[index].remark || '',
                                          isUpload: 0
                                        })
                                        toast.success('文件已清除')
                                      }
                                    } catch (error) {
                                      console.error('Failed to clear attachment', error)
                                      toast.error('清除文件失败')
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Receivables */}
            <Card>
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle>应收项目</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <Select value={selectedQuoteId} onValueChange={handleQuoteSelect}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="选择销售报价" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesQuotes.map((quote) => (
                          <SelectItem key={quote.id} value={quote.id}>
                            {quote.name}（{quote.customer}）
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={addReceivable}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加收入项
                  </Button>
                </div>
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
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivables.map((item, index) => (
                        <TableRow key={`receivable-${index}`}>
                          <TableCell>
                            <Select
                              value={item.feeTypeId != null ? String(item.feeTypeId) : undefined}
                              onValueChange={(value) => handleReceivableTypeChange(index, value)}
                              disabled={feeTypeOptions.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={item.feeTypeName || '选择类型'} />
                              </SelectTrigger>
                              <SelectContent>
                                {feeTypeOptions.map((type) => (
                                  <SelectItem key={type.id} value={String(type.id)}>
                                    {formatFeeTypeName(type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.feeItemId != null ? String(item.feeItemId) : undefined}
                              onValueChange={(value) => handleReceivableItemChange(index, value)}
                              disabled={feeItemOptions.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={item.feeItemName || '选择项目'} />
                              </SelectTrigger>
                              <SelectContent>
                                {feeItemOptions
                                  .filter((option) =>
                                    item.feeTypeId ? option.feeTypeId === item.feeTypeId : true
                                  )
                                  .map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                      {formatFeeItemName(option)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.method || ''}
                              onValueChange={(value) => updateReceivable(index, 'method', value)}
                            >
                              <SelectTrigger>
                              <SelectValue placeholder="选择方式" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={RECEIVABLE_METHOD_FIXED}>{RECEIVABLE_METHOD_FIXED}</SelectItem>
                                <SelectItem value={RECEIVABLE_METHOD_ACTUAL}>{RECEIVABLE_METHOD_ACTUAL}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.price ?? ''}
                              onChange={(e) =>
                                updateReceivable(
                                  index,
                                  'price',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.currency}
                              onChange={(e) => updateReceivable(index, 'currency', e.target.value)}
                              placeholder="币种"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.unit}
                              onChange={(e) => updateReceivable(index, 'unit', e.target.value)}
                              placeholder="单位"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity ?? ''}
                              onChange={(e) =>
                                updateReceivable(
                                  index,
                                  'quantity',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="数量"
                            />
                          </TableCell>
                          <TableCell>
                            <Input value={item.amount ?? ''} readOnly placeholder="自动计算" />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.remark}
                              onChange={(e) => updateReceivable(index, 'remark', e.target.value)}
                              placeholder="备注"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={receivables.length === 1}
                              onClick={() => removeReceivable(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  <Label>发货人名称</Label>
                  <Input value={waybillForm.shipperName} onChange={(e) => setWaybillForm({ ...waybillForm, shipperName: e.target.value })} placeholder="请输入发货人名称" />
                </div>
                <div className="space-y-2">
                  <Label>收货人名称</Label>
                  <Input value={waybillForm.consigneeName} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeName: e.target.value })} placeholder="请输入收货人名称" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-4">
                    <Label>发货联系人</Label>
                    <Input value={waybillForm.shipperContact} onChange={(e) => setWaybillForm({ ...waybillForm, shipperContact: e.target.value })} placeholder="请输入发货联系人" />
                  </div>
                  <div className="space-y-4">
                    <Label>发货联系人电话</Label>
                    <Input value={waybillForm.shipperContactTel} onChange={(e) => setWaybillForm({ ...waybillForm, shipperContactTel: e.target.value })} placeholder="请输入发货联系人电话" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-4">
                    <Label>收货联系人</Label>
                    <Input value={waybillForm.consigneeContact} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeContact: e.target.value })} placeholder="请输入收货联系人" />
                  </div>
                  <div className="space-y-4">
                    <Label>收货联系人电话</Label>
                    <Input value={waybillForm.consigneeContactTel} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeContactTel: e.target.value })} placeholder="请输入收货联系人电话" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>发货人地址</Label>
                  <Input value={waybillForm.shipperAddress} onChange={(e) => setWaybillForm({ ...waybillForm, shipperAddress: e.target.value })} placeholder="请输入发货人地址" />
                </div>
                <div className="space-y-2">
                  <Label>收货人地址</Label>
                  <Input value={waybillForm.consigneeAddress} onChange={(e) => setWaybillForm({ ...waybillForm, consigneeAddress: e.target.value })} placeholder="请输入收货人地址" />
                </div>
                 <div className="space-y-2">
                  <Label>提单号</Label>
                  <Input value={waybillForm.waybillNo} onChange={(e) => setWaybillForm({ ...waybillForm, waybillNo: e.target.value })} placeholder="请输入提单号" />
                </div>
                <div className="space-y-2">
                  <Label>提单日期</Label>
                  <Input type="date" value={waybillForm.waybillDate || ''} onChange={(e) => setWaybillForm({ ...waybillForm, waybillDate: e.target.value || null })} />
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
                <CardTitle>货柜信息</CardTitle>
                <Button variant="outline" size="sm" onClick={addContainer}><Plus className="w-4 h-4 mr-1" />新增</Button>
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
                              <Trash2 className="w-4 h-4 text-destructive" />
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
                <Button variant="outline" size="sm" onClick={addInvoice}>
                  <Plus className="w-4 h-4 mr-1" />
                  新增
                </Button>
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
                          <TableCell>
                            <Input
                              value={item.invoiceNo}
                              onChange={(e) => updateInvoice(index, 'invoiceNo', e.target.value)}
                              placeholder="发票号"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.bussType}
                              onChange={(e) => updateInvoice(index, 'bussType', e.target.value)}
                              placeholder="业务类型"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.currency}
                              onChange={(e) => updateInvoice(index, 'currency', e.target.value)}
                              placeholder="SAR/USD"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.ttlAmount ?? ''}
                              onChange={(e) =>
                                updateInvoice(
                                  index,
                                  'ttlAmount',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.exporter}
                              onChange={(e) => updateInvoice(index, 'exporter', e.target.value)}
                              placeholder="出口商"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={invoices.length === 1}
                              onClick={() => removeInvoice(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Goods Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>产品信息</CardTitle>
                <Button variant="outline" size="sm" onClick={addGoodsInfo}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加产品
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px]">产品名称*</TableHead>
                        <TableHead className="w-[140px]">HSCode*</TableHead>
                        <TableHead className="w-[140px]">型号*</TableHead>
                        <TableHead className="w-[120px]">数量(箱)*</TableHead>
                        <TableHead className="w-[140px]">单价(CNF美元)*</TableHead>
                        <TableHead className="w-[150px]">总CNF价格(美元)*</TableHead>
                        <TableHead className="w-[160px]">SABER文件</TableHead>
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {goodsInfos.map((item, index) => (
                        <TableRow key={`goods-${index}`}>
                          <TableCell>
                            <Input
                              value={item.goodsName}
                              onChange={(e) =>
                                updateGoodsInfo(index, 'goodsName', e.target.value)
                              }
                              placeholder="请输入产品名称"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.hsCode}
                              onChange={(e) => updateGoodsInfo(index, 'hsCode', e.target.value)}
                              placeholder="请输入HSCode"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.goodsSpec}
                              onChange={(e) => updateGoodsInfo(index, 'goodsSpec', e.target.value)}
                              placeholder="型号"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity ?? ''}
                              onChange={(e) =>
                                updateGoodsInfo(
                                  index,
                                  'quantity',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.price ?? ''}
                              onChange={(e) =>
                                updateGoodsInfo(
                                  index,
                                  'price',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.amount ?? ''}
                              onChange={(e) =>
                                updateGoodsInfo(
                                  index,
                                  'amount',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.saber}
                              onChange={(e) => updateGoodsInfo(index, 'saber', e.target.value)}
                              placeholder="SABER文件"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={goodsInfos.length === 1}
                              onClick={() => removeGoodsInfo(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-end px-6 py-3 text-sm border-t text-muted-foreground">
                    总计
                    <span className="ml-2 text-base font-semibold text-foreground">
                      {goodsTotalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Loading>

        {/* Extraction progress modal */}
        <Dialog open={extractModalOpen} onOpenChange={(open) => setExtractModalOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentAttachment?.fileName ?? '文件提取进度'}</DialogTitle>
              <DialogDescription>{currentAttachment?.status ?? '正在提取中'}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2 overflow-y-auto max-h-64">
                {currentAttachmentNodes.map((n) => (
                  <label key={n.id} className="flex items-center space-x-2">
                    <input type="checkbox" checked={n.done} readOnly className="w-4 h-4" />
                    <span className={`text-sm ${n.done ? 'text-muted-foreground line-through' : ''}`}>{n.label}</span>
                  </label>
                ))}
              </div>
              {(currentAttachment?.logs?.length ?? 0) > 0 && (
                <div className="p-2 overflow-y-auto text-sm rounded max-h-48 bg-muted">
                  {(currentAttachment?.logs || []).map((l: any, i: number) => (
                    <div key={i} className="text-xs">{l}</div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setExtractModalOpen(false); setExtractingAttachmentId(null); }} disabled={Boolean(extractingAttachmentId && eventSourcesRef.current[extractingAttachmentId])}>
                关闭
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
