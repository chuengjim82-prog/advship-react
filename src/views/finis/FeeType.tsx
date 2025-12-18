import { useRef, useCallback } from 'react'
import { Form, Input, Button, Switch, Tag, Table, Row, Col, Space } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import CrudTable from '@/components/CrudTable'
import ServiceDialog, { type ServiceItem } from '@/components/ServiceDialog'
import type { CrudTableRef } from '@/components/CrudTable/types'
import type { SelectDialogRef } from '@/components/SelectDialog'

const { TextArea } = Input

interface FeeTypeData {
  id?: number
  cnName: string
  enName: string
  serviceId?: number | null
  serviceName?: string
  isSale: boolean
  isBuy: boolean
  statusi: number
  statuss?: string
  remark: string
}

export default function FeeType() {
  const crudTableRef = useRef<CrudTableRef>(null)
  const serviceDialogRef = useRef<SelectDialogRef>(null)

  const handleServiceSelect = useCallback((service: ServiceItem) => {
    const form = crudTableRef.current?.form
    if (form) {
      form.setFieldsValue({
        serviceId: service.id,
        serviceName: service.name
      })
    }
  }, [])

  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="cnName" title="类别名称" width={200} />
      <Table.Column dataIndex="enName" title="英文名称" />
      <Table.Column dataIndex="serviceName" title="产品服务" width={150} />
      <Table.Column
        title="销售"
        dataIndex="isSale"
        width={100}
        render={(isSale: boolean) =>
          isSale ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>
        }
      />
      <Table.Column
        title="采购"
        dataIndex="isBuy"
        width={80}
        render={(isBuy: boolean) =>
          isBuy ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>
        }
      />
      <Table.Column
        title="状态"
        dataIndex="statusi"
        width={80}
        render={(statusi: number) =>
          statusi === 1 ? <Tag color="success">启用</Tag> : <Tag color="error">停用</Tag>
        }
      />
      <Table.Column dataIndex="remark" title="备注" />
    </>
  ), [])

  const renderForm = useCallback(() => (
    <>
      <Form.Item
        label="类别名称"
        name="cnName"
        rules={[{ required: true, message: '请输入类别名称' }]}
      >
        <Input placeholder="请输入类别名称" />
      </Form.Item>
      <Form.Item label="英文名称" name="enName">
        <Input placeholder="请输入英文名称" />
      </Form.Item>
      <Form.Item label="产品服务" name="serviceId">
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item noStyle name="serviceName">
            <Input placeholder="请选择产品服务" readOnly />
          </Form.Item>
          <Button
            type="primary"
            icon={<MoreOutlined />}
            onClick={() => serviceDialogRef.current?.open()}
          >
            选择
          </Button>
        </Space.Compact>
      </Form.Item>
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item label="销售" name="isSale" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="采购" name="isBuy" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="状态" name="statusi">
        <Switch checkedChildren="启用" unCheckedChildren="停用" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    cnName: '',
    enName: '',
    serviceId: null,
    serviceName: '',
    isSale: true,
    isBuy: true,
    statusi: 1,
    statuss: '启用',
    remark: ''
  }), [])

  return (
    <>
      <CrudTable<FeeTypeData>
        ref={crudTableRef}
      title="费用类别"
      apiUrl="/base/api/FeeType"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
    <ServiceDialog ref={serviceDialogRef} onSelect={handleServiceSelect} />
    </>
  )
}
