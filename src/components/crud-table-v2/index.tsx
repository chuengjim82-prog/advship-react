import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { Search, Plus, RefreshCw, Edit, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Form } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'
import type { CrudTableV2Props, CrudTableV2Ref, SearchField } from './types'

function CrudTableV2<T extends FieldValues = FieldValues>(
  props: CrudTableV2Props<T>,
  ref: React.Ref<CrudTableV2Ref>
) {
  const {
    title,
    apiUrl,
    columns,
    formSchema,
    renderFormFields,
    defaultValues,
    searchPlaceholder = '请输入关键词搜索',
    dialogWidth = '600px',
    dialogClassName,
    searchFields,
    searchVisibleRows = 2,
    onLoaded,
    onBeforeSubmit,
    onAfterSubmit,
  } = props

  // 每行显示的搜索字段数量（基于每个字段约 200px 宽度）
  const FIELDS_PER_ROW = 4

  // State
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('') // Actually used in API call
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<T | null>(null)

  // 多字段搜索状态
  const [searchValues, setSearchValues] = useState<Record<string, string>>({})
  const [appliedSearchValues, setAppliedSearchValues] = useState<Record<string, string>>({})
  const [searchExpanded, setSearchExpanded] = useState(false)

  // 判断是否需要展开/收起按钮
  const hasMultiSearch = searchFields && searchFields.length > 0
  const visibleFieldCount = searchVisibleRows * FIELDS_PER_ROW
  const needsExpand = hasMultiSearch && searchFields.length > visibleFieldCount

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // TanStack Table uses 0-based index
    pageSize: 10,
  })

  // Form
  const form = useForm<T>({
    // @ts-expect-error - zodResolver type inference issue with generic Zod schemas
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as any,
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 构建搜索参数
      const searchParams: Record<string, unknown> = {
        pageIndex: pagination.pageIndex + 1, // API uses 1-based index
        pageSize: pagination.pageSize,
      }

      if (hasMultiSearch) {
        // 多字段搜索模式
        Object.entries(appliedSearchValues).forEach(([key, value]) => {
          if (value && value.trim()) {
            searchParams[key] = value.trim()
          }
        })
      } else {
        // 单关键词搜索模式（保持兼容）
        const keyword = appliedKeyword.trim() || undefined
        if (keyword) {
          searchParams.keyword = keyword
          searchParams.Keyword = keyword // 兼容部分后端使用大写参数名
          searchParams.keyWord = keyword // 兼容驼峰写法
          searchParams.search = keyword // 兼容 search
          searchParams.q = keyword // 兼容 q
          searchParams.query = keyword // 兼容 query
        }
      }

      const res = await request.get<PageResult<T>>(apiUrl, { params: searchParams })
      const items = res.data?.items || []
      setTableData(items)
      setTotal(res.data?.total || 0)
      onLoaded?.(items)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, pagination.pageIndex, pagination.pageSize, appliedKeyword, appliedSearchValues, hasMultiSearch, onLoaded])

  // Load data on mount and when pagination/search changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle search - apply keyword and reset page
  const handleSearch = useCallback(() => {
    if (hasMultiSearch) {
      setAppliedSearchValues({ ...searchValues })
    } else {
      setAppliedKeyword(searchKeyword)
    }
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [hasMultiSearch, searchKeyword, searchValues])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    if (hasMultiSearch) {
      setSearchValues({})
      setAppliedSearchValues({})
    } else {
      setSearchKeyword('')
      setAppliedKeyword('')
    }
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [hasMultiSearch])

  // Handle search field value change
  const handleSearchFieldChange = useCallback((fieldName: string, value: string) => {
    setSearchValues(prev => ({ ...prev, [fieldName]: value }))
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  // Handle add
  const handleAdd = useCallback(() => {
    setIsEdit(false)
    form.reset(defaultValues as any)
    setDialogOpen(true)
  }, [form, defaultValues])

  // Handle edit
  const handleEdit = useCallback((record: T) => {
    setIsEdit(true)
    form.reset(record as any)
    setDialogOpen(true)
  }, [form])

  // Handle submit
  const handleSubmit = useCallback(async (values: T) => {
    setSubmitLoading(true)
    try {
      let submitValues = values
      if (onBeforeSubmit) {
        submitValues = await onBeforeSubmit(values)
      }

      if (isEdit) {
        await request.put(apiUrl, submitValues)
        toast.success('修改成功')
      } else {
        await request.post(apiUrl, submitValues)
        toast.success('新增成功')
      }

      setDialogOpen(false)
      await loadData()
      onAfterSubmit?.(submitValues)
    } catch (error) {
      console.error('Form submission failed:', error)
      toast.error(isEdit ? '修改失败' : '新增失败')
    } finally {
      setSubmitLoading(false)
    }
  }, [apiUrl, isEdit, loadData, onBeforeSubmit, onAfterSubmit])

  // Handle delete
  const handleDelete = useCallback((record: T) => {
    setRecordToDelete(record)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!recordToDelete || !recordToDelete.id) return

    try {
      await request.delete(`${apiUrl}/${recordToDelete.id}`)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setRecordToDelete(null)
      await loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('删除失败')
    }
  }, [apiUrl, recordToDelete, loadData])

  // Format date helper
  const formatDate = useCallback((dateStr: string | null) => {
    if (!dateStr) return ''
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
  }, [])

  // Add action and createTime columns
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [...columns]

    // Add createTime column if not present
    const hasCreateTime = columns.some(col =>
      'accessorKey' in col && col.accessorKey === 'createTime'
    )
    if (!hasCreateTime) {
      cols.push({
        accessorKey: 'createTime' as any,
        header: '创建时间',
        size: 180,
        cell: ({ getValue }) => formatDate(getValue() as string),
      })
    }

    // Add action column
    cols.push({
      id: 'actions',
      header: '操作',
      size: 180,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
            className="h-8 px-2"
          >
            <Edit className="mr-1 h-4 w-4" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            删除
          </Button>
        </div>
      ),
    })

    return cols
  }, [columns, formatDate, handleEdit, handleDelete])

  // TanStack Table instance
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  })

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    loadData,
    openAddDialog: handleAdd,
    openEditDialog: handleEdit,
  }), [loadData, handleAdd, handleEdit])

  return (
    <div className="crud-table-v2">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-3">
            <CardTitle>{title}</CardTitle>
          </div>

          {/* 搜索区域 */}
          {hasMultiSearch && searchFields ? (
            <div className="space-y-3">
              <div
                className={cn(
                  "grid gap-3 overflow-hidden transition-all duration-300",
                  "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                )}
                style={{
                  maxHeight: searchExpanded || !needsExpand
                    ? `${Math.ceil(searchFields.length / FIELDS_PER_ROW) * 56}px`
                    : `${searchVisibleRows * 56}px`,
                }}
              >
                {searchFields.map((field: SearchField) => (
                  <div key={field.name} className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap min-w-[60px]">
                      {field.label}
                    </label>
                    {field.type === 'select' && field.options ? (
                      <Select
                        value={searchValues[field.name] || ''}
                        onValueChange={(value) => handleSearchFieldChange(field.name, value)}
                      >
                        <SelectTrigger className="flex-1 h-8">
                          <SelectValue placeholder={field.placeholder || `请选择${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt) => (
                            <SelectItem key={String(opt.value)} value={String(opt.value)}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={field.placeholder || `请输入${field.label}`}
                        value={searchValues[field.name] || ''}
                        onChange={(e) => handleSearchFieldChange(field.name, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 h-8"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={handleSearch}>
                  <Search className="mr-1 h-4 w-4" />
                  搜索
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  <X className="mr-1 h-4 w-4" />
                  清空
                </Button>
                <Button variant="default" size="sm" onClick={handleAdd}>
                  <Plus className="mr-1 h-4 w-4" />
                  新增
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  刷新
                </Button>
                {needsExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchExpanded(!searchExpanded)}
                    className="ml-auto"
                  >
                    {searchExpanded ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        收起
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        展开
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder={searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-[200px]"
              />
              <Button variant="default" size="sm" onClick={handleSearch}>
                <Search className="mr-1 h-4 w-4" />
                搜索
              </Button>
              <Button variant="default" size="sm" onClick={handleAdd}>
                <Plus className="mr-1 h-4 w-4" />
                新增
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-1 h-4 w-4" />
                刷新
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table style={{ width: 'max-content', minWidth: '100%' }}>
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
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      colSpan={tableColumns.length}
                      className="h-24 text-center"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                上一页
              </Button>
              <div className="text-sm">
                第 {pagination.pageIndex + 1} / {table.getPageCount()} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(dialogClassName)} style={{ maxWidth: dialogWidth }}>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑' : '新增'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderFormFields(form as any)}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? '提交中...' : '确定'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const CrudTableV2Component = forwardRef(CrudTableV2) as <T extends FieldValues = FieldValues>(
  props: CrudTableV2Props<T> & { ref?: React.Ref<CrudTableV2Ref> }
) => React.ReactElement

export type { CrudTableV2Props, CrudTableV2Ref, SearchField }
export default CrudTableV2Component
