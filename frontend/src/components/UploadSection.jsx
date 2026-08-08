import { useState } from "react";
import Button from "./subcomponents/Button.jsx";
import H2 from "./subcomponents/H2.jsx";
import { uploadDeliveryFile, updateBarcodeDataApi } from "../js/api/uploadApi";

export default function UploadSection({ className = "" }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadMessage(""); // Clear previous messages
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage("✗ No file selected");
      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const data = await uploadDeliveryFile(file);

      setUploadMessage(
        `✓ ${data.message} (${data.deliveries_count} deliveries, ${data.total_articles} articles)`,
      );
      setFile(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Trigger page reload to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadMessage(`✗ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateBarcodeData = async () => {
    setUpdating(true);
    setUpdateMessage("");

    try {
      const data = await updateBarcodeDataApi();
      setUpdateMessage(
        `✓ ${data.message} (${data.total_articles} total articles)`,
      );
      console.log("Barcode data updated:", data);
    } catch (err) {
      console.error("Error updating barcode data:", err);
      setUpdateMessage(`✗ Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section
      className={`bg-[var(--bg-panel)] p-6 rounded-lg border border-gray-300 ${className}`}
    >
      <H2>Upload file</H2>
      <form
        onSubmit={handleUpload}
        className="flex gap-4 items-center flex-wrap"
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.json"
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
        />
        <Button handleClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
      {file && !uploading && (
        <p className="mt-2 text-sm text-gray-700">Selected: {file.name}</p>
      )}
      {uploadMessage && (
        <p
          className={`mt-2 text-sm ${
            uploadMessage.startsWith("✓") ? "text-green-600" : "text-red-600"
          }`}
        >
          {uploadMessage}
        </p>
      )}

      {/* <div className="mt-6 pt-6 border-t border-gray-300">
        <H2>Barcode Management</H2>
        <div className="flex gap-4 items-center">
          <Button handleClick={handleUpdateBarcodeData} disabled={updating}>
            {updating ? "Updating..." : "Update Barcode Data"}
          </Button>
          {updateMessage && (
            <p
              className={`text-sm ${
                updateMessage.startsWith("✓")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {updateMessage}
            </p>
          )}
        </div>
      </div> */}
    </section>
  );
}
