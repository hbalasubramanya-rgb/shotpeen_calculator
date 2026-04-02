"use client";

import {
  Dataset,
  DatasetResult,
  UnitSystem,
  formatArcHeight,
  formatIntensity,
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
  const complianceColor =
    result.compliance.status === "pass"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/30"
      : result.compliance.status === "fail"
        ? "text-rose-200 bg-rose-500/10 border-rose-400/30"
        : "text-amber-200 bg-amber-500/10 border-amber-400/30";

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

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5 print:border-slate-300 print:bg-slate-50">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200 print:text-slate-500">
            Intensity
          </p>
          <p className="mt-3 text-3xl font-semibold text-white print:text-slate-900">
            {formatIntensity(result.intensityInch, dataset.stripType, unit)}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 print:border-slate-300 print:bg-slate-50 ${
            saturationOk
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-rose-400/30 bg-rose-500/10"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-slate-200 print:text-slate-500">
            Saturation
          </p>
          <p className="mt-3 text-xl font-semibold text-white print:text-slate-900">
            {saturationOk ? "Saturated" : "Not Saturated"}
          </p>
          <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
            {saturationOk && result.saturationRatio !== null
              ? `Ratio at 2T check: ${(result.saturationRatio * 100).toFixed(2)}%`
              : "No valid point met the <10% criterion at doubled exposure."}
          </p>
        </div>

        <div className={`rounded-2xl border p-5 ${complianceColor} print:border-slate-300 print:bg-slate-50 print:text-slate-900`}>
          <p className="text-xs uppercase tracking-[0.24em] print:text-slate-500">Compliance</p>
          <p className="mt-3 text-xl font-semibold">
            {result.compliance.status === "pass"
              ? "PASS"
              : result.compliance.status === "fail"
                ? "FAIL"
                : "PENDING"}
          </p>
          <p className="mt-2 text-sm print:text-slate-700">{result.compliance.reason}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 print:border-slate-300 print:bg-slate-50">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
            Recommended Exposure
          </p>
          <p className="mt-3 text-xl font-semibold text-white print:text-slate-900">
            {result.saturationPoint ? `${result.saturationPoint.exposure}T` : "--"}
          </p>
          <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
            Strip {dataset.stripType} | Average intensity{" "}
            {averageIntensityInch !== null
              ? formatIntensity(averageIntensityInch, dataset.stripType, unit)
              : "--"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
            Spec Range
          </p>
          <p className="mt-2 text-base text-white print:text-slate-900">
            {formatArcHeight(result.specMinInch, unit)} to {formatArcHeight(result.specMaxInch, unit)}{" "}
            {unit === "inch" ? "in" : "mm"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
            Valid Points
          </p>
          <p className="mt-2 text-base text-white print:text-slate-900">{result.validPoints.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 print:border-slate-300 print:bg-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
            Regression
          </p>
          <p className="mt-2 text-base text-white print:text-slate-900">
            {result.regression
              ? `H = ${result.regression.a.toFixed(5)} ln(T) + ${result.regression.b.toFixed(5)}`
              : "Insufficient valid data"}
          </p>
        </div>
      </div>
    </section>
  );
}
