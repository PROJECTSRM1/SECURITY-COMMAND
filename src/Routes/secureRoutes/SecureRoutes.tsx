import { Routes, Route } from "react-router-dom";
import Dashboard from "../../pages/dashboard/Dashboard";
import CctvAiFeeds from "../../pages/anpr/CctvAiFeeds";
import LayoutComponent from "../../components/Layout/Layout";

export const SecureRoutes = () => {
    
    return <Routes>
            <Route path="/" element={<LayoutComponent />}>
                <Route path="dashboard" element={<Dashboard />} />
                 <Route path="cctv-ai-feeds" element={<CctvAiFeeds />} />

            </Route>
    </Routes>
}