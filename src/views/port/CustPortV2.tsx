import { useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import CountryDialog, { type CountryItem } from '@/components/CountryDialog'
import CityDialog, { type CityItem } from '@/components/CityDialog'

// Data type
interface CustPortData {
  id?: number
  code: string
  cnName: string
  enName: string
  countryId?: number | null
  countryCode2?: string
  cityId?: number | null
  cityCode?: string
  contact: string
  phone: string
  address: string
  remark: string
}

// Zod validation schema
const custPortSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  cnName: z.string().min(1, '请输入中文名称'),
  enName: z.string().default(''),
  countryId: z.number().nullable().optional(),
  countryCode2: z.string().default(''),
  cityId: z.number().nullable().optional(),
  cityCode: z.string().default(''),
  contact: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  remark: z.string().default(''),
})

export default function CustPort() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [currentForm, setCurrentForm] = useState<UseFormReturn<CustPortData> | null>(null)

  // TanStack Table columns
  const columns: ColumnDef<CustPortData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
    { accessorKey: 'countryCode2', header: '国家', size: 100 },
    { accessorKey: 'cityCode', header: '城市', size: 100 },
    { accessorKey: 'contact', header: '联系人', size: 100 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址' },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Handle country selection
  const handleCountrySelect = useCallback((country: CountryItem) => {
    if (currentForm) {
      currentForm.setValue('countryId', country.id)
      currentForm.setValue('countryCode2', country.code2)
    }
  }, [currentForm])

  // Handle city selection
  const handleCitySelect = useCallback((city: CityItem) => {
    if (currentForm) {
      currentForm.setValue('cityId', city.id)
      currentForm.setValue('cityCode', city.code)
    }
  }, [currentForm])

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<CustPortData>) => {
    // Store form reference for dialog callbacks
    setCurrentForm(form)

    return (
      <>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="col-span-2">
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
                    选择国家
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cityId"
          render={() => (
            <FormItem className="col-span-2">
              <FormLabel>城市</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="cityCode"
                    render={({ field }) => (
                      <Input
                        placeholder="请选择城市"
                        readOnly
                        className="flex-1"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => setCityDialogOpen(true)}
                  >
                    <MoreHorizontal className="mr-1 h-4 w-4" />
                    选择城市
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>联系人</FormLabel>
              <FormControl>
                <Input placeholder="请输入联系人" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>联系电话</FormLabel>
              <FormControl>
                <Input placeholder="请输入联系电话" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>地址</FormLabel>
              <FormControl>
                <Input placeholder="请输入地址" {...field} />
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
  const defaultValues: CustPortData = {
    code: '',
    cnName: '',
    enName: '',
    countryId: null,
    countryCode2: '',
    cityId: null,
    cityCode: '',
    contact: '',
    phone: '',
    address: '',
    remark: '',
  }

  return (
    <>
      <CrudTableV2<CustPortData>
        title="港口管理"
        apiUrl="/base/api/CustPort"
        columns={columns}
        formSchema={custPortSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <CountryDialog 
        open={countryDialogOpen} 
        onOpenChange={setCountryDialogOpen} 
        onSelect={handleCountrySelect} 
      />
      <CityDialog 
        open={cityDialogOpen} 
        onOpenChange={setCityDialogOpen} 
        onSelect={handleCitySelect} 
      />
    </>
  )
}
