export type ReportSlug =
  | "1-year-prediction"
  | "3-year-prediction"
  | "5-year-prediction";

export type ReportType = "1-year" | "3-year" | "5-year";

export interface ReportMetadata {
  type: ReportType;
  price: number;
  originalPrice: number;
}

export const REPORT_METADATA: Record<ReportSlug, ReportMetadata> = {
  "1-year-prediction": {
    type: "1-year",
    price: 999,
    originalPrice: 1999,
  },
  "3-year-prediction": {
    type: "3-year",
    price: 2499,
    originalPrice: 4999,
  },
  "5-year-prediction": {
    type: "5-year",
    price: 3999,
    originalPrice: 7999,
  },
};

export function slugToReportType(slug: ReportSlug | string): ReportType {
  const metadata = REPORT_METADATA[slug as ReportSlug];
  if (!metadata) {
    throw new Error(`Invalid report slug: ${slug}`);
  }
  return metadata.type;
}

export function getReportPrice(slug: ReportSlug | string): number {
  const metadata = REPORT_METADATA[slug as ReportSlug];
  if (!metadata) {
    throw new Error(`Invalid report slug: ${slug}`);
  }
  return metadata.price;
}
