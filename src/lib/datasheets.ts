import type { ProductDatasheet } from "@/lib/types";

export function normalizeDatasheets(
  datasheets: unknown,
  fallbackUrl: string | null = null
): ProductDatasheet[] {
  if (Array.isArray(datasheets)) {
    return datasheets
      .map((item) => {
        if (typeof item === "string") {
          return {
            name: "Datasheet",
            url: item,
            type: null,
            size: null,
          };
        }

        if (!item || typeof item !== "object") {
          return null;
        }

        const record = item as Partial<ProductDatasheet>;
        if (typeof record.url !== "string" || !record.url) {
          return null;
        }

        return {
          name: typeof record.name === "string" && record.name ? record.name : "Datasheet",
          url: record.url,
          type: typeof record.type === "string" ? record.type : null,
          size: typeof record.size === "number" ? record.size : null,
        };
      })
      .filter((item): item is ProductDatasheet => item !== null);
  }

  if (fallbackUrl) {
    return [
      {
        name: "Datasheet",
        url: fallbackUrl,
        type: null,
        size: null,
      },
    ];
  }

  return [];
}

export function createDatasheetEntry(file: File, url: string): ProductDatasheet {
  return {
    name: file.name,
    url,
    type: file.type || null,
    size: file.size,
  };
}
