export const SORT_MODES_CONFIG = [
  { key: "withinLeverans", label: "Inom leverans" },
  { key: "completeList", label: "Fullständig lista" },
];

export function compareByBeskrivning(a, b, direction) {
  const aDesc = (a.Beskrivning || "").toLowerCase();
  const bDesc = (b.Beskrivning || "").toLowerCase();
  return direction === "asc"
    ? aDesc.localeCompare(bDesc)
    : bDesc.localeCompare(aDesc);
}
