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
  id: number
  creatorId: number
  creatorNic: string | null
  number: string // 柜号
  goodsInfo: string // 货物信息
  sizeType: string // 货柜型号
  pickUpTimeE: Date // 预约提柜时间
  quantity: number // 数量
  weight: number // 重量
  orderNo: string // 订单号
  statusi: number // 状态码
  statuss: string // 状态
  deliveryType: number // 派送方式
  orderId: number // 订单ID
  transPikId: number // 运输公司ID
  transPikName: string // 运输公司名称
  isTempStore: boolean // 是否堆场存储
  transportationNumber: string // 车牌号
  transPikPhone: string // 运输公司电话
  shippingContact: string // 派送联系人
  deliveryDateE?: string // 添加字段
  remark?: string // 添加字段
  yardContact?: string // 添加字段
  yardPhone?: string // 添加字段
  yardAddress?: string // 添加字段
  recipientContact?: string // 添加字段
  recipientPhone?: string // 添加字段
  shippingAddress?: string // 添加字段
}

export interface ApiResponse {
  items: DeliveryItem[]
  total: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

export interface ColumnConfig {
  key: keyof DeliveryItem | 'actions'
  label: string
  visible: boolean
  sortable: boolean
}
