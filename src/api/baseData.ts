import request from '@/utils/request'
import type { PageResult } from '@/utils/request'

export interface ServiceItem {
  id: number
  code?: string
  name?: string
  cnName?: string
  enName?: string
}

export interface AgentItem {
  id: number
  code?: string
  name?: string
}

export interface CustPortItem {
  id: number
  code?: string
  cnName?: string
  enName?: string
}

export interface CountryItem {
  id: number
  code2?: string
  code3?: string
  cnName?: string
  enName?: string
}

export const fetchServices = async (): Promise<ServiceItem[]> => {
  try {
    const res = await request.get<PageResult<ServiceItem>>('/base/api/Service', {
      params: { pageIndex: 1, pageSize: 1000 }
    })
    return res.data?.items || []
  } catch (error) {
    console.error('Failed to fetch services', error)
    return []
  }
}

export const fetchCustAgents = async (): Promise<AgentItem[]> => {
  try {
    const res = await request.get<PageResult<AgentItem>>('/base/api/CustAgent', {
      params: { pageIndex: 1, pageSize: 1000 }
    })
    return res.data?.items || []
  } catch (error) {
    console.error('Failed to fetch customs agents', error)
    return []
  }
}

export const fetchCustPorts = async (): Promise<CustPortItem[]> => {
  try {
    const res = await request.get<PageResult<CustPortItem>>('/base/api/CustPort', {
      params: { pageIndex: 1, pageSize: 1000 }
    })
    return res.data?.items || []
  } catch (error) {
    console.error('Failed to fetch customs ports', error)
    return []
  }
}

export const fetchTransAgents = async (): Promise<AgentItem[]> => {
  try {
    const res = await request.get<PageResult<AgentItem>>('/base/api/Shipping', {
      params: { pageIndex: 1, pageSize: 1000 }
    })
    return res.data?.items || []
  } catch (error) {
    console.error('Failed to fetch shipping agents', error)
    return []
  }
}

export const fetchCountries = async (): Promise<CountryItem[]> => {
  try {
    const res = await request.get<PageResult<CountryItem>>('/base/api/Country', {
      params: { pageIndex: 1, pageSize: 1000 }
    })
    return res.data?.items || []
  } catch (error) {
    console.error('Failed to fetch countries', error)
    return []
  }
}
