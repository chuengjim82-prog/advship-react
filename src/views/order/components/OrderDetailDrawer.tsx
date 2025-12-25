import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Check, X, AlertCircle } from "lucide-react";
import request from "@/utils/request";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  fetchCustoms,
  fetchShippings,
  fetchCustomers,
  fetchCustAgents,
  fetchCustPorts,
  fetchCountries,
  type CustomsItem,
  type ShippingItem,
  type CustomerItem,
  type AgentItem,
  type CustPortItem,
  type CountryItem,
} from "@/api/baseData";

interface OrderDetailDrawerProps {
  visible: boolean;
  orderId?: number | null;
  onClose: () => void;
}

export default function OrderDetailDrawer({ visible, orderId, onClose }: OrderDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null);

  const [customerOptions, setCustomerOptions] = useState<CustomerItem[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryItem[]>([]);
  const [custPortOptions, setCustPortOptions] = useState<CustPortItem[]>([]);
  const [customsOptions, setCustomsOptions] = useState<CustomsItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingItem[]>([]);
  const [custAgentOptions, setCustAgentOptions] = useState<AgentItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attachments, setAttachments] = useState<any[]>([]);

  const loadDetail = async (id?: number | null) => {
    if (!id) {
      setDetail(null);
      setAttachments([]);
      return;
    }
    setLoading(true);
    try {
      const res = await request.get<{ attachments?: unknown[] }>(`/bzss/api/orderbaseinfo/${id}/detail`);
      setDetail(res.data);
      setAttachments((res.data as { attachments?: unknown[] })?.attachments ?? []);
    } catch (err) {
      console.error("load detail failed", err);
      toast.error("加载订单详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && orderId) loadDetail(orderId);
    if (!visible) setDetail(null);
  }, [visible, orderId]);

  const loadBaseOptions = async () => {
    try {
      const [customs, shippings, customers, agents, ports, countries] = await Promise.all([
        fetchCustoms(),
        fetchShippings(),
        fetchCustomers(),
        fetchCustAgents(),
        fetchCustPorts(),
        fetchCountries(),
      ]);
      setCustomsOptions(customs);
      setShippingOptions(shippings);
      setCustomerOptions(customers);
      setCustAgentOptions(agents);
      setCustPortOptions(ports);
      setCountryOptions(countries);
    } catch (err) {
      console.error("load base options failed", err);
    }
  };

  useEffect(() => {
    if (visible) loadBaseOptions();
  }, [visible]);

  const RECEIVABLE_METHOD_FIXED = "固定";
  const RECEIVABLE_METHOD_ACTUAL = "实报";

  const methodCodeToLabel = (code?: number | null) =>
    code === 1 ? RECEIVABLE_METHOD_FIXED : code === 2 ? RECEIVABLE_METHOD_ACTUAL : "-";

  const customerDisplay =
    detail?.baseInfo?.customerName ?? customerOptions.find((c) => c.id === detail?.baseInfo?.customerId)?.name ?? "-";
  const orgCountryItem = countryOptions.find((c) => c.id === detail?.baseInfo?.orgCountryId);
  const orgCountryDisplay =
    detail?.baseInfo?.orgCountryName ??
    (orgCountryItem ? orgCountryItem.cnName || orgCountryItem.enName || orgCountryItem.code2 : "-");
  const countryItem = countryOptions.find((c) => c.id === detail?.baseInfo?.countryId);
  const countryDisplay =
    detail?.baseInfo?.countryName ??
    (countryItem ? countryItem.cnName || countryItem.enName || countryItem.code2 : "-");
  const custPortItem = custPortOptions.find((p) => p.id === detail?.waybill?.custPortId);
  const custPortDisplay =
    detail?.waybill?.custPortName ??
    (custPortItem ? custPortItem.enName || custPortItem.cnName || custPortItem.code : "-");
  const shipperItem = shippingOptions.find((s) => s.id === detail?.waybill?.shipperId);
  const shipperDisplay = detail?.waybill?.shipperName ?? (shipperItem ? shipperItem.sName || shipperItem.code : "-");
  const custAgentDisplay =
    detail?.baseInfo?.custAgentName ??
    custAgentOptions.find((a) => a.id === detail?.baseInfo?.custAgentId)?.name ??
    "-";

  const customsItem = customsOptions.find((p) => p.id === detail?.baseInfo?.customsId);
  const customsDisplay =
    detail?.baseInfo?.customsName ?? (customsItem ? customsItem.enName || customsItem.cnName || customsItem.code : "-");

  return (
    <Sheet open={visible} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent className="w-[80vw] sm:max-w-[80vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>订单详情</SheetTitle>
        </SheetHeader>

        <Loading loading={loading}>
          <div className="py-4 space-y-4">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">客户名称</div>
                  <div className="font-medium">{customerDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">出口国家</div>
                  <div className="font-medium">{orgCountryDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">出口公司</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">进口国家</div>
                  <div className="font-medium">{countryDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的城市</div>
                  <div className="font-medium">{detail?.waybill?.destCityName ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的港口</div>
                  <div className="font-medium">{custPortDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的地海关</div>
                  <div className="font-medium">{customsDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">航司名称</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">代理清关</div>
                  <div className="font-medium">{detail?.baseInfo?.isAgentClear ? "是" : "否"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">清关公司</div>
                  <div className="font-medium">{custAgentDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">经纪商授权码</div>
                  <div className="font-medium">{detail?.baseInfo?.orderNo ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">申报类型</div>
                  <div className="font-medium">
                    {detail?.baseInfo?.declarationType === 1
                      ? "进口申报"
                      : detail?.baseInfo?.declarationType === 2
                        ? "立即清关"
                        : "-"}
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="text-sm text-muted-foreground">备注</div>
                  <div className="font-medium">{detail?.baseInfo?.remark ?? "-"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments (只读) */}
            {attachments && attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>附件</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[160px]">文件类型</TableHead>
                          <TableHead className="w-[200px]">文件名</TableHead>
                          <TableHead className="w-[100px] text-center">审核结果</TableHead>
                          <TableHead className="w-[200px]">审核意见</TableHead>
                          <TableHead className="w-[100px]">审核人</TableHead>
                          <TableHead className="w-[150px]">审核时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attachments.map((file: any) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <div className="text-sm">{file.fileName ?? "-"}</div>
                            </TableCell>
                            <TableCell>
                              {file.isUpload === 1 && file.fileNameN ? (
                                <button
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                  onClick={() => {
                                    const downloadUrl = `http://hn3.osoosa.com/bzss/order/${orderId}/${file.fileNameN}`;
                                    window.open(downloadUrl, "_blank");
                                  }}
                                >
                                  <Download className="w-3 h-3" />
                                  {file.fileNameO ?? "-"}
                                </button>
                              ) : (
                                <div className="text-sm text-muted-foreground">{file.fileNameO ?? "未上传"}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {file.auditResult === 1 ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <Check className="w-3 h-3 mr-1" />
                                  通过
                                </Badge>
                              ) : file.auditResult === 0 ? (
                                <Badge variant="destructive">
                                  <X className="w-3 h-3 mr-1" />
                                  未通过
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  待审核
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm max-w-[200px] truncate" title={file.auditMemo ?? ""}>
                                {file.auditMemo ?? "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{file.auditerName ?? "-"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {file.auditTime ? dayjs(file.auditTime).format("YYYY-MM-DD HH:mm") : "-"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Receivables */}
            {detail?.receivables && detail.receivables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>应收项目</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">类型</TableHead>
                          <TableHead className="w-[180px]">项目名称</TableHead>
                          <TableHead className="w-[120px]">方式</TableHead>
                          <TableHead className="w-[120px]">价格</TableHead>
                          <TableHead className="w-[100px]">币种</TableHead>
                          <TableHead className="w-[100px]">单位</TableHead>
                          <TableHead className="w-[120px]">数量</TableHead>
                          <TableHead className="w-[160px]">金额</TableHead>
                          <TableHead>备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.receivables.map((item: any, idx: number) => (
                          <TableRow key={item.id ?? idx}>
                            <TableCell>{item.feeTypeName ?? "-"}</TableCell>
                            <TableCell>{item.feeItemName ?? "-"}</TableCell>
                            <TableCell>{methodCodeToLabel(item.method)}</TableCell>
                            <TableCell>{item.price ?? "-"}</TableCell>
                            <TableCell>{item.currencyCode ?? "-"}</TableCell>
                            <TableCell>{item.unit ?? "-"}</TableCell>
                            <TableCell>{item.quantity ?? "-"}</TableCell>
                            <TableCell className="font-semibold">{item.amount ?? "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.remark ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payables */}
            {detail?.payables && detail.payables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>应付项目</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">类型</TableHead>
                          <TableHead className="w-[180px]">项目名称</TableHead>
                          <TableHead className="w-[120px]">方式</TableHead>
                          <TableHead className="w-[120px]">价格</TableHead>
                          <TableHead className="w-[100px]">币种</TableHead>
                          <TableHead className="w-[100px]">单位</TableHead>
                          <TableHead className="w-[120px]">数量</TableHead>
                          <TableHead className="w-[160px]">金额</TableHead>
                          <TableHead>备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.payables.map((item: any, idx: number) => (
                          <TableRow key={item.id ?? idx}>
                            <TableCell>{item.feeTypeName ?? "-"}</TableCell>
                            <TableCell>{item.feeItemName ?? "-"}</TableCell>
                            <TableCell>{methodCodeToLabel(item.method)}</TableCell>
                            <TableCell>{item.price ?? "-"}</TableCell>
                            <TableCell>{item.currencyCode ?? "-"}</TableCell>
                            <TableCell>{item.unit ?? "-"}</TableCell>
                            <TableCell>{item.quantity ?? "-"}</TableCell>
                            <TableCell className="font-semibold">{item.amount ?? "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.remark ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Loading>
      </SheetContent>
    </Sheet>
  );
}
