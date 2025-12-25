import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'


interface CustomerData {
  id?: number
  code: string
  name: string
  countryId?: number | null
  countryCode2?: string
  cityName: string
  contact: string
  phone: string
  address: string
  statusi: number
  remark: string
}

interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
}
const customerSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  countryId: z.number().nullable().optional(),
  countryCode2: z.string().default(''),
  cityName: z.string().default(''),
  contact: z.string().default(''),
  phone: z.string().default(''),
  statusi: z.number().default(1),
  address: z.string().default(''),
  remark: z.string().default(''),
})


export default function Customer() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)

  const mainFormRef = useRef<UseFormReturn<CustomerData> | null>(null)

  const countryColumns: ColumnDef<CountryItem>[] = [
    { accessorKey: 'code2', header: '二字码', size: 100 },
    { accessorKey: 'code3', header: '三字码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleCountrySelect = useCallback((country: CountryItem) => {
    console.log(mainFormRef.current)
    if (mainFormRef.current) {
      mainFormRef.current.setValue('countryId', country.id)
      mainFormRef.current.setValue('countryCode2', country.code2)
    }
  }, [])


  const columns: ColumnDef<CustomerData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称', size: 180 },
    { accessorKey: 'countryCode2', header: '国家', size: 80 },
    { accessorKey: 'cityName', header: '城市', size: 80 },
    { accessorKey: 'contact', header: '联系人', size: 100 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址', size: 200 },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>,
    },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<CustomerData>) => {
    mainFormRef.current = form

    return (
      <div className="col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
          <FormField control={form.control} name="cityName" render={({ field }) => (
            <FormItem>
              <FormLabel>所在城市</FormLabel>
              <FormControl><Input placeholder="请输入所在城市" {...field} /></FormControl>
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
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <FormField control={form.control} name="statusi" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="text-sm">状态</FormLabel>
                <FormControl><Switch checked={field.value === 1} onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} /></FormControl>
              </FormItem>
            )} />
          </div>
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
        </div>
      </div>
    )
  }, [])

  const defaultValues: CustomerData = {
    code: '',
    name: '',
    countryId: null,
    countryCode2: '',
    cityName: '',
    contact: '',
    phone: '',
    address: '',
    statusi: 1,
    remark: '',
  }

  return (
    <>
      <CrudTableV2<CustomerData>
        title="客户管理"
        apiUrl="/base/api/Customer"
        columns={columns}
        formSchema={customerSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
        dialogWidth="1024px"
        dialogClassName="max-w-5xl max-h-[85vh] overflow-y-auto"
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
