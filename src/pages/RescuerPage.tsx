import { useState } from "react";
import { useNavigate } from "react-router";
import { RescuerDashboard } from "../components/RescuerDashboard";
import { RescuerAuth } from "../components/RescuerAuth";
import { useData } from "../context/DataContext";
import { RescuerAccount } from "../App";
import { authService } from "../utils/auth";
import { localStorageApi } from "../utils/local-storage";

export function RescuerPage() {
  const navigate = useNavigate();
  const { rescueRequests, updateRequestStatus, rescuers } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRescuer, setCurrentRescuer] = useState<{
    name: string;
    email: string;
    id: string;
    displayId: string;
  } | null>(null);

  const handleBack = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setCurrentRescuer(null);
      authService.signOut();
    } else {
      navigate("/");
    }
  };

  const handleLogin = async (identifier: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(identifier, password);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Find rescuer profile from context
        const profile = rescuers.find(r => r.email === identifier);
        
        if (!profile) {
          return { success: false, error: 'Rescuer profile not found in KV store' };
        }
        
        setIsAuthenticated(true);
        setCurrentRescuer({
          name: profile.name || '',
          email: profile.email,
          id: profile.id,
          displayId: profile.badge_id || ''
        });
        return { success: true, name: profile.name };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const handleRegister = async (email: string, password: string, name: string, phone: string, address: string) => {
    try {
      const { data: authData, error: authError } = await authService.signUp(email, password, { name });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData?.user) {
        const id = crypto.randomUUID();
        const badge_id = `RSC-${Math.floor(1000 + Math.random() * 9000)}`;
        const key = `rescuer:${id}`;
        
        const profile: RescuerAccount = {
          id,
          auth_user_id: authData.user.id,
          name,
          email,
          phone,
          address,
          badge_id,
          registeredAt: new Date().toISOString(),
          profileComplete: true
        };

        localStorageApi.set(key, profile);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  if (!isAuthenticated) {
    return (
      <RescuerAuth
        onLogin={handleLogin}
        onRegister={handleRegister}
        onBack={handleBack}
      />
    );
  }

  return (
    <RescuerDashboard
      onBack={handleBack}
      requests={rescueRequests}
      onUpdateStatus={updateRequestStatus}
      rescuerName={currentRescuer?.name || ''}
      rescuerEmail={currentRescuer?.email || ''}
      rescuerId={currentRescuer?.id || ''}
      rescuerDisplayId={currentRescuer?.displayId || ''}
    />
  );
}