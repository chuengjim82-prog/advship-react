import { Loading } from '@/components/ui/spinner'
import MainLayout from '@/layouts/MainLayout'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// 懒加载视图组件
const Login = lazy(() => import('@/views/Login'))
const Home = lazy(() => import('@/views/Home'))

// Basic Data Module
const Country = lazy(() => import('@/views/basic/Country'))
const City = lazy(() => import('@/views/basic/City'))
const Currency = lazy(() => import('@/views/basic/Currency'))
const Service = lazy(() => import('@/views/basic/Service'))
const ServiceAttn = lazy(() => import('@/views/basic/ServiceAttn'))
const FeeType = lazy(() => import('@/views/finis/FeeType'))
const FeeItem = lazy(() => import('@/views/finis/FeeItem'))
const BankAccountO = lazy(() => import('@/views/finis/BankAccountO'))
const BankAccountT = lazy(() => import('@/views/finis/BankAccountT'))

// Partner Module
const Customer = lazy(() => import('@/views/partner/Customer'))
const CsReceiver = lazy(() => import('@/views/partner/CsReceiver'))
const CsShipper = lazy(() => import('@/views/partner/CsShipper'))
const CsConsignee = lazy(() => import('@/views/partner/CsConsignee'))
const Supplier = lazy(() => import('@/views/partner/Supplier'))
const Shipping = lazy(() => import('@/views/partner/Shipping'))
const CustAgent = lazy(() => import('@/views/partner/CustAgent'))

// Port & Customs Module
const Customs = lazy(() => import('@/views/port/Customs'))
const CustPort = lazy(() => import('@/views/port/CustPort'))

// Order Module
const BaseInfo = lazy(() => import('@/views/order/BaseInfo'))
const OrderDetail = lazy(() => import('@/views/order/components/OrderDetail'))

const Clearance = lazy(() => import('@/views/clearance/clearanceList'))
const ClearanceOrderDetail = lazy(() => import('@/views/clearance/components/OrderDetail'))
const DeliveryList = lazy(() => import('@/views/delivery/DeliveryList'))
const CustomerDelivery = lazy(() => import('@/views/delivery/components/CustomerDelivery'))
const ContainerPickup = lazy(() => import('@/views/delivery/components/ContainerPickup'))
const ContainerPickupReadonly = lazy(() => import('@/views/delivery/components/ContainerPickupReadonly'))

const Containerhandling = lazy(() => import('@/views/delivery/components/Containerhandling'))

// System Tools Module
const CodeGenerator = lazy(() => import('@/views/CodeGenerator'))

// 路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
        handle: { title: '首页' },
      },
      // Basic Data Routes
      {
        path: 'basic/country',
        element: <Country />,
        handle: { title: '国家管理' },
      },
      {
        path: 'basic/city',
        element: <City />,
        handle: { title: '城市管理' },
      },
      {
        path: 'basic/currency',
        element: <Currency />,
        handle: { title: '币种管理' },
      },
      {
        path: 'basic/service',
        element: <Service />,
        handle: { title: '服务项目管理' },
      },
      {
        path: 'basic/serviceAttn',
        element: <ServiceAttn />,
        handle: { title: '产品服务附件' },
      },
      {
        path: 'basic/feeType',
        element: <FeeType />,
        handle: { title: '费用类别' },
      },
      {
        path: 'basic/feeItem',
        element: <FeeItem />,
        handle: { title: '费用项目管理' },
      },
      {
        path: 'basic/bankAccountO',
        element: <BankAccountO />,
        handle: { title: '银行账户' }
      },
      {
        path: 'basic/bankAccountT',
        element: <BankAccountT />,
        handle: { title: '往来账户' }
      },
      // Partner Routes
      {
        path: 'partner/customer',
        element: <Customer />,
        handle: { title: '客户管理' },
      }, {
        path: 'partner/csReceiver',
        element: <CsReceiver />,
        handle: { title: '客户收件人' },
      }, {
        path: 'partner/csShipper',
        element: <CsShipper />,
        handle: { title: '客户发件人' },
      }, {
        path: 'partner/csConsignee',
        element: <CsConsignee />,
        handle: { title: '客户收货地址' },
      },
      {
        path: 'partner/supplier',
        element: <Supplier />,
        handle: { title: '供应商管理' },
      },
      {
        path: 'partner/shipping',
        element: <Shipping />,
        handle: { title: '船公司管理' },
      },
      {
        path: 'partner/cust-agent',
        element: <CustAgent />,
        handle: { title: '客户代理管理' },
      },
      // Port & Customs Routes
      {
        path: 'port/customs',
        element: <Customs />,
        handle: { title: '海关管理' },
      },
      {
        path: 'port/cust-port',
        element: <CustPort />,
        handle: { title: '港口管理' },
      },
      // Order Routes
      {
        path: 'order/base-info',
        element: <BaseInfo />,
        handle: { title: '订单列表(跟单)' },
      },
      {
        path: 'clearance/clearance-list',
        element: <Clearance />,
        handle: { title: '清关列表' },
      },
      {
        path: 'clearance/OrderDetail',
        element: <ClearanceOrderDetail />,
        handle: { title: '订单详情' },
      },
      {
        path: '/delivery/delivery-list',
        element: <DeliveryList />,
        handle: { title: '派送列表' },
      },
      {
        path: '/delivery/CustomerDelivery',
        element: <CustomerDelivery />,
        handle: { title: '派送预约' },
      },
      {
        path: '/delivery/ContainerPickup',
        element: <ContainerPickup />,
        handle: { title: '预约提柜' },
      },
      {
        path: '/delivery/Containerhandling',
        element: <Containerhandling />,
        handle: { title: '提柜处理' },
      },
      {
        path: '/delivery/ContainerPickupReadonly',
        element: <ContainerPickupReadonly />,
        handle: { title: '提柜详情' },
      },
      {
        path: 'order/detail',
        element: <OrderDetail />,
        handle: { title: '订单详情' },
      },
      // System Tools Routes
      {
        path: 'tools/code-generator',
        element: <CodeGenerator />,
        handle: { title: '代码生成器' },
      },
    ],
  },
])

// 包装 Suspense
function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loading tip="加载中..." />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default AppRouter
