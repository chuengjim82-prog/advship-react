import { useRef, useCallback } from 'react'
import { Form, Input, Button, Table, Row, Col, Space } from 'antd'
import CrudTable from '@/components/CrudTable'
import CountryDialog, { type CountryItem } from '@/components/CountryDialog'
import CityDialog, { type CityItem } from '@/components/CityDialog'
import type { CrudTableRef } from '@/components/CrudTable/types'
import type { SelectDialogRef } from '@/components/SelectDialog'

const { TextArea } = Input

interface CustomsData {
  id?: number
  code: string
  cnName: string
  enName: string
  countryId?: number | null
  countryCode2?: string
  cityId?: number | null
  cityCode?: string
  contact: string
  phone: string
  address: string
  remark: string
}

export default function Customs() {
  const crudTableRef = useRef<CrudTableRef>(null)
  const countryDialogRef = useRef<SelectDialogRef>(null)
  const cityDialogRef = useRef<SelectDialogRef>(null)

  const handleCountrySelect = useCallback((country: CountryItem) => {
    const form = crudTableRef.current?.form
    if (form) {
      form.setFieldsValue({
        countryId: country.id,
        countryCode2: country.code2
      })
    }
  }, [])

  const handleCitySelect = useCallback((city: CityItem) => {
    const form = crudTableRef.current?.form
    if (form) {
      form.setFieldsValue({
        cityId: city.id,
        cityCode: city.code
      })
    }
  }, [])

  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={100} />
      <Table.Column dataIndex="cnName" title="中文名称" width={150} />
      <Table.Column dataIndex="enName" title="英文名称" />
      <Table.Column dataIndex="countryCode2" title="国家" width={100} />
      <Table.Column dataIndex="cityCode" title="城市" width={100} />
      <Table.Column dataIndex="contact" title="联系人" width={100} />
      <Table.Column dataIndex="phone" title="联系电话" width={150} />
      <Table.Column dataIndex="address" title="地址" />
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
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item
            label="中文名称"
            name="cnName"
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input placeholder="请输入中文名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="英文名称" name="enName">
            <Input placeholder="请输入英文名称" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="国家" name="countryId">
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item noStyle name="countryCode2">
            <Input placeholder="请选择国家" readOnly />
          </Form.Item>
          <Button type="primary" onClick={() => countryDialogRef.current?.open()}>
            选择国家
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item label="城市" name="cityId">
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item noStyle name="cityCode">
            <Input placeholder="请选择城市" readOnly />
          </Form.Item>
          <Button type="primary" onClick={() => cityDialogRef.current?.open()}>
            选择城市
          </Button>
        </Space.Compact>
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
    cnName: '',
    enName: '',
    countryId: null,
    countryCode2: '',
    cityId: null,
    cityCode: '',
    contact: '',
    phone: '',
    address: '',
    remark: ''
  }), [])

  return (
    <>
      <CrudTable<CustomsData>
        ref={crudTableRef}
        title="海关管理"
        apiUrl="/base/api/Customs"
        renderColumns={renderColumns}
        renderForm={renderForm}
        defaultFormData={defaultFormData}
      />
      <CountryDialog ref={countryDialogRef} onSelect={handleCountrySelect} />
      <CityDialog ref={cityDialogRef} onSelect={handleCitySelect} />
    </>
  )
}
