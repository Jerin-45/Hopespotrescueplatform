import { useNavigate } from "react-router";
import { HelperDashboard } from "../components/HelperDashboard";
import { useData } from "../context/DataContext";
import { RescueRequest } from "../App";
import { SupabaseService } from "../services/SupabaseService";

export function HelperPage() {
  const navigate = useNavigate();
  const { rescueRequests, refreshData } = useData();

  const handleBack = () => {
    navigate("/");
  };

  const handleSubmitRequest = async (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => {
    // Use the SupabaseService to insert into the new helper_request_submission table
    const { error } = await SupabaseService.submitHelperRequest(request);
    
    if (error) {
      alert("Failed to submit request: " + error);
    } else {
      // Refresh context data to show the new request in the list
      // Note: The new table might not be immediately reflected in the old fetch endpoint 
      // unless the backend is updated to read from both or migrated completely.
      // For now, we assume the service handles the fallback to the old endpoint if needed.
      await refreshData();
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
