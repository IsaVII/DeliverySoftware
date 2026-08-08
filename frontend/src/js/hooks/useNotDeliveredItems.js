import { useState, useEffect } from "react";
import { fetchNotDeliveredFromApi } from "../api/notDeliveredApi";

export function useNotDeliveredItems() {
  const [notDeliveredItems, setNotDeliveredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetchNotDeliveredFromApi()
      .then(setNotDeliveredItems)
      .catch((err) => {
        console.error("Fel vid hämtning av ej levererade artiklar:", err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { notDeliveredItems, isLoading, error };
}
