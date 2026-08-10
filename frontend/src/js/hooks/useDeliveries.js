import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  fetchDeliveriesFromApi,
  fetchFilename,
  fetchMetadata,
  saveBarcodeToApi,
  saveReceivedToApi,
  saveCommentToApi,
} from "../api/deliveriesApi";
import {
  STATUS_FILTERS_CONFIG,
  isPfandArticle,
  getRowStatus,
} from "../utils/deliveryStatus";
import { compareByBeskrivning } from "../utils/sorting";

// ---------------------------------------------------------------------------
// useDeliveries — owns every piece of state for the delivery table, the
// websocket connection, and all read/write handlers. The component that
// consumes this hook should be pure rendering.
// ---------------------------------------------------------------------------
export function useDeliveries() {
  const [articles, setArticles] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [minimizedColumns, setMinimizedColumns] = useState(true); // Always minimized by default on all screen sizes
  const [isTableMinimized, setIsTableMinimized] = useState(false); // Table expanded by default
  const [currentFilename, setCurrentFilename] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [searchDescriptionInput, setSearchDescriptionInput] = useState("");
  const [searchBarcodeInput, setSearchBarcodeInput] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [barcodeSearchError, setBarcodeSearchError] = useState("");
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [statusFilters, setStatusFilters] = useState(() =>
    Object.fromEntries(STATUS_FILTERS_CONFIG.map(({ key }) => [key, true])),
  );
  const [sortMode, setSortMode] = useState("none"); // "none", "withinLeverans", "completeList"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);
  const [barcodeFilter, setBarcodeFilter] = useState("all"); // "all", "with-barcode", "without-barcode"
  const [showPfand, setShowPfand] = useState(false); // Hide pfand articles by default
  const [showCommentColumn, setShowCommentColumn] = useState(true); // Show comment column by default
  const [showCommentsOnly, setShowCommentsOnly] = useState(false); // Show only articles with comments by default
  const tableRowRefs = useRef({});
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    loadDeliveries();

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setMinimizedColumns(mobile);
    };
    window.addEventListener("resize", handleResize);

    // Connect to WebSocket for real-time updates
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✓ Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("✗ Disconnected from WebSocket server");
    });

    socket.on("delivery_updated", (data) => {
      console.log("Received delivery update:", data);

      // Update only the affected article in the list
      setArticles((prev) =>
        prev.map((article) =>
          article.leveransnr === data.deliverynr &&
          String(article.Rad) === String(data.Rad)
            ? {
                ...article,
                ...(data.type === "barcode" && { Streckkod: data.streckkod }),
                ...(data.type === "received" && { received: data.received }),
              }
            : article,
        ),
      );
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket-anslutningsfel:", error);
    });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.disconnect();
    };
  }, []);

  async function loadDeliveries() {
    setLoading(true);
    try {
      const flattenedArticles = await fetchDeliveriesFromApi();
      setArticles(flattenedArticles);

      const filename = await fetchFilename();
      if (filename != null) setCurrentFilename(filename);

      const metadataData = await fetchMetadata();
      if (metadataData != null) setMetadata(metadataData);

      setError(null);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveBarcode(deliverynr, rad, barcode) {
    try {
      await saveBarcodeToApi(deliverynr, rad, barcode);
      setArticles((prev) =>
        prev.map((article) =>
          article.leveransnr === deliverynr && article.Rad === rad
            ? { ...article, Streckkod: barcode }
            : article,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error saving barcode:", err);
      setError(err.message);
    }
  }

  async function saveReceived(deliverynr, rad, received) {
    try {
      await saveReceivedToApi(deliverynr, rad, received);
      setArticles((prev) =>
        prev.map((article) =>
          article.leveransnr === deliverynr && article.Rad === rad
            ? { ...article, received }
            : article,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error saving received:", err);
      setError(err.message);
    }
  }

  async function saveComment(deliverynr, rad, comment) {
    try {
      await saveCommentToApi(deliverynr, rad, comment);
      setArticles((prev) =>
        prev.map((article) =>
          article.leveransnr === deliverynr && article.Rad === rad
            ? { ...article, comment }
            : article,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Fel vid sparning av kommentar:", err);
      setError(err.message);
    }
  }

  function fillWithKFP(deliverynr, rad, kfp) {
    saveReceived(deliverynr, rad, kfp);
  }

  function clearSelection() {
    setSelectedRowId(null);
  }

  function toggleStatusFilter(status) {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  }

  function getFilteredAndSortedArticles() {
    // First, filter articles
    let filtered = articles.filter((article) => {
      const isPant = isPfandArticle(article);

      // If article is pant
      if (isPant) {
        // If pant is activated, show it (skip status filter)
        // If pant is not activated, exclude it
        if (!showPfand) return false;
      } else {
        // For non-pant articles, apply status filter
        const rowStatus = getRowStatus(article);
        if (!statusFilters[rowStatus]) return false;
      }

      // Apply barcode filter
      if (barcodeFilter === "with-barcode") {
        if (!article.Streckkod || article.Streckkod.trim() === "") return false;
      } else if (barcodeFilter === "without-barcode") {
        if (article.Streckkod && article.Streckkod.trim() !== "") return false;
      }
      // "all" shows everything, no filter needed

      // Apply comments filter
      if (showCommentsOnly) {
        if (!article.comment || article.comment.trim() === "") return false;
      }

      // Apply description search filter
      if (searchDescription.trim()) {
        const searchLower = searchDescription.toLowerCase();
        if (!article.Beskrivning?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });

    // Then, apply sorting
    if (sortMode === "none") {
      return filtered;
    } else if (sortMode === "withinLeverans") {
      // Group by leveransnr, sort within each group, then flatten
      const grouped = {};
      filtered.forEach((article) => {
        const leveransnr = article.leveransnr;
        if (!grouped[leveransnr]) {
          grouped[leveransnr] = [];
        }
        grouped[leveransnr].push(article);
      });

      const result = [];
      Object.keys(grouped)
        .sort() // Keep leveransnr in original order
        .forEach((leveransnr) => {
          const group = grouped[leveransnr];
          group.sort((a, b) => compareByBeskrivning(a, b, sortDirection));
          result.push(...group);
        });
      return result;
    } else if (sortMode === "completeList") {
      // Sort all articles by beskrivning across all leveransnr
      const sorted = [...filtered];
      sorted.sort((a, b) => compareByBeskrivning(a, b, sortDirection));
      return sorted;
    }

    return filtered;
  }

  function searchByDescription(text) {
    if (!text.trim()) {
      setSearchDescription("");
      return;
    }

    setSearchDescription(text);
  }

  function searchByBarcode(barcode) {
    if (!barcode.trim()) {
      setSearchBarcode("");
      setSelectedRowId(null);
      setBarcodeSearchError("");
      return;
    }

    const foundArticle = articles.find(
      (article) => article.Streckkod && barcode.includes(article.Streckkod),
    );

    if (foundArticle) {
      setSearchBarcode(barcode);
      setBarcodeSearchError("");
      // Scroll to the article
      const rowId = `${foundArticle.leveransnr}-${foundArticle.Rad}`;
      const element = tableRowRefs.current[rowId];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Auto-fill if enabled
      if (autoFillEnabled) {
        const kfpValue = parseFloat(foundArticle.KFP);
        console.log("Auto-fill: saving", {
          leveransnr: foundArticle.leveransnr,
          rad: foundArticle.Rad,
          kfp: kfpValue,
        });
        fillWithKFP(foundArticle.leveransnr, foundArticle.Rad, kfpValue);
        // Clear the search input and refocus for next barcode
        setSearchBarcodeInput("");
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 0);
      } else {
        // Only select/focus the row if NOT auto-filling
        setSelectedRowId(rowId);
      }
    } else {
      setBarcodeSearchError(`Barcode "${barcode}" not found`);
    }
  }

  const toggleMinimizeColumns = () => {
    // Allow toggle on both mobile and desktop
    setMinimizedColumns((prev) => !prev);
  };

  function toggleSortMode(newMode) {
    if (sortMode === newMode) {
      // If clicking the same mode, toggle direction
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // If switching to a new mode, reset to ascending
      setSortMode(newMode);
      setSortDirection("asc");
    }
  }

  function resetSort() {
    setSortMode("none");
    setSortDirection("asc");
  }

  function toggleBarcodeFilter() {
    setBarcodeFilter((prev) => {
      if (prev === "all") return "with-barcode";
      if (prev === "with-barcode") return "without-barcode";
      return "all";
    });
  }

  return {
    // state
    articles,
    metadata,
    loading,
    error,
    isMobile,
    minimizedColumns,
    isTableMinimized,
    currentFilename,
    searchDescriptionInput,
    searchBarcodeInput,
    selectedRowId,
    barcodeSearchError,
    isPrintMode,
    statusFilters,
    sortMode,
    sortDirection,
    autoFillEnabled,
    barcodeFilter,
    showPfand,
    showCommentColumn,
    showCommentsOnly,
    tableRowRefs,
    barcodeInputRef,

    // setters passed straight through to the view
    setIsTableMinimized,
    setSearchDescriptionInput,
    setSearchBarcodeInput,
    setBarcodeSearchError,
    setIsPrintMode,
    setAutoFillEnabled,
    setShowPfand,
    setShowCommentColumn,
    setShowCommentsOnly,

    // derived data
    filteredArticles: getFilteredAndSortedArticles(),

    // handlers
    saveBarcode,
    saveReceived,
    saveComment,
    fillWithKFP,
    clearSelection,
    toggleStatusFilter,
    searchByDescription,
    searchByBarcode,
    toggleMinimizeColumns,
    toggleSortMode,
    resetSort,
    toggleBarcodeFilter,
  };
}
