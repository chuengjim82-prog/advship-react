import { useCallback } from 'react'
import { Form, Input, InputNumber, Table } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface CountryData {
  id?: number
  code2: string
  code3: string
  cnName: string
  enName: string
  currency: string
  timeZone: number
  remark: string
}

export default function Country() {
  const renderColumns = useCallback(() => {
    return (
      <>
        <Table.Column dataIndex="id" title="主键" width={80} />
        <Table.Column dataIndex="code2" title="二字码" width={120} />
        <Table.Column dataIndex="code3" title="三字码" width={120} />
        <Table.Column dataIndex="cnName" title="中文名称" width={150} />
        <Table.Column dataIndex="enName" title="英文名称" width={200} />
        <Table.Column dataIndex="currency" title="币种" width={100} />
        <Table.Column dataIndex="timeZone" title="时区" width={80} />
        <Table.Column dataIndex="remark" title="备注" />
      </>
    )
  }, [])

  const renderForm = useCallback(() => {
    return (
      <>
        <Form.Item
          label="二字码"
          name="code2"
          rules={[{ required: true, message: '请输入二字码' }]}
        >
          <Input placeholder="请输入二字码" maxLength={2} />
        </Form.Item>
        <Form.Item
          label="三字码"
          name="code3"
          rules={[{ required: true, message: '请输入三字码' }]}
        >
          <Input placeholder="请输入三字码" maxLength={3} />
        </Form.Item>
        <Form.Item
          label="中文名称"
          name="cnName"
          rules={[{ required: true, message: '请输入中文名称' }]}
        >
          <Input placeholder="请输入中文名称" />
        </Form.Item>
        <Form.Item label="英文名称" name="enName">
          <Input placeholder="请输入英文名称" />
        </Form.Item>
        <Form.Item label="币种" name="currency">
          <Input placeholder="请输入币种" />
        </Form.Item>
        <Form.Item label="时区" name="timeZone">
          <InputNumber min={-12} max={12} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </>
    )
  }, [])

  const defaultFormData = useCallback(() => ({
    code2: '',
    code3: '',
    cnName: '',
    enName: '',
    currency: '',
    timeZone: 8,
    remark: ''
  }), [])

  return (
    <CrudTable<CountryData>
      title="国家管理"
      apiUrl="/base/api/Country"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
