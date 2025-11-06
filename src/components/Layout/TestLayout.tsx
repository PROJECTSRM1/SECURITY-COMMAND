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
    <div>

      <div style={{ padding: '20px' }}>


        {/* <Row justify={"space-between"}>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '22%' }}
            style={{ marginTop: "20px" }}
          >
            <Card variant="borderless"
              className='rjb-header-cards'
              style={{
                  backgroundImage: `url(${Cam1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height:'110px'
                }}
            >
              <Statistic
                title="On-Post Officers"
                value={465}
                // precision={2}
                // valueStyle={{ color: '#3f8600' }}
                prefix={<UsergroupAddOutlined style={{ color: "brown" }} />}
                suffix="/ 600"
              />
            </Card>
          </Col>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '22%' }}
            style={{ marginTop: "20px" }}
          >
            <Card variant="borderless"
              className='rjb-header-cards'
                            style={{
                  backgroundImage: `url(${Cam1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height:'110px'
                }}
            >
              <Statistic
                title="Alerts Today"
                value={26}
                // precision={2}
                // valueStyle={{ color: '#3f8600' }}
                prefix={<AlertOutlined style={{ color: "red" }} />}
              // suffix="%"
              />
            </Card>
          </Col>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '22%' }}
            style={{ marginTop: "20px" }}
          >
            <Card variant="borderless"
              className='rjb-header-cards'
                            style={{
                  backgroundImage: `url(${Cam1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height:'110px'
                }}
            >
              <Statistic
                title="Suspisious Activities"
                value={3}
                // precision={2}
                // valueStyle={{ color: 'yellow' }}
                prefix={<AimOutlined style={{ color: "orange" }} />}
              // suffix="%"
              />
            </Card>
          </Col>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '22%' }}
            style={{ marginTop: "20px" }}
          >
            <Card variant="borderless"
              className='rjb-header-cards'
                            style={{
                  backgroundImage: `url(${Cam1})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  height:'110px'
                }}
            >
              <Statistic
                title="Devices Offline"
                value={12}
                // precision={2}
                // valueStyle={{ color: '#3f8600' }}
                prefix={<QuestionCircleOutlined style={{ color: "gray" }} />}
              // suffix="%"
              />
            </Card>
          </Col>

        </Row> */}

        {/* <Row justify={"space-between"}>

          <Col
            xs={{ flex: '100%' }}
            md={{ flex: '70%' }}
            style={{ marginTop: "20px", }}
            className='rjb-header-cards'
          >
            <div style={{ background: '#e6f4ff', padding: '10px', color: "rgb(81, 153, 205)", fontSize: '18px', fontWeight: "bold" }}>{'Live Site'}</div>

            <MapsComponent />
          </Col>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '25%' }}
            style={{ marginTop: "20px", }}
            className='rjb-header-cards'
          >
            <h4 style={{margin:'10px'}}>Shifts and Rosters Summary</h4>
            <TableComponent />
          </Col>
        </Row> */}

        <div>
          <Row justify={"space-between"} >

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              style={{ marginTop: "20px" }}
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="On-Post Officers"
                  value={465}
                  // precision={2}
                  // valueStyle={{ color: '#3f8600' }}
                  prefix={<UsergroupAddOutlined style={{ color: "brown" }} />}
                  suffix="/ 600"
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              style={{ marginTop: "20px" }}
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Alerts Today"
                  value={26}
                  // precision={2}
                  // valueStyle={{ color: '#3f8600' }}
                  prefix={<AlertOutlined style={{ color: "red" }} />}
                // suffix="%"
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              style={{ marginTop: "20px" }}
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Suspisious Activities"
                  value={3}
                  // precision={2}
                  // valueStyle={{ color: 'yellow' }}
                  prefix={<AimOutlined style={{ color: "orange" }} />}
                // suffix="%"
                />
              </Card>
            </Col>

            <Col
              xs={{ flex: '100%' }}
              sm={{ flex: '50%' }}
              md={{ flex: '40%' }}
              lg={{ flex: '22%' }}
              style={{ marginTop: "20px" }}
            >
              <Card variant="borderless"
                className='rjb-header-cards rjb-stat-card-hover'
              >
                <Statistic
                  title="Devices Offline"
                  value={12}
                  // precision={2}
                  // valueStyle={{ color: '#3f8600' }}
                  prefix={<QuestionCircleOutlined style={{ color: "gray" }} />}
                // suffix="%"
                />
              </Card>
            </Col>

          </Row>

          {/* <OfficersTrack /> */}

          <Row style={{ marginTop: 20 }}>
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
              style={{ margin: "0 auto" }}
            >
              <Row>
                                <Col sm={{flex: '100%'}}>
                  <Card variant="borderless"
                    className='rjb-header-cards rjb-stat-card-hover'>
                    <Sideheadings title='Response Times' />

                    <BarChartWithMinHeightComponent />
                  </Card>
                </Col>

              </Row>
              <Row style={{marginTop:20}}>
                <Col 
              sm={{ flex: '100%' }}
                >
                  <Card variant="borderless"
                    className='rjb-header-cards rjb-stat-card-hover'
                  >
                    <Sideheadings title='System Overview' />

                    <div style={{ display: 'flex', justifyContent: "space-between", paddingTop: 20 }}>
                      {[
                        { title: "Device Defritate", value: 96 },
                        { title: "GPS Accuracy", value: 85 },
                        { title: "Battery Average", value: 72 },
                      ].map((ele: any) => <div key={ele.title}><ProgressBarsComponent title={ele.title} value={ele.value} /></div>)}
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
