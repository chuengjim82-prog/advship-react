import { useCallback } from 'react'
import { Form, Input, Table } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface CurrencyData {
  id?: number
  code: string
  name: string
  symbol: string
  remark: string
}

export default function Currency() {
  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={150} />
      <Table.Column dataIndex="name" title="名称" width={150} />
      <Table.Column dataIndex="symbol" title="符号" width={100} />
      <Table.Column dataIndex="remark" title="备注" />
    </>
  ), [])

  const renderForm = useCallback(() => (
    <>
      <Form.Item
        label="编码"
        name="code"
        rules={[{ required: true, message: '请输入编码' }]}
      >
        <Input placeholder="请输入编码，如 USD" />
      </Form.Item>
      <Form.Item
        label="名称"
        name="name"
        rules={[{ required: true, message: '请输入名称' }]}
      >
        <Input placeholder="请输入名称，如 美元" />
      </Form.Item>
      <Form.Item label="符号" name="symbol">
        <Input placeholder="请输入符号，如 $" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    code: '',
    name: '',
    symbol: '',
    remark: ''
  }), [])

  return (
    <CrudTable<CurrencyData>
      title="币种管理"
      apiUrl="/base/api/Currency"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
