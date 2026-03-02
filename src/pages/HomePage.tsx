import { useNavigate } from "react-router";
import { LandingPage } from "../components/LandingPage";

export function HomePage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'helper' | 'rescuer' | 'admin' | null) => {
    if (role) {
      navigate(`/${role}`);
    }
  };

  return <LandingPage onRoleSelect={handleRoleSelect} />;
}
