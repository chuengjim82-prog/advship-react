import { useCallback } from 'react'
import { Form, Input, Row, Col, Table } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface ShippingData {
  id?: number
  code: string
  sName: string
  fName: string
  contact: string
  phone: string
  address: string
  remark: string
}

export default function Shipping() {
  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="sName" title="简称" width={150} />
      <Table.Column dataIndex="fName" title="全称" />
      <Table.Column dataIndex="contact" title="联系人" width={120} />
      <Table.Column dataIndex="phone" title="联系电话" width={150} />
      <Table.Column dataIndex="address" title="地址" />
      <Table.Column dataIndex="remark" title="备注" />
    </>
  ), [])

  const renderForm = useCallback(() => (
    <>
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            label="编码"
            name="code"
            rules={[{ required: true, message: '请输入编码' }]}
          >
            <Input placeholder="请输入编码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="简称"
            name="sName"
            rules={[{ required: true, message: '请输入简称' }]}
          >
            <Input placeholder="请输入简称" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="全称" name="fName">
        <Input placeholder="请输入全称" />
      </Form.Item>
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item label="联系人" name="contact">
            <Input placeholder="请输入联系人" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="联系电话" name="phone">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="地址" name="address">
        <Input placeholder="请输入地址" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    code: '',
    sName: '',
    fName: '',
    contact: '',
    phone: '',
    address: '',
    remark: ''
  }), [])

  return (
    <CrudTable<ShippingData>
      title="船公司管理"
      apiUrl="/base/api/Shipping"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
