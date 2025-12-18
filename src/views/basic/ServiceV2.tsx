import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'

// Data type
interface ServiceData {
  id?: number
  code: string
  name: string
  isSale: boolean
  isBuy: boolean
  statusi: number
  statuss?: string
  remark: string
}

// Zod validation schema
const serviceSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  isSale: z.boolean().default(true),
  isBuy: z.boolean().default(true),
  statusi: z.number().default(1),
  statuss: z.string().optional(),
  remark: z.string().default(''),
})

export default function Service() {
  // TanStack Table columns
  const columns: ColumnDef<ServiceData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称', size: 180 },
    {
      accessorKey: 'isSale',
      header: '销售',
      size: 100,
      cell: ({ getValue }) => (
        getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
      ),
    },
    {
      accessorKey: 'isBuy',
      header: '采购',
      size: 80,
      cell: ({ getValue }) => (
        getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
      ),
    },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => (
        getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>
      ),
    },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<ServiceData>) => (
    <>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>编码</FormLabel>
            <FormControl>
              <Input placeholder="请输入编码" {...field} />
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
              <Input placeholder="请输入名称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="isSale"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">销售</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="isBuy"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">采购</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="statusi"
        render={({ field }) => (
          <FormItem className="col-span-2 flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">状态</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value === 1}
                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
              />
            </FormControl>
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
  const defaultValues: ServiceData = {
    code: '',
    name: '',
    isSale: true,
    isBuy: true,
    statusi: 1,
    statuss: '启用',
    remark: '',
  }

  return (
    <CrudTableV2<ServiceData>
      title="服务项目管理"
      apiUrl="/base/api/Service"
      columns={columns}
      formSchema={serviceSchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
    />
  )
}
