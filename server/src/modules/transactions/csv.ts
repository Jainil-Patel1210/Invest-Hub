import type { TransactionView } from "./types";

const HEADER = ["Date", "Symbol", "Type", "Quantity", "Price", "Fee", "Total"];

/**
 * A CSV field is wrapped in quotes when it contains a comma, quote, or
 * newline, with embedded quotes doubled (RFC 4180). It also neutralizes
 * "formula injection": a cell starting with = + - @ is executed as a formula
 * by Excel/Sheets, so such values get a leading apostrophe. Symbols come from
 * our own catalog, but a CSV is exactly the kind of output that gets opened in
 * a spreadsheet, so the escape belongs here regardless.
 */
function escapeField(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@]/.test(text) && typeof value === "string") text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(transactions: TransactionView[]): string {
  const lines = transactions.map((t) =>
    [
      new Date(t.executedAt).toISOString(),
      t.symbol,
      t.type,
      t.quantity,
      t.price.toFixed(2),
      t.fee.toFixed(2),
      t.total.toFixed(2),
    ]
      .map(escapeField)
      .join(","),
  );
  return [HEADER.join(","), ...lines].join("\r\n") + "\r\n";
}
