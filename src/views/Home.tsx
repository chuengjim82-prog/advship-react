// React import removed
import { Card, Row, Col, Statistic } from 'antd'
import { UserOutlined, ShoppingOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('menu.customer')}
              value={112893}
              prefix={<UserOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('menu.orderList')}
              value={9280}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={5328000}
              prefix={<DollarOutlined />}
              precision={2}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Growth"
              value={11.28}
              prefix={<RiseOutlined />}
              suffix="%"
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} title="Welcome to AdvShip">
        <p>React 18 + TypeScript + Vite + Ant Design</p>
        <p>物流管理系统前端项目运行成功！</p>
      </Card>
    </div>
  )
}
