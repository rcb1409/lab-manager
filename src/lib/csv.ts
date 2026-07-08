type Column<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv<T>(rows: T[], columns: Column<T>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCsvValue(c.value(row))).join(",")
  );
  return [header, ...body].join("\r\n");
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
