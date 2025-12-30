import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, Check, X, AlertCircle, ClipboardCheck } from "lucide-react";
import request from "@/utils/request";
import { ssoApi } from "@/api/sso";
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

interface OrderAuditDrawerProps {
  visible: boolean;
  orderId?: number | null;
  onClose: () => void;
  onSuccess?: (orderId?: number) => void;
}

export default function OrderAuditDrawer({ visible, orderId, onClose, onSuccess }: OrderAuditDrawerProps) {
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
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditingFile, setAuditingFile] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<string>("1"); // '1' 通过, '0' 不通过
  const [auditMemo, setAuditMemo] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 获取当前用户信息（本地缓存）
  const getCurrentUser = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
    } catch (e) {
      console.error('[OrderAuditDrawer] Failed to parse userInfo', e);
    }
    return null;
  };

  // 确保拿到当前用户（本地没有则用 token 去拉取一次）
  const ensureCurrentUser = async () => {
    const cached = getCurrentUser();
    if (cached) return cached;

    try {
      const res = await ssoApi.getUserInfo();
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      return res.data;
    } catch (e) {
      console.error('[OrderAuditDrawer] Failed to fetch userInfo', e);
      return null;
    }
  };

  // 获取用户ID (支持 number 和 string 类型)
  const getUserId = (user: any): number => {
    if (!user) return 0;
    // 尝试多种可能的字段名
    const id = user.userId ?? user.id ?? user.user_id ?? 0;
    return typeof id === 'string' ? parseInt(id, 10) || 0 : id;
  };

  // 获取用户昵称
  const getUserName = (user: any): string => {
    if (!user) return "未知用户";
    return user.nickName || user.userName || user.username || user.name || "未知用户";
  };

  // 完成审核并提交
  const handleSubmitAudit = async () => {
    if (!orderId) return;
    const currentUser = await ensureCurrentUser();
    setSubmitLoading(true);
    try {
      await request.post("/bzss/api/BaseInfo/ChangeStatus", {
        id: orderId,
        statusi: 2,
        statuss: "资料已审核",
        updateTime: new Date().toISOString(),
        updaterId: getUserId(currentUser),
        updaterNic: getUserName(currentUser),
      });
      toast.success("审核提交成功");
      onSuccess?.(orderId);
      onClose();
    } catch (err) {
      console.error("submit audit failed", err);
      toast.error("审核提交失败");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 审核文件
  const handleAuditFile = async () => {
    if (!auditingFile) return;
    const currentUser = await ensureCurrentUser();
    setAuditLoading(true);
    try {
      await request.post("/bzss/api/Attachment/Audit", {
        id: auditingFile.id,
        auditTime: new Date().toISOString(),
        auditerId: getUserId(currentUser),
        auditerName: getUserName(currentUser),
        auditMemo: auditMemo,
        auditResult: parseInt(auditResult),
      });
      toast.success(auditResult === "1" ? "审核通过" : "审核不通过");
      // 刷新附件列表
      loadDetail(orderId);
      closeAuditDialog();
    } catch (err) {
      console.error("audit failed", err);
      toast.error("审核操作失败");
    } finally {
      setAuditLoading(false);
    }
  };

  // 打开审核弹窗
  const openAuditDialog = (file: any) => {
    setAuditingFile(file);
    setAuditResult("1");
    setAuditMemo("");
    setAuditDialogOpen(true);
  };

  // 关闭审核弹窗
  const closeAuditDialog = () => {
    setAuditDialogOpen(false);
    setAuditingFile(null);
    setAuditResult("1");
    setAuditMemo("");
  };

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
    // load base options once when drawer is used
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
        <SheetHeader className="flex flex-row items-center justify-between pr-8">
          <SheetTitle>订单审核</SheetTitle>
          <Button 
            onClick={handleSubmitAudit} 
            disabled={submitLoading}
            className="ml-auto"
          >
            {submitLoading ? "提交中..." : "完成审核并提交"}
          </Button>
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

            {/* Attachments (文件审核) */}
            {attachments && attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>附件(文件审核)</CardTitle>
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
                          <TableHead className="w-[140px] text-center">操作</TableHead>
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
                            <TableCell className="text-center">
                              {file.isUpload === 1 && file.isAudit !== 1 ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-3"
                                  onClick={() => openAuditDialog(file)}
                                >
                                  <ClipboardCheck className="w-3 h-3 mr-1" />
                                  审核
                                </Button>
                              ) : file.isAudit === 1 ? (
                                <span className="text-muted-foreground text-xs">已处理</span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
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
                        {detail.receivables.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{item.feeTypeName ?? "-"}</TableCell>
                            <TableCell>{item.feeItemName ?? "-"}</TableCell>
                            <TableCell>{methodCodeToLabel(item.itemType) ?? "-"}</TableCell>
                            <TableCell>{item.price ?? "-"}</TableCell>
                            <TableCell>{item.currency ?? "-"}</TableCell>
                            <TableCell>{item.itemUnit ?? "-"}</TableCell>
                            <TableCell>{item.quantity ?? "-"}</TableCell>
                            <TableCell>{item.amount ?? "-"}</TableCell>
                            <TableCell>{item.remark ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Waybill Info */}
            <Card>
              <CardHeader>
                <CardTitle>提单信息</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货人名称</div>
                  <div className="font-medium">{shipperDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货人名称</div>
                  <div className="font-medium">{detail?.waybill?.consigneeName ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货联系人</div>
                  <div className="font-medium">{detail?.waybill?.shipperContact ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货联系人电话</div>
                  <div className="font-medium">{detail?.waybill?.shipperContactTel ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货联系人</div>
                  <div className="font-medium">{detail?.waybill?.consigneeContact ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货联系人电话</div>
                  <div className="font-medium">{detail?.waybill?.consigneeContactTel ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">发货人地址</div>
                  <div className="font-medium">{detail?.waybill?.shipperAddress ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">收货人地址</div>
                  <div className="font-medium">{detail?.waybill?.consigneeAddress ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">提单号</div>
                  <div className="font-medium">{detail?.waybill?.waybillNo ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">提单日期</div>
                  <div className="font-medium">{detail?.waybill?.waybillDate ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">目的港</div>
                  <div className="font-medium">{custPortDisplay}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">件数</div>
                  <div className="font-medium">{detail?.waybill?.quantity ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">总重量(kg)</div>
                  <div className="font-medium">{detail?.waybill?.ttlWeight ?? "-"}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">体积(m3)</div>
                  <div className="font-medium">{detail?.waybill?.cubicVol ?? "-"}</div>
                </div>
              </CardContent>
            </Card>

            {/* Containers */}
            {detail?.containers && detail.containers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>货柜信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">柜号</TableHead>
                          <TableHead className="w-[120px]">柜型</TableHead>
                          <TableHead className="w-[100px]">数量</TableHead>
                          <TableHead className="w-[120px]">重量(kg)</TableHead>
                          <TableHead>货物描述</TableHead>
                          <TableHead className="w-[120px]">备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.containers.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.number ?? "-"}</TableCell>
                            <TableCell>{item.sizeType ?? "-"}</TableCell>
                            <TableCell>{item.quantity ?? "-"}</TableCell>
                            <TableCell>{item.weight ?? "-"}</TableCell>
                            <TableCell>{item.goodsInfo ?? "-"}</TableCell>
                            <TableCell>{item.remark ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoices */}
            {detail?.invoices && detail.invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>发票信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">发票号</TableHead>
                          <TableHead className="w-[120px]">业务类型</TableHead>
                          <TableHead className="w-[120px]">币种</TableHead>
                          <TableHead className="w-[120px]">金额</TableHead>
                          <TableHead>出口商</TableHead>
                          <TableHead className="w-[120px]">备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.invoices.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.invoiceNo ?? "-"}</TableCell>
                            <TableCell>{item.bussType ?? "-"}</TableCell>
                            <TableCell>{item.currency ?? "-"}</TableCell>
                            <TableCell>{item.ttlAmount ?? "-"}</TableCell>
                            <TableCell>{item.exporter ?? "-"}</TableCell>
                            <TableCell>{item.remark ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goods Info */}
            {detail?.goodsInfos && detail.goodsInfos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>产品信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[160px]">产品名称</TableHead>
                          <TableHead className="w-[140px]">HSCode</TableHead>
                          <TableHead className="w-[140px]">型号</TableHead>
                          <TableHead className="w-[120px]">数量(箱)</TableHead>
                          <TableHead className="w-[140px]">单价(CNF美元)</TableHead>
                          <TableHead className="w-[150px]">总CNF价格(美元)</TableHead>
                          <TableHead className="w-[160px]">SABER文件</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.goodsInfos.map((item: any, index: number) => (
                          <TableRow key={`goods-${index}`}>
                            <TableCell>{item.goodsName ?? "-"}</TableCell>
                            <TableCell>{item.hsCode ?? "-"}</TableCell>
                            <TableCell>{item.goodsSpec ?? "-"}</TableCell>
                            <TableCell>{item.quantity ?? "-"}</TableCell>
                            <TableCell>{item.price ?? "-"}</TableCell>
                            <TableCell>{item.amount ?? "-"}</TableCell>
                            <TableCell>{item.saber ?? "-"}</TableCell>
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

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </SheetFooter>

        {/* 审核弹窗 */}
        {auditDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-[450px] shadow-lg">
              <h3 className="text-lg font-semibold mb-4">文件审核</h3>
              <p className="text-sm text-muted-foreground mb-4">
                文件: {auditingFile?.fileNameO ?? auditingFile?.fileName}
              </p>

              {/* 审核结果选择 */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">审核结果</Label>
                <RadioGroup value={auditResult} onValueChange={setAuditResult} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="audit-pass" />
                    <Label htmlFor="audit-pass" className="flex items-center gap-1 cursor-pointer text-green-600">
                      <Check className="w-4 h-4" />
                      通过
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="audit-reject" />
                    <Label htmlFor="audit-reject" className="flex items-center gap-1 cursor-pointer text-red-600">
                      <X className="w-4 h-4" />
                      不通过
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 审核意见 */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">审核意见</Label>
                <Textarea
                  placeholder="请输入审核意见..."
                  value={auditMemo}
                  onChange={(e) => setAuditMemo(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeAuditDialog} disabled={auditLoading}>
                  取消
                </Button>
                <Button onClick={handleAuditFile} disabled={auditLoading || (auditResult === "0" && !auditMemo.trim())}>
                  确认提交
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
