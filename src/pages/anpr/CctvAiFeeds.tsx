
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import "./CctvAiFeeds.css";

// type VehicleData = {
//   id: string;
//   plateNumber: string;
//   vehicleType: string;
//   time: string;
//   location: string;
// };

// const samplePlates = [
//   { plateNumber: "TS09AB1234", vehicleType: "Car", location: "Gate 1" },
//   { plateNumber: "AP28CC9988", vehicleType: "Bike", location: "Gate 2" },
//   { plateNumber: "TS10XY5678", vehicleType: "SUV", location: "Gate 3" },
//   { plateNumber: "KA05MN3344", vehicleType: "Truck", location: "Gate 4" },
//   { plateNumber: "TS12GH4444", vehicleType: "Car", location: "Gate 2" },
//   { plateNumber: "MH20ZZ7777", vehicleType: "Van", location: "Gate 5" },
// ];

// type PersonRow = {
//   gender: string;
//   lat: string;
//   long: string;
//   suspicious: "Yes" | "No" | string;
// };

// const PERSON_DATA: PersonRow[] = [
//   { gender: "Male", lat: "28.6139", long: "77.2090", suspicious: "Idle" },
//   { gender: "Female", lat: "28.6140", long: "77.2100", suspicious: "suspicious" },
//   { gender: "Male", lat: "28.6150", long: "77.2110", suspicious: "Idle" },
// ];

// const getNowTimeString = (): string => {
//   const d = new Date();
//   return d.toLocaleTimeString();
// };

// const makeEntry = (base: {
//   plateNumber: string;
//   vehicleType: string;
//   location: string;
// }): VehicleData => ({
//   id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//   plateNumber: base.plateNumber,
//   vehicleType: base.vehicleType,
//   time: getNowTimeString(),
//   location: base.location,
// });

// const CctvAiFeeds: React.FC = () => {
//   const [vehicles, setVehicles] = useState<VehicleData[]>([]);
//   const [latestId, setLatestId] = useState<string | null>(null);

//   const locationState = useLocation();
//   // `data` will contain: { title, camlink, showPeople }
//   const data = (locationState && (locationState as any).state) || {};

//   useEffect(() => {
//     // initial vehicles
//     setVehicles(() => {
//       const initial: VehicleData[] = [];
//       for (let i = 0; i < 4; i++) {
//         const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
//         initial.push(makeEntry(base));
//       }
//       return initial;
//     });

//     // start interval to add simulated scans
//     const timer = window.setInterval(() => {
//       const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
//       const entry = makeEntry(base);

//       setVehicles((prev) => {
//         const next = [entry, ...prev].slice(0, 8);
//         return next;
//       });

//       setLatestId(entry.id);

//       window.setTimeout(() => {
//         setLatestId(null);
//       }, 700);
//     }, 500);

//     return () => {
//       clearInterval(timer);
//     };
//   }, []);

//   // fallback youtube src
//   const youtubeSrc =
//     "https://www.youtube.com/embed/N7PVa8b5YOM?autoplay=1&mute=1&controls=1&start=4&loop=1&playlist=N7PVa8b5YOM&rel=0";

//   // decide src/title
//   const src = data?.camlink ? data.camlink : youtubeSrc;
//   const title = data?.title ? data.title : "CCTV YouTube Feed";

//   return (
//     <div className="cctv-container">
//       <div className="cctv-left">
//         <div className="cctv-video-wrap">
//           <iframe
//             title={title}
//             src={src}
//             frameBorder={0}
//             allow="autoplay; encrypted-media; picture-in-picture; web-share"
//             allowFullScreen
//             className="cctv-iframe"
//           />
//           <div className="cctv-overlay">
//             <div className="cctv-overlay-text">
//                 {data?.showPeople ? "Suspicious People" : "Vehicle Recognition"}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="cctv-right">
//         {/* If showPeople is true in location.state, render the People table */}
//         {data?.showPeople ? (
//           <>
//             <h2 className="cctv-heading">
              
//               People Scan Logs
//             </h2>
//             <div
//               className="cctv-table-wrap"
//               role="region"
//               aria-label="People scan logs"
//             >
//               <table className="cctv-table people-table">
//                 <thead>
//                   <tr>
//                     <th>Gender</th>
//                     <th>Position</th>
//                     <th>Suspicious</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {PERSON_DATA.map((p, idx) => (
//                     <tr key={idx}>
//                       <td>{p.gender}</td>
//                       <td>{`${p.lat}, ${p.long}`}</td>
//                       <td>{p.suspicious}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         ) : (
//           <>
//             <h2 className="cctv-heading">
//               {title ? `${title} — Vehicle Scan Logs` : "Vehicle Scan Logs"}
//             </h2>
//             <div
//               className="cctv-table-wrap"
//               role="region"
//               aria-label="Vehicle scan logs"
//             >
//               <table className="cctv-table">
//                 <thead>
//                   <tr>
//                     <th>Plate</th>
//                     <th>Type</th>
//                     <th>Time</th>
//                     <th>Location</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {vehicles.map((v) => (
//                     <tr key={v.id} className={v.id === latestId ? "new-entry" : ""}>
//                       <td className="plate-cell">{v.plateNumber}</td>
//                       <td>{v.vehicleType}</td>
//                       <td>{v.time}</td>
//                       <td>{v.location}</td>
//                     </tr>
//                   ))}
//                   {vehicles.length === 0 && (
//                     <tr>
//                       <td colSpan={4} className="empty-row">
//                         No scans yet
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CctvAiFeeds;

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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

const PERSON_DATA: PersonRowStatic[] = [
  { gender: "Male", lat: "28.6139", long: "77.2090", suspicious: "Idle" },
  { gender: "Female", lat: "28.6140", long: "77.2100", suspicious: "suspicious" },
  { gender: "Male", lat: "28.6150", long: "77.2110", suspicious: "Idle" },
];

const samplePeople: PersonRowStatic[] = [
  { gender: "Male", lat: "28.6135", long: "77.2095", suspicious: "Idle" },
  { gender: "Female", lat: "28.6142", long: "77.2104", suspicious: "suspicious" },
  { gender: "Male", lat: "28.6155", long: "77.2112", suspicious: "Idle" },
  { gender: "Female", lat: "28.6160", long: "77.2120", suspicious: "Idle" },
  { gender: "Male", lat: "28.6129", long: "77.2088", suspicious: "suspicious" },
];

const getNowTimeString = (): string => {
  const d = new Date();
  return d.toLocaleTimeString();
};

const makeVehicleEntry = (base: {
  plateNumber: string;
  vehicleType: string;
  location: string;
}): VehicleData => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  plateNumber: base.plateNumber,
  vehicleType: base.vehicleType,
  time: getNowTimeString(),
  location: base.location,
});

const makePersonEntry = (base: PersonRowStatic): PersonRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  gender: base.gender,
  lat: base.lat,
  long: base.long,
  suspicious: base.suspicious,
  time: getNowTimeString(),
});

const CctvAiFeeds: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [latestVehicleId, setLatestVehicleId] = useState<string | null>(null);

  const [people, setPeople] = useState<PersonRow[]>([]);
  const [latestPersonId, setLatestPersonId] = useState<string | null>(null);

  const locationState = useLocation();
  // `data` will contain: { title, camlink, showPeople }
  const data = (locationState && (locationState as any).state) || {};

  // Vehicles simulation (unchanged)
  useEffect(() => {
    setVehicles(() => {
      const initial: VehicleData[] = [];
      for (let i = 0; i < 4; i++) {
        const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
        initial.push(makeVehicleEntry(base));
      }
      return initial;
    });

    const timer = window.setInterval(() => {
      const base = samplePlates[Math.floor(Math.random() * samplePlates.length)];
      const entry = makeVehicleEntry(base);

      setVehicles((prev) => {
        const next = [entry, ...prev].slice(0, 8);
        return next;
      });

      setLatestVehicleId(entry.id);
      window.setTimeout(() => setLatestVehicleId(null), 700);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  // People simulation: initialize and add new people **only when** showPeople is true
  useEffect(() => {
    if (!data?.showPeople) {
      // If not showing people, clear people state (optional)
      setPeople([]);
      setLatestPersonId(null);
      return;
    }

    // initialize people list from static PERSON_DATA (convert to PersonRow)
    setPeople(() =>
      PERSON_DATA.map((p) => ({
        ...p,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        time: getNowTimeString(),
      }))
    );

    // start interval to add simulated person scans
    const peopleTimer = window.setInterval(() => {
      const base = samplePeople[Math.floor(Math.random() * samplePeople.length)];
      const entry = makePersonEntry(base);

      setPeople((prev) => {
        const next = [entry, ...prev].slice(0, 8); // keep max 8
        return next;
      });

      setLatestPersonId(entry.id);
      window.setTimeout(() => setLatestPersonId(null), 700);
    }, 1000); // slower than vehicles for readability

    return () => {
      clearInterval(peopleTimer);
    };
  }, [data?.showPeople]);

  // fallback youtube src
  const youtubeSrc =
    "https://www.youtube.com/embed/N7PVa8b5YOM?autoplay=1&mute=1&controls=1&start=4&loop=1&playlist=N7PVa8b5YOM&rel=0";

  // decide src/title
  const src = data?.camlink ? data.camlink : youtubeSrc;
  const title = data?.title ? data.title : "CCTV YouTube Feed";

  return (
    <div className="cctv-container">
      <div className="cctv-left">
        <div className="cctv-video-wrap">
          <iframe
            title={title}
            src={src}
            frameBorder={0}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            className="cctv-iframe"
          />
          <div className="cctv-overlay">
            <div className="cctv-overlay-text">
              {data?.showPeople ? "Suspicious People" : "Vehicle Recognition"}
            </div>
          </div>
        </div>
      </div>

      <div className="cctv-right">
        {/* ALWAYS render People table here when showPeople is true */}
        {data?.showPeople ? (
          <>
            <h2 className="cctv-heading">People Scan Logs</h2>
            <div
              className="cctv-table-wrap"
              role="region"
              aria-label="People scan logs"
            >
              <table className="cctv-table people-table">
                <thead>
                  <tr>
                    <th>Gender</th>
                    <th>Position</th>
                    <th>Suspicious</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.id} className={p.id === latestPersonId ? "new-entry" : ""}>
                      <td>{p.gender}</td>
                      <td>{`${p.lat}, ${p.long}`}</td>
                      <td>{p.suspicious}</td>
                      <td>{p.time}</td>
                    </tr>
                  ))}
                  {people.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-row">
                        No people detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h2 className="cctv-heading">
              {title ? `${title} — Vehicle Scan Logs` : "Vehicle Scan Logs"}
            </h2>
            <div
              className="cctv-table-wrap"
              role="region"
              aria-label="Vehicle scan logs"
            >
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
                    <tr key={v.id} className={v.id === latestVehicleId ? "new-entry" : ""}>
                      <td className="plate-cell">{v.plateNumber}</td>
                      <td>{v.vehicleType}</td>
                      <td>{v.time}</td>
                      <td>{v.location}</td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-row">
                        No scans yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CctvAiFeeds;
