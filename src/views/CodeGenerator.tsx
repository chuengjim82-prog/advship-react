import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, FileText, Folder } from 'lucide-react'
import { getTables, getColumns, generateEntities } from '@/api/codeGenerator'
import type { TableInfo, ColumnInfo } from '@/api/codeGenerator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
      toast.error('加载表列表失败')
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
      toast.error('加载列信息失败')
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
      toast.success(res.data || '生成成功')
    } catch (error) {
      console.error(error)
      toast.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  const generateAll = async () => {
    setGenerating(true)
    try {
      const res = await generateEntities({ tableNames: [] })
      toast.success(res.data || '生成成功')
    } catch (error) {
      console.error(error)
      toast.error('生成失败')
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>代码生成器</CardTitle>
          <Button onClick={loadTables} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            刷新表列表
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Tables List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">数据库表 ({tables.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>表名</TableHead>
                          <TableHead>描述</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              加载中...
                            </TableCell>
                          </TableRow>
                        ) : tables.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        ) : (
                          tables.map((table) => (
                            <TableRow
                              key={table.name}
                              className={cn(
                                "cursor-pointer hover:bg-muted/50",
                                selectedTable?.name === table.name && "bg-primary/10"
                              )}
                              onClick={() => handleTableSelect(table)}
                            >
                              <TableCell className="font-medium">{table.name}</TableCell>
                              <TableCell>{table.description}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Columns List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">
                    字段信息{selectedTable ? ` - ${selectedTable.name}` : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">字段名</TableHead>
                          <TableHead className="w-[100px]">数据类型</TableHead>
                          <TableHead className="w-[80px]">长度</TableHead>
                          <TableHead className="w-[60px]">主键</TableHead>
                          <TableHead className="w-[60px]">自增</TableHead>
                          <TableHead className="w-[60px]">可空</TableHead>
                          <TableHead>描述</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              加载中...
                            </TableCell>
                          </TableRow>
                        ) : columns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              {selectedTable ? '暂无字段信息' : '请选择一个表'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          columns.map((column) => (
                            <TableRow key={column.name}>
                              <TableCell className="font-medium">{column.name}</TableCell>
                              <TableCell>{column.dataType}</TableCell>
                              <TableCell>{column.length}</TableCell>
                              <TableCell>
                                {column.isPrimaryKey && <Badge variant="destructive">是</Badge>}
                              </TableCell>
                              <TableCell>
                                {column.isIdentity && <Badge variant="warning">是</Badge>}
                              </TableCell>
                              <TableCell>
                                {column.isNullable && <Badge variant="outline">是</Badge>}
                              </TableCell>
                              <TableCell>{column.description}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              onClick={generateCode}
              disabled={!selectedTable || generating}
            >
              <FileText className="h-4 w-4 mr-2" />
              生成选中表的实体类
            </Button>
            <Button
              size="lg"
              onClick={generateAll}
              disabled={tables.length === 0 || generating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Folder className="h-4 w-4 mr-2" />
              生成所有表的实体类
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
