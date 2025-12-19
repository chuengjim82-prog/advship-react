import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'

interface CustAgentData {
  id?: number
  code: string
  name: string
  contact: string
  phone: string
  address: string
  remark: string
}

const custAgentSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  contact: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  remark: z.string().default(''),
})

export default function CustAgent() {
  const columns: ColumnDef<CustAgentData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称', size: 180 },
    { accessorKey: 'contact', header: '联系人', size: 120 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址' },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<CustAgentData>) => (
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
      <FormField control={form.control} name="remark" render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>备注</FormLabel>
          <FormControl><Textarea placeholder="请输入备注" rows={3} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  ), [])

  const defaultValues: CustAgentData = {
    code: '',
    name: '',
    contact: '',
    phone: '',
    address: '',
    remark: '',
  }

  return (
    <CrudTableV2<CustAgentData>
      title="客户代理管理"
      apiUrl="/base/api/CustAgent"
      columns={columns}
      formSchema={custAgentSchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
    />
  )
}
