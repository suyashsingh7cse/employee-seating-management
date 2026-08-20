import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-soft">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
