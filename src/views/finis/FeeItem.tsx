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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'

interface FeeItemData {
  id?: number
  feeTypeId?: number | null
  feeTypeName?: string
  cnName: string
  enName: string
  itemType: number
  itemUnit: string
  isSale: boolean
  isBuy: boolean
  remark: string
}

interface FeeTypeItem {
  id: number
  cnName: string
  enName: string
}

const feeItemSchema = z.object({
  id: z.number().optional(),
  feeTypeId: z.number().nullable().optional(),
  feeTypeName: z.string().default(''),
  cnName: z.string().min(1, '请输入项目名称'),
  enName: z.string().min(1, '请输入英文名称'),
  itemType: z.number().default(0),
  itemUnit: z.string().default(''),
  isSale: z.boolean().default(true),
  isBuy: z.boolean().default(true),
  remark: z.string().default(''),
})

export default function FeeItem() {
  const [feeTypeDialogOpen, setFeeTypeDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<FeeItemData> | null>(null)

  const feeTypeColumns: ColumnDef<FeeTypeItem>[] = [
    { accessorKey: 'cnName', header: '中文名称', size: 200 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleFeeTypeSelect = useCallback((feeType: FeeTypeItem) => {
    if (formRef.current) {
      formRef.current.setValue('feeTypeId', feeType.id)
      formRef.current.setValue('feeTypeName', feeType.cnName)
    }
  }, [])

  const columns: ColumnDef<FeeItemData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'feeTypeName', header: '费用类别', size: 200 },
    { accessorKey: 'cnName', header: '项目名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称', size: 200 },
    {
      accessorKey: 'itemType',
      header: '费用方式',
      size: 100,
      cell: ({ getValue }) => {
        const v = getValue() as number
        if (v === 0) return <Badge variant="outline">实报</Badge>
        if (v === 1) return <Badge variant="success">固定</Badge>
        return <Badge variant="warning">-</Badge>
      },
    },
    { accessorKey: 'itemUnit', header: '费用单位', size: 100 },
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
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<FeeItemData>) => {
    formRef.current = form
    return (
      <>
        <FormField control={form.control} name="feeTypeName" render={({ field }) => (
          <FormItem>
            <FormLabel>费用类别</FormLabel>
            <div className="flex gap-2">
              <FormControl><Input placeholder="请选择费用类别" readOnly {...field} /></FormControl>
              <Button type="button" variant="outline" size="icon" onClick={() => setFeeTypeDialogOpen(true)}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="cnName" render={({ field }) => (
          <FormItem>
            <FormLabel>项目名称</FormLabel>
            <FormControl><Input placeholder="请输入项目名称" {...field} /></FormControl>
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
        <FormField control={form.control} name="itemType" render={({ field }) => (
          <FormItem>
            <FormLabel>费用方式</FormLabel>
            <FormControl>
              <RadioGroup value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="type0" />
                  <Label htmlFor="type0">实报</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="type1" />
                  <Label htmlFor="type1">固定</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="itemUnit" render={({ field }) => (
          <FormItem>
            <FormLabel>费用单位</FormLabel>
            <FormControl><Input placeholder="请输入费用单位" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
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

  const defaultValues: FeeItemData = {
    feeTypeId: null,
    feeTypeName: '',
    cnName: '',
    enName: '',
    itemType: 0,
    itemUnit: '',
    isSale: true,
    isBuy: true,
    remark: '',
  }

  return (
    <>
      <CrudTableV2<FeeItemData>
        title="费用项目管理"
        apiUrl="/base/api/FeeItem"
        columns={columns}
        formSchema={feeItemSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
      />
      <SelectDialogV2<FeeTypeItem>
        title="选择费用类别"
        apiUrl="/base/api/FeeType"
        columns={feeTypeColumns}
        open={feeTypeDialogOpen}
        onOpenChange={setFeeTypeDialogOpen}
        onSelect={handleFeeTypeSelect}
      />
    </>
  )
}
