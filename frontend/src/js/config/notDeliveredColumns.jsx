// Simple, read-only table for displaying not-delivered articles
// No sorting, filtering, or status tracking - just a straightforward display
export const NOT_DELIVERED_COLUMNS = [
  {
    key: "huvudgrupp",
    showWhen: "always",
    header: () => "Main Group",
    cell: (item) => item.huvudgrupp || "-",
  },
  {
    key: "artikelnr",
    showWhen: "always",
    header: () => "Article No.",
    cell: (item) => item.Artikelnr || "-",
  },
  {
    key: "beskrivning",
    showWhen: "always",
    header: () => "Description",
    font: "left",
    headerClassName: "max-w-[100px] md:max-w-none",
    cellClassName: "max-w-[100px] md:max-w-none overflow-hidden text-ellipsis",
    cell: (item) => item.Beskrivning || "-",
  },
  {
    key: "bestKvant",
    showWhen: "always",
    header: () => (
      <>
        Order
        <br />
        Qty
      </>
    ),
    cell: (item) => item.BestKvänt || "-",
  },
  {
    key: "bestEnh",
    showWhen: "full",
    header: () => "Order Unit",
    cell: (item) => item.BestEnh || "-",
  },
  {
    key: "bestKfp",
    showWhen: "always",
    header: () => (
      <>
        Order
        <br />
        KFP
      </>
    ),
    cell: (item) => item.BestKFP || "-",
  },
  {
    key: "restadKvant",
    showWhen: "always",
    header: () => (
      <>
        Remaining
        <br />
        Qty
      </>
    ),
    cell: (item) => item.RestadKvänt || "-",
  },
  {
    key: "restadEnh",
    showWhen: "full",
    header: () => "Remaining Unit",
    cell: (item) => item.RestadEnh || "-",
  },
  {
    key: "bristorsak",
    showWhen: "always",
    header: () => "Shortage Reason",
    font: "left",
    headerClassName: "max-w-[80px] md:max-w-none",
    cellClassName: "max-w-[80px] md:max-w-none overflow-hidden text-ellipsis",
    cell: (item) => item.Bristorsak || "-",
  },
  {
    key: "referens",
    showWhen: "full",
    header: () => "Reference",
    cell: (item) => item.Referens || "",
  },
];
