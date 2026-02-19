import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
  }, [isAuthenticated, navigate]);

  return null;
};

export default Index;
