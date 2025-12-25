// Order related type definitions

export interface WaybillDto {
  id?: number
  orderId?: number
  waybillNo?: string
  waybillDate?: string
  shipperName?: string
  shipperAddress?: string
  shipperContact?: string
  shipperContactTel?: string
  consigneeName?: string
  consigneeAddress?: string
  consigneeContact?: string
  consigneeContactTel?: string
  quantity?: number
  ttlWeight?: number
  cubicVol?: number
  custPort?: string
  custPortId?: number
  custPortName?: string
  remark?: string
  shipperId?: number
  shipperCompanyName?: string
  destCityName?: string
}

export interface ContainerGoodsItem {
  id: number
  containerId?: number
  number?: string
  sizeType?: string
  weight?: number
  remark?: string
}

export interface OrderBaseInfo {
  id?: number
  orderNo?: string
  customerId?: number
  customerName?: string
  countryId?: number
  countryName?: string
  orgCountryId?: number
  orgCountryName?: string
  customsId?: number
  customsName?: string
  custAgentId?: number
  custAgentName?: string
  isAgentClear?: boolean
  declarationType?: number
  remark?: string
  status?: number
  statusText?: string
}

export interface OrderDetail {
  baseInfo?: OrderBaseInfo
  waybill?: WaybillDto
  containers?: ContainerGoodsItem[]
  receivables?: OrderReceivable[]
  attachments?: OrderAttachment[]
}

export interface OrderReceivable {
  id?: number
  orderId?: number
  feeTypeId?: number
  feeTypeName?: string
  feeItemId?: number
  feeItemName?: string
  itemType?: number
  price?: number
  currency?: string
  itemUnit?: string
  quantity?: number
  amount?: number
  remark?: string
}

export interface OrderAttachment {
  id?: number
  orderId?: number
  fileName?: string
  fileNameN?: string
  fileNameO?: string
  isUpload?: number
  isAudit?: number
  remark?: string
}
