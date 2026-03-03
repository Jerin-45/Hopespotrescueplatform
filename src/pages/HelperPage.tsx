import { useNavigate } from "react-router";
import { HelperDashboard } from "../components/HelperDashboard";
import { useData } from "../context/DataContext";
import { RescueRequest } from "../App";

export function HelperPage() {
  const navigate = useNavigate();
  const { rescueRequests, addRescueRequest } = useData();

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmitRequest = async (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => {
    const success = await addRescueRequest(request);
    
    if (!success) {
      alert("Failed to submit request");
    }
  };

  return (
    <HelperDashboard
      onBack={handleBack}
      onSubmitRequest={handleSubmitRequest}
      requests={rescueRequests}
    />
  );
}