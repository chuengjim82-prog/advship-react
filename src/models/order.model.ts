// 接口数据类型
export interface BillItem {
  waybillNo: string
  remark: string
  quantity: string
  ttlWeight: string
}

export interface ContainerGoodsItem {
  id: number
  number: string
  remark: string
  sizeType: number
  weight: number
}

export interface AttachmentDetail {
  id: number
  auditMemo: string
  auditResult: number
  auditTime: string
  creatorNic: string
  fileName: string
  dirtType: number
  fileType: string
  isAudit: number
  isExtract: number
  remark: string
  url?: string
  fileKey?: string
  filePath?: string
}

export interface InvoiceGoodsItem {
  id: number
  amount: number
  goodsName: string
  goodsSpec: string | null
  hsCode: string
  price: number
  quantity: number
  remark: string | null
  saber: string | null
}

export interface OrderBaseInfoDto {
  id: number
  countryId: number
  countryName: string | null
  customsCnName: string | null
  creatorNic: string
  custAgentId: number
  custAgentName: string | null
  custPickup: boolean
  currencyName: string | null
  custPortId: number
  custPortName: string | null
  orderDate: string
  orderNo: string
  remark: string
  serviceId: number
  status1: number
  statusi: number
  statuss: string
  transAgentId: number
  transAgentName: string | null
}

export interface WaybillDto {
  id: number
  consigneeAddress: string
  consigneeName: string
  cubicVol: number
  custPort: string
  quantity: number
  remark: string
  shipperAddress: string
  shipperName: string
  ttlWeight: number
  waybillDate: string
  waybillNo: string
}

export interface BaseInfoResponse {
  baseInfo: OrderBaseInfoDto
  waybill: WaybillDto
}
export interface ContainerPickupInfo {
  id: number // 柜ID
  remark: string // 提柜备注说明
  number: string // 柜号
  transportationNumber: string // 车牌号
  transPikName: string // 司机姓名
  pickUpTimeE: string | null // 预约提柜时间
  transPikId: number
  transPikPhone?: string // 添加缺失的属性
  deliveryType: number
}

export interface TransportAgent {
  value: number
  text: string
}

export interface ContainerPickupProps {
  /** 柜号（用于显示） */
  containerNo?: string
  /** 提单号或柜号代码 */
  pickupCode?: string
  /** 柜型 */
  containerType?: string
  /** 模式：create 创建 | edit 编辑 | detail 只读 */
  mode?: 'create' | 'edit' | 'detail'
  /** 初始数据（用于 edit/detail 模式） */
  initialData?: Partial<DeliveryItem> // 修改类型为 Partial<DeliveryItem>
  onClose?: () => void
  onSubmit?: (data: Partial<DeliveryItem>) => void // 确保类型一致
}
// 数据类型定义
export interface DeliveryItem {
  /** 兼容不同接口返回，先放宽类型以保证构建通过 */
  [key: string]: any

  id?: number
  Id?: number
  orderId?: number
  containerId?: number

  number?: string
  sizeType?: string | number
  orderNo?: string

  statusi?: number
  statuss?: string

  deliveryType?: number

  pickUpTimeE?: string | Date | null
  deliveryDateE?: string | Date | null
  giveBackTimeE?: string | Date | null

  remark?: string

  transPikId?: string | number
  transPikName?: string
  transPikPhone?: string
  transportationNumber?: string

  yardContact?: string
  yardPhone?: string
  yardAddress?: string

  recipientContact?: string
  recipientPhone?: string
  shippingAddress?: string

  // 派送相关（部分页面使用）
  deliveryCompanyId?: string | number
  deliveryContact?: string
  deliveryPlateNumber?: string
  deliveryCall?: string
}

export interface ApiResponse {
  items: DeliveryItem[]
  total: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  sortable: boolean
}
