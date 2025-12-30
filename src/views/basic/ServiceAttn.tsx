import { useCallback, useRef, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { RadioGroup } from '@radix-ui/react-radio-group'
import { RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@radix-ui/react-label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import SelectDialogV2 from '@/components/select-dialog-v2'

// Data type
interface ServiceAttnData {
  id?: number
  service?: number
  serviceName?: string
  fileName: string
  dirtType: number
  neAudit: boolean
  neExtract: boolean
  remark: string
}

interface ServiceItem {
  id: number
  name: string
  code: string
}

// Zod validation schema
const serviceAttnSchema = z.object({
  id: z.number().optional(),
  service: z.number().optional(),
  fileName: z.string().min(1, '请输入文件名称'),
  dirtType: z.number().default(0),
  neAudit: z.boolean().default(true),
  neExtract: z.boolean().default(true),
  remark: z.string().default(''),
})


export default function Service() {
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<ServiceAttnData> | null>(null)

  const serviceColumns: ColumnDef<ServiceItem>[] = [
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称' },
  ]

  const handleServiceSelect = useCallback((service: ServiceItem) => {
    if (formRef.current) {
      formRef.current.setValue('service', service.id)
      formRef.current.setValue('serviceName', service.name)
    }
  }, [])
  // TanStack Table columns
  const columns: ColumnDef<ServiceAttnData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'serviceName', header: '产品', size: 150 },
    { accessorKey: 'fileName', header: '文件名称', size: 250 },
    {
      accessorKey: 'dirtType',
      header: '收集/存入',
      size: 80,
      cell: ({ getValue }) => (
        getValue() === 0 ? "收集" : "存入"
      ),
    },
    {
      accessorKey: 'neAudit',
      header: '需要审核',
      size: 80,
      cell: ({ getValue }) => (
        getValue() === false ? <Badge variant="outline">否</Badge> : <Badge variant="blue">是</Badge>
      ),
    },
    {
      accessorKey: 'NeExtract',
      header: '提取内容',
      size: 80,
      cell: ({ getValue }) => (
        getValue() === false ? <Badge variant="outline">否</Badge> : <Badge variant="blue">是</Badge>
      ),
    },
    { accessorKey: 'remark', header: '备注', size: 300 },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<ServiceAttnData>) => {
    formRef.current = form
    return (
      <>
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
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>文件名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入文件名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="dirtType" render={({ field }) => (
          <FormItem>
            <FormLabel>收集/存入</FormLabel>
            <FormControl>
              <RadioGroup value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="type0" />
                  <Label htmlFor="type0">收集</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="type1" />
                  <Label htmlFor="type1">存入</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <FormField control={form.control} name="neAudit" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="text-sm">需要审核</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="neExtract" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="text-sm">提取内容</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>
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
          )} />
      </>
    )
  }, [])

  // Default form values
  const defaultValues: ServiceAttnData = {
    service: 0,
    fileName: '',
    dirtType: 0,
    neAudit: true,
    neExtract: true,
    remark: '',
  }

  return (
    <>
      <CrudTableV2<ServiceAttnData>
        title="产品服务附件"
        apiUrl="/base/api/ServiceAttn"
        columns={columns}
        formSchema={serviceAttnSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
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
