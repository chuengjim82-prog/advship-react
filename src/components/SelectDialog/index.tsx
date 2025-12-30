import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Modal, Input, Button, Table, Pagination, Space, message } from 'antd'
import type { TableColumnsType, TableProps } from 'antd'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'
import './index.css'

export interface SelectDialogRef {
  open: () => void
}

interface SelectDialogProps<T> {
  title: string
  apiUrl: string
  columns: TableColumnsType<T>
  placeholder?: string
  onSelect: (item: T) => void
  width?: number
}

function SelectDialog<T extends { id: number }>(
  props: SelectDialogProps<T>,
  ref: React.Ref<SelectDialogRef>
) {
  const { title, apiUrl, columns, placeholder = '请输入关键词搜索', onSelect, width = 900 } = props

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<T[]>([])
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true)
      loadData()
    }
  }))

  const loadData = async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = {
        pageIndex: currentPage,
        pageSize: pageSize
      }
      if (keyword.trim()) {
        params.keyword = keyword.trim()
      }

      const res = await request.get<PageResult<T>>(apiUrl, { params })
      setDataSource(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      loadData()
    }
  }, [currentPage, pageSize, visible])

  const handleClose = () => {
    setVisible(false)
    setSelectedRow(null)
    setSelectedRowKeys([])
    setKeyword('')
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadData()
  }

  const handleReset = () => {
    setKeyword('')
    setCurrentPage(1)
    loadData()
  }

  const handleRowClick = (record: T) => {
    setSelectedRow(record)
    setSelectedRowKeys([record.id])
    // Double click to confirm
    onSelect(record)
    handleClose()
  }

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning('请选择一项')
      return
    }
    onSelect(selectedRow)
    handleClose()
  }

  const rowSelection: TableProps<T>['rowSelection'] = {
    type: 'radio',
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys)
      setSelectedRow(selectedRows[0] || null)
    }
  }

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      onOk={handleConfirm}
      width={width}
      destroyOnHidden
      okText="确定"
      cancelText="取消"
    >
      <div className="select-dialog-content">
        <div className="dialog-toolbar">
          <Space>
            <Input
              placeholder={placeholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 260 }}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        <Table<T>
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={false}
          bordered
          scroll={{ y: 360 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />

        <div className="pagination-area">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            pageSizeOptions={[10, 20, 50]}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(page, newPageSize) => {
              setCurrentPage(page)
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize)
                setCurrentPage(1)
              }
            }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default forwardRef(SelectDialog) as <T extends { id: number }>(
  props: SelectDialogProps<T> & { ref?: React.Ref<SelectDialogRef> }
) => React.ReactElement
