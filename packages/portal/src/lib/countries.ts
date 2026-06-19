/** Common ISO country codes for geo targeting. */
export const TARGET_COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "AE", name: "UAE" },
  { code: "NG", name: "Nigeria" },
];

export function formatCountryList(codes: string[]): string {
  if (!codes.length) return "Worldwide";
  const names = codes.map(
    (c) => TARGET_COUNTRIES.find((x) => x.code === c)?.name || c,
  );
  return names.join(", ");
}
