// Simple, read-only table for displaying not-delivered articles
// No sorting, filtering, or status tracking - just a straightforward display
export const NOT_DELIVERED_COLUMNS = [
  {
    key: "huvudgrupp",
    showWhen: "always",
    header: () => "Huvudgrupp",
    cell: (item) => item.huvudgrupp || "-",
  },
  {
    key: "artikelnr",
    showWhen: "always",
    header: () => "Artikelnr",
    cell: (item) => item.Artikelnr || "-",
  },
  {
    key: "beskrivning",
    showWhen: "always",
    header: () => "Beskrivning",
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
        Best
        <br />
        Kvant
      </>
    ),
    cell: (item) => item.BestKvänt || "-",
  },
  {
    key: "bestEnh",
    showWhen: "full",
    header: () => "Best Enh",
    cell: (item) => item.BestEnh || "-",
  },
  {
    key: "bestKfp",
    showWhen: "always",
    header: () => (
      <>
        Best
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
        Rstad
        <br />
        Kvant
      </>
    ),
    cell: (item) => item.RestadKvänt || "-",
  },
  {
    key: "restadEnh",
    showWhen: "full",
    header: () => "Rstad Enh",
    cell: (item) => item.RestadEnh || "-",
  },
  {
    key: "bristorsak",
    showWhen: "always",
    header: () => "Bristorsak",
    font: "left",
    headerClassName: "max-w-[80px] md:max-w-none",
    cellClassName: "max-w-[80px] md:max-w-none overflow-hidden text-ellipsis",
    cell: (item) => item.Bristorsak || "-",
  },
  {
    key: "referens",
    showWhen: "full",
    header: () => "Referens",
    cell: (item) => item.Referens || "",
  },
];
