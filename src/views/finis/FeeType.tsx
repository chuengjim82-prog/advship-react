import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'

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

interface ServiceItem {
  id: number
  name: string
  code: string
}

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
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<FeeTypeData> | null>(null)

  const serviceColumns: ColumnDef<ServiceItem>[] = [
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称' },
  ]

  const handleServiceSelect = useCallback((service: ServiceItem) => {
    if (formRef.current) {
      formRef.current.setValue('serviceId', service.id)
      formRef.current.setValue('serviceName', service.name)
    }
  }, [])

  const columns: ColumnDef<FeeTypeData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'cnName', header: '类别名称', size: 200 },
    { accessorKey: 'enName', header: '英文名称', size: 250 },
    { accessorKey: 'serviceName', header: '产品服务', size: 120 },
    {
      accessorKey: 'isSale',
      header: '销售',
      size: 80,
      cell: ({ getValue }) => getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>,
    },
    {
      accessorKey: 'isBuy',
      header: '采购',
      size: 80,
      cell: ({ getValue }) => getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>,
    },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>,
    },
    { accessorKey: 'remark', header: '备注', size: 300 },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<FeeTypeData>) => {
    formRef.current = form
    return (
      <>
        <FormField control={form.control} name="cnName" render={({ field }) => (
          <FormItem>
            <FormLabel>类别名称</FormLabel>
            <FormControl><Input placeholder="请输入类别名称" {...field} /></FormControl>
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
        <FormField control={form.control} name="serviceName" render={({ field }) => (
          <FormItem>
            <FormLabel>产品服务</FormLabel>
            <div className="flex gap-2">
              <FormControl><Input placeholder="请选择产品服务" readOnly {...field} /></FormControl>
              <Button type="button" variant="outline" size="icon" onClick={() => setServiceDialogOpen(true)}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <div className="col-span-2 grid grid-cols-3 gap-4">
          <FormField control={form.control} name="isSale" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="text-sm">销售</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="isBuy" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="text-sm">采购</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="statusi" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="text-sm">状态</FormLabel>
              <FormControl><Switch checked={field.value === 1} onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} /></FormControl>
            </FormItem>
          )} />
        </div>
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

  const syncStatusText = useCallback((values: FeeTypeData) => ({
    ...values,
    statuss: values.statusi === 1 ? '启用' : '停用',
  }), [])

  return (
    <>
      <CrudTableV2<FeeTypeData>
        title="费用类别"
        apiUrl="/base/api/FeeType"
        columns={columns}
        formSchema={feeTypeSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
        onBeforeSubmit={syncStatusText}
      />
      <SelectDialogV2<ServiceItem>
        title="选择产品服务"
        apiUrl="/base/api/service"
        columns={serviceColumns}
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onSelect={handleServiceSelect}
      />
    </>
  )
}
