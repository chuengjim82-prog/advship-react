import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

interface ShippingData {
  id?: number
  code: string
  sName: string
  fName: string
  contact: string
  phone: string
  address: string
  statusi: number
  remark: string
}

const shippingSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  sName: z.string().min(1, '请输入简称'),
  fName: z.string().default(''),
  contact: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  statusi: z.number().default(1),
  remark: z.string().default(''),
})

export default function Shipping() {
  const columns: ColumnDef<ShippingData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'sName', header: '简称', size: 150 },
    { accessorKey: 'fName', header: '全称' },
    { accessorKey: 'contact', header: '联系人', size: 120 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址' },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>,
    },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<ShippingData>) => (
    <>
      <FormField control={form.control} name="code" render={({ field }) => (
        <FormItem>
          <FormLabel>编码</FormLabel>
          <FormControl><Input placeholder="请输入编码" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="sName" render={({ field }) => (
        <FormItem>
          <FormLabel>简称</FormLabel>
          <FormControl><Input placeholder="请输入简称" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="fName" render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>全称</FormLabel>
          <FormControl><Input placeholder="请输入全称" {...field} /></FormControl>
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
      <FormField control={form.control} name="address" render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>地址</FormLabel>
          <FormControl><Input placeholder="请输入地址" {...field} /></FormControl>
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
      <FormField control={form.control} name="remark" render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>备注</FormLabel>
          <FormControl><Textarea placeholder="请输入备注" rows={3} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  ), [])

  const defaultValues: ShippingData = {
    code: '',
    sName: '',
    fName: '',
    contact: '',
    phone: '',
    address: '',
    statusi: 1,
    remark: '',
  }

  return (
    <CrudTableV2<ShippingData>
      title="船公司管理"
      apiUrl="/base/api/Shipping"
      columns={columns}
      formSchema={shippingSchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
    />
  )
}
