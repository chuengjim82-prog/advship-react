import { useState, useCallback, useRef, useEffect } from 'react'
import { message } from 'antd'
import request from '@/utils/request'
import type { PageResult } from '@/utils/request'

interface UseTableDataOptions {
  apiUrl: string
  onLoaded?: (data: any[]) => void
}

export function useTableData({ apiUrl, onLoaded }: UseTableDataOptions) {
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Use ref to store onLoaded callback to avoid dependency issues
  const onLoadedRef = useRef(onLoaded)
  useEffect(() => {
    onLoadedRef.current = onLoaded
  }, [onLoaded])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request.get<PageResult<any>>(apiUrl, {
        params: {
          pageIndex,
          pageSize,
          keyword: searchKeyword
        }
      })
      const items = res.data?.items || []
      setTableData(items)
      setTotal(res.data?.total || 0)
      onLoadedRef.current?.(items)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [apiUrl, pageIndex, pageSize, searchKeyword])

  const handleDelete = useCallback(async (id: string | number) => {
    try {
      await request.delete(`${apiUrl}/${id}`)
      message.success('删除成功')
      await loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }, [apiUrl, loadData])

  const handleSearch = useCallback(() => {
    setPageIndex(1)
    loadData()
  }, [loadData])

  const handleRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  const handlePageChange = useCallback((page: number, newPageSize?: number) => {
    setPageIndex(page)
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setPageIndex(1) // Reset to first page when page size changes
    }
  }, [pageSize])

  return {
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
  }
}
