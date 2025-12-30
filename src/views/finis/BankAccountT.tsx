import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface BankAccountTData {
  id?: number
  ownerType: string
  ownerId?: number | null
  ownerName?: string
  accountName: string
  depositBank: string
  accountNo: string
  currency: string
  bankCode: string
  branchCode: string
  swiftCode: string
  countryId?: number | null
  countryName?: string
  countryCode2?: string
  cityName: string
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

interface CustomerItem {
  id: number
  code: string
  name: string
}

interface SupplierItem {
  id: number
  code: string
  sName: string
  fName: string
}

const BankAccountTSchema = z.object({
  id: z.number().optional(),
  ownerType: z.string().default('客户'),
  accountName: z.string().min(1, '请输入账户名称'),
  depositBank: z.string().default(''),
  accountNo: z.string().default(''),
  currency: z.string().default(''),
  bankCode: z.string().default(''),
  branchCode: z.string().default(''),
  swiftCode: z.string().default(''),
  countryId: z.number().nullable().optional(),
  countryCode2: z.string().default(''),
  cityName: z.string().default(''),
  ownerId: z.number().nullable().optional(),
  ownerName: z.string().default(''),
  statusi: z.number().default(1),
  remark: z.string().default(''),
})

export default function BankAccountT() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<BankAccountTData> | null>(null)
  // 用于跟踪当前选中的账户类型
  const [currentOwnerType, setCurrentOwnerType] = useState('客户')

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

  const customerColumns: ColumnDef<CustomerItem>[] = [
    { accessorKey: 'code', header: '编码', size: 100 },
    { accessorKey: 'name', header: '中文名称', size: 150 },
    { accessorKey: 'countryName', header: '国家', size: 100 },
    { accessorKey: 'cityName', header: '城市', size: 100 },
  ]

  const handleCustomerSelect = useCallback((customer: CustomerItem) => {
    if (formRef.current) {
      formRef.current.setValue('ownerId', customer.id)
      formRef.current.setValue('ownerName', customer.name)
    }
    // 选择客户后自动设置账户类型为客户
    setCurrentOwnerType('客户')
    if (formRef.current) {
      formRef.current.setValue('ownerType', '客户')
    }
  }, [])

  const supplierColumns: ColumnDef<SupplierItem>[] = [
    { accessorKey: 'code', header: '编码', size: 100 },
    { accessorKey: 'sName', header: '简称', size: 150 },
    { accessorKey: 'fName', header: '全称', size: 150 },
  ]

  const handleSupplierSelect = useCallback((supplier: SupplierItem) => {
    if (formRef.current) {
      formRef.current.setValue('ownerId', supplier.id)
      formRef.current.setValue('ownerName', supplier.sName)
    }
    // 选择供应商后自动设置账户类型为供应商
    setCurrentOwnerType('供应商')
    if (formRef.current) {
      formRef.current.setValue('ownerType', '供应商')
    }
  }, [])

  // 处理账户类型变更
  const handleOwnerTypeChange = useCallback((value: string) => {
    setCurrentOwnerType(value)
    // 切换类型时清空所属对象信息
    if (formRef.current) {
      formRef.current.setValue('ownerId', null)
      formRef.current.setValue('ownerName', '')
    }
  }, [])

  const columns: ColumnDef<BankAccountTData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    {
      accessorKey: 'ownerType',
      header: '账户类型',
      size: 100,
    },
    { accessorKey: 'ownerName', header: '所属对象', size: 100 },
    { accessorKey: 'accountName', header: '账户名称', size: 150 },
    { accessorKey: 'depositBank', header: '开户银行', size: 200 },
    { accessorKey: 'accountNo', header: '账户号码', size: 200 },
    { accessorKey: 'currency', header: '币种', size: 100 },
    { accessorKey: 'bankCode', header: '银行号码', size: 200 },
    { accessorKey: 'branchCode', header: '分行代码', size: 200 },
    { accessorKey: 'swiftCode', header: 'Swift代码', size: 100 },
    { accessorKey: 'countryCode2', header: '账户地点', size: 100 },
    { accessorKey: 'cityName', header: '所在城市', size: 100 },
    { accessorKey: 'latestTime', header: '最近交易', size: 100 },
    { accessorKey: 'dataSource', header: '数据来源', size: 100 },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>,
    },
    { accessorKey: 'remark', header: '备注', size: 250 },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<BankAccountTData>) => {
    formRef.current = form

    // 初始化时同步表单中的账户类型
    if (form.watch('ownerType') && form.watch('ownerType') !== currentOwnerType) {
      setCurrentOwnerType(form.watch('ownerType'))
    }

    return (
      <>
        <FormField
          control={form.control}
          name="ownerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>账户类型</FormLabel>
              <FormControl>
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(v) => {
                    field.onChange(v)
                    handleOwnerTypeChange(v)
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="客户" id="type0" />
                    <Label htmlFor="type0">客户</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="供应商" id="type1" />
                    <Label htmlFor="type1">供应商</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 客户类型 - 所属对象1 */}
        {currentOwnerType === '客户' && (
          <FormField control={form.control} name="ownerName" render={({ field }) => (
            <FormItem>
              <FormLabel>所属客户</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="请选择客户" readOnly {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCustomerDialogOpen(true)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* 供应商类型 - 所属对象2 */}
        {currentOwnerType === '供应商' && (
          <FormField control={form.control} name="ownerName" render={({ field }) => (
            <FormItem>
              <FormLabel>所属供应商</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="请选择供应商" readOnly {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSupplierDialogOpen(true)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="accountName" render={({ field }) => (
          <FormItem>
            <FormLabel>账户名称</FormLabel>
            <FormControl><Input placeholder="请输入账户名称" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="depositBank" render={({ field }) => (
          <FormItem>
            <FormLabel>开户银行</FormLabel>
            <FormControl><Input placeholder="请输入开户银行" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="accountNo" render={({ field }) => (
          <FormItem>
            <FormLabel>账户号码</FormLabel>
            <FormControl><Input placeholder="请输入账户号码" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="currency" render={({ field }) => (
          <FormItem>
            <FormLabel>账户币种</FormLabel>
            <FormControl><Input placeholder="请输入账户币种" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="bankCode" render={({ field }) => (
          <FormItem>
            <FormLabel>银行号码</FormLabel>
            <FormControl><Input placeholder="请输入银行号码" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="branchCode" render={({ field }) => (
          <FormItem>
            <FormLabel>分行代码</FormLabel>
            <FormControl><Input placeholder="请输入分行代码" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="swiftCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Swift代码</FormLabel>
            <FormControl><Input placeholder="请输入Swift代码" {...field} /></FormControl>
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
          <FormItem className="col-span-1">
            <FormLabel>所在城市</FormLabel>
            <FormControl><Input placeholder="请输入所在城市" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="statusi" render={({ field }) => (
          <FormItem className="">
            <FormLabel>状态</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.value === 1}
                  onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              </div>

            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="remark" render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>备注</FormLabel>
            <FormControl>
              <Textarea placeholder="请输入备注" rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </>
    )
  }, [currentOwnerType, handleOwnerTypeChange])

  const defaultValues: BankAccountTData = {
    ownerType: '客户',
    ownerId: null,
    accountName: '',
    depositBank: '',
    accountNo: '',
    currency: '',
    bankCode: '',
    branchCode: '',
    swiftCode: '',
    countryId: null,
    cityName: '',
    statusi: 1,
    remark: '',
  }

  return (
    <>
      <CrudTableV2<BankAccountTData>
        title="往来账户"
        apiUrl="/base/api/BankAccountT"
        columns={columns}
        formSchema={BankAccountTSchema}
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

      <SelectDialogV2<CustomerItem>
        title="选择客户"
        apiUrl="/base/api/customer"
        columns={customerColumns}
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onSelect={handleCustomerSelect}
      />

      <SelectDialogV2<SupplierItem>
        title="选择供应商"
        apiUrl="/base/api/supplier"
        columns={supplierColumns}
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSelect={handleSupplierSelect}
      />
    </>
  )
}