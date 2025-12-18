import { useState, useRef, useCallback } from 'react'
import { Form, Input, Button, Table, Modal, Row, Col, Divider, Space, message } from 'antd'
import CrudTable from '@/components/CrudTable'
import type { CrudTableRef } from '@/components/CrudTable/types'

const { TextArea } = Input

interface CustomerRecipient {
  name: string
  phone: string
  email: string
}

interface CustomerSender {
  name: string
  phone: string
  address: string
}

interface CustomerAddress {
  label: string
  contact: string
  phone: string
  address: string
}

interface CustomerData {
  id?: number
  code: string
  name: string
  cityName: string
  contact: string
  phone: string
  address: string
  remark: string
  recipients: CustomerRecipient[]
  senders: CustomerSender[]
  addresses: CustomerAddress[]
}

export default function Customer() {
  const crudTableRef = useRef<CrudTableRef>(null)

  // Recipient Dialog State
  const [recipientDialogVisible, setRecipientDialogVisible] = useState(false)
  const [recipientEditIndex, setRecipientEditIndex] = useState(-1)
  const [recipientForm] = Form.useForm()

  // Sender Dialog State
  const [senderDialogVisible, setSenderDialogVisible] = useState(false)
  const [senderEditIndex, setSenderEditIndex] = useState(-1)
  const [senderForm] = Form.useForm()

  // Address Dialog State
  const [addressDialogVisible, setAddressDialogVisible] = useState(false)
  const [addressEditIndex, setAddressEditIndex] = useState(-1)
  const [addressForm] = Form.useForm()

  // Ensure form has array fields
  const ensureArrayFields = useCallback((formData: any) => {
    if (!Array.isArray(formData.recipients)) formData.recipients = []
    if (!Array.isArray(formData.senders)) formData.senders = []
    if (!Array.isArray(formData.addresses)) formData.addresses = []
  }, [])

  // Recipient Handlers
  const openRecipientDialog = useCallback((index = -1) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)

    setRecipientEditIndex(index)
    if (index > -1) {
      recipientForm.setFieldsValue(formData.recipients[index])
    } else {
      recipientForm.resetFields()
    }
    setRecipientDialogVisible(true)
  }, [ensureArrayFields, recipientForm])

  const saveRecipient = useCallback(async () => {
    try {
      const values = await recipientForm.validateFields()
      const mainForm = crudTableRef.current?.form
      if (!mainForm) return

      const formData = mainForm.getFieldsValue()
      ensureArrayFields(formData)

      if (recipientEditIndex > -1) {
        formData.recipients[recipientEditIndex] = values
      } else {
        formData.recipients.push(values)
      }

      mainForm.setFieldsValue({ recipients: formData.recipients })
      message.success('收件人信息已保存')
      setRecipientDialogVisible(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }, [ensureArrayFields, recipientForm, recipientEditIndex])

  const removeRecipient = useCallback((index: number) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)
    formData.recipients.splice(index, 1)
    mainForm.setFieldsValue({ recipients: formData.recipients })
  }, [ensureArrayFields])

  // Sender Handlers
  const openSenderDialog = useCallback((index = -1) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)

    setSenderEditIndex(index)
    if (index > -1) {
      senderForm.setFieldsValue(formData.senders[index])
    } else {
      senderForm.resetFields()
    }
    setSenderDialogVisible(true)
  }, [ensureArrayFields, senderForm])

  const saveSender = useCallback(async () => {
    try {
      const values = await senderForm.validateFields()
      const mainForm = crudTableRef.current?.form
      if (!mainForm) return

      const formData = mainForm.getFieldsValue()
      ensureArrayFields(formData)

      if (senderEditIndex > -1) {
        formData.senders[senderEditIndex] = values
      } else {
        formData.senders.push(values)
      }

      mainForm.setFieldsValue({ senders: formData.senders })
      message.success('发件人信息已保存')
      setSenderDialogVisible(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }, [ensureArrayFields, senderForm, senderEditIndex])

  const removeSender = useCallback((index: number) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)
    formData.senders.splice(index, 1)
    mainForm.setFieldsValue({ senders: formData.senders })
  }, [ensureArrayFields])

  // Address Handlers
  const openAddressDialog = useCallback((index = -1) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)

    setAddressEditIndex(index)
    if (index > -1) {
      addressForm.setFieldsValue(formData.addresses[index])
    } else {
      addressForm.resetFields()
    }
    setAddressDialogVisible(true)
  }, [ensureArrayFields, addressForm])

  const saveAddress = useCallback(async () => {
    try {
      const values = await addressForm.validateFields()
      const mainForm = crudTableRef.current?.form
      if (!mainForm) return

      const formData = mainForm.getFieldsValue()
      ensureArrayFields(formData)

      if (addressEditIndex > -1) {
        formData.addresses[addressEditIndex] = values
      } else {
        formData.addresses.push(values)
      }

      mainForm.setFieldsValue({ addresses: formData.addresses })
      message.success('收货地址已保存')
      setAddressDialogVisible(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }, [ensureArrayFields, addressForm, addressEditIndex])

  const removeAddress = useCallback((index: number) => {
    const mainForm = crudTableRef.current?.form
    if (!mainForm) return

    const formData = mainForm.getFieldsValue()
    ensureArrayFields(formData)
    formData.addresses.splice(index, 1)
    mainForm.setFieldsValue({ addresses: formData.addresses })
  }, [ensureArrayFields])

  const renderColumns = useCallback(() => (
    <>
      <Table.Column dataIndex="id" title="主键" width={120} />
      <Table.Column dataIndex="code" title="编码" width={120} />
      <Table.Column dataIndex="name" title="名称" width={180} />
      <Table.Column dataIndex="cityName" title="所在城市" width={120} />
      <Table.Column dataIndex="contact" title="联系人" width={120} />
      <Table.Column dataIndex="phone" title="联系电话" width={150} />
      <Table.Column dataIndex="address" title="地址" />
      <Table.Column dataIndex="remark" title="备注" />
    </>
  ), [])

  const renderForm = useCallback((formData: CustomerData) => {
    ensureArrayFields(formData)
    return (
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
            <Form.Item label="所在城市" name="cityName">
              <Input placeholder="请输入所在城市" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="联系人" name="contact">
              <Input placeholder="请输入联系人" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
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

        <Divider >客户收件人</Divider>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>收件人信息</div>
          <Button type="primary" onClick={() => openRecipientDialog()}>
            新增收件人
          </Button>
        </div>
        <Form.Item name="recipients" noStyle>
          <Table
            dataSource={formData.recipients || []}
            size="small"
            bordered
            pagination={false}
            locale={{ emptyText: '暂无收件人' }}
            rowKey={(_, index) => index!}
            style={{ marginBottom: 16 }}
          >
            <Table.Column dataIndex="name" title="姓名" width={160} />
            <Table.Column dataIndex="phone" title="手机" width={160} />
            <Table.Column dataIndex="email" title="邮箱" />
            <Table.Column
              title="操作"
              width={160}
              render={(_, __, index) => (
                <Space>
                  <Button type="link" onClick={() => openRecipientDialog(index)}>
                    编辑
                  </Button>
                  <Button type="link" danger onClick={() => removeRecipient(index)}>
                    删除
                  </Button>
                </Space>
              )}
            />
          </Table>
        </Form.Item>

        <Divider >客户发件人</Divider>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>发件人信息</div>
          <Button type="primary" onClick={() => openSenderDialog()}>
            新增发件人
          </Button>
        </div>
        <Form.Item name="senders" noStyle>
          <Table
            dataSource={formData.senders || []}
            size="small"
            bordered
            pagination={false}
            locale={{ emptyText: '暂无发件人' }}
            rowKey={(_, index) => index!}
            style={{ marginBottom: 16 }}
          >
            <Table.Column dataIndex="name" title="姓名" width={160} />
            <Table.Column dataIndex="phone" title="手机" width={160} />
            <Table.Column dataIndex="address" title="发件地址" />
            <Table.Column
              title="操作"
              width={160}
              render={(_, __, index) => (
                <Space>
                  <Button type="link" onClick={() => openSenderDialog(index)}>
                    编辑
                  </Button>
                  <Button type="link" danger onClick={() => removeSender(index)}>
                    删除
                  </Button>
                </Space>
              )}
            />
          </Table>
        </Form.Item>

        <Divider >客户收货地址</Divider>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>收货地址</div>
          <Button type="primary" onClick={() => openAddressDialog()}>
            新增收货地址
          </Button>
        </div>
        <Form.Item name="addresses" noStyle>
          <Table
            dataSource={formData.addresses || []}
            size="small"
            bordered
            pagination={false}
            locale={{ emptyText: '暂无收货地址' }}
            rowKey={(_, index) => index!}
            style={{ marginBottom: 16 }}
          >
            <Table.Column dataIndex="label" title="地址名称" width={180} />
            <Table.Column dataIndex="contact" title="联系人" width={140} />
            <Table.Column dataIndex="phone" title="手机" width={160} />
            <Table.Column dataIndex="address" title="详细地址" />
            <Table.Column
              title="操作"
              width={160}
              render={(_, __, index) => (
                <Space>
                  <Button type="link" onClick={() => openAddressDialog(index)}>
                    编辑
                  </Button>
                  <Button type="link" danger onClick={() => removeAddress(index)}>
                    删除
                  </Button>
                </Space>
              )}
            />
          </Table>
        </Form.Item>
      </>
    )
  }, [ensureArrayFields, openRecipientDialog, removeRecipient, openSenderDialog, removeSender, openAddressDialog, removeAddress])

  const defaultFormData = useCallback(() => ({
    code: '',
    name: '',
    cityName: '',
    contact: '',
    phone: '',
    address: '',
    remark: '',
    recipients: [],
    senders: [],
    addresses: []
  }), [])

  return (
    <>
      <CrudTable<CustomerData>
        ref={crudTableRef}
        title="客户管理"
        apiUrl="/base/api/Customer"
        renderColumns={renderColumns}
        renderForm={renderForm}
        defaultFormData={defaultFormData}
      />

      {/* Recipient Dialog */}
      <Modal
        title={recipientEditIndex > -1 ? '编辑收件人' : '新增收件人'}
        open={recipientDialogVisible}
        onOk={saveRecipient}
        onCancel={() => setRecipientDialogVisible(false)}
        width={520}
      >
        <Form form={recipientForm} labelCol={{ span: 6 }}>
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            label="手机"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Sender Dialog */}
      <Modal
        title={senderEditIndex > -1 ? '编辑发件人' : '新增发件人'}
        open={senderDialogVisible}
        onOk={saveSender}
        onCancel={() => setSenderDialogVisible(false)}
        width={520}
      >
        <Form form={senderForm} labelCol={{ span: 6 }}>
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            label="手机"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            label="发件地址"
            name="address"
            rules={[{ required: true, message: '请输入发件地址' }]}
          >
            <Input placeholder="请输入发件地址" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Address Dialog */}
      <Modal
        title={addressEditIndex > -1 ? '编辑收货地址' : '新增收货地址'}
        open={addressDialogVisible}
        onOk={saveAddress}
        onCancel={() => setAddressDialogVisible(false)}
        width={520}
      >
        <Form form={addressForm} labelCol={{ span: 6 }}>
          <Form.Item
            label="地址名称"
            name="label"
            rules={[{ required: true, message: '请输入地址名称' }]}
          >
            <Input placeholder="如：默认地址/总部" />
          </Form.Item>
          <Form.Item
            label="联系人"
            name="contact"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item
            label="手机"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            label="详细地址"
            name="address"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
