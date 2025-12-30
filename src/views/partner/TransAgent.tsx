import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface TransAgentData {
  id?: number
  code: string
  name: string
  contact: string
  phone: string
  address: string
  remark: string
  countryId?: number | null
  countryCode2?: string
  allowIn: boolean
}

interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
}

const transAgentSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  contact: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  remark: z.string().default(''),
  countryId: z.number().nullable().optional(),
  countryCode2: z.string().default(''),
  allowIn: z.boolean().default(true),
})

export default function TransAgent() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<TransAgentData> | null>(null)

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


  const columns: ColumnDef<TransAgentData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称', size: 200 },
    { accessorKey: 'countryCode2', header: '国家', size: 100 },
    {
      accessorKey: 'allowIn',
      header: '可进海关',
      size: 120,
      cell: ({ getValue }) => (
        getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
      ),
    }, { accessorKey: 'contact', header: '联系人', size: 120 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址', size: 200 },
    { accessorKey: 'remark', header: '备注', size: 200 },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<TransAgentData>) => {
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
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>名称</FormLabel>
            <FormControl><Input placeholder="请输入名称" {...field} /></FormControl>
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

        <FormField control={form.control} name="contact" render={({ field }) => (
          <FormItem>
            <FormLabel>联系人</FormLabel>
            <FormControl><Input placeholder="请输入联系人" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>联系电话</FormLabel>
            <FormControl><Input placeholder="请输入联系电话" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="allowIn" render={({ field }) => (
          <FormItem className="">
            <FormLabel>可进海关</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked ? true : false)}
                />
              </div>

            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>地址</FormLabel>
            <FormControl><Input placeholder="请输入地址" {...field} /></FormControl>
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

  const defaultValues: TransAgentData = {
    code: '',
    name: '',
    contact: '',
    phone: '',
    address: '',
    remark: '',
    countryId: null,
    countryCode2: '',
    allowIn: true,
  }

  return (
    <>
      <CrudTableV2<TransAgentData>
        title="运输公司"
        apiUrl="/base/api/TransAgent"
        columns={columns}
        formSchema={transAgentSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <SelectDialogV2<CountryItem>
        title="选择国家"
        apiUrl="/base/api/country"
        columns={countryColumns}
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSelect={handleCountrySelect}
      />
    </>
  )
}


