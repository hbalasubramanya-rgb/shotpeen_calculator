"use client";

import {
  Dataset,
  DatasetResult,
  UnitSystem,
  formatArcHeight,
  formatIntensity,
  getStripThickness,
} from "@/app/lib/calculator";

type ResultsPanelProps = {
  dataset: Dataset;
  result: DatasetResult;
  averageIntensityInch: number | null;
  unit: UnitSystem;
};

export function ResultsPanel({
  dataset,
  result,
  averageIntensityInch,
  unit,
}: ResultsPanelProps) {
  const saturationOk = result.saturationPoint !== null;
  const stripThickness = getStripThickness(dataset.stripType, unit);
  const complianceTone =
    result.compliance.status === "pass"
      ? {
          panel: "border-emerald-400/35 bg-emerald-500/10",
          text: "text-emerald-200",
          accent: "bg-emerald-400",
          label: "PASS",
        }
      : result.compliance.status === "fail"
        ? {
            panel: "border-rose-400/35 bg-rose-500/10",
            text: "text-rose-200",
            accent: "bg-rose-400",
            label: "FAIL",
          }
        : {
            panel: "border-amber-400/35 bg-amber-500/10",
            text: "text-amber-200",
            accent: "bg-amber-400",
            label: "PENDING",
          };

  const saturationTone = saturationOk
    ? {
        panel: "border-emerald-400/35 bg-emerald-500/10",
        text: "text-emerald-200",
        accent: "bg-emerald-400",
      }
    : {
        panel: "border-rose-400/35 bg-rose-500/10",
        text: "text-rose-200",
        accent: "bg-rose-400",
      };

  return (
    <section className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 print:text-slate-500">
            Output
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white print:text-slate-900">
            Intensity And Compliance Summary
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right print:border-slate-300 print:bg-slate-50">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
            Timestamp
          </p>
          <p className="mt-1 text-sm text-slate-100 print:text-slate-800">{result.timestamp}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(145deg,rgba(8,145,178,0.18),rgba(15,23,42,0.85))] p-6 print:border-slate-300 print:bg-slate-50">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200 print:text-slate-500">
                Calculated Intensity
              </p>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-white print:text-slate-900 sm:text-6xl">
                {formatIntensity(result.intensityInch, dataset.stripType, unit)}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 print:text-slate-700">
                Saturation intensity is taken from the first point that satisfies the Almen
                doubling rule. The displayed value is the working process intensity for the
                selected dataset and strip type.
              </p>
            </div>
            <div className="grid min-w-[210px] gap-3">
              <div className={`rounded-2xl border px-4 py-4 ${complianceTone.panel} print:border-slate-300 print:bg-white`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200 print:text-slate-500">
                    Compliance
                  </p>
                  <span className={`h-3 w-3 rounded-full ${complianceTone.accent}`} />
                </div>
                <p className={`mt-3 text-2xl font-semibold ${complianceTone.text} print:text-slate-900`}>
                  {complianceTone.label}
                </p>
                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  {result.compliance.reason}
                </p>
              </div>

              <div className={`rounded-2xl border px-4 py-4 ${saturationTone.panel} print:border-slate-300 print:bg-white`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-200 print:text-slate-500">
                    Saturation Status
                  </p>
                  <span className={`h-3 w-3 rounded-full ${saturationTone.accent}`} />
                </div>
                <p className={`mt-3 text-2xl font-semibold ${saturationTone.text} print:text-slate-900`}>
                  {saturationOk ? "Established" : "Not Found"}
                </p>
                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  {saturationOk && result.saturationRatio !== null
                    ? `2T ratio = ${(result.saturationRatio * 100).toFixed(2)}%`
                    : "No valid exposure pair met the required saturation criterion."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 print:border-slate-300 print:bg-white">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
                Recommended Exposure
              </p>
              <p className="mt-2 text-2xl font-semibold text-white print:text-slate-900">
                {result.saturationPoint ? `${result.saturationPoint.exposure}T` : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 print:border-slate-300 print:bg-white">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
                Strip Type
              </p>
              <p className="mt-2 text-2xl font-semibold text-white print:text-slate-900">
                {dataset.stripType}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 print:border-slate-300 print:bg-white">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
                Average Intensity
              </p>
              <p className="mt-2 text-2xl font-semibold text-white print:text-slate-900">
                {averageIntensityInch !== null
                  ? formatIntensity(averageIntensityInch, dataset.stripType, unit)
                  : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 print:border-slate-300 print:bg-white">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
                Valid Points
              </p>
              <p className="mt-2 text-2xl font-semibold text-white print:text-slate-900">
                {result.validPoints.length}
              </p>
            </div>
          </div>

          <div
            className={`mt-4 rounded-2xl border px-4 py-4 print:border-slate-300 print:bg-white ${
              result.recommendation.tone === "ok"
                ? "border-emerald-400/35 bg-emerald-500/10"
                : "border-amber-400/35 bg-amber-500/10"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300 print:text-slate-500">
              Smart Alert
            </p>
            <p className="mt-2 text-lg font-semibold text-white print:text-slate-900">
              {result.recommendation.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
              {result.recommendation.detail}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-5 print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
              Specification Window
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm text-slate-400 print:text-slate-600">
                <span>Min</span>
                <span>Target Band</span>
                <span>Max</span>
              </div>
              <div className="mt-3 h-4 rounded-full bg-slate-800 print:bg-slate-200">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#ef4444_0%,#f59e0b_18%,#10b981_40%,#10b981_60%,#f59e0b_82%,#ef4444_100%)]" />
              </div>
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-white print:text-slate-900">
                <span>{formatArcHeight(result.specMinInch, unit)}</span>
                <span>{formatArcHeight(result.intensityInch, unit)}</span>
                <span>{formatArcHeight(result.specMaxInch, unit)}</span>
              </div>
              <p className="mt-4 text-sm text-slate-300 print:text-slate-700">
                Current intensity is compared against the specified operating range in{" "}
                {unit === "inch" ? "inches" : "millimeters"}.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-900/75 p-5 print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
              Engineering Detail
            </p>
            <dl className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 print:border-slate-200">
                <dt className="text-sm text-slate-400 print:text-slate-600">Regression Model</dt>
                <dd className="max-w-[250px] text-right text-sm font-medium text-white print:text-slate-900">
                  {result.regression
                    ? `H = ${result.regression.a.toFixed(5)} ln(T) + ${result.regression.b.toFixed(5)}`
                    : "Insufficient valid data"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 print:border-slate-200">
                <dt className="text-sm text-slate-400 print:text-slate-600">Specified Range</dt>
                <dd className="text-right text-sm font-medium text-white print:text-slate-900">
                  {formatArcHeight(result.specMinInch, unit)} to{" "}
                  {formatArcHeight(result.specMaxInch, unit)} {unit === "inch" ? "in" : "mm"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 print:border-slate-200">
                <dt className="text-sm text-slate-400 print:text-slate-600">Strip Thickness</dt>
                <dd className="text-right text-sm font-medium text-white print:text-slate-900">
                  {stripThickness.toFixed(3)} {unit === "inch" ? "in" : "mm"} ({dataset.stripType} strip)
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4 print:border-slate-200">
                <dt className="text-sm text-slate-400 print:text-slate-600">Saturation Point</dt>
                <dd className="text-right text-sm font-medium text-white print:text-slate-900">
                  {result.saturationPoint
                    ? `${result.saturationPoint.exposure}T at ${formatArcHeight(result.saturationPoint.arcHeightInch, unit)}`
                    : "Not established"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-sm text-slate-400 print:text-slate-600">Data Timestamp</dt>
                <dd className="text-right text-sm font-medium text-white print:text-slate-900">
                  {result.timestamp}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
