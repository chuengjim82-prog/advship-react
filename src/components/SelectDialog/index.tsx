// This component is deprecated - use select-dialog-v2 instead
import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'
import { toast } from 'sonner'
import './index.css'

export interface SelectDialogRef {
  open: () => void
}

interface Column<T> {
  title: string
  dataIndex: keyof T | string
  width?: number
  render?: (value: unknown, record: T) => React.ReactNode
}

interface SelectDialogProps<T> {
  title: string
  apiUrl: string
  columns: Column<T>[]
  placeholder?: string
  onSelect: (item: T) => void
  width?: number
}

function SelectDialogInner<T extends { id: number }>(
  props: SelectDialogProps<T>,
  ref: React.Ref<SelectDialogRef>
) {
  const { title, apiUrl, columns, placeholder = '请输入关键词搜索', onSelect } = props

  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<T[]>([])
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true)
      loadData()
    }
  }))

  const loadData = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
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
  }, [currentPage, visible])

  const handleClose = () => {
    setVisible(false)
    setSelectedRow(null)
    setKeyword('')
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadData()
  }

  const handleRowClick = (record: T) => {
    setSelectedRow(record)
  }

  const handleRowDoubleClick = (record: T) => {
    onSelect(record)
    handleClose()
  }

  const handleConfirm = () => {
    if (!selectedRow) {
      toast.warning('请选择一项')
      return
    }
    onSelect(selectedRow)
    handleClose()
  }

  const totalPages = Math.ceil(total / pageSize)

  const getCellValue = (record: T, dataIndex: keyof T | string): unknown => {
    return record[dataIndex as keyof T]
  }

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={() => { setKeyword(''); setCurrentPage(1); loadData() }}>重置</Button>
          </div>

          <div className="border rounded-md max-h-[360px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, idx) => (
                    <TableHead key={idx} style={{ width: col.width }}>{col.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : dataSource.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  dataSource.map((record) => (
                    <TableRow
                      key={record.id}
                      className={`cursor-pointer ${selectedRow?.id === record.id ? 'bg-primary/10' : ''}`}
                      onClick={() => handleRowClick(record)}
                      onDoubleClick={() => handleRowDoubleClick(record)}
                    >
                      {columns.map((col, idx) => (
                        <TableCell key={idx}>
                          {col.render
                            ? col.render(getCellValue(record, col.dataIndex), record)
                            : String(getCellValue(record, col.dataIndex) ?? '-')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">共 {total} 条</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="px-2 py-1">{currentPage} / {totalPages || 1}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>取消</Button>
          <Button onClick={handleConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SelectDialog = forwardRef(SelectDialogInner) as <T extends { id: number }>(
  props: SelectDialogProps<T> & { ref?: React.Ref<SelectDialogRef> }
) => React.ReactElement

export default SelectDialog
