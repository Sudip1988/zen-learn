import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./auth/AuthGuard";
import { AppShell } from "./components/Layout/AppShell";
import { ErrorBoundary } from "./components/UI/ErrorBoundary";

import { Landing } from "./pages/Landing";
import { RequestInvite } from "./pages/RequestInvite";
import { Home } from "./pages/Home";
import { Discovery } from "./pages/Discovery";
import { Catalogues } from "./pages/Catalogues";
import { CatalogueDetail } from "./pages/CatalogueDetail";
import { Watch } from "./pages/Watch";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/request-invite" element={<RequestInvite />} />

        {/* Protected: Firebase Auth + approved invite */}
        <Route element={<AuthGuard />}>
          <Route path="/discover" element={<Discovery />} />
          <Route path="/watch/:videoId" element={<Watch />} />

          <Route element={<AppShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/catalogues" element={<Catalogues />} />
            <Route path="/catalogue/:id" element={<CatalogueDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
