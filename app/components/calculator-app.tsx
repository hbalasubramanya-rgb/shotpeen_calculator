"use client";

import { useMemo, useState } from "react";

import { ChartPanel } from "@/app/components/chart-panel";
import { InputTable } from "@/app/components/input-table";
import { ResultsPanel } from "@/app/components/results-panel";
import {
  Dataset,
  UnitSystem,
  calculateAverageIntensity,
  calculateDataset,
  createBlankPoint,
  createDataset,
} from "@/app/lib/calculator";

const minimumRows = 4;

function createEmptyDataset(name: string): Dataset {
  return createDataset(
    name,
    Array.from({ length: minimumRows }, () => createBlankPoint()),
  );
}

export function CalculatorApp() {
  const initialDatasets = useMemo(
    () => [createDataset("Sample Dataset"), createEmptyDataset("Dataset 2")],
    [],
  );
  const [unit, setUnit] = useState<UnitSystem>("inch");
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(initialDatasets[0]?.id ?? "");

  const results = useMemo(
    () => datasets.map((dataset) => ({ datasetId: dataset.id, result: calculateDataset(dataset, unit) })),
    [datasets, unit],
  );

  const activeDataset = datasets.find((dataset) => dataset.id === activeDatasetId) ?? datasets[0];
  const activeResult =
    results.find((entry) => entry.datasetId === activeDataset?.id)?.result ??
    calculateDataset(activeDataset, unit);
  const averageIntensityInch = calculateAverageIntensity(results.map((entry) => entry.result));

  const updateDataset = (updatedDataset: Dataset) => {
    setDatasets((current) =>
      current.map((dataset) => (dataset.id === updatedDataset.id ? updatedDataset : dataset)),
    );
  };

  const addDataset = () => {
    const dataset = createEmptyDataset(`Dataset ${datasets.length + 1}`);
    setDatasets((current) => [...current, dataset]);
    setActiveDatasetId(dataset.id);
  };

  const removeDataset = (datasetId: string) => {
    if (datasets.length <= 1) {
      return;
    }

    const remaining = datasets.filter((dataset) => dataset.id !== datasetId);
    setDatasets(remaining);

    if (datasetId === activeDatasetId) {
      setActiveDatasetId(remaining[0]?.id ?? "");
    }
  };

  const resetAll = () => {
    const resetDatasets = [createDataset("Sample Dataset"), createEmptyDataset("Dataset 2")];
    setDatasets(resetDatasets);
    setActiveDatasetId(resetDatasets[0].id);
    setUnit("inch");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_42%,_#1e293b_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <header className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300 print:text-slate-500">
                CWST Process Control
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white print:text-slate-900 sm:text-5xl">
                CW Peen Calculator
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 print:text-slate-700">
                Almen intensity and process parameter calculator for Curtiss-Wright Surface
                Technologies. Enter strip data, determine saturation, validate specification
                compliance, and generate a print-ready engineering report.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-1">
                <button
                  type="button"
                  onClick={() => setUnit("inch")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    unit === "inch" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                  }`}
                >
                  Inch
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("mm")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    unit === "mm" ? "bg-cyan-400 text-slate-950" : "text-slate-300"
                  }`}
                >
                  Millimeter
                </button>
              </div>
              <button
                type="button"
                onClick={addDataset}
                className="rounded-full border border-cyan-400/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/10"
              >
                Add Dataset
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-full border border-amber-400/50 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Print Report
              </button>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-700/40 bg-slate-950/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 print:text-slate-500">
                Dataset Control
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white print:text-slate-900">
                Multiple Dataset Review
              </h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right print:border-slate-300 print:bg-slate-50">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 print:text-slate-500">
                Average Intensity
              </p>
              <p className="mt-1 text-lg font-semibold text-white print:text-slate-900">
                {averageIntensityInch !== null
                  ? `${unit === "inch" ? averageIntensityInch.toFixed(4) : (averageIntensityInch * 25.4).toFixed(3)} ${unit === "inch" ? "in" : "mm"}`
                  : "--"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {datasets.map((dataset, index) => {
              const datasetResult = results.find((entry) => entry.datasetId === dataset.id)?.result;
              const isActive = dataset.id === activeDatasetId;
              const statusColor =
                datasetResult?.compliance.status === "pass"
                  ? "border-emerald-400/40"
                  : datasetResult?.compliance.status === "fail"
                    ? "border-rose-400/40"
                    : "border-slate-700";

              return (
                <div
                  key={dataset.id}
                  className={`rounded-2xl border px-4 py-3 ${statusColor} ${
                    isActive ? "bg-slate-900 text-white" : "bg-slate-950/50 text-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDatasetId(dataset.id)}
                    className="text-left"
                  >
                    <p className="text-sm font-semibold">{dataset.name || `Dataset ${index + 1}`}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em]">
                      {datasetResult?.saturationPoint ? "Saturated" : "Pending"}
                    </p>
                  </button>
                  {datasets.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeDataset(dataset.id)}
                      className="ml-4 text-xs font-semibold text-rose-200 print:hidden"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <main className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <InputTable dataset={activeDataset} unit={unit} onDatasetChange={updateDataset} />
            <ChartPanel result={activeResult} unit={unit} />
          </div>
          <div className="space-y-6">
            <ResultsPanel
              dataset={activeDataset}
              result={activeResult}
              averageIntensityInch={averageIntensityInch}
              unit={unit}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
