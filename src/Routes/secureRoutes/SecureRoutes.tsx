import { Routes, Route } from "react-router-dom";
import Dashboard from "../../pages/dashboard/Dashboard";
import CctvAiFeeds from "../../pages/anpr/CctvAiFeeds";
import LayoutComponent from "../../components/Layout/Layout";
import CrowdedPeople from "../../pages/Crowded/CrowdedPeople";
import GatePassApp from "../../pages/gatepass/GatePassApp";
import OfficersTrack from "../../pages/officerstracking/OfficersTrack";
import AlertsPanel from "../../pages/alertspanel/Alertspanel";
import AnalyticsReports from "../../pages/analytics/AnalyticsReports";
import SettingsPage from "../../pages/settings/SettingsPage";
import OfficersPage from "../../pages/officers/OfficersPage";
import CriminalRecord from "../../pages/criminalrecord";

export const SecureRoutes = () => {
    
    return <Routes>
            <Route path="/" element={<LayoutComponent />}>
                <Route path="dashboard" element={<Dashboard />} />
                 <Route path="cctv-ai-feeds" element={<CctvAiFeeds />} />
                 <Route path="crowded-people" element={<CrowdedPeople />} />
                 <Route path="gate-pass" element={<GatePassApp />} />
                 <Route path="officers-track" element={<OfficersTrack />} />
                 <Route path="ai-alerts" element={<AlertsPanel />} />
                 <Route path="analytics" element={<AnalyticsReports />} />
                 <Route path="settings" element={<SettingsPage />} />
                 <Route path="officers" element={<OfficersPage/>} />
                 <Route path="criminal-record" element={<CriminalRecord/>} />

            </Route>
    </Routes>
}