import { useState, useEffect } from "react";
import { fetchAppMetadata } from "../api/deliveriesApi";

export function useAppMetadata() {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    fetchAppMetadata()
      .then(setMetadata)
      .catch((error) => console.error("Failed to fetch metadata:", error));
  }, []);

  return metadata;
}
