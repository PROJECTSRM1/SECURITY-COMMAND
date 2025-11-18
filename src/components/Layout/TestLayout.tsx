
import React from 'react';

import { Col, Row } from 'antd';
import { UsergroupAddOutlined, AlertOutlined, AimOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Statistic } from 'antd';
// import OfficersTrack from '../../pages/officerstracking/OfficersTrack';
import RadarChartComponent from '../Charts/RadarChartComponent';
// import PieChartWithCustomizedLabel from '../Charts/PieChartWithCustomizedLabel';
import Sideheadings from '../header/sideheadings/sideheadings';
import ProgressBarsComponent from '../Charts/ProgressBars/ProgressBarsComponent';
import BarChartWithMinHeightComponent from '../Charts/BarChartWithMinHeightComponent';

const LayoutComponent: React.FC = () => {
  return (
    <div className="rjb-lay__dashboard">

      <div className="rjb-lay__container">

        {/* (old blocks commented out left untouched) */}

        <div>
          <Row justify={"space-between"}>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              className="rjb-lay__col-gap"
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="On-Post Officers"
                  value={465}
                  prefix={<UsergroupAddOutlined className="rjb-lay__stat-icon rjb-lay__stat-icon--brown" />}
                  suffix="/ 600"
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              className="rjb-lay__col-gap"
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Alerts Today"
                  value={26}
                  prefix={<AlertOutlined className="rjb-lay__stat-icon rjb-lay__stat-icon--red" />}
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              className="rjb-lay__col-gap"
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Suspisious Activities"
                  value={3}
                  prefix={<AimOutlined className="rjb-lay__stat-icon rjb-lay__stat-icon--orange" />}
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              className="rjb-lay__col-gap"
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Devices Offline"
                  value={12}
                  prefix={<QuestionCircleOutlined className="rjb-lay__stat-icon rjb-lay__stat-icon--gray" />}
                />
              </Card>
            </Col>

          </Row>

          {/* <OfficersTrack /> */}

          <Row className="rjb-lay__charts-row">
            <Col
              sm={{ flex: '50%' }}
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Sideheadings title='Performance by Gates' />
                <RadarChartComponent />
              </Card>
            </Col>

            <Col
              sm={{ flex: '40%' }}
              className="rjb-lay__middle-col"
            >
              <Row>
                <Col sm={{ flex: '100%' }}>
                  <Card variant="borderless"
                    className='rjb-header-cards rjb-stat-card-hover'>
                    <Sideheadings title='Response Times' />
                    <BarChartWithMinHeightComponent />
                  </Card>
                </Col>
              </Row>

              <Row className="rjb-lay__col-gap">
                <Col sm={{ flex: '100%' }}>
                  <Card variant="borderless"
                    className='rjb-header-cards rjb-stat-card-hover'
                  >
                    <Sideheadings title='System Overview' />

                    <div className="rjb-lay__system-overview">
                      {[
                        { title: "Device Defritate", value: 96 },
                        { title: "GPS Accuracy", value: 85 },
                        { title: "Battery Average", value: 72 },
                      ].map((ele: any) => (
                        <div key={ele.title}>
                          <ProgressBarsComponent title={ele.title} value={ele.value} />
                        </div>
                      ))}
                    </div>

                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

        </div>

      </div>

    </div>
  );
};

export default LayoutComponent;
