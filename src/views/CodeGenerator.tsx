import { useState, useEffect } from 'react'
import { Card, Button, Row, Col, Table, Tag, Space, message } from 'antd'
import { ReloadOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons'
import { getTables, getColumns, generateEntities } from '@/api/codeGenerator'
import type { TableInfo, ColumnInfo } from '@/api/codeGenerator'
import './CodeGenerator.css'

export default function CodeGenerator() {
  const [loading, setLoading] = useState(false)
  const [columnLoading, setColumnLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [tables, setTables] = useState<TableInfo[]>([])
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)

  const loadTables = async () => {
    setLoading(true)
    try {
      const res = await getTables()
      setTables(res.data || [])
    } catch (error) {
      console.error(error)
      message.error('加载表列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = async (record: TableInfo | null) => {
    setSelectedTable(record)
    if (!record) {
      setColumns([])
      return
    }

    setColumnLoading(true)
    try {
      const res = await getColumns(record.name)
      setColumns(res.data || [])
    } catch (error) {
      console.error(error)
      message.error('加载列信息失败')
      setColumns([])
    } finally {
      setColumnLoading(false)
    }
  }

  const generateCode = async () => {
    if (!selectedTable) return

    setGenerating(true)
    try {
      const res = await generateEntities({ tableNames: [selectedTable.name] })
      message.success(res.data || '生成成功')
    } catch (error) {
      console.error(error)
      message.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const generateAll = async () => {
    setGenerating(true)
    try {
      const res = await generateEntities({ tableNames: [] })
      message.success(res.data || '生成成功')
    } catch (error) {
      console.error(error)
      message.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  const tableColumns = [
    {
      title: '表名',
      dataIndex: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description'
    }
  ]

  const columnColumns = [
    {
      title: '字段名',
      dataIndex: 'name',
      width: 150
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 100
    },
    {
      title: '长度',
      dataIndex: 'length',
      width: 80
    },
    {
      title: '主键',
      dataIndex: 'isPrimaryKey',
      width: 60,
      render: (isPrimaryKey: boolean) =>
        isPrimaryKey ? <Tag color="red">是</Tag> : null
    },
    {
      title: '自增',
      dataIndex: 'isIdentity',
      width: 60,
      render: (isIdentity: boolean) =>
        isIdentity ? <Tag color="orange">是</Tag> : null
    },
    {
      title: '可空',
      dataIndex: 'isNullable',
      width: 60,
      render: (isNullable: boolean) =>
        isNullable ? <Tag>是</Tag> : null
    },
    {
      title: '描述',
      dataIndex: 'description'
    }
  ]

  return (
    <div className="code-generator">
      <Card
        title="代码生成器"
        extra={
          <Button type="primary" onClick={loadTables} loading={loading} icon={<ReloadOutlined />}>
            刷新表列表
          </Button>
        }
      >
        <Row gutter={20}>
          <Col span={10}>
            <Card title={`数据库表 (${tables.length})`} bordered={false}>
              <Table
                dataSource={tables}
                columns={tableColumns}
                loading={loading}
                rowKey="name"
                pagination={false}
                scroll={{ y: 500 }}
                onRow={(record) => ({
                  onClick: () => handleTableSelect(record),
                  style: {
                    cursor: 'pointer',
                    backgroundColor:
                      selectedTable?.name === record.name ? '#e6f7ff' : undefined
                  }
                })}
              />
            </Card>
          </Col>

          <Col span={14}>
            <Card
              title={`字段信息${selectedTable ? ` - ${selectedTable.name}` : ''}`}
              bordered={false}
            >
              <Table
                dataSource={columns}
                columns={columnColumns}
                loading={columnLoading}
                rowKey="name"
                pagination={false}
                scroll={{ y: 500 }}
              />
            </Card>
          </Col>
        </Row>

        <div className="generate-actions">
          <Space size="large">
            <Button
              type="primary"
              size="large"
              onClick={generateCode}
              loading={generating}
              disabled={!selectedTable}
              icon={<FileTextOutlined />}
            >
              生成选中表的实体类
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={generateAll}
              loading={generating}
              disabled={tables.length === 0}
              icon={<FolderOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              生成所有表的实体类
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  )
}
