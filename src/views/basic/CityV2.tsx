import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import CountryDialog, { type CountryItem } from '@/components/CountryDialog'

// Data type
interface CityData {
  id?: number
  code: string
  cnName: string
  enName: string
  remark: string
  countryId?: number | null
  countryName?: string
  countryCode2?: string
}

// Zod validation schema
const citySchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  cnName: z.string().min(1, '请输入中文名称'),
  enName: z.string().default(''),
  remark: z.string().default(''),
  countryId: z.number().nullable().refine((val) => val !== null, { message: '请选择国家' }),
  countryName: z.string().optional(),
  countryCode2: z.string().default(''),
})

export default function City() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const formRef = React.useRef<UseFormReturn<CityData> | null>(null)

  // TanStack Table columns
  const columns: ColumnDef<CityData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
    { accessorKey: 'countryCode2', header: '国家', size: 150 },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Handle country selection
  const handleCountrySelect = useCallback((country: CountryItem) => {
    if (formRef.current) {
      formRef.current.setValue('countryId', country.id)
      formRef.current.setValue('countryCode2', country.code2)
    }
  }, [])

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<CityData>) => {
    // Store form reference for dialog callback
    formRef.current = form

    return (
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
          name="cnName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>中文名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入中文名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enName"
          render={({ field }) => (
            <FormItem className="col-span-2">
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
          name="countryId"
          render={() => (
            <FormItem className="col-span-2">
              <FormLabel>国家</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="countryCode2"
                    render={({ field }) => (
                      <Input
                        placeholder="请选择国家"
                        readOnly
                        className="flex-1"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => setCountryDialogOpen(true)}
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
  }, [])

  // Default form values
  const defaultValues: CityData = {
    code: '',
    cnName: '',
    enName: '',
    remark: '',
    countryId: null,
    countryName: '',
    countryCode2: '',
  }

  return (
    <>
      <CrudTableV2<CityData>
        title="城市管理"
        apiUrl="/base/api/city"
        columns={columns}
        formSchema={citySchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <CountryDialog 
        open={countryDialogOpen} 
        onOpenChange={setCountryDialogOpen} 
        onSelect={handleCountrySelect} 
      />
    </>
  )
}
