import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import DeliveryTable from "./components/DeliveryTable";
import NotDeliveredTable from "./components/NotDeliveredTable";
import MetadataDisplay from "./components/MetadataDisplay";
import { useTheme } from "./js/hooks/useTheme";
import { useAuth } from "./js/hooks/useAuth";
import { useAppMetadata } from "./js/hooks/useAppMetadata";

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isLoggedIn, handleLogin, handleLogout } = useAuth();
  const metadata = useAppMetadata();
  const [showNotDeliveredTable, setShowNotDeliveredTable] = useState(true);
  const [localIp, setLocalIp] = useState("Loading...");

  useEffect(() => {
    fetch("/api/local-ip")
      .then((res) => res.json())
      .then((data) => setLocalIp(data.local_ip))
      .catch(() => setLocalIp("Unable to fetch"));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        className="print:hidden"
      />
      <main className="bg-[var(--bg)] flex-1 w-full mx-auto px-1 md:px-6 py-2 flex flex-col gap-3">
        <div>
          local ip: <b>{localIp}:5000</b>
        </div>

        <MetadataDisplay metadata={metadata} />
        {isLoggedIn && <UploadSection className="print:hidden" />}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[var(--text)]">
            Delivered Articles
          </h2>
          <DeliveryTable
            showNotDeliveredTable={showNotDeliveredTable}
            setShowNotDeliveredTable={setShowNotDeliveredTable}
          />
        </div>
        {showNotDeliveredTable && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--text)]">
              Not Delivered Articles
            </h2>
            <NotDeliveredTable />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
