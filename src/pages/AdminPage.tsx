import { useState } from "react";
import { useNavigate } from "react-router";
import { AdminDashboard } from "../components/AdminDashboard";
import { AdminLogin } from "../components/AdminLogin";
import { useData } from "../context/DataContext";

export function AdminPage() {
  const navigate = useNavigate();
  const { rescueRequests, updateRequestStatus, rescuers, refreshData } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleBack = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
    } else {
      navigate("/");
    }
  };

  const handleLogin = (adminId: string, password: string) => {
    if (adminId === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      refreshData();
      return true;
    }
    return false;
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} onBack={handleBack} />;
  }

  return (
    <AdminDashboard
      onBack={handleBack}
      requests={rescueRequests}
      onUpdateStatus={updateRequestStatus}
      rescuers={rescuers}
    />
  );
}
