export type UnitSystem = "inch" | "mm";
export type StripType = "A" | "N" | "C";

export const STRIP_THICKNESS_INCH: Record<StripType, number> = {
  N: 0.031,
  A: 0.051,
  C: 0.094,
};

export type DataPoint = {
  id: string;
  exposure: string;
  arcHeight: string;
};

export type Dataset = {
  id: string;
  name: string;
  points: DataPoint[];
  stripType: StripType;
  specMin: string;
  specMax: string;
};

export type ProcessedPoint = {
  exposure: number;
  arcHeightInch: number;
};

export type ChartPoint = {
  exposure: number;
  measured?: number;
  fit: number;
  isSaturation?: boolean;
};

export type DatasetResult = {
  validPoints: ProcessedPoint[];
  sortedPoints: ProcessedPoint[];
  regression: {
    a: number;
    b: number;
  } | null;
  saturationPoint: ProcessedPoint | null;
  saturationRatio: number | null;
  intensityInch: number | null;
  specMinInch: number | null;
  specMaxInch: number | null;
  compliance:
    | { status: "pass"; reason: "Within specified range." }
    | { status: "fail"; reason: "Intensity below specified range." }
    | { status: "fail"; reason: "Intensity above specified range." }
    | { status: "unknown"; reason: "Specify a valid min and max range." }
    | { status: "unknown"; reason: "Saturation not established." };
  chartPoints: ChartPoint[];
  recommendation: {
    tone: "ok" | "warn";
    title: string;
    detail: string;
  };
  timestamp: string;
};

const MM_PER_INCH = 25.4;

export const samplePoints: DataPoint[] = [
  { id: crypto.randomUUID(), exposure: "1", arcHeight: "0.008" },
  { id: crypto.randomUUID(), exposure: "2", arcHeight: "0.012" },
  { id: crypto.randomUUID(), exposure: "4", arcHeight: "0.014" },
  { id: crypto.randomUUID(), exposure: "8", arcHeight: "0.015" },
  { id: crypto.randomUUID(), exposure: "16", arcHeight: "0.0155" },
];

export function createBlankPoint(): DataPoint {
  return {
    id: crypto.randomUUID(),
    exposure: "",
    arcHeight: "",
  };
}

export function createDataset(name: string, points = samplePoints): Dataset {
  return {
    id: crypto.randomUUID(),
    name,
    points: points.map((point) => ({ ...point, id: crypto.randomUUID() })),
    stripType: "A",
    specMin: "0.013",
    specMax: "0.016",
  };
}

export function convertFromUnit(value: number, unit: UnitSystem): number {
  return unit === "inch" ? value : value / MM_PER_INCH;
}

export function convertToUnit(valueInch: number, unit: UnitSystem): number {
  return unit === "inch" ? valueInch : valueInch * MM_PER_INCH;
}

export function formatArcHeight(valueInch: number | null, unit: UnitSystem): string {
  if (valueInch === null || Number.isNaN(valueInch)) {
    return "--";
  }

  const converted = convertToUnit(valueInch, unit);
  return unit === "inch" ? converted.toFixed(4) : converted.toFixed(3);
}

export function formatIntensity(
  valueInch: number | null,
  stripType: StripType,
  unit: UnitSystem,
): string {
  if (valueInch === null) {
    return "Not established";
  }

  return `${formatArcHeight(valueInch, unit)}${stripType}`;
}

export function getStripThickness(stripType: StripType, unit: UnitSystem) {
  return convertToUnit(STRIP_THICKNESS_INCH[stripType], unit);
}

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseOptionalNumber(value: string, unit: UnitSystem): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return convertFromUnit(parsed, unit);
}

function fitLogarithmicRegression(points: ProcessedPoint[]) {
  if (points.length < 2) {
    return null;
  }

  const transformed = points.map((point) => ({
    x: Math.log(point.exposure),
    y: point.arcHeightInch,
  }));

  const count = transformed.length;
  const sumX = transformed.reduce((sum, point) => sum + point.x, 0);
  const sumY = transformed.reduce((sum, point) => sum + point.y, 0);
  const sumXY = transformed.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = transformed.reduce((sum, point) => sum + point.x * point.x, 0);
  const denominator = count * sumXX - sumX * sumX;

  if (denominator === 0) {
    return null;
  }

  const a = (count * sumXY - sumX * sumY) / denominator;
  const b = (sumY - a * sumX) / count;

  return { a, b };
}

function predictArcHeight(exposure: number, regression: { a: number; b: number } | null) {
  if (!regression || exposure <= 0) {
    return 0;
  }

  return regression.a * Math.log(exposure) + regression.b;
}

function buildChartPoints(points: ProcessedPoint[], regression: { a: number; b: number } | null) {
  if (!points.length) {
    return [];
  }

  const sortedPoints = [...points].sort((left, right) => left.exposure - right.exposure);
  const minExposure = sortedPoints[0].exposure;
  const maxExposure = sortedPoints[sortedPoints.length - 1].exposure;
  const steps = 48;
  const generated: ChartPoint[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const exposure = minExposure + (maxExposure - minExposure) * progress;
    generated.push({
      exposure,
      fit: predictArcHeight(exposure, regression),
    });
  }

  return [
    ...generated,
    ...sortedPoints.map((point) => ({
      exposure: point.exposure,
      measured: point.arcHeightInch,
      fit: predictArcHeight(point.exposure, regression),
    })),
  ].sort((left, right) => left.exposure - right.exposure);
}

function detectSaturation(points: ProcessedPoint[]) {
  const sortedPoints = [...points].sort((left, right) => left.exposure - right.exposure);

  for (const point of sortedPoints) {
    const doublePoint = sortedPoints.find(
      (candidate) => Math.abs(candidate.exposure - point.exposure * 2) < 1e-9,
    );

    if (!doublePoint || point.arcHeightInch === 0) {
      continue;
    }

    const ratio = (doublePoint.arcHeightInch - point.arcHeightInch) / point.arcHeightInch;
    if (ratio < 0.1) {
      return {
        saturationPoint: point,
        saturationRatio: ratio,
      };
    }
  }

  return {
    saturationPoint: null,
    saturationRatio: null,
  };
}

export function calculateDataset(dataset: Dataset, unit: UnitSystem): DatasetResult {
  const validPoints = dataset.points
    .map((point) => {
      const exposure = parsePositiveNumber(point.exposure);
      const arcHeight = parsePositiveNumber(point.arcHeight);

      if (exposure === null || arcHeight === null) {
        return null;
      }

      return {
        exposure,
        arcHeightInch: convertFromUnit(arcHeight, unit),
      };
    })
    .filter((point): point is ProcessedPoint => point !== null);

  const sortedPoints = [...validPoints].sort((left, right) => left.exposure - right.exposure);
  const regression = fitLogarithmicRegression(sortedPoints);
  const { saturationPoint, saturationRatio } = detectSaturation(sortedPoints);
  const intensityInch = saturationPoint?.arcHeightInch ?? null;
  const specMinInch = parseOptionalNumber(dataset.specMin, unit);
  const specMaxInch = parseOptionalNumber(dataset.specMax, unit);

  let compliance: DatasetResult["compliance"] = {
    status: "unknown",
    reason: "Saturation not established.",
  };

  if (specMinInch !== null && specMaxInch !== null && specMinInch <= specMaxInch) {
    if (intensityInch === null) {
      compliance = {
        status: "unknown",
        reason: "Saturation not established.",
      };
    } else if (intensityInch < specMinInch) {
      compliance = {
        status: "fail",
        reason: "Intensity below specified range.",
      };
    } else if (intensityInch > specMaxInch) {
      compliance = {
        status: "fail",
        reason: "Intensity above specified range.",
      };
    } else {
      compliance = {
        status: "pass",
        reason: "Within specified range.",
      };
    }
  } else {
    compliance = {
      status: "unknown",
      reason: "Specify a valid min and max range.",
    };
  }

  const chartPoints = buildChartPoints(sortedPoints, regression).map((point) => ({
    ...point,
    isSaturation:
      saturationPoint !== null &&
      Math.abs(point.exposure - saturationPoint.exposure) < 1e-9 &&
      point.measured === saturationPoint.arcHeightInch,
  }));

  const lastPoint = sortedPoints[sortedPoints.length - 1] ?? null;
  const nextExposureSuggestion = lastPoint ? lastPoint.exposure * 2 : null;
  const recommendation =
    saturationPoint !== null
      ? {
          tone: "ok" as const,
          title: "Process condition acceptable",
          detail: `Saturation established at ${saturationPoint.exposure}T. Maintain exposure near the detected saturation point and verify with routine strip checks.`,
        }
      : {
          tone: "warn" as const,
          title: "Increase exposure time",
          detail: nextExposureSuggestion
            ? `Saturation was not established with the current series. Extend the test beyond ${lastPoint?.exposure}T and evaluate at approximately ${nextExposureSuggestion}T or higher.`
            : "Saturation was not established. Add valid exposure-time pairs and extend exposure time until the 2T change falls below 10%.",
        };

  return {
    validPoints,
    sortedPoints,
    regression,
    saturationPoint,
    saturationRatio,
    intensityInch,
    specMinInch,
    specMaxInch,
    compliance,
    chartPoints,
    recommendation,
    timestamp: new Date().toLocaleString(),
  };
}

export function calculateAverageIntensity(results: DatasetResult[]) {
  const validIntensities = results
    .map((result) => result.intensityInch)
    .filter((value): value is number => value !== null);

  if (!validIntensities.length) {
    return null;
  }

  return validIntensities.reduce((sum, value) => sum + value, 0) / validIntensities.length;
}
