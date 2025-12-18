import { useState, useEffect, useMemo } from 'react'
import {
  Drawer,
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Switch,
  InputNumber,
  Table,
  Space,
  Spin,
  message
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '@/utils/request'
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

const { TextArea } = Input

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
      message.error('加载订单详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const initializeForm = async () => {
    if (isEditMode && orderId) {
      await loadOrderDetail(orderId)
    } else {
      resetForms()
    }
  }

  useEffect(() => {
    loadBaseOptions()
  }, [])

  useEffect(() => {
    if (visible) {
      initializeForm()
    } else {
      resetForms()
    }
  }, [visible, orderId])

  // Sync custPort when custPortId changes
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

  const formatServiceOption = (item: ServiceItem) => item.name || item.code || `服务${item.id}`
  const formatAgentOption = (item: AgentItem) => item.name || item.code || `代理${item.id}`
  const formatCustPortOption = (item: CustPortItem) =>
    item.cnName || item.enName || item.code || `口岸${item.id}`
  const formatCountryOption = (item: CountryItem) =>
    item.cnName || item.enName || item.code2 || item.code3 || `国家${item.id}`

  const addContainer = () => {
    setContainers([...containers, createContainerForm()])
  }

  const removeContainer = (index: number) => {
    if (containers.length === 1) return
    setContainers(containers.filter((_, i) => i !== index))
  }

  const updateContainer = (index: number, field: keyof ContainerForm, value: any) => {
    const newContainers = [...containers]
    newContainers[index] = { ...newContainers[index], [field]: value }
    setContainers(newContainers)
  }

  const addInvoice = () => {
    setInvoices([...invoices, createInvoiceForm()])
  }

  const removeInvoice = (index: number) => {
    if (invoices.length === 1) return
    setInvoices(invoices.filter((_, i) => i !== index))
  }

  const updateInvoice = (index: number, field: keyof InvoiceForm, value: any) => {
    const newInvoices = [...invoices]
    newInvoices[index] = { ...newInvoices[index], [field]: value }
    setInvoices(newInvoices)
  }

  const normalizeContainers = () =>
    containers
      .map((item) => ({
        ...item,
        quantity: item.quantity ?? null,
        weight: item.weight ?? null
      }))
      .filter(
        (item) =>
          item.number ||
          item.sizeType ||
          item.goodsInfo ||
          item.quantity !== null ||
          item.weight !== null
      )

  const normalizeInvoices = () =>
    invoices
      .map((item) => ({
        ...item,
        ttlAmount: item.ttlAmount ?? null
      }))
      .filter(
        (item) =>
          item.invoiceNo ||
          item.bussType ||
          item.transType ||
          item.currency ||
          item.exporter
      )

  const handleSubmit = async () => {
    try {
      const normalizedContainers = normalizeContainers()
      if (normalizedContainers.length === 0) {
        message.warning('请至少添加一条柜型信息')
        return
      }

      const normalizedInvoices = normalizeInvoices()
      if (normalizedInvoices.length === 0) {
        message.warning('请至少添加一条发票信息')
        return
      }

      setSubmitting(true)
      try {
        const payload = {
          baseInfo: {
            ...baseInfoForm,
            orderDate: baseInfoForm.orderDate
          },
          waybill: {
            ...waybillForm,
            waybillDate: waybillForm.waybillDate
          },
          containers: normalizedContainers,
          invoices: normalizedInvoices
        }

        if (isEditMode) {
          if (!orderId) {
            throw new Error('缺少订单ID，无法更新')
          }
          await request.put<boolean>(`/bzss/api/orderbaseinfo/${orderId}`, payload)
          message.success('订单更新成功')
          onSuccess(orderId)
        } else {
          const response = await request.post<number>('/bzss/api/orderbaseinfo/create', payload)
          const newOrderId = response.data ?? 0
          message.success('订单创建成功')
          onSuccess(newOrderId)
        }
        onClose()
        resetForms()
      } catch (error) {
        console.error('订单提交失败', error)
        message.error('订单提交失败，请稍后重试')
      } finally {
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleClose = () => {
    onClose()
    resetForms()
  }

  const containerColumns = [
    {
      title: '柜号',
      dataIndex: 'number',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <Input
          value={containers[index].number}
          onChange={(e) => updateContainer(index, 'number', e.target.value)}
          placeholder="柜号"
        />
      )
    },
    {
      title: '柜型',
      dataIndex: 'sizeType',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <Input
          value={containers[index].sizeType}
          onChange={(e) => updateContainer(index, 'sizeType', e.target.value)}
          placeholder="柜型"
        />
      )
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (_: any, __: any, index: number) => (
        <InputNumber
          value={containers[index].quantity}
          onChange={(value) => updateContainer(index, 'quantity', value)}
          min={0}
          step={1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '重量(kg)',
      dataIndex: 'weight',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <InputNumber
          value={containers[index].weight}
          onChange={(value) => updateContainer(index, 'weight', value)}
          min={0}
          step={0.1}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '货物描述',
      dataIndex: 'goodsInfo',
      width: 200,
      render: (_: any, __: any, index: number) => (
        <Input
          value={containers[index].goodsInfo}
          onChange={(e) => updateContainer(index, 'goodsInfo', e.target.value)}
          placeholder="描述"
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 160,
      render: (_: any, __: any, index: number) => (
        <Input
          value={containers[index].remark}
          onChange={(e) => updateContainer(index, 'remark', e.target.value)}
          placeholder="备注"
        />
      )
    },
    {
      title: '操作',
      width: 90,
      fixed: 'right' as const,
      render: (_: any, __: any, index: number) => (
        <Button
          type="link"
          danger
          disabled={containers.length === 1}
          onClick={() => removeContainer(index)}
        >
          删除
        </Button>
      )
    }
  ]

  const invoiceColumns = [
    {
      title: '发票号',
      dataIndex: 'invoiceNo',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].invoiceNo}
          onChange={(e) => updateInvoice(index, 'invoiceNo', e.target.value)}
          placeholder="发票号"
        />
      )
    },
    {
      title: '业务类型',
      dataIndex: 'bussType',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].bussType}
          onChange={(e) => updateInvoice(index, 'bussType', e.target.value)}
          placeholder="业务类型"
        />
      )
    },
    {
      title: '运输方式',
      dataIndex: 'transType',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].transType}
          onChange={(e) => updateInvoice(index, 'transType', e.target.value)}
          placeholder="运输方式"
        />
      )
    },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].currency}
          onChange={(e) => updateInvoice(index, 'currency', e.target.value)}
          placeholder="SAR/USD..."
        />
      )
    },
    {
      title: '金额',
      dataIndex: 'ttlAmount',
      width: 140,
      render: (_: any, __: any, index: number) => (
        <InputNumber
          value={invoices[index].ttlAmount}
          onChange={(value) => updateInvoice(index, 'ttlAmount', value)}
          min={0}
          step={0.01}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '出口商',
      dataIndex: 'exporter',
      width: 200,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].exporter}
          onChange={(e) => updateInvoice(index, 'exporter', e.target.value)}
          placeholder="出口商"
        />
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 160,
      render: (_: any, __: any, index: number) => (
        <Input
          value={invoices[index].remark}
          onChange={(e) => updateInvoice(index, 'remark', e.target.value)}
          placeholder="备注"
        />
      )
    },
    {
      title: '操作',
      width: 90,
      fixed: 'right' as const,
      render: (_: any, __: any, index: number) => (
        <Button
          type="link"
          danger
          disabled={invoices.length === 1}
          onClick={() => removeInvoice(index)}
        >
          删除
        </Button>
      )
    }
  ]

  return (
    <Drawer
      title={isEditMode ? '更新订单' : '创建订单'}
      placement="right"
      width="80%"
      open={visible}
      onClose={handleClose}
      maskClosable={false}
      extra={
        <Button type="primary" loading={submitting} onClick={handleSubmit} icon={<PlusOutlined />}>
          {isEditMode ? '更新' : '提交'}
        </Button>
      }
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {isEditMode ? '保存更新' : '提交'}
          </Button>
        </Space>
      }
    >
      <Spin spinning={detailLoading}>
        <Form
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
        <Card title="订单信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="目的地海关">
                <Select
                  value={baseInfoForm.custPortId}
                  onChange={(value) => setBaseInfoForm({ ...baseInfoForm, custPortId: value })}
                  placeholder="选择目的地海关"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={custPortOptions.map((item) => ({
                    label: formatCustPortOption(item),
                    value: item.id
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="航司名称">
                <Select
                  value={baseInfoForm.transAgentId}
                  onChange={(value) => setBaseInfoForm({ ...baseInfoForm, transAgentId: value })}
                  placeholder="选择航司"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={transAgentOptions.map((item) => ({
                    label: formatAgentOption(item),
                    value: item.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="代理清关">
                <Switch
                  checked={baseInfoForm.custPickup}
                  onChange={(checked) => setBaseInfoForm({ ...baseInfoForm, custPickup: checked })}
                  checkedChildren="是"
                  unCheckedChildren="否"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="清关公司">
                <Select
                  value={baseInfoForm.custAgentId}
                  onChange={(value) => setBaseInfoForm({ ...baseInfoForm, custAgentId: value })}
                  placeholder="选择清关公司"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={custAgentOptions.map((item) => ({
                    label: formatAgentOption(item),
                    value: item.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="经纪商授权码"
                name="orderNo"
                rules={[{ required: true, message: '请输入订单编号' }]}
              >
                <Input
                  value={baseInfoForm.orderNo}
                  onChange={(e) => setBaseInfoForm({ ...baseInfoForm, orderNo: e.target.value })}
                  placeholder="请输入经纪商授权码"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="申报类型">
                <Input
                  value={baseInfoForm.statuss}
                  onChange={(e) => setBaseInfoForm({ ...baseInfoForm, statuss: e.target.value })}
                  placeholder="请输入申报类型"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="订单日期"
                name="orderDate"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker
                  value={baseInfoForm.orderDate ? dayjs(baseInfoForm.orderDate) : null}
                  onChange={(date) =>
                    setBaseInfoForm({
                      ...baseInfoForm,
                      orderDate: date ? date.format('YYYY-MM-DD') : null
                    })
                  }
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="选择订单日期"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="运输服务"
                name="serviceId"
                rules={[{ required: true, message: '请选择运输服务' }]}
              >
                <Select
                  value={baseInfoForm.serviceId}
                  onChange={(value) => setBaseInfoForm({ ...baseInfoForm, serviceId: value })}
                  placeholder="选择运输服务"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={serviceOptions.map((item) => ({
                    label: formatServiceOption(item),
                    value: item.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="提单号">
                <Input
                  value={baseInfoForm.waybillNo}
                  onChange={(e) => setBaseInfoForm({ ...baseInfoForm, waybillNo: e.target.value })}
                  placeholder="请输入提单号"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="目的国家">
                <Select
                  value={baseInfoForm.countryId}
                  onChange={(value) => setBaseInfoForm({ ...baseInfoForm, countryId: value })}
                  placeholder="选择国家"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={countryOptions.map((item) => ({
                    label: formatCountryOption(item),
                    value: item.id
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
            <TextArea
              value={baseInfoForm.remark}
              onChange={(e) => setBaseInfoForm({ ...baseInfoForm, remark: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </Form.Item>
        </Card>

        <Card title="提单信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="提单号"
                name="waybillNo"
                rules={[{ required: true, message: '请输入提单号' }]}
              >
                <Input
                  value={waybillForm.waybillNo}
                  onChange={(e) => setWaybillForm({ ...waybillForm, waybillNo: e.target.value })}
                  placeholder="请输入提单号"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="提单日期">
                <DatePicker
                  value={waybillForm.waybillDate ? dayjs(waybillForm.waybillDate) : null}
                  onChange={(date) =>
                    setWaybillForm({
                      ...waybillForm,
                      waybillDate: date ? date.format('YYYY-MM-DD') : null
                    })
                  }
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  placeholder="选择日期"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="发货人">
                <Input
                  value={waybillForm.shipperName}
                  onChange={(e) => setWaybillForm({ ...waybillForm, shipperName: e.target.value })}
                  placeholder="请输入发货人"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="收货人">
                <Input
                  value={waybillForm.consigneeName}
                  onChange={(e) =>
                    setWaybillForm({ ...waybillForm, consigneeName: e.target.value })
                  }
                  placeholder="请输入收货人"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="发货地址">
                <Input
                  value={waybillForm.shipperAddress}
                  onChange={(e) =>
                    setWaybillForm({ ...waybillForm, shipperAddress: e.target.value })
                  }
                  placeholder="请输入发货地址"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="收货地址">
                <Input
                  value={waybillForm.consigneeAddress}
                  onChange={(e) =>
                    setWaybillForm({ ...waybillForm, consigneeAddress: e.target.value })
                  }
                  placeholder="请输入收货地址"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="目的港">
                <Input
                  value={waybillForm.custPort}
                  onChange={(e) => setWaybillForm({ ...waybillForm, custPort: e.target.value })}
                  placeholder="请输入目的港"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="件数" labelCol={{ span: 12 }}>
                <InputNumber
                  value={waybillForm.quantity}
                  onChange={(value) => setWaybillForm({ ...waybillForm, quantity: value })}
                  min={0}
                  step={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="总重量(kg)" labelCol={{ span: 12 }}>
                <InputNumber
                  value={waybillForm.ttlWeight}
                  onChange={(value) => setWaybillForm({ ...waybillForm, ttlWeight: value })}
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="体积(m³)">
                <InputNumber
                  value={waybillForm.cubicVol}
                  onChange={(value) => setWaybillForm({ ...waybillForm, cubicVol: value })}
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注">
                <Input
                  value={waybillForm.remark}
                  onChange={(e) => setWaybillForm({ ...waybillForm, remark: e.target.value })}
                  placeholder="请输入提单备注"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="柜型信息"
          extra={
            <Button type="link" onClick={addContainer} icon={<PlusOutlined />}>
              新增
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            dataSource={containers}
            columns={containerColumns}
            pagination={false}
            bordered
            rowKey={(_, index) => index!}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        <Card
          title="发票信息"
          extra={
            <Button type="link" onClick={addInvoice} icon={<PlusOutlined />}>
              新增
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            pagination={false}
            bordered
            rowKey={(_, index) => index!}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Form>
      </Spin>
    </Drawer>
  )
}
