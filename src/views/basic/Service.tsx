import { useCallback } from 'react'
import { Form, Input, Switch, Tag, Table, Row, Col } from 'antd'
import CrudTable from '@/components/CrudTable'

const { TextArea } = Input

interface ServiceData {
  id?: number
  code: string
  name: string
  isSale: boolean
  isBuy: boolean
  statusi: number
  statuss?: string
  remark: string
}

export default function Service() {
  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={80} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="name" title="名称" width={180} />
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
        label="编码"
        name="code"
        rules={[{ required: true, message: '请输入编码' }]}
      >
        <Input placeholder="请输入编码" />
      </Form.Item>
      <Form.Item
        label="名称"
        name="name"
        rules={[{ required: true, message: '请输入名称' }]}
      >
        <Input placeholder="请输入名称" />
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
        <Switch checkedChildren="启用" unCheckedChildren="停用" checked={true} />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>
    </>
  ), [])

  const defaultFormData = useCallback(() => ({
    code: '',
    name: '',
    isSale: true,
    isBuy: true,
    statusi: 1,
    statuss: '启用',
    remark: ''
  }), [])

  return (
    <CrudTable<ServiceData>
      title="服务项目管理"
      apiUrl="/base/api/Service"
      renderColumns={renderColumns}
      renderForm={renderForm}
      defaultFormData={defaultFormData}
    />
  )
}
