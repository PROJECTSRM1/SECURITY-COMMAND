import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, 
  // useMap 
} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { markersData } from '../../utils/constants/data';
import { useAppSelector } from '../../app/hooks';
// import { PushpinOutlined } from '@ant-design/icons'
import { FaLocationDot } from "react-icons/fa6";
import L from 'leaflet';
import { renderToString } from 'react-dom/server';


// const MapUpdater = ({ selectedOfficer }: { selectedOfficer: any }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (selectedOfficer) {
//       const { coords } = selectedOfficer;
//       map.flyTo(coords, 20, { animate: true }); // smooth zoom-in
//     }
//   }, [selectedOfficer, map]);

//   return null; // nothing to render
// };

const pushpinIcon = L.divIcon({
  html: renderToString(<FaLocationDot className="map-pin-icon" />),
  className: '', 
  iconSize: [24, 24], // optional
  iconAnchor: [12, 24], // optional (where the "tip" of icon points)
});

export default function MapView() {
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const selectedOfficer = useAppSelector((state) => state.posts.selectedOfficer);

   useEffect(() => {
    if (selectedOfficer) {
      const marker = markerRefs.current[selectedOfficer.name];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedOfficer]);

  const position: [number, number] = [17.385, 78.4867];


    useEffect(()=>{
      console.log('selectedOfficer:', selectedOfficer)
    },[selectedOfficer])


//   const position = [17.385, 78.4867]; // Hyderabad coordinates

  return (
    <div  className="map-wrapper">
 <MapContainer
      center={selectedOfficer ? selectedOfficer.coords : position}
      zoom={selectedOfficer ? 18 : 13}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* This invisible helper re-centers map on selection */}
      {/* <MapUpdater selectedOfficer={selectedOfficer} /> */}

      {markersData.map((m: any) => (
        <Marker
        icon={pushpinIcon}
          key={m.id}
          position={m.position}
          ref={(ref) => {
            if (ref) markerRefs.current[m.name] = ref;
          }}
        >
          <Popup>
            <div className="map-popup">
              <div>Officer: {m.name}</div>
              <div>Availability: {m.availability ? 'On-Post' : 'Offline'}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  );
}
