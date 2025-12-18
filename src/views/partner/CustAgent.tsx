import { useCallback } from 'react'
import { Form, Input, Row, Col, Table } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface CustAgentData {
  id?: number
  code: string
  name: string
  contact: string
  phone: string
  address: string
  remark: string
}

export default function CustAgent() {
  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="name" title="名称" width={180} />
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
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
        </Col>
      </Row>
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
    name: '',
    contact: '',
    phone: '',
    address: '',
    remark: ''
  }), [])

  return (
    <CrudTable<CustAgentData>
      title="客户代理管理"
      apiUrl="/base/api/CustAgent"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
