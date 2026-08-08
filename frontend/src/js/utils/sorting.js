export const SORT_MODES_CONFIG = [
  { key: "withinLeverans", label: "Within delivery" },
  { key: "completeList", label: "Full list" },
];

export function compareByBeskrivning(a, b, direction) {
  const aDesc = (a.Beskrivning || "").toLowerCase();
  const bDesc = (b.Beskrivning || "").toLowerCase();
  return direction === "asc"
    ? aDesc.localeCompare(bDesc)
    : bDesc.localeCompare(aDesc);
}
