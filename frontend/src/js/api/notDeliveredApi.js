export async function fetchNotDeliveredFromApi() {
  const response = await fetch("/api/deliveries");
  if (!response.ok) {
    throw new Error("Failed to fetch undelivered articles");
  }
  const data = await response.json();
  return data.not_delivered || [];
}
