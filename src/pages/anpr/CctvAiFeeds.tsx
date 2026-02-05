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
  vehicleModel: string;
  vehicleColor: string;
  fuelType: string;
  time: string;
  location: string;
  insurance: "Yes" | "No";
  pollution: "Yes" | "No";
  tollgates: string[]; 
  challans: number;
  ownerName: string;
  ownerImage: string; 
  mobileNumber: string;
  aadharNumber: string;
  rcStatus: "Active" | "Expired" | "Blacklisted";
  registrationDate: string;
  address: string;
  isWanted: boolean;
  // New properties for Tab Functionality
  speed: number;
  status: "Normal" | "Wrong Route" | "Rash Drive" | "Robbery Suspect" | "Forgery" | "Emergency";
};

// const [people, setPeople] = useState<
//   { id: string; gender: string; lat: string; long: string; suspicious: string; time: string }[]
// >([]);

const samplePlates = [
  { plateNumber: "TS09AB1234", vehicleType: "Car", vehicleModel: "Honda City", location: "Gate 1" },
  { plateNumber: "AP28CC9988", vehicleType: "Bike", vehicleModel: "Royal Enfield", location: "Gate 2" },
  { plateNumber: "TS10XY5678", vehicleType: "SUV", vehicleModel: "Mahindra Thar", location: "Gate 3" },
  { plateNumber: "KA05MN3344", vehicleType: "Truck", vehicleModel: "Tata Prima", location: "Gate 4" },
  { plateNumber: "TS12GH4444", vehicleType: "Car", vehicleModel: "Maruti Swift", location: "Gate 2" },
  { plateNumber: "MH20ZZ7777", vehicleType: "Van", vehicleModel: "Maruti Omni", location: "Gate 5" },
];

const sampleTollgates = ["ORR-Exit 1", "Shamshabad Toll", "Gachibowli Gate", "NH44 Checkpoint", "Airport Entry"];


type PersonRow = {
  id: string;
  gender: string;
  lat: string;
  long: string;
  suspicious: "Idle" | "suspicious";
  time: string;
};

const samplePeople = [
  { gender: "Male", lat: "28.6155", long: "77.2112", suspicious: "Idle" as const },
  { gender: "Female", lat: "28.6142", long: "77.2104", suspicious: "suspicious" as const },
  { gender: "Male", lat: "28.6139", long: "77.2090", suspicious: "Idle" as const },
  { gender: "Female", lat: "28.6140", long: "77.2100", suspicious: "suspicious" as const },
];


// const now = () => new Date().toLocaleTimeString();

/** HELPERS **/
const getNowTimeString = (): string => new Date().toLocaleTimeString();

const getPastTime = (minutesAgo: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const yesNo = (): "Yes" | "No" => (Math.random() > 0.3 ? "Yes" : "No");

const generateStitchedRoute = () => {
  const count = Math.floor(Math.random() * 3) + 2;
  const selected = [...sampleTollgates].sort(() => 0.5 - Math.random()).slice(0, count);
  return selected.map((gate, index) => `${gate} (${getPastTime((index + 1) * 25)})`);
};

const makeVehicleEntry = (base: {
  plateNumber: string;
  vehicleType: string;
  vehicleModel: string;
  location: string;
}, customTime?: string): VehicleData => {
  const randomNames = ["Rajesh Kumar", "Sravani Reddy", "Amit Singh", "Priya Sharma", "Vikram Rathore"];
  const colors = ["White", "Silver", "Black", "Red", "Dark Blue"];
  const fuels = ["Petrol", "Diesel", "Electric", "CNG"];
  const statuses: VehicleData['status'][] = ["Normal", "Wrong Route", "Rash Drive", "Robbery Suspect", "Forgery", "Emergency"];
  const nameIndex = Math.floor(Math.random() * randomNames.length);
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    plateNumber: base.plateNumber,
    vehicleType: base.vehicleType,
    vehicleModel: base.vehicleModel,
    vehicleColor: colors[Math.floor(Math.random() * colors.length)],
    fuelType: fuels[Math.floor(Math.random() * fuels.length)],
    time: customTime || getNowTimeString(),
    location: base.location,
    insurance: yesNo(),
    pollution: yesNo(),
    tollgates: generateStitchedRoute(),
    challans: Math.floor(Math.random() * 4),
    ownerName: randomNames[nameIndex],
    ownerImage: `https://i.pravatar.cc/150?u=${nameIndex + 10}`, 
    mobileNumber: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
    aadharNumber: `${Math.floor(1000 + Math.random() * 8999)} **** ****`,
    rcStatus: Math.random() > 0.1 ? "Active" : "Blacklisted",
    registrationDate: "12-Aug-2021",
    address: "H.No 4-12, Jubilee Hills, Road No 36, Hyderabad, TS",
    isWanted: Math.random() > 0.85,
    speed: Math.floor(40 + Math.random() * 100),
    status: statuses[Math.floor(Math.random() * statuses.length)]
  };
};

const CctvAiFeeds: React.FC<Props> = ({ camlink, title, showPeople }) => {
  const [people, setPeople] = useState<PersonRow[]>([]);

  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [latestVehicleId, setLatestVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const locState = (useLocation().state as any) || {};
  const src = camlink ?? locState?.camlink ??  "https://www.youtube.com/embed/N7PVa8b5YOM?autoplay=1&mute=1&controls=1&start=4&loop=1&playlist=N7PVa8b5YOM&rel=0";
  const titleFinal = title ?? locState?.Title ?? "CCTV YouTube Feed";

  const tabs = [
    "Running Vehicles",
    "Violations & Suspects",
    "Plate Forgery Alerts",
    "Emergency Response"
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      const entry = makeVehicleEntry(samplePlates[Math.floor(Math.random() * samplePlates.length)]);
      setVehicles((prev) => [entry, ...prev].slice(0, 15));
      setLatestVehicleId(entry.id);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // FILTER LOGIC FOR TABS
  const filteredVehicles = vehicles.filter(v => {
    if (activeTab === 0) return true; // Show all running
    if (activeTab === 1) return v.status === "Wrong Route" || v.status === "Rash Drive" || v.status === "Robbery Suspect";
    if (activeTab === 2) return v.status === "Forgery";
    if (activeTab === 3) return v.status === "Emergency";
    return true;
  });
  useEffect(() => {
  if (!showPeople) return;

  setPeople(
    samplePeople.map((p, i) => ({
      ...p,
      id: `${Date.now()}-${i}`,
      time: new Date().toLocaleTimeString(),
    }))
  );

  const timer = setInterval(() => {
    const p = samplePeople[Math.floor(Math.random() * samplePeople.length)];
    setPeople(prev => [
      {
        ...p,
        id: `${Date.now()}`,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ].slice(0, 10));
  }, 1000);

  return () => clearInterval(timer);
}, [showPeople]);



return showPeople ? (
  <div className="rjb-cctv-container rjb-crowd-horizontal">

    {/* LEFT: VIDEO */}
    <div className="rjb-crowd-left">
      <div className="rjb-cctv-video-wrap">
        <iframe
          title={titleFinal}
          src={src}
          frameBorder={0}
          allowFullScreen
          className="rjb-cctv-iframe1"
        />
        <div className="rjb-cctv-overlay">
          <div className="rjb-cctv-overlay-text">Suspicious People</div>
        </div>
      </div>
    </div>

    {/* RIGHT: TABLE */}
    <div className="rjb-crowd-right">
      <h2 className="rjb-cctv-heading">People Scan Logs</h2>
      <div className="rjb-cctv-table-wrap">
        <table className="rjb-cctv-table">
          <thead>
            <tr>
              <th>Gender</th>
              <th>Position</th>
              <th>Suspicious</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {people.map(p => (
              <tr key={p.id}>
                <td>{p.gender}</td>
                <td>{p.lat}, {p.long}</td>
                <td>{p.suspicious}</td>
                <td>{p.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  </div>
) : (


    <div className="rjb-cctv-container rjb-cctv-vertical">        
      
      {/* 4 TABS ABOVE VIDEO */}
      <div className="rjb-tabs-wrapper">
        {tabs.map((tab, index) => (
          <button 
            key={index} 
            className={`rjb-tab-nav ${activeTab === index ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rjb-cctv-video-full">
        <div className="rjb-cctv-video-wrap">
          <iframe title={titleFinal} src={src} frameBorder={0} allowFullScreen className="rjb-cctv-iframe" />
        </div>
      </div>

      <div className="rjb-cctv-table-full">
        <h2 className="rjb-cctv-heading">{tabs[activeTab]} — Logs</h2>
        <div className="rjb-cctv-table-wrap">
          <table className="rjb-cctv-table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Type & Model</th>
                <th>Time / Speed</th>
                <th>Location</th>
                <th>Detection Status</th>
                <th>Challans</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr key={v.id} className={v.id === latestVehicleId ? "rjb-new-entry" : ""}>
                  <td className="rjb-plate-cell">{v.plateNumber}</td>
                  <td className="rjb-clickable-cell" onClick={() => setSelectedVehicle(v)}>{v.vehicleType} ({v.vehicleModel})</td>
                  <td>{v.time} | <span className={v.speed > 80 ? "rjb-text-danger" : ""}>{v.speed} km/h</span></td>
                  <td>{v.location}</td>
                  <td>
                    <span className={`rjb-status-tag ${v.status.toLowerCase().replace(" ", "-")}`}>
                      {v.status}
                    </span>
                  </td>
                  <td>₹ {v.challans * 500}</td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr><td colSpan={6} className="rjb-empty-msg">No incidents detected in this category currently.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL (Remains Undisturbed) */}
      {selectedVehicle && (
        <div className="rjb-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="rjb-modal-content police-theme" onClick={(e) => e.stopPropagation()}>
            <div className="rjb-modal-header">
              <div className="rjb-header-profile">
                <img src={selectedVehicle.ownerImage} alt="Owner" className="rjb-owner-img" />
                <div className="rjb-header-main">
                  <h3>Investigation Report: {selectedVehicle.ownerName}</h3>
                  <span className="rjb-v-number">{selectedVehicle.plateNumber}</span>
                </div>
              </div>
              <button className="rjb-modal-close" onClick={() => setSelectedVehicle(null)}>&times;</button>
            </div>

            <div className="rjb-modal-body">
              <div className="rjb-modal-grid">
                <div className="rjb-modal-col">
                  <div className="rjb-section-title">Owner Information</div>
                  <div className="rjb-detail-row"><span>Mobile No:</span> {selectedVehicle.mobileNumber}</div>
                  <div className="rjb-detail-row"><span>Aadhar No:</span> {selectedVehicle.aadharNumber}</div>
                  <div className="rjb-detail-row"><span>Address:</span> {selectedVehicle.address}</div>

                  <div className="rjb-section-title">Route Stitching (Sequential Path)</div>
                  <div className="rjb-route-container">
                    {selectedVehicle.tollgates.map((step, i) => (
                      <div key={i} className="rjb-route-step">
                        <div className="rjb-route-dot"></div>
                        <div className="rjb-route-text">{step}</div>
                        {i < selectedVehicle.tollgates.length - 1 && <div className="rjb-route-line"></div>}
                      </div>
                    ))}
                    <div className="rjb-route-step current">
                      <div className="rjb-route-dot active"></div>
                      <div className="rjb-route-text">Currently at: {selectedVehicle.location} ({selectedVehicle.time})</div>
                    </div>
                  </div>
                </div>

                <div className="rjb-vertical-divider"></div>

                <div className="rjb-modal-col">
                  <div className="rjb-section-title">Status Overview</div>
                  <div className="rjb-status-banner">
                    <div className={`status-badge ${selectedVehicle.rcStatus.toLowerCase()}`}>RC: {selectedVehicle.rcStatus}</div>
                    {selectedVehicle.isWanted && <div className="status-badge alert-red">🚨 WANTED</div>}
                    {selectedVehicle.status !== "Normal" && <div className="status-badge alert-red">⚠️ {selectedVehicle.status.toUpperCase()}</div>}
                  </div>
                  <div className="rjb-section-title">Vehicle Specifications</div>
                  <div className="rjb-detail-row"><span>Model:</span> {selectedVehicle.vehicleModel}</div>
                  <div className="rjb-detail-row"><span>Body Type:</span> {selectedVehicle.vehicleType}</div>
                  <div className="rjb-detail-row"><span>Color:</span> {selectedVehicle.vehicleColor}</div>
                  <div className="rjb-detail-row"><span>Fuel Type:</span> {selectedVehicle.fuelType}</div>
                  <div className="rjb-detail-row"><span>Reg. Date:</span> {selectedVehicle.registrationDate}</div>

                  <div className="rjb-section-title">Legal Compliance</div>
                  <div className="rjb-detail-row"><span>Insurance:</span> {selectedVehicle.insurance}</div>
                  <div className="rjb-detail-row"><span>Pollution:</span> {selectedVehicle.pollution}</div>
                  <div className="rjb-detail-row"><span>Challans:</span> 
                    <b className={selectedVehicle.challans > 0 ? "rjb-text-danger" : ""}>₹ {selectedVehicle.challans * 500}</b>
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