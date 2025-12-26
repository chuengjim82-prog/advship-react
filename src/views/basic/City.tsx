import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2, { type SearchField } from '@/components/crud-table-v2'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'

interface CityData {
  id?: number
  code: string
  cnName: string
  enName: string
  remark: string
  countryId?: number | null
  countryCode2?: string
}

interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
}

const citySchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  cnName: z.string().min(1, '请输入中文名称'),
  enName: z.string().default(''),
  remark: z.string().default(''),
  countryId: z.number().nullable().optional(),
  countryCode2: z.string().default(''),
})

export default function City() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [searchCountryDialogOpen, setSearchCountryDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<CityData> | null>(null)

  const countryColumns: ColumnDef<CountryItem>[] = [
    { accessorKey: 'code2', header: '二字码', size: 100 },
    { accessorKey: 'code3', header: '三字码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleCountrySelect = useCallback((country: CountryItem) => {
    if (formRef.current) {
      formRef.current.setValue('countryId', country.id)
      formRef.current.setValue('countryCode2', country.code2)
    }
  }, [])

  const columns: ColumnDef<CityData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
    { accessorKey: 'countryCode2', header: '国家', size: 100 },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<CityData>) => {
    formRef.current = form
    return (
      <>
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>编码</FormLabel>
            <FormControl><Input placeholder="请输入编码" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="cnName" render={({ field }) => (
          <FormItem>
            <FormLabel>中文名称</FormLabel>
            <FormControl><Input placeholder="请输入中文名称" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="enName" render={({ field }) => (
          <FormItem>
            <FormLabel>英文名称</FormLabel>
            <FormControl><Input placeholder="请输入英文名称" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="countryCode2" render={({ field }) => (
          <FormItem>
            <FormLabel>国家</FormLabel>
            <div className="flex gap-2">
              <FormControl><Input placeholder="请选择国家" readOnly {...field} /></FormControl>
              <Button type="button" variant="outline" size="icon" onClick={() => setCountryDialogOpen(true)}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="remark" render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>备注</FormLabel>
            <FormControl><Textarea placeholder="请输入备注" rows={3} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </>
    )
  }, [])

  const defaultValues: CityData = {
    code: '',
    cnName: '',
    enName: '',
    remark: '',
    countryId: null,
    countryCode2: '',
  }

  // 保存搜索区国家选择的onChange回调
  const searchCountryOnChangeRef = useRef<((value: string) => void) | null>(null)

  // 多字段搜索配置
  const searchFields: SearchField[] = [
    { name: 'code', label: '编码', placeholder: '请输入编码' },
    { name: 'cnName', label: '中文名', placeholder: '请输入中文名' },
    { 
      name: 'countryCode2', 
      label: '国家', 
      type: 'custom',
      render: (value, onChange) => {
        // 保存onChange引用以便在弹窗选择后调用
        searchCountryOnChangeRef.current = onChange
        return (
          <div className="flex gap-1">
            <Input 
              placeholder="请选择国家" 
              readOnly 
              value={value || ''}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => setSearchCountryDialogOpen(true)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    },
  ]

  return (
    <>
      <CrudTableV2<CityData>
        title="城市管理"
        apiUrl="/base/api/city"
        columns={columns}
        formSchema={citySchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
        searchFields={searchFields}
        searchVisibleRows={1}
      />
      {/* 表单编辑用国家选择弹窗 */}
      <SelectDialogV2<CountryItem>
        title="选择国家"
        apiUrl="/base/api/country"
        columns={countryColumns}
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSelect={handleCountrySelect}
      />
      {/* 搜索区域国家选择弹窗 */}
      <SelectDialogV2<CountryItem>
        title="选择国家"
        apiUrl="/base/api/country"
        columns={countryColumns}
        open={searchCountryDialogOpen}
        onOpenChange={setSearchCountryDialogOpen}
        onSelect={(country) => {
          // 通过保存的onChange回调更新搜索参数
          if (searchCountryOnChangeRef.current) {
            searchCountryOnChangeRef.current(country.code2)
          }
        }}
      />
    </>
  )
}
