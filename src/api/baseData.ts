import request from "@/utils/request";
import type { PageResult } from "@/utils/request";

export interface ShippingItem {
  id: number;
  code?: string;
  sName?: string;
}

export interface CustomerItem {
  id: number;
  code?: string;
  name?: string;
}

export interface ServiceItem {
  id: number;
  code?: string;
  name?: string;
  cnName?: string;
  enName?: string;
}

export interface AgentItem {
  id: number;
  code?: string;
  name?: string;
}

export interface CustPortItem {
  id: number;
  code?: string;
  cnName?: string;
  enName?: string;
}

export interface CustomsItem {
  id: number;
  code?: string;
  cnName?: string;
  enName?: string;
}

export interface CountryItem {
  id: number;
  code2?: string;
  code3?: string;
  cnName?: string;
  enName?: string;
}

export interface FeeTypeItem {
  id: number;
  cnName?: string;
  enName?: string;
}

export interface FeeItem {
  id: number;
  feeTypeId?: number | null;
  cnName?: string;
  enName?: string;
  itemUnit?: string;
}

export const fetchShippings = async (): Promise<ShippingItem[]> => {
  try {
    const res = await request.get<PageResult<ShippingItem>>(
      "/base/api/Shipping",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch shippings", error);
    return [];
  }
};

export const fetchCustomers = async (): Promise<CustomerItem[]> => {
  try {
    const res = await request.get<PageResult<CustomerItem>>(
      "/base/api/Customer",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch services", error);
    return [];
  }
};

export const fetchServices = async (): Promise<ServiceItem[]> => {
  try {
    const res = await request.get<PageResult<ServiceItem>>(
      "/base/api/Service",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch services", error);
    return [];
  }
};

export const fetchCustAgents = async (): Promise<AgentItem[]> => {
  try {
    const res = await request.get<PageResult<AgentItem>>(
      "/base/api/CustAgent",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch customs agents", error);
    return [];
  }
};

export const fetchCustPorts = async (): Promise<CustPortItem[]> => {
  try {
    const res = await request.get<PageResult<CustPortItem>>(
      "/base/api/CustPort",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch cust ports", error);
    return [];
  }
};

export const fetchCustoms = async (): Promise<CustomsItem[]> => {
  try {
    const res = await request.get<PageResult<CustomsItem>>(
      "/base/api/Customs",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch customs", error);
    return [];
  }
};

export const fetchTransAgents = async (): Promise<AgentItem[]> => {
  try {
    const res = await request.get<PageResult<AgentItem>>("/base/api/Shipping", {
      params: { pageIndex: 1, pageSize: 1000 },
    });
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch shipping agents", error);
    return [];
  }
};

export const fetchCountries = async (): Promise<CountryItem[]> => {
  try {
    const res = await request.get<PageResult<CountryItem>>(
      "/base/api/Country",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch countries", error);
    return [];
  }
};

export const fetchFeeTypes = async (): Promise<FeeTypeItem[]> => {
  try {
    const res = await request.get<PageResult<FeeTypeItem>>(
      "/base/api/FeeType",
      {
        params: { pageIndex: 1, pageSize: 1000 },
      }
    );
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch fee types", error);
    return [];
  }
};

export const fetchFeeItems = async (): Promise<FeeItem[]> => {
  try {
    const res = await request.get<PageResult<FeeItem>>("/base/api/FeeItem", {
      params: { pageIndex: 1, pageSize: 1000 },
    });
    return res.data?.items || [];
  } catch (error) {
    console.error("Failed to fetch fee items", error);
    return [];
  }
};
