import React, { useEffect, useState } from "react";
import "./CctvAiFeeds.css";

type VehicleData = {
  id: string;
  plateNumber: string;
  vehicleType: string;
  time: string;
  location: string;
};

const samplePlates = [
  { plateNumber: "TS09AB1234", vehicleType: "Car", location: "Gate 1" },
  { plateNumber: "AP28CC9988", vehicleType: "Bike", location: "Gate 2" },
  { plateNumber: "TS10XY5678", vehicleType: "SUV", location: "Gate 3" },
  { plateNumber: "KA05MN3344", vehicleType: "Truck", location: "Gate 4" },
  { plateNumber: "TS12GH4444", vehicleType: "Car", location: "Gate 2" },
  { plateNumber: "MH20ZZ7777", vehicleType: "Van", location: "Gate 5" },
];


const getNowTimeString = () => {
  const d = new Date();
  return d.toLocaleTimeString();
};

const makeEntry = (base: { plateNumber: string; vehicleType: string; location: string; }): VehicleData => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  plateNumber: base.plateNumber,
  vehicleType: base.vehicleType,
  time: getNowTimeString(),
  location: base.location,
});

const CctvAiFeeds: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [latestId, setLatestId] = useState<string | null>(null);

  useEffect(() => {
    
    setVehicles(() => {
      const initial = [];
      for (let i = 0; i < 4; i++) {
        const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
        initial.push(makeEntry(base));
      }
      return initial;
    });

    // start interval
    const timer = window.setInterval(() => {
      const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
      const entry = makeEntry(base);

      setVehicles((prev) => {
        const next = [entry, ...prev].slice(0, 8); 
        return next;
      });

      setLatestId(entry.id);

      // clear latest highlight after 700ms
      window.setTimeout(() => {
        setLatestId(null);
      }, 700);
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Build youtube src with autoplay, muted, loop via playlist param
const youtubeSrc =
  "https://www.youtube.com/embed/N7PVa8b5YOM?autoplay=1&mute=1&controls=1&start=4&loop=1&playlist=N7PVa8b5YOM&rel=0";

  return (
    <div className="cctv-container">
      <div className="cctv-left">
        <div className="cctv-video-wrap">
          <iframe
            title="CCTV YouTube Feed"
            src={youtubeSrc}
            frameBorder={0}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="cctv-iframe"
          />
          <div className="cctv-overlay">
            <div className="cctv-overlay-text">Vehicle Recognition</div>
          </div>
        </div>
      </div>

      <div className="cctv-right">
        <h2 className="cctv-heading">Vehicle Scan Logs</h2>
        <div className="cctv-table-wrap" role="region" aria-label="Vehicle scan logs">
          <table className="cctv-table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Type</th>
                <th>Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className={v.id === latestId ? "new-entry" : ""}>
                  <td className="plate-cell">{v.plateNumber}</td>
                  <td>{v.vehicleType}</td>
                  <td>{v.time}</td>
                  <td>{v.location}</td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-row">No scans yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CctvAiFeeds;
