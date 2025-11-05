import React from 'react';

import { Col, Row } from 'antd';
import { UsergroupAddOutlined, AlertOutlined, AimOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Card, Statistic } from 'antd';

import Cam1 from '../../assets/cam1.jpeg';

import MapsComponent from '../MapsComponent/MapsComponent';
import TableComponent from '../TableComponent/TableComponent';


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
        <Row justify={"space-between"}>

          <Col
            xs={{ flex: '100%' }}
            sm={{ flex: '50%' }}
            md={{ flex: '40%' }}
            lg={{ flex: '22%' }}
            style={{ marginTop: "20px" }}
          >
            <Card variant="borderless"
              className='rjb-header-cards'
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
        <Row justify={"space-between"}>

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
        </Row> 

        </div>

      </div>

    </div>
  );
};

export default LayoutComponent;
