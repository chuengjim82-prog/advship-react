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

interface CustomsData {
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

interface CountryItem {
  id: number
  code2: string
  cnName: string
  enName: string
}

interface CityItem {
  id: number
  code: string
  cnName: string
  enName: string
}

const customsSchema = z.object({
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

export default function Customs() {
  const formRef = useRef<UseFormReturn<CustomsData> | null>(null)
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)

  const countryColumns: ColumnDef<CountryItem>[] = [
    { accessorKey: 'code2', header: '代码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const cityColumns: ColumnDef<CityItem>[] = [
    { accessorKey: 'code', header: '代码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleCountrySelect = useCallback((country: CountryItem) => {
    if (formRef.current) {
      formRef.current.setValue('countryId', country.id)
      formRef.current.setValue('countryCode2', country.code2)
    }
  }, [])

  const handleCitySelect = useCallback((city: CityItem) => {
    if (formRef.current) {
      formRef.current.setValue('cityId', city.id)
      formRef.current.setValue('cityCode', city.code)
    }
  }, [])

  const columns: ColumnDef<CustomsData>[] = [
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

  const renderFormFields = useCallback((form: UseFormReturn<CustomsData>) => {
    formRef.current = form
    return (
      <>
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>编码</FormLabel>
            <FormControl><Input placeholder="请输入编码" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="cnName" render={({ field }) => (
          <FormItem>
            <FormLabel>中文名称</FormLabel>
            <FormControl><Input placeholder="请输入中文名称" {...field} /></FormControl>
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
        <FormField control={form.control} name="cityCode" render={({ field }) => (
          <FormItem>
            <FormLabel>城市</FormLabel>
            <div className="flex gap-2">
              <FormControl><Input placeholder="请选择城市" readOnly {...field} /></FormControl>
              <Button type="button" variant="outline" size="icon" onClick={() => setCityDialogOpen(true)}>
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

  const defaultValues: CustomsData = {
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
      <CrudTableV2<CustomsData>
        title="海关管理"
        apiUrl="/base/api/Customs"
        columns={columns}
        formSchema={customsSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <SelectDialogV2<CountryItem>
        title="选择国家"
        apiUrl="/base/api/Country"
        columns={countryColumns}
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSelect={handleCountrySelect}
      />
      <SelectDialogV2<CityItem>
        title="选择城市"
        apiUrl="/base/api/City"
        columns={cityColumns}
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        onSelect={handleCitySelect}
      />
    </>
  )
}
