import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2, { type SearchField } from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'

// Data type
interface CountryData {
  id?: number
  code2: string
  code3: string
  cnName: string
  enName: string
  currency: string
  timeZone: number
  remark: string
}

// Zod validation schema
const countrySchema = z.object({
  id: z.number().optional(),
  cnName: z.string().min(1, '请输入中文名称'),
  enName: z.string().default(''),
  code2: z.string().min(1, '请输入二字码').max(2, '二字码最多2个字符'),
  code3: z.string().min(1, '请输入三字码').max(3, '三字码最多3个字符'),
  currency: z.string().default(''),
  timeZone: z.number().min(-12).max(12),
  remark: z.string().default(''),
})

export default function Country() {
  // TanStack Table columns
  const columns: ColumnDef<CountryData>[] = [
    {
      accessorKey: 'id',
      header: '主键',
      size: 80,
    },
    {
      accessorKey: 'cnName',
      header: '中文名称',
      size: 150,
    },
    {
      accessorKey: 'enName',
      header: '英文名称',
      size: 200,
    },
    {
      accessorKey: 'code2',
      header: '二字码',
      size: 120,
    },
    {
      accessorKey: 'code3',
      header: '三字码',
      size: 120,
    },
    {
      accessorKey: 'currency',
      header: '币种',
      size: 100,
    },
    {
      accessorKey: 'timeZone',
      header: '时区',
      size: 80,
    },
    {
      accessorKey: 'remark',
      header: '备注',
    },
  ]

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<CountryData>) => (
    <>
      <FormField
        control={form.control}
        name="cnName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>中文名称</FormLabel>
            <FormControl>
              <Input placeholder="请输入中文名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="enName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>英文名称</FormLabel>
            <FormControl>
              <Input placeholder="请输入英文名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="code2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>二字码</FormLabel>
            <FormControl>
              <Input placeholder="请输入二字码" maxLength={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="code3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>三字码</FormLabel>
            <FormControl>
              <Input placeholder="请输入三字码" maxLength={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>币种</FormLabel>
            <FormControl>
              <Input placeholder="请输入币种" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="timeZone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>时区</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="请输入时区"
                min={-12}
                max={12}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="remark"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>备注</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="请输入备注"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  ), [])

  // Default form values
  const defaultValues: CountryData = {
    code2: '',
    code3: '',
    cnName: '',
    enName: '',
    currency: '',
    timeZone: 8,
    remark: '',
  }
  // 多字段搜索配置
  const searchFields: SearchField[] = [
    // { name: 'cnName', label: '中文名称', placeholder: '请输入中文名称' },
    // { name: 'enName', label: '英文名称', placeholder: '请输入英文名称' },
    // { name: 'code2', label: '二字码', placeholder: '请输入二字码' },
    // { name: 'code3', label: '三字码', placeholder: '请输入三字码' },
  ]

  return (
    <CrudTableV2<CountryData>
      title="国家管理"
      apiUrl="/base/api/Country"
      columns={columns}
      formSchema={countrySchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
      searchFields={searchFields}
      searchVisibleRows={1}
    />
  )
}
