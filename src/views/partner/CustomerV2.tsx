import { useRef, useCallback, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ColumnDef } from '@tanstack/react-table'
import CrudTableV2 from '@/components/crud-table-v2'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import SelectDialogV2 from '@/components/select-dialog-v2'
import request from '@/utils/request'

interface CustomerRecipient {
  name: string
  phone: string
  email?: string
}

interface CustomerSender {
  name: string
  phone: string
  address: string
}

interface CustomerAddress {
  label: string
  contact: string
  phone: string
  address: string
}

interface CustomerData {
  id?: number
  code: string
  name: string
  countryId?: number | null
  countryCode2?: string
  cityName: string
  contact: string
  phone: string
  address: string
  remark: string
  recipients: CustomerRecipient[]
  senders: CustomerSender[]
  addresses: CustomerAddress[]
}

interface CountryItem {
  id: number
  code2: string
  code3: string
  cnName: string
  enName: string
}
const customerSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, '请输入编码'),
  name: z.string().min(1, '请输入名称'),
  cityName: z.string().default(''),
  contact: z.string().default(''),
  phone: z.string().default(''),
  address: z.string().default(''),
  remark: z.string().default(''),
  recipients: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  })).default([]),
  senders: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  })).default([]),
  addresses: z.array(z.object({
    label: z.string(),
    contact: z.string(),
    phone: z.string(),
    address: z.string(),
  })).default([]),
})

const recipientSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  phone: z.string().min(1, '请输入手机号'),
  email: z.string().default(''),
})

const senderSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  phone: z.string().min(1, '请输入手机号'),
  address: z.string().min(1, '请输入发件地址'),
})

const addressSchema = z.object({
  label: z.string().min(1, '请输入地址名称'),
  contact: z.string().min(1, '请输入联系人'),
  phone: z.string().min(1, '请输入手机号'),
  address: z.string().min(1, '请输入详细地址'),
})

export default function Customer() {
  const [countryDialogOpen, setCountryDialogOpen] = useState(false)

  const mainFormRef = useRef<UseFormReturn<CustomerData> | null>(null)

  const countryColumns: ColumnDef<CountryItem>[] = [
    { accessorKey: 'code2', header: '二字码', size: 100 },
    { accessorKey: 'code3', header: '三字码', size: 100 },
    { accessorKey: 'cnName', header: '中文名称', size: 150 },
    { accessorKey: 'enName', header: '英文名称' },
  ]

  const handleCountrySelect = useCallback((country: CountryItem) => {
    console.log(mainFormRef.current)
    if (mainFormRef.current) {
      mainFormRef.current.setValue('countryId', country.id)
      mainFormRef.current.setValue('countryCode2', country.code2)
    }
  }, [])

  // Recipient Dialog State
  const [recipientDialogOpen, setRecipientDialogOpen] = useState(false)
  const [recipientEditIndex, setRecipientEditIndex] = useState(-1)
  const recipientForm = useForm<CustomerRecipient>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { name: '', phone: '', email: '' },
  })

  // Sender Dialog State
  const [senderDialogOpen, setSenderDialogOpen] = useState(false)
  const [senderEditIndex, setSenderEditIndex] = useState(-1)
  const senderForm = useForm<CustomerSender>({
    resolver: zodResolver(senderSchema),
    defaultValues: { name: '', phone: '', address: '' },
  })

  // Address Dialog State
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [addressEditIndex, setAddressEditIndex] = useState(-1)
  const addressForm = useForm<CustomerAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', contact: '', phone: '', address: '' },
  })

  // Recipient Handlers
  const openRecipientDialog = useCallback((index = -1) => {
    if (!mainFormRef.current) return
    const recipients = mainFormRef.current.getValues('recipients') || []
    setRecipientEditIndex(index)
    if (index > -1) {
      recipientForm.reset(recipients[index])
    } else {
      recipientForm.reset({ name: '', phone: '', email: '' })
    }
    setRecipientDialogOpen(true)
  }, [recipientForm])

  const saveRecipient = useCallback(() => {
    recipientForm.handleSubmit((values) => {
      if (!mainFormRef.current) return
      const recipients = [...(mainFormRef.current.getValues('recipients') || [])]
      if (recipientEditIndex > -1) {
        recipients[recipientEditIndex] = values
      } else {
        recipients.push(values)
      }
      mainFormRef.current.setValue('recipients', recipients)
      toast.success('收件人信息已保存')
      setRecipientDialogOpen(false)
    })()
  }, [recipientForm, recipientEditIndex])

  const removeRecipient = useCallback((index: number) => {
    if (!mainFormRef.current) return
    const recipients = [...(mainFormRef.current.getValues('recipients') || [])]
    recipients.splice(index, 1)
    mainFormRef.current.setValue('recipients', recipients)
  }, [])

  // Sender Handlers
  const openSenderDialog = useCallback((index = -1) => {
    if (!mainFormRef.current) return
    const senders = mainFormRef.current.getValues('senders') || []
    setSenderEditIndex(index)
    if (index > -1) {
      senderForm.reset(senders[index])
    } else {
      senderForm.reset({ name: '', phone: '', address: '' })
    }
    setSenderDialogOpen(true)
  }, [senderForm])

  const saveSender = useCallback(() => {
    senderForm.handleSubmit((values) => {
      if (!mainFormRef.current) return
      const senders = [...(mainFormRef.current.getValues('senders') || [])]
      if (senderEditIndex > -1) {
        senders[senderEditIndex] = values
      } else {
        senders.push(values)
      }
      mainFormRef.current.setValue('senders', senders)
      toast.success('发件人信息已保存')
      setSenderDialogOpen(false)
    })()
  }, [senderForm, senderEditIndex])

  const removeSender = useCallback((index: number) => {
    if (!mainFormRef.current) return
    const senders = [...(mainFormRef.current.getValues('senders') || [])]
    senders.splice(index, 1)
    mainFormRef.current.setValue('senders', senders)
  }, [])

  // Address Handlers
  const openAddressDialog = useCallback((index = -1) => {
    if (!mainFormRef.current) return
    const addresses = mainFormRef.current.getValues('addresses') || []
    setAddressEditIndex(index)
    if (index > -1) {
      addressForm.reset(addresses[index])
    } else {
      addressForm.reset({ label: '', contact: '', phone: '', address: '' })
    }
    setAddressDialogOpen(true)
  }, [addressForm])

  const saveAddress = useCallback(() => {
    addressForm.handleSubmit((values) => {
      if (!mainFormRef.current) return
      const addresses = [...(mainFormRef.current.getValues('addresses') || [])]
      if (addressEditIndex > -1) {
        addresses[addressEditIndex] = values
      } else {
        addresses.push(values)
      }
      mainFormRef.current.setValue('addresses', addresses)
      toast.success('收货地址已保存')
      setAddressDialogOpen(false)
    })()
  }, [addressForm, addressEditIndex])

  const removeAddress = useCallback((index: number) => {
    if (!mainFormRef.current) return
    const addresses = [...(mainFormRef.current.getValues('addresses') || [])]
    addresses.splice(index, 1)
    mainFormRef.current.setValue('addresses', addresses)
  }, [])

  // 自定义客户主表单提交处理
  const handleCustomerSubmit = useCallback(async (data: CustomerData, isEdit: boolean) => {
    //console.log(isEdit);
    // try {
    //   await request.post(`/base/api/Customer/CreateCustomer`, data)
    //   toast.success('预约提柜成功')
    //   // setShowPickupDialog(false)
    //   // fetchClearanceList()
    // } catch (error) {
    //   console.error('预约提柜失败:', error)
    //   toast.error('预约提柜失败')
    // }

    // setIsSubmitting(true)
    // //await request.post(`/base/api/Customer/CreateCustomer?`, data)

    try {
      const apiConfig = {
        create: '/base/api/Customer/CreateCustomer',
        update: '/base/api/Customer/CreateCustomer'
      }

      let result
      if (isEdit && data.id) {
        // 编辑客户
        result = await request.post(
          apiConfig.update,
          data,
        )
      } else {
        // 新增客户
        result = await request.post(
          apiConfig.update,
          data,

        )
      }

      if (result) {
        toast.success(isEdit ? '客户信息更新成功' : '客户创建成功')
        return result.data
      }

      return null
    } finally {
      //setIsSubmitting(false)
    }
  }, [])

  const columns: ColumnDef<CustomerData>[] = [
    { accessorKey: 'id', header: '主键', size: 80 },
    { accessorKey: 'code', header: '编码', size: 120 },
    { accessorKey: 'name', header: '名称', size: 180 },
    { accessorKey: 'countryCode2', header: '国家', size: 100 },
    { accessorKey: 'cityName', header: '城市', size: 120 },
    { accessorKey: 'contact', header: '联系人', size: 120 },
    { accessorKey: 'phone', header: '联系电话', size: 150 },
    { accessorKey: 'address', header: '地址' },
    { accessorKey: 'remark', header: '备注' },
  ]

  const renderFormFields = useCallback((form: UseFormReturn<CustomerData>) => {
    mainFormRef.current = form
    const recipients = form.watch('recipients') || []
    const senders = form.watch('senders') || []
    const addresses = form.watch('addresses') || []

    return (
      <div className="col-span-2 space-y-6">
        {/* 基本信息卡片 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* 收件人卡片 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">客户收件人</CardTitle>
              <Button type="button" size="sm" onClick={() => openRecipientDialog()}>
                <Plus className="h-4 w-4 mr-1" />新增收件人
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">姓名</TableHead>
                    <TableHead className="w-[160px]">手机</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">暂无收件人</TableCell>
                    </TableRow>
                  ) : (
                    recipients.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => openRecipientDialog(index)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRecipient(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 发件人卡片 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">客户发件人</CardTitle>
              <Button type="button" size="sm" onClick={() => openSenderDialog()}>
                <Plus className="h-4 w-4 mr-1" />新增发件人
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">姓名</TableHead>
                    <TableHead className="w-[160px]">手机</TableHead>
                    <TableHead>发件地址</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">暂无发件人</TableCell>
                    </TableRow>
                  ) : (
                    senders.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.address}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => openSenderDialog(index)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSender(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 收货地址卡片 */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">客户收货地址</CardTitle>
              <Button type="button" size="sm" onClick={() => openAddressDialog()}>
                <Plus className="h-4 w-4 mr-1" />新增收货地址
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">地址名称</TableHead>
                    <TableHead className="w-[140px]">联系人</TableHead>
                    <TableHead className="w-[160px]">手机</TableHead>
                    <TableHead>详细地址</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">暂无收货地址</TableCell>
                    </TableRow>
                  ) : (
                    addresses.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.contact}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.address}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => openAddressDialog(index)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeAddress(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }, [openRecipientDialog, removeRecipient, openSenderDialog, removeSender, openAddressDialog, removeAddress])

  const defaultValues: CustomerData = {
    code: '',
    name: '',
    cityName: '',
    contact: '',
    phone: '',
    address: '',
    remark: '',
    recipients: [],
    senders: [],
    addresses: [],
  }

  return (
    <>
      <CrudTableV2<CustomerData>
        title="客户管理"
        apiUrl="/base/api/Customer"
        columns={columns}
        formSchema={customerSchema}
        renderFormFields={renderFormFields}
        defaultValues={defaultValues}
        dialogWidth="1024px"
        dialogClassName="max-w-5xl max-h-[85vh] overflow-y-auto"
        onSubmit={handleCustomerSubmit}

      />

      {/* Recipient Dialog - 大弹窗 */}
      <Dialog open={recipientDialogOpen} onOpenChange={setRecipientDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{recipientEditIndex > -1 ? '编辑收件人' : '新增收件人'}</DialogTitle>
          </DialogHeader>
          <Form {...recipientForm}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FormField control={recipientForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl><Input placeholder="请输入姓名" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={recipientForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>手机</FormLabel>
                  <FormControl><Input placeholder="请输入手机号" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={recipientForm.control} name="email" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>邮箱</FormLabel>
                  <FormControl><Input placeholder="请输入邮箱" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipientDialogOpen(false)}>取消</Button>
            <Button onClick={saveRecipient}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sender Dialog - 大弹窗 */}
      <Dialog open={senderDialogOpen} onOpenChange={setSenderDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{senderEditIndex > -1 ? '编辑发件人' : '新增发件人'}</DialogTitle>
          </DialogHeader>
          <Form {...senderForm}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FormField control={senderForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl><Input placeholder="请输入姓名" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={senderForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>手机</FormLabel>
                  <FormControl><Input placeholder="请输入手机号" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={senderForm.control} name="address" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>发件地址</FormLabel>
                  <FormControl><Input placeholder="请输入发件地址" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSenderDialogOpen(false)}>取消</Button>
            <Button onClick={saveSender}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog - 大弹窗 */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{addressEditIndex > -1 ? '编辑收货地址' : '新增收货地址'}</DialogTitle>
          </DialogHeader>
          <Form {...addressForm}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FormField control={addressForm.control} name="label" render={({ field }) => (
                <FormItem>
                  <FormLabel>地址名称</FormLabel>
                  <FormControl><Input placeholder="如：默认地址/总部" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addressForm.control} name="contact" render={({ field }) => (
                <FormItem>
                  <FormLabel>联系人</FormLabel>
                  <FormControl><Input placeholder="请输入联系人" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addressForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>手机</FormLabel>
                  <FormControl><Input placeholder="请输入手机号" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={addressForm.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>详细地址</FormLabel>
                  <FormControl><Input placeholder="请输入详细地址" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>取消</Button>
            <Button onClick={saveAddress}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
