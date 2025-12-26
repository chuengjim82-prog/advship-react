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
import { Search, Plus, RefreshCw, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export type { SearchField }

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

  // State
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchParams, setSearchParams] = useState<Record<string, string>>({})
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<T | null>(null)

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
      const params: Record<string, any> = {
        pageIndex: pagination.pageIndex + 1, // API uses 1-based index
        pageSize: pagination.pageSize,
      }
      
      // Use multi-field search if searchFields is configured
      if (searchFields && searchFields.length > 0) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params[key] = value
        })
      } else {
        params.keyword = searchKeyword
      }
      
      const res = await request.get<PageResult<T>>(apiUrl, { params })
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
  }, [apiUrl, pagination.pageIndex, pagination.pageSize, searchKeyword, searchParams, searchFields, onLoaded])

  // Load data on mount and when pagination/search changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // 用于存储待搜索的参数（解决自定义字段异步更新问题）
  const pendingSearchRef = React.useRef<Record<string, string> | null>(null)

  // Handle search
  const handleSearch = useCallback((immediateParams?: Record<string, string>) => {
    // 如果传入了立即参数，先更新 searchParams
    if (immediateParams) {
      setSearchParams(prev => ({ ...prev, ...immediateParams }))
      pendingSearchRef.current = { ...searchParams, ...immediateParams }
    }
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [searchParams])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchKeyword('')
    setSearchParams({})
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
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

  // Calculate visible fields based on searchVisibleRows
  const fieldsPerRow = 4 // fields per row
  const maxVisibleFields = searchVisibleRows * fieldsPerRow
  const visibleSearchFields = searchFields && !searchExpanded 
    ? searchFields.slice(0, maxVisibleFields) 
    : searchFields
  const hasMoreFields = searchFields && searchFields.length > maxVisibleFields

  return (
    <div className="crud-table-v2">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>{title}</CardTitle>
            </div>
            
            {/* Search Area */}
            {searchFields && searchFields.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {visibleSearchFields?.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                      <label className="text-sm text-muted-foreground">{field.label}</label>
                      {field.type === 'custom' && field.render ? (
                        field.render(
                          searchParams[field.name] || '',
                          (value) => setSearchParams(prev => ({ ...prev, [field.name]: value })),
                          handleSearch // 传入搜索函数，让自定义渲染可以触发搜索
                        )
                      ) : (
                        <Input
                          placeholder={field.placeholder || `请输入${field.label}`}
                          value={searchParams[field.name] || ''}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, [field.name]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="default" size="sm" onClick={() => handleSearch()}>
                    <Search className="mr-1 h-4 w-4" />
                    搜索
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
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
                  {hasMoreFields && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSearchExpanded(!searchExpanded)}
                    >
                      {searchExpanded ? '收起' : '展开'}
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
                <Button variant="default" size="sm" onClick={() => handleSearch()}>
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
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="rounded-md border">
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

export default forwardRef(CrudTableV2) as <T extends FieldValues = FieldValues>(
  props: CrudTableV2Props<T> & { ref?: React.Ref<CrudTableV2Ref> }
) => React.ReactElement
