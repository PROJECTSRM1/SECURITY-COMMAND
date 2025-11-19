// import MapsComponent from '../MapsComponent/MapsComponent';
// import TableComponent from '../TableComponent/TableComponent';
// import Sideheadings from '../header/sideheadings/sideheadings';
import { Col, Row } from 'antd';
import MapsComponent from '../../components/MapsComponent/MapsComponent';
import TableComponent from '../../components/TableComponent/TableComponent';
import Sideheadings from '../../components/header/sideheadings/sideheadings';



function OfficersTrack() {
    return (
        <div className="rjb-track-page-wrap">
            <Row justify={"space-between"}>

                <Col
                    xs={{ flex: '100%' }}
                    md={{ flex: '70%' }}
                    className="rjb-header-cards rjb-track-col"
                >
                    <Sideheadings title='Officers Track' />
                    <MapsComponent />
                </Col>

                <Col
                    xs={{ flex: '100%' }}
                    sm={{ flex: '50%' }}
                    md={{ flex: '40%' }}
                    lg={{ flex: '28%' }}
                    className="rjb-header-cards rjb-track-col"
                >
                    <Sideheadings title="Rosters Summary" />
                    <TableComponent />
                </Col>
            </Row>
        </div>
    )
}

export default OfficersTrack