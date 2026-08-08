export async function uploadDeliveryFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Serverfel: Ogiltigt svar. ${e.message}`);
  }

  if (!response.ok) {
    throw new Error(data.error || "Uppladdning misslyckades");
  }

  return data;
}

export async function updateBarcodeDataApi() {
  const response = await fetch("/api/barcodeupdate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Misslyckades att uppdatera streckkoddata");
  }

  return response.json();
}
