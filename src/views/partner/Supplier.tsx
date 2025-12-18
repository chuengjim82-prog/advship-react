import { useCallback } from 'react'
import { Form, Input, Table } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface SupplierData {
  id?: number
  code: string
  sName: string
  fName: string
  remark: string
}

export default function Supplier() {
  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="sName" title="简称" width={150} />
      <Table.Column dataIndex="fName" title="全称" />
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
        <Input placeholder="请输入编码" />
      </Form.Item>
      <Form.Item
        label="简称"
        name="sName"
        rules={[{ required: true, message: '请输入简称' }]}
      >
        <Input placeholder="请输入简称" />
      </Form.Item>
      <Form.Item label="全称" name="fName">
        <Input placeholder="请输入全称" />
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
    remark: ''
  }), [])

  return (
    <CrudTable<SupplierData>
      title="供应商管理"
      apiUrl="/base/api/Supplier"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
