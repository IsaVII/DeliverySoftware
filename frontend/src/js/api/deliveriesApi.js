// ---------------------------------------------------------------------------
// Data layer — talks to the backend, knows nothing about React.
// ---------------------------------------------------------------------------

export function flattenDeliveries(data) {
  const flattened = [];
  (data.deliveries || []).forEach((delivery) => {
    (delivery.articles || []).forEach((article) => {
      const flatArticle = {
        ...article,
        leveransnr: delivery.leveransnr,
        Streckkod: article.Streckkod || "",
      };
      flattened.push(flatArticle);
    });
  });
  return flattened;
}

export async function fetchDeliveriesFromApi() {
  const response = await fetch("/api/deliveries");
  if (!response.ok) {
    throw new Error("Failed to fetch deliveries");
  }
  const data = await response.json();
  return flattenDeliveries(data);
}

export async function fetchFilename() {
  const response = await fetch("/api/deliveries/filename");
  if (!response.ok) return null;
  const data = await response.json();
  return data.filename;
}

export async function fetchMetadata() {
  const response = await fetch("/api/deliveries/metadata");
  if (!response.ok) return null;
  return response.json();
}

// Used by App.jsx for the top-level metadata banner. Deliberately a separate
// request from fetchMetadata() above: this hits /api/deliveries (the same
// list endpoint DeliveryTable uses) and reads its `metadata` field, rather
// than the dedicated /api/deliveries/metadata endpoint.
export async function fetchAppMetadata() {
  const response = await fetch("/api/deliveries");
  const data = await response.json();
  return data.metadata || null;
}

export async function saveBarcodeToApi(deliverynr, rad, barcode) {
  const response = await fetch("/api/deliveries/barcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deliverynr, rad, barcode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Misslyckades att spara streckkod: ${response.statusText} - ${errorData.error} ` +
        `- "rad: ${rad}, deliverynr: ${deliverynr}, barcode: ${barcode}"`,
    );
  }
}

export async function saveReceivedToApi(deliverynr, rad, received) {
  const requestBody = { deliverynr, rad, received };
  const response = await fetch("/api/deliveries/received", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Misslyckades att spara mottagen: ${response.statusText} - ${errorData.error}`,
    );
  }
}

export async function saveCommentToApi(deliverynr, rad, comment) {
  const requestBody = { deliverynr, rad, comment };
  const response = await fetch("/api/deliveries/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Misslyckades att spara kommentar: ${response.statusText} - ${errorData.error}`,
    );
  }
}
