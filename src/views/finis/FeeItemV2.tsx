import { useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import FeeTypeDialog, { type FeeTypeItem } from '@/components/FeeTypeDialog'

// Data type
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

// Zod validation schema
const feeItemSchema = z.object({
  id: z.number().optional(),
  feeTypeId: z.number().nullable().refine((val) => val !== null, { message: '请选择费用类别' }),
  feeTypeName: z.string().default(''),
  cnName: z.string().min(1, '请输入项目名称'),
  enName: z.string().min(1, '请输入英文名称'),
  itemType: z.number().refine((val) => val === 0 || val === 1, { message: '请选择费用方式' }),
  itemUnit: z.string().default(''),
  isSale: z.boolean().default(true),
  isBuy: z.boolean().default(true),
  remark: z.string().default(''),
})

export default function FeeItem() {
  const [feeTypeDialogOpen, setFeeTypeDialogOpen] = useState(false)
  const [currentForm, setCurrentForm] = useState<UseFormReturn<FeeItemData> | null>(null)

  // TanStack Table columns
  const columns: ColumnDef<FeeItemData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'feeTypeName', header: '费用类别', size: 200 },
    { accessorKey: 'cnName', header: '项目名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称', size: 200 },
    {
      accessorKey: 'itemType',
      header: '费用方式',
      size: 120,
      cell: ({ getValue }) => {
        const itemType = getValue() as number
        if (itemType === 0) return <Badge variant="outline">实报</Badge>
        if (itemType === 1) return <Badge variant="success">固定</Badge>
        return <Badge variant="warning">-</Badge>
      },
    },
    { accessorKey: 'itemUnit', header: '费用单位', size: 100 },
    {
      accessorKey: 'isSale',
      header: '销售',
      size: 80,
      cell: ({ getValue }) => (
        getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
      ),
    },
    {
      accessorKey: 'isBuy',
      header: '采购',
      size: 80,
      cell: ({ getValue }) => (
        getValue() ? <Badge variant="blue">是</Badge> : <Badge variant="outline">否</Badge>
      ),
    },
    { accessorKey: 'remark', header: '备注' },
  ]

  // Handle fee type selection
  const handleFeeTypeSelect = useCallback((feeType: FeeTypeItem) => {
    if (currentForm) {
      currentForm.setValue('feeTypeId', feeType.id)
      currentForm.setValue('feeTypeName', feeType.cnName)
    }
  }, [currentForm])

  // Form fields renderer
  const renderFormFields = useCallback((form: UseFormReturn<FeeItemData>) => {
    // Store form reference for dialog callback
    setCurrentForm(form)

    return (
      <>
        <FormField
          control={form.control}
          name="feeTypeId"
          render={() => (
            <FormItem className="col-span-2">
              <FormLabel>费用类别</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="feeTypeName"
                    render={({ field }) => (
                      <Input
                        placeholder="请选择费用类别"
                        readOnly
                        className="flex-1"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => setFeeTypeDialogOpen(true)}
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
          name="cnName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>项目名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入项目名称" {...field} />
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
          name="itemType"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>费用方式</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value?.toString()}
                  onValueChange={(value: string) => field.onChange(parseInt(value))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="itemType0" />
                    <Label htmlFor="itemType0">实报</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="itemType1" />
                    <Label htmlFor="itemType1">固定</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="itemUnit"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>费用单位</FormLabel>
              <FormControl>
                <Input placeholder="请输入费用单位" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isSale"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">销售</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isBuy"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">采购</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
      <FeeTypeDialog 
        open={feeTypeDialogOpen} 
        onOpenChange={setFeeTypeDialogOpen} 
        onSelect={handleFeeTypeSelect} 
      />
    </>
  )
}
