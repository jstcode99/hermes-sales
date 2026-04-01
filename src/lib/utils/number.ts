export const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null || value === "") return "";

  const number = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
  }).format(number);
};

export const parseCurrency = (value: string) => {
  return value.replace(/[^\d]/g, "");
};

export const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

export function splitByRatio(n: number) {
  const base = Math.floor(n / 3); // 1
  const p1 = base; // 1
  const p2 = 3 - p1; // 2
  return { p1, p2 };
}
