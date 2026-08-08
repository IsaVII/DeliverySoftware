export async function fetchNotDeliveredFromApi() {
  const response = await fetch("/api/deliveries");
  if (!response.ok) {
    throw new Error("Misslyckades att hämta ej levererade artiklar");
  }
  const data = await response.json();
  return data.not_delivered || [];
}
