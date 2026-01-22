import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  camlink?: string;
  title?: string;
  showPeople?: boolean;
};

type VehicleData = {
  id: string;
  plateNumber: string;
  vehicleType: string;
  time: string;
  location: string;
  insurance: "Yes" | "No";
  pollution: "Yes" | "No";
  tollgates: string;
  challans: number;
  ownerName: string;
  mobileNumber: string;
  aadharNumber: string;
  rcStatus: "Active" | "Expired" | "Blacklisted";
  registrationDate: string;
  address: string;
  isWanted: boolean;
};

type PersonRowStatic = {
  gender: string;
  lat: string;
  long: string;
  suspicious: "Yes" | "No" | string;
};

type PersonRow = PersonRowStatic & {
  id: string;
  time: string;
};

// EXTENDED SAMPLE VEHICLES
const samplePlates = [
  { plateNumber: "TS09AB1234", vehicleType: "Car", location: "Gate 1" },
  { plateNumber: "AP28CC9988", vehicleType: "Bike", location: "Gate 2" },
  { plateNumber: "TS10XY5678", vehicleType: "SUV", location: "Gate 3" },
  { plateNumber: "KA05MN3344", vehicleType: "Truck", location: "Gate 4" },
  { plateNumber: "TS12GH4444", vehicleType: "Car", location: "Gate 2" },
  { plateNumber: "MH20ZZ7777", vehicleType: "Van", location: "Gate 5" },
  { plateNumber: "DL01RT9001", vehicleType: "SUV", location: "Gate 1" },
  { plateNumber: "KA03NB5566", vehicleType: "Bike", location: "Gate 3" },
  { plateNumber: "TN07PQ1122", vehicleType: "Car", location: "Gate 4" },
  { plateNumber: "HR26BX4455", vehicleType: "Truck", location: "Gate 2" },
  { plateNumber: "UP16CK7788", vehicleType: "Van", location: "Gate 1" },
  { plateNumber: "GJ05HH9900", vehicleType: "SUV", location: "Gate 5" },
];

const PERSON_DATA: PersonRowStatic[] = [
  { gender: "Male", lat: "28.6139", long: "77.2090", suspicious: "Idle" },
  { gender: "Female", lat: "28.6140", long: "77.2100", suspicious: "suspicious" },
  { gender: "Male", lat: "28.6150", long: "77.2110", suspicious: "Idle" },
];

const sampleTollgates = ["ORR-1", "ORR-3", "ORR-5", "NH44", "Airport Toll"];

/** HELPERS **/
const getNowTimeString = (): string => new Date().toLocaleTimeString();

const getPastTime = (minutesAgo: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const yesNo = (): "Yes" | "No" => (Math.random() > 0.3 ? "Yes" : "No");

const randomTollHistory = () => {
  const count = Math.floor(Math.random() * 3) + 1;
  const selectedTolls = [...sampleTollgates].sort(() => 0.5 - Math.random()).slice(0, count);
  return selectedTolls
    .map((gate, index) => {
      const mins = (index + 1) * (Math.floor(Math.random() * 40) + 15);
      return `${gate} (${getPastTime(mins)})`;
    })
    .join(", ");
};

const makeVehicleEntry = (base: {
  plateNumber: string;
  vehicleType: string;
  location: string;
}, customTime?: string): VehicleData => {
  const randomNames = ["Rajesh Kumar", "Sravani Reddy", "Amit Singh", "Priya Sharma", "Vikram Rathore"];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    plateNumber: base.plateNumber,
    vehicleType: base.vehicleType,
    time: customTime || getNowTimeString(),
    location: base.location,
    insurance: yesNo(),
    pollution: yesNo(),
    tollgates: randomTollHistory(),
    challans: Math.floor(Math.random() * 4),
    ownerName: randomNames[Math.floor(Math.random() * randomNames.length)],
    mobileNumber: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    aadharNumber: `${Math.floor(1000 + Math.random() * 8999)} **** ****`,
    rcStatus: Math.random() > 0.1 ? "Active" : "Blacklisted",
    registrationDate: "12-Aug-2021",
    address: "H.No 4-12, Jubilee Hills, Road No 36, Hyderabad, TS",
    isWanted: Math.random() > 0.85,
  };
};

const CctvAiFeeds: React.FC<Props> = ({ camlink, title, showPeople }) => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [latestVehicleId, setLatestVehicleId] = useState<string | null>(null);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");

  const locationState = useLocation();
  const locState = (locationState && (locationState as any).state) || {};

  const showPeopleFlag = typeof showPeople === "boolean" ? showPeople : !!locState?.showPeople;
  const src = camlink ?? locState?.camlink ?? "https://www.youtube.com/embed/N7PVa8b5YOM?autoplay=1&mute=1&controls=1&start=4&loop=1&playlist=N7PVa8b5YOM&rel=0";
  const titleFinal = title ?? locState?.Title ?? "CCTV YouTube Feed";

  useEffect(() => {
    if (filterDate) {
      // STATIC MODE FOR SELECTED DATE
      const staticData: VehicleData[] = [];
      const times = ["09:15:00", "10:30:22", "11:45:10", "13:00:05", "14:20:45", "16:10:12", "18:05:30", "20:50:00"];
      for (let i = 0; i < 8; i++) {
        staticData.push(makeVehicleEntry(samplePlates[i % samplePlates.length], times[i]));
      }
      setVehicles(staticData);
      setLatestVehicleId(null);
      return;
    }

    // LIVE MODE
    setVehicles(() => {
      const initial: VehicleData[] = [];
      for (let i = 0; i < 4; i++) {
        initial.push(makeVehicleEntry(samplePlates[Math.floor(Math.random() * samplePlates.length)]));
      }
      return initial;
    });

    const timer = window.setInterval(() => {
      const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
      const entry = makeVehicleEntry(base);
      setVehicles((prev) => [entry, ...prev].slice(0, 8));
      setLatestVehicleId(entry.id);
      window.setTimeout(() => setLatestVehicleId(null), 700);
    }, 3000);

    return () => clearInterval(timer);
  }, [filterDate]);

  useEffect(() => {
    if (!showPeopleFlag) {
      setPeople([]);
      return;
    }
    setPeople(() => PERSON_DATA.map((p) => ({ ...p, id: Math.random().toString(), time: getNowTimeString() })));
  }, [showPeopleFlag]);

  return (
    <div className="rjb-cctv-container rjb-cctv-vertical">
      <div className="rjb-cctv-video-full">
        <div className="rjb-cctv-video-wrap">
          <iframe title={titleFinal} src={src} frameBorder={0} allowFullScreen className="rjb-cctv-iframe" />
          <div className="rjb-cctv-overlay"><div className="rjb-cctv-overlay-text">{showPeopleFlag ? "Suspicious People" : "Vehicle Detection"}</div></div>
        </div>
      </div>

      <div className="rjb-cctv-table-full">
        <div className="rjb-table-header-row">
          <h2 className="rjb-cctv-heading">
            {showPeopleFlag ? "People Scan Logs" : `${titleFinal} — Vehicle Scan Logs`}
            {filterDate && !showPeopleFlag && <span className="rjb-static-badge">HISTORY</span>}
          </h2>
          
          {!showPeopleFlag && (
            <div className="rjb-filter-container">
              <label>Filter by Date: </label>
              <input type="date" className="rjb-date-input" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
              {filterDate && <button className="rjb-clear-btn" onClick={() => setFilterDate("")}>Reset</button>}
            </div>
          )}
        </div>

        <div className="rjb-cctv-table-wrap">
          <table className="rjb-cctv-table">
            <thead>
              {showPeopleFlag ? (
                <tr><th>Gender</th><th>Position</th><th>Suspicious</th><th>Time</th></tr>
              ) : (
                <tr><th>Plate</th><th>Type</th><th>Time</th><th>Location</th><th>Insurance</th><th>Pollution</th><th>Tollgate History</th><th>Challans</th></tr>
              )}
            </thead>
            <tbody>
              {!showPeopleFlag ? (
                vehicles.map((v) => (
                  <tr key={v.id} className={v.id === latestVehicleId ? "rjb-new-entry" : ""}>
                    <td className="rjb-plate-cell">{v.plateNumber}</td>
                    <td className="rjb-clickable-cell" onClick={() => setSelectedVehicle(v)}>{v.vehicleType}</td>
                    <td>{v.time}</td>
                    <td>{v.location}</td>
                    <td>{v.insurance}</td>
                    <td>{v.pollution}</td>
                    <td>{v.tollgates}</td>
                    <td>{v.challans === 0 ? "None" : `₹ ${v.challans * 500}`}</td>
                  </tr>
                ))
              ) : (
                people.map((p) => (
                  <tr key={p.id}><td>{p.gender}</td><td>{`${p.lat}, ${p.long}`}</td><td>{p.suspicious}</td><td>{p.time}</td></tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedVehicle && (
        <div className="rjb-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="rjb-modal-content police-theme" onClick={(e) => e.stopPropagation()}>
            <div className="rjb-modal-header">
              <div className="rjb-header-main">
                <h3>Vehicle Investigation Report</h3>
                <span className="rjb-v-number">{selectedVehicle.plateNumber}</span>
              </div>
              <button className="rjb-modal-close" onClick={() => setSelectedVehicle(null)}>&times;</button>
            </div>
            <div className="rjb-modal-body">
              <div className="rjb-modal-grid">
                <div className="rjb-modal-col">
                  <div className="rjb-section-title">Owner Information</div>
                  <div className="rjb-detail-row"><span>Owner Name:</span> {selectedVehicle.ownerName}</div>
                  <div className="rjb-detail-row"><span>Mobile No:</span> {selectedVehicle.mobileNumber}</div>
                  <div className="rjb-detail-row"><span>Aadhar No:</span> {selectedVehicle.aadharNumber}</div>
                  <div className="rjb-detail-row"><span>Address:</span> {selectedVehicle.address}</div>
                  <div className="rjb-section-title">Detection History</div>
                  <div className="rjb-detail-row"><span>Last Seen:</span> {selectedVehicle.time}</div>
                  <div className="rjb-detail-row"><span>Current Loc:</span> {selectedVehicle.location}</div>
                  <div className="rjb-detail-row"><span>Toll Route:</span> {selectedVehicle.tollgates}</div>
                </div>
                <div className="rjb-vertical-divider"></div>
                <div className="rjb-modal-col">
                  <div className="rjb-section-title">Status Overview</div>
                  <div className="rjb-status-banner">
                    <div className={`status-badge ${selectedVehicle.rcStatus.toLowerCase()}`}>RC: {selectedVehicle.rcStatus}</div>
                    {selectedVehicle.isWanted && <div className="status-badge alert-red">🚨 WANTED</div>}
                  </div>
                  <div className="rjb-section-title">Vehicle & Legal Status</div>
                  <div className="rjb-detail-row"><span>Vehicle Type:</span> {selectedVehicle.vehicleType}</div>
                  <div className="rjb-detail-row"><span>Reg. Date:</span> {selectedVehicle.registrationDate}</div>
                  <div className="rjb-detail-row"><span>Insurance:</span> {selectedVehicle.insurance}</div>
                  <div className="rjb-detail-row"><span>Pollution:</span> {selectedVehicle.pollution}</div>
                  <div className="rjb-detail-row"><span>Challans:</span> 
                    <b className={selectedVehicle.challans > 0 ? "text-danger" : ""}>{selectedVehicle.challans === 0 ? "None" : `₹ ${selectedVehicle.challans * 500}`}</b>
                  </div>
                </div>
              </div>
            </div>
            <div className="rjb-modal-footer">
              <button className="btn-action-print" onClick={() => window.print()}>Print Report</button>
              <button className="btn-action-close" onClick={() => setSelectedVehicle(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CctvAiFeeds;