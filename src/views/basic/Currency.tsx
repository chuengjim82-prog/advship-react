import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'

// Data type
interface CurrencyData {
  id?: number
  code: string
  name: string
  symbol: string
  remark: string
}

// Zod validation schema
const currencySchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  symbol: z.string().default(''),
  remark: z.string().default(''),
})

export default function Currency() {
  // TanStack Table columns
  const columns: ColumnDef<CurrencyData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 150 },
    { accessorKey: 'name', header: '名称', size: 150 },
    { accessorKey: 'symbol', header: '符号', size: 100 },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<CurrencyData>) => (
    <>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>编码</FormLabel>
            <FormControl>
              <Input placeholder="请输入编码，如 USD" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>名称</FormLabel>
            <FormControl>
              <Input placeholder="请输入名称，如 美元" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="symbol"
        render={({ field }) => (
          <FormItem>
            <FormLabel>符号</FormLabel>
            <FormControl>
              <Input placeholder="请输入符号，如 $" {...field} />
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
  const defaultValues: CurrencyData = {
    code: '',
    name: '',
    symbol: '',
    remark: '',
  }

  return (
    <CrudTableV2<CurrencyData>
      title="币种管理"
      apiUrl="/base/api/Currency"
      columns={columns}
      formSchema={currencySchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
    />
  )
}
