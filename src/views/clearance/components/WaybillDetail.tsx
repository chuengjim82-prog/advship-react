'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Copy, Package, Scale, Ship } from 'lucide-react'
import { toast } from 'sonner'

interface WaybillDto {
  id?: number
  waybillNo?: string
  waybillDate?: string
  shipperName?: string
  shipperAddress?: string
  consigneeName?: string
  consigneeAddress?: string
  quantity?: number
  ttlWeight?: number
  cubicVol?: number
  custPort?: string
  remark?: string
}

interface ContainerGoodsItem {
  id: number
  number?: string
  sizeType?: string
  weight?: number
  remark?: string
}

interface WaybillDetailProps {
  waybillInfo: WaybillDto | null
  loading: boolean
  containerGoods: ContainerGoodsItem[]
  formatDate: (date?: string | null) => string
}

export default function WaybillDetail({ waybillInfo, loading, containerGoods, formatDate }: WaybillDetailProps) {
  const copyToClipboard = async (text: string, label: string = '内容') => {
    if (!text) {
      toast.error(`${label}为空，无法复制`)
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label}已复制`)
    } catch {
      toast.error('复制失败')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>提单详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 w-full bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center gap-3">
          <Ship className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">提单详情</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-10">
        {/* 发件人 & 收件人 并排布局 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 发件人 */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">发件人 (Shipper)</h3>
            <div className="space-y-4 pl-4 border-l-4 border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">公司名称</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-medium">{waybillInfo?.shipperName || '-'}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(waybillInfo?.shipperName ?? '', '发件人公司')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">地址</p>
                <div className="flex items-start gap-2 mt-1">
                  <p className="text-base max-w-md">{waybillInfo?.shipperAddress || '-'}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-1"
                    onClick={() => copyToClipboard(waybillInfo?.shipperAddress ?? '', '发件人地址')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 收件人 */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">收件人 (Consignee)</h3>
            <div className="space-y-4 pl-4 border-l-4 border-green-600/20">
              <div>
                <p className="text-sm text-muted-foreground">公司名称</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-medium">{waybillInfo?.consigneeName || '-'}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(waybillInfo?.consigneeName ?? '', '收件人公司')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">地址</p>
                <div className="flex items-start gap-2 mt-1">
                  <p className="text-base max-w-md">{waybillInfo?.consigneeAddress || '-'}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-1"
                    onClick={() => copyToClipboard(waybillInfo?.consigneeAddress ?? '', '收件人地址')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* 提单核心信息（横向卡片式） */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">提单号码</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">{waybillInfo?.waybillNo || '-'}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(waybillInfo?.waybillNo ?? '', '提单号码')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">提单日期</p>
            <p className="text-xl font-semibold">{formatDate(waybillInfo?.waybillDate)}</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <p className="text-sm">总数量</p>
            </div>
            <p className="text-xl font-semibold">{waybillInfo?.quantity || '-'} 箱</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <p className="text-sm">总重量</p>
            </div>
            <p className="text-xl font-semibold">{waybillInfo?.ttlWeight || '-'} KG</p>
          </div>
        </div>

        {/* 清关口岸 & 体积 & 备注 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">清关口岸</p>
            <p className="text-base font-medium">{waybillInfo?.custPort || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">体积</p>
            <p className="text-base font-medium">{waybillInfo?.cubicVol || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">备注</p>
            <p className="text-base">{waybillInfo?.remark || '-'}</p>
          </div>
        </div>

        <Separator />

        {/* 货物信息表格 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">货物信息</h3>
          {containerGoods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暂无货物信息</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">柜号</TableHead>
                  <TableHead className="font-semibold">货物描述</TableHead>
                  <TableHead className="font-semibold text-right">数量</TableHead>
                  <TableHead className="font-semibold text-right">重量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containerGoods.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.number || '-'}</TableCell>
                    <TableCell>{item.remark || '-'}</TableCell>
                    <TableCell className="text-right">{item.sizeType || '-'}</TableCell>
                    <TableCell className="text-right">{item.weight || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
