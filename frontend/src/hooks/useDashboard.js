import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { adminService } from "./services/adminService";

export function useDashboard() {
  const { esAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!esAdmin()) return;
    let cancelled = false;

    adminService
      .getDashboard()
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e.response?.data?.detail ?? "Error al cargar el dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
