import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent mx-auto"></div>
          <p className="mt-4 font-sans text-sm text-ink/60 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
