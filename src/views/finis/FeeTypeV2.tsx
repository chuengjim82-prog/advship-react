import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import ServiceDialog, { type ServiceItem } from '@/components/ServiceDialog'
import type { SelectDialogRef } from '@/components/SelectDialog'

// Data type
interface FeeTypeData {
  id?: number
  cnName: string
  enName: string
  serviceId?: number | null
  serviceName?: string
  isSale: boolean
  isBuy: boolean
  statusi: number
  statuss?: string
  remark: string
}

// Zod validation schema
const feeTypeSchema = z.object({
  id: z.number().optional(),
  cnName: z.string().min(1, '请输入类别名称'),
  enName: z.string().default(''),
  serviceId: z.number().nullable().optional(),
  serviceName: z.string().default(''),
  isSale: z.boolean().default(true),
  isBuy: z.boolean().default(true),
  statusi: z.number().default(1),
  statuss: z.string().optional(),
  remark: z.string().default(''),
})

export default function FeeType() {
  const serviceDialogRef = useRef<SelectDialogRef>(null)
  const [currentForm, setCurrentForm] = useState<UseFormReturn<FeeTypeData> | null>(null)

  // TanStack Table columns
  const columns: ColumnDef<FeeTypeData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'cnName', header: '类别名称', size: 200 },
    { accessorKey: 'enName', header: '英文名称' },
    { accessorKey: 'serviceName', header: '产品服务', size: 150 },
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

  // Handle service selection
  const handleServiceSelect = useCallback((service: ServiceItem) => {
    if (currentForm) {
      currentForm.setValue('serviceId', service.id)
      currentForm.setValue('serviceName', service.name)
    }
  }, [currentForm])

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<FeeTypeData>) => {
    // Store form reference for dialog callback
    setCurrentForm(form)

    return (
      <>
        <FormField
          control={form.control}
          name="cnName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类别名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入类别名称" {...field} />
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
          name="serviceId"
          render={() => (
            <FormItem className="col-span-2">
              <FormLabel>产品服务</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="serviceName"
                    render={({ field }) => (
                      <Input
                        placeholder="请选择产品服务"
                        readOnly
                        className="flex-1"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => serviceDialogRef.current?.open()}
                  >
                    <MoreHorizontal className="mr-1 h-4 w-4" />
                    选择
                  </Button>
                </div>
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
    )
  }, [currentForm])

  // Default form values
  const defaultValues: FeeTypeData = {
    cnName: '',
    enName: '',
    serviceId: null,
    serviceName: '',
    isSale: true,
    isBuy: true,
    statusi: 1,
    statuss: '启用',
    remark: '',
  }

  return (
    <>
      <CrudTableV2<FeeTypeData>
        title="费用类别"
        apiUrl="/base/api/FeeType"
        columns={columns}
        formSchema={feeTypeSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <ServiceDialog ref={serviceDialogRef} onSelect={handleServiceSelect} />
    </>
  )
}
