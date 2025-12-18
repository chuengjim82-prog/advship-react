import { useRef, useCallback } from 'react'
import { Form, Input, Button, Switch, Tag, Radio, Table, Row, Col, Space } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import CrudTable from '@/components/CrudTable'
import FeeTypeDialog, { type FeeTypeItem } from '@/components/FeeTypeDialog'
import type { CrudTableRef } from '@/components/CrudTable/types'
import type { SelectDialogRef } from '@/components/SelectDialog'

const { TextArea } = Input

interface FeeItemData {
  id?: number
  feeTypeId?: number | null
  feeTypeName?: string
  cnName: string
  enName: string
  itemType: number
  itemUnit: string
  isSale: boolean
  isBuy: boolean
  remark: string
}

export default function FeeItem() {
  const crudTableRef = useRef<CrudTableRef>(null)
  const feeTypeDialogRef = useRef<SelectDialogRef>(null)

  const handleFeeTypeSelect = useCallback((feeType: FeeTypeItem) => {
    const form = crudTableRef.current?.form
    if (form) {
      form.setFieldsValue({
        feeTypeId: feeType.id,
        feeTypeName: feeType.cnName
      })
    }
  }, [])

  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="feeTypeName" title="费用类别" width={200} />
      <Table.Column dataIndex="cnName" title="项目名称" width={150} />
      <Table.Column dataIndex="enName" title="英文名称" width={200} />
      <Table.Column
        title="费用方式"
        dataIndex="itemType"
        width={120}
        render={(itemType: number) => {
          if (itemType === 0) return <Tag color="default">实报</Tag>
          if (itemType === 1) return <Tag color="success">固定</Tag>
          return <Tag color="warning">-</Tag>
        }}
      />
      <Table.Column dataIndex="itemUnit" title="费用单位" width={100} />
      <Table.Column
        title="销售"
        dataIndex="isSale"
        width={80}
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
      <Table.Column dataIndex="remark" title="备注" />
    </>
  ), [])

  const renderForm = useCallback(() => (
    <>
      <Form.Item
        label="费用类别"
        name="feeTypeId"
        rules={[{ required: true, message: '请选择费用类别' }]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item noStyle name="feeTypeName">
            <Input placeholder="请选择费用类别" readOnly />
          </Form.Item>
          <Button
            type="primary"
            icon={<MoreOutlined />}
            onClick={() => feeTypeDialogRef.current?.open()}
          >
            选择
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        label="项目名称"
        name="cnName"
        rules={[{ required: true, message: '请输入项目名称' }]}
      >
        <Input placeholder="请输入项目名称" />
      </Form.Item>
      <Form.Item
        label="英文名称"
        name="enName"
        rules={[{ required: true, message: '请输入英文名称' }]}
      >
        <Input placeholder="请输入英文名称" />
      </Form.Item>
      <Form.Item
        label="费用方式"
        name="itemType"
        rules={[{ required: true, message: '请选择费用方式' }]}
      >
        <Radio.Group>
          <Radio value={0}>实报</Radio>
          <Radio value={1}>固定</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="费用单位" name="itemUnit">
        <Input placeholder="请输入费用单位" />
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
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    feeTypeId: null,
    feeTypeName: '',
    cnName: '',
    enName: '',
    itemType: 0,
    itemUnit: '',
    isSale: true,
    isBuy: true,
    remark: ''
  }), [])

  return (
    <>
      <CrudTable<FeeItemData>
        ref={crudTableRef}
        title="费用项目管理"
        apiUrl="/base/api/FeeItem"
        renderColumns={renderColumns}
        renderForm={renderForm}
        defaultFormData={defaultFormData}
      />
      <FeeTypeDialog ref={feeTypeDialogRef} onSelect={handleFeeTypeSelect} />
    </>
  )
}
