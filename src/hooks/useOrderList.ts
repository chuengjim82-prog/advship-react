import { useState, useEffect, useCallback, useRef } from "react";
import request from "@/utils/request";

interface OrderListResponse {
  items?: any[];
  total?: number;
}

interface StatusSummaryItem {
  statuss?: string | null;
  count?: number | null;
}

export function useOrderList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 使用 useRef 来跟踪加载状态
  const loadedRef = useRef({
    orders: false,
    status: false,
  });

  // 使用 useRef 来跟踪请求状态，防止并发请求
  const fetchingRef = useRef(false);
  // React StrictMode 会重复触发 useEffect，需用 ref 保证只调一次
  const initialFetchRef = useRef(false);

  // 合并请求函数
  const fetchAllData = useCallback(async () => {
    // 防止重复请求
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      // 并行请求订单数据和状态汇总
      const orderPromise = request
        .get<OrderListResponse>("/bzss/api/dynamic/order-base-info", {
          params: {
            pageIndex,
            pageSize,
            keyword: keyword || undefined,
            statuss: currentStatus === "all" ? undefined : currentStatus,
          },
        })
        .then((res) => res.data);

      const statusPromise = loadedRef.current.status
        ? Promise.resolve<StatusSummaryItem[]>([])
        : request
            .get<StatusSummaryItem[]>("/bzss/api/orderbaseinfo/status-summary")
            .then((res) => res.data || []);

      const [orderData, statusSummary] = await Promise.all([
        orderPromise,
        statusPromise,
      ]);

      setOrders(orderData?.items || []);
      setTotal(orderData?.total || 0);

      // 只有在需要时才更新状态汇总
      if (!loadedRef.current.status && statusSummary.length > 0) {
        const counts: Record<string, number> = {};
        statusSummary.forEach((item) => {
          const key = item.statuss?.trim() || "未设置";
          counts[key] = item.count || 0;
        });
        setStatusCounts(counts);
        loadedRef.current.status = true;
      }

      loadedRef.current.orders = true;
    } catch (error) {
      console.error("获取订单数据失败:", error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [pageIndex, pageSize, currentStatus, keyword]);

  // 初始加载
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    fetchAllData();
  }, [fetchAllData]); // 只在组件挂载时执行一次

  // 当筛选条件变化时重新获取订单数据（不包括状态汇总）
  useEffect(() => {
    // 跳过初始加载
    if (!loadedRef.current.orders) return;

    setLoading(true);
    request
      .get<OrderListResponse>("/bzss/api/dynamic/order-base-info", {
        params: {
          pageIndex,
          pageSize,
          keyword: keyword || undefined,
          statuss: currentStatus === "all" ? undefined : currentStatus,
        },
      })
      .then((res) => {
        const data = res.data;
        setOrders(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [pageIndex, pageSize, currentStatus, keyword]);

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value);
    setPageIndex(1);
  };

  const handleSearch = (kw?: string) => {
    if (kw !== undefined) setKeyword(kw);
    setPageIndex(1);
  };

  const handlePageChange = (page: number, newSize?: number) => {
    setPageIndex(page);
    if (newSize && newSize !== pageSize) {
      setPageSize(newSize);
    }
  };

  const refresh = () => {
    // 重置加载状态
    loadedRef.current.orders = false;
    loadedRef.current.status = false;
    fetchAllData();
  };

  return {
    orders,
    statusCounts,
    loading,
    currentStatus,
    keyword,
    pageIndex,
    pageSize,
    total,
    handleStatusChange,
    handleSearch,
    handlePageChange,
    refresh,
  };
}
