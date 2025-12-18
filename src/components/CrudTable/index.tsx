import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import { Card, Button, Input, Table, Modal, Form, Popconfirm, Pagination, Space } from 'antd'
import { SearchOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { message } from 'antd'
import dayjs from 'dayjs'
import request from '@/utils/request'
import { useTableData } from '@/hooks/useTableData'
import type { CrudTableProps, CrudTableRef } from './types'
import './index.css'

function CrudTable<T extends Record<string, any>>(
  props: CrudTableProps<T>,
  ref: React.Ref<CrudTableRef>
) {
  const {
    title,
    apiUrl,
    renderColumns,
    renderForm,
    defaultFormData = () => ({} as T),
    onLoaded
  } = props

  const {
    loading,
    tableData,
    total,
    pageIndex,
    pageSize,
    searchKeyword,
    setSearchKeyword,
    loadData,
    handleDelete,
    handleSearch,
    handleRefresh,
    handlePageChange
  } = useTableData({ apiUrl, onLoaded })

  const [dialogVisible, setDialogVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    loadData,
    form
  }), [loadData, form])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle add
  const handleAdd = () => {
    setIsEdit(false)
    form.resetFields()
    form.setFieldsValue(defaultFormData())
    setDialogVisible(true)
  }

  // Handle edit
  const handleEdit = (record: T) => {
    setIsEdit(true)
    form.setFieldsValue({ ...record })
    setDialogVisible(true)
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)

      if (isEdit) {
        await request.put(apiUrl, values)
        message.success('修改成功')
      } else {
        await request.post(apiUrl, values)
        message.success('新增成功')
      }

      setDialogVisible(false)
      await loadData()
    } catch (error) {
      console.error('Form validation failed:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  // Handle delete with confirmation
  const onConfirmDelete = (record: T) => {
    handleDelete(record.id)
  }

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
  }

  // Define action column
  const actionColumn = {
    title: '操作',
    width: 180,
    fixed: 'right' as const,
    render: (_: any, record: T) => (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
        <Popconfirm
          title="确定要删除这条记录吗？"
          onConfirm={() => onConfirmDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    )
  }

  // Define createTime column
  const createTimeColumn = {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
    render: (text: string) => formatDate(text)
  }

  return (
    <div className="crud-table">
      <Card
        title={title}
        extra={
          <Space>
            <Input
              placeholder="请输入关键词搜索"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          loading={loading}
          dataSource={tableData}
          rowKey="id"
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        >
          {renderColumns()}
          {createTimeColumn && <Table.Column {...createTimeColumn} />}
          {actionColumn && <Table.Column {...actionColumn} />}
        </Table>

        <div className="pagination">
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[10, 20, 50, 100]}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={handlePageChange}
          />
        </div>
      </Card>

      <Modal
        title={isEdit ? '编辑' : '新增'}
        open={dialogVisible}
        onOk={handleSubmit}
        onCancel={() => setDialogVisible(false)}
        confirmLoading={submitLoading}
        width={600}
        forceRender
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          {dialogVisible && renderForm(form.getFieldsValue())}
        </Form>
      </Modal>
    </div>
  )
}

export default forwardRef(CrudTable) as <T extends Record<string, any>>(
  props: CrudTableProps<T> & { ref?: React.Ref<CrudTableRef> }
) => React.ReactElement
