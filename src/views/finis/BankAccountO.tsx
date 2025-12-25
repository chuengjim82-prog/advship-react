import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import SelectDialogV2 from '@/components/select-dialog-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import { MoreHorizontal } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// 1. 扩展接口，新增 statuss 字段（用于提交）
interface BankAccountOData {
  id?: number
  shortName: string
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
  cashierId: string
  accountType: string
  statusi: number
  statuss?: string // 新增：提交用的状态文字
  remark: string
}

interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
}

const bankAccountOSchema = z.object({
  id: z.number().optional(),
  shortName: z.string().min(1, '请输入账户简称'),
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
  cashierId: z.string().default(''),
  accountType: z.string().default(''),
  statusi: z.number().default(1),
  statuss: z.string().optional(), // 新增到schema（可选，不校验）
  remark: z.string().default(''),
})

export default function BankAccountO() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)
  const formRef = useRef<UseFormReturn<BankAccountOData> | null>(null)

  // 2. 核心：数据转换函数（statusi → statuss）
  const transformSubmitData = (data: BankAccountOData): BankAccountOData => {
    return {
      ...data,
      statuss: data.statusi === 1 ? '启用' : '停用' // 关键映射逻辑
    }
  }

  const countryColumns: ColumnDef<CountryItem>[] = [
    { accessorKey: 'code2', header: '二字码', size: 100 },
    { accessorKey: 'code3', header: '三字码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleCountrySelect = useCallback((country: CountryItem) => {
    console.log(formRef.current)
    if (formRef.current) {
      formRef.current.setValue('countryId', country.id)
      formRef.current.setValue('countryCode2', country.code2)
    }
  }, [])

  const columns: ColumnDef<BankAccountOData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'shortName', header: '账户简称', size: 150 },
    { accessorKey: 'accountName', header: '账户名称', size: 150 },
    { accessorKey: 'depositBank', header: '开户银行', size: 200 },
    { accessorKey: 'accountNo', header: '账户号码', size: 200 },
    { accessorKey: 'currency', header: '币种', size: 100 },
    { accessorKey: 'bankCode', header: '银行号码', size: 200 },
    { accessorKey: 'branchCode', header: '分行代码', size: 200 },
    { accessorKey: 'swiftCode', header: 'Swift代码', size: 100 },
    { accessorKey: 'countryCode2', header: '账户地点', size: 100 },
    { accessorKey: 'cityName', header: '所在城市', size: 100 },
    { accessorKey: 'cashierId', header: '账户出纳', size: 100 },
    { accessorKey: 'accountType', header: '账户类型', size: 100 },
    { accessorKey: 'latestTime', header: '最近交易', size: 100 },
    { accessorKey: 'dataSource', header: '数据来源', size: 100 },
    {
      accessorKey: 'statusi',
      header: '状态',
      size: 80,
      cell: ({ getValue }) => getValue() === 1 ? <Badge variant="success">启用</Badge> : <Badge variant="destructive">停用</Badge>,
    },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<BankAccountOData>) => {
    formRef.current = form
    return (
      <>
        <FormField control={form.control} name="shortName" render={({ field }) => (
          <FormItem>
            <FormLabel>账户简称</FormLabel>
            <FormControl><Input placeholder="请输入账户简称" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
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
          <FormItem>
            <FormLabel>所在城市</FormLabel>
            <FormControl><Input placeholder="请输入所在城市" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="cashierId" render={({ field }) => (
          <FormItem>
            <FormLabel>账户出纳</FormLabel>
            <FormControl><Input placeholder="请输入账户出纳" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="accountType" render={({ field }) => (
          <FormItem>
            <FormLabel>账户类型</FormLabel>
            <FormControl><Input placeholder="请输入账户类型" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <FormField control={form.control} name="statusi" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg p-3">
              <FormLabel className="text-sm">状态</FormLabel>
              <FormControl><Switch checked={field.value === 1} onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} /></FormControl>
            </FormItem>
          )} />
        </div>
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
  }, [])

  const defaultValues: BankAccountOData = {
    shortName: '',
    accountName: '',
    depositBank: '',
    accountNo: '',
    currency: '',
    bankCode: '',
    branchCode: '',
    swiftCode: '',
    countryId: 0,
    cityName: '',
    cashierId: '0',
    accountType: '',
    statusi: 1,
    statuss: '启用', // 默认值
    remark: '',
  }

  return (
    <>
      <CrudTableV2<BankAccountOData>
        title="银行账户"
        apiUrl="/base/api/BankAccountO"
        columns={columns}
        formSchema={bankAccountOSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
        // 3. 关键：提交前转换数据（适配CrudTableV2的通用钩子）
        onBeforeSubmit={transformSubmitData}
      // 如果CrudTableV2不支持onBeforeSubmit，尝试以下备选方案：
      // requestOptions={{
      //   transformRequest: (data) => transformSubmitData(data)
      // }}
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