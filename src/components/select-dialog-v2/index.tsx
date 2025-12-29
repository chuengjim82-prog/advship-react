import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'

export interface SelectDialogV2Props<T extends object> {
  title: string
  apiUrl: string
  columns: ColumnDef<T>[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (record: T) => void
  searchPlaceholder?: string
  width?: string
}

export interface SelectDialogV2Ref {
  loadData: () => Promise<void>
}

function SelectDialogV2Inner<T extends object>(
  props: SelectDialogV2Props<T>,
  ref: React.Ref<SelectDialogV2Ref>
) {
  const {
    title,
    apiUrl,
    columns,
    open,
    onOpenChange,
    onSelect,
    searchPlaceholder = '请输入关键词搜索',
    width = '800px',
  } = props

  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRow, setSelectedRow] = useState<T | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request.get<PageResult<T>>(apiUrl, {
        params: {
          pageIndex,
          pageSize,
          keyword: searchKeyword,
        },
      })
      setTableData(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, pageIndex, pageSize, searchKeyword])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  useEffect(() => {
    if (open) {
      setSelectedRow(null)
      setSearchKeyword('')
      setPageIndex(1)
    }
  }, [open])

  const handleSearch = useCallback(() => {
    setPageIndex(1)
    loadData()
  }, [loadData])

  const handlePageChange = useCallback((page: number, size: number) => {
    setPageIndex(page)
    setPageSize(size)
  }, [])

  const handleRowClick = useCallback((record: T) => {
    setSelectedRow(record)
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedRow && onSelect) {
      onSelect(selectedRow)
      onOpenChange(false)
    }
  }, [selectedRow, onSelect, onOpenChange])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useImperativeHandle(ref, () => ({
    loadData,
  }), [loadData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: width }} className="max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 py-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button variant="default" size="sm" onClick={handleSearch}>
            <Search className="mr-1 h-4 w-4" />
            搜索
          </Button>
        </div>

        <div className="flex-1 overflow-auto rounded-md border min-h-[350px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.column.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`cursor-pointer ${selectedRow && (selectedRow as any).id === (row.original as any).id
                      ? 'bg-primary/10'
                      : ''
                      }`}
                    onClick={() => handleRowClick(row.original)}
                    onDoubleClick={() => {
                      setSelectedRow(row.original)
                      if (onSelect) {
                        onSelect(row.original)
                        onOpenChange(false)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="py-2">
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRow}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const SelectDialogV2 = forwardRef(SelectDialogV2Inner) as <T extends object>(
  props: SelectDialogV2Props<T> & { ref?: React.Ref<SelectDialogV2Ref> }
) => React.ReactElement

export default SelectDialogV2
