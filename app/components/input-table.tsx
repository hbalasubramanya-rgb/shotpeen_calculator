"use client";

import { Dataset, StripType, UnitSystem } from "@/app/lib/calculator";

type InputTableProps = {
  dataset: Dataset;
  unit: UnitSystem;
  onDatasetChange: (dataset: Dataset) => void;
};

const stripOptions: StripType[] = ["A", "N", "C"];

export function InputTable({ dataset, unit, onDatasetChange }: InputTableProps) {
  const updatePoint = (pointId: string, field: "exposure" | "arcHeight", value: string) => {
    onDatasetChange({
      ...dataset,
      points: dataset.points.map((point) =>
        point.id === pointId ? { ...point, [field]: value } : point,
      ),
    });
  };

  const addRow = () => {
    onDatasetChange({
      ...dataset,
      points: [
        ...dataset.points,
        {
          id: crypto.randomUUID(),
          exposure: "",
          arcHeight: "",
        },
      ],
    });
  };

  const removeRow = (pointId: string) => {
    if (dataset.points.length <= 4) {
      return;
    }

    onDatasetChange({
      ...dataset,
      points: dataset.points.filter((point) => point.id !== pointId),
    });
  };

  return (
    <section className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 print:text-slate-500">
            Input Data
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white print:text-slate-900">
            Exposure And Arc Height Table
          </h2>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border border-cyan-400/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/10 print:hidden"
        >
          Add Row
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300 print:text-slate-700">Dataset Name</span>
          <input
            value={dataset.name}
            onChange={(event) => onDatasetChange({ ...dataset, name: event.target.value })}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300 print:text-slate-700">Strip Type</span>
          <select
            value={dataset.stripType}
            onChange={(event) =>
              onDatasetChange({ ...dataset, stripType: event.target.value as StripType })
            }
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
          >
            {stripOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300 print:text-slate-700">
            Spec Min ({unit === "inch" ? "in" : "mm"})
          </span>
          <input
            inputMode="decimal"
            pattern="^[0-9]*[.]?[0-9]*$"
            value={dataset.specMin}
            onChange={(event) => onDatasetChange({ ...dataset, specMin: event.target.value })}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-300 print:text-slate-700">
            Spec Max ({unit === "inch" ? "in" : "mm"})
          </span>
          <input
            inputMode="decimal"
            pattern="^[0-9]*[.]?[0-9]*$"
            value={dataset.specMax}
            onChange={(event) => onDatasetChange({ ...dataset, specMax: event.target.value })}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
          />
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-900/80 print:bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">
                Exposure (T Multiplier)
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">
                Arc Height ({unit === "inch" ? "in" : "mm"})
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600 print:hidden">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {dataset.points.map((point, index) => (
              <tr key={point.id} className="border-t border-slate-800 print:border-slate-200">
                <td className="px-4 py-3">
                  <input
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    value={point.exposure}
                    onChange={(event) => updatePoint(point.id, "exposure", event.target.value)}
                    placeholder={`${2 ** index}`}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    inputMode="decimal"
                    pattern="^[0-9]*[.]?[0-9]*$"
                    value={point.arcHeight}
                    onChange={(event) => updatePoint(point.id, "arcHeight", event.target.value)}
                    placeholder={unit === "inch" ? "0.0140" : "0.356"}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400 print:border-slate-300 print:bg-white print:text-slate-900"
                  />
                </td>
                <td className="px-4 py-3 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeRow(point.id)}
                    disabled={dataset.points.length <= 4}
                    className="rounded-full border border-rose-400/40 px-3 py-2 text-xs font-semibold text-rose-100 transition enabled:hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
