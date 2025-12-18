import { useCallback } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'

// Data type
interface SupplierData {
  id?: number
  code: string
  sName: string
  fName: string
  remark: string
}

// Zod validation schema
const supplierSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  sName: z.string().min(1, '请输入简称'),
  fName: z.string().default(''),
  remark: z.string().default(''),
})

export default function Supplier() {
  // TanStack Table columns
  const columns: ColumnDef<SupplierData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'sName', header: '简称', size: 150 },
    { accessorKey: 'fName', header: '全称' },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<SupplierData>) => (
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
        name="sName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>简称</FormLabel>
            <FormControl>
              <Input placeholder="请输入简称" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fName"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>全称</FormLabel>
            <FormControl>
              <Input placeholder="请输入全称" {...field} />
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
  const defaultValues: SupplierData = {
    code: '',
    sName: '',
    fName: '',
    remark: '',
  }

  return (
    <CrudTableV2<SupplierData>
      title="供应商管理"
      apiUrl="/base/api/Supplier"
      columns={columns}
      formSchema={supplierSchema}
      renderFormFields={renderFormFields}
      defaultValues={defaultValues}
    />
  )
}
