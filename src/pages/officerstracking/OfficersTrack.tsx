// import MapsComponent from '../MapsComponent/MapsComponent';
// import TableComponent from '../TableComponent/TableComponent';
// import Sideheadings from '../header/sideheadings/sideheadings';
import { Col, Row } from 'antd';
import MapsComponent from '../../components/MapsComponent/MapsComponent';
import TableComponent from '../../components/TableComponent/TableComponent';
import Sideheadings from '../../components/header/sideheadings/sideheadings';



function OfficersTrack() {
    return (
        <div style={{padding:20}}>
            <Row justify={"space-between"}>

                <Col
                    xs={{ flex: '100%' }}
                    md={{ flex: '70%' }}
                    style={{ marginTop: "20px", }}
                    className='rjb-header-cards'
                >
                    <Sideheadings title='Officers Track' />
                    <MapsComponent />
                </Col>

                <Col
                    xs={{ flex: '100%' }}
                    sm={{ flex: '50%' }}
                    md={{ flex: '40%' }}
                    lg={{ flex: '28%' }}
                    style={{ marginTop: "20px", }}
                    className='rjb-header-cards'
                >
                    <Sideheadings title="Rosters Summary" />
                    <TableComponent />
                </Col>
            </Row>
        </div>
    )
}

export default OfficersTrack