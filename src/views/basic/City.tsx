import { useRef, useCallback } from 'react'
import { Form, Input, Button, Space, Table } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import CrudTable from '@/components/CrudTable'
import CountryDialog, { type CountryItem } from '@/components/CountryDialog'
import type { CrudTableRef } from '@/components/CrudTable/types'
import type { SelectDialogRef } from '@/components/SelectDialog'

const { TextArea } = Input

interface CityData {
  id?: number
  code: string
  cnName: string
  enName: string
  remark: string
  countryId?: number | null
  countryName?: string
  countryCode2?: string
}

export default function City() {
  const crudTableRef = useRef<CrudTableRef>(null)
  const countryDialogRef = useRef<SelectDialogRef>(null)

  const handleCountrySelect = useCallback((country: CountryItem) => {
    const form = crudTableRef.current?.form
    if (form) {
      form.setFieldsValue({
        countryId: country.id,
        countryCode2: country.code2
      })
    }
  }, [])

  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="cnName" title="中文名称" width={150} />
      <Table.Column dataIndex="enName" title="英文名称" />
      <Table.Column dataIndex="countryCode2" title="国家" width={150} />
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
        label="中文名称"
        name="cnName"
        rules={[{ required: true, message: '请输入中文名称' }]}
      >
        <Input placeholder="请输入中文名称" />
      </Form.Item>
      <Form.Item label="英文名称" name="enName">
        <Input placeholder="请输入英文名称" />
      </Form.Item>
      <Form.Item
        label="国家"
        name="countryId"
        rules={[{ required: true, message: '请选择国家' }]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item noStyle name="countryCode2">
            <Input placeholder="请选择国家" readOnly />
          </Form.Item>
          <Button
            type="primary"
            icon={<MoreOutlined />}
            onClick={() => countryDialogRef.current?.open()}
          >
            选择
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    code: '',
    cnName: '',
    enName: '',
    remark: '',
    countryId: null,
    countryName: '',
    countryCode2: ''
  }), [])

  return (
    <>
      <CrudTable<CityData>
        ref={crudTableRef}
        title="城市管理"
        apiUrl="/base/api/city"
        renderColumns={renderColumns}
        renderForm={renderForm}
        defaultFormData={defaultFormData}
      />
      <CountryDialog ref={countryDialogRef} onSelect={handleCountrySelect} />
    </>
  )
}
