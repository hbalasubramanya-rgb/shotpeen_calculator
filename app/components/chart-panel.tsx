"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DatasetResult, UnitSystem, convertToUnit, formatArcHeight } from "@/app/lib/calculator";

type ChartPanelProps = {
  result: DatasetResult;
  unit: UnitSystem;
};

export function ChartPanel({ result, unit }: ChartPanelProps) {
  const chartData = result.chartPoints.map((point) => ({
    exposure: Number(point.exposure.toFixed(4)),
    measured:
      typeof point.measured === "number"
        ? Number(convertToUnit(point.measured, unit).toFixed(4))
        : null,
    fit: Number(convertToUnit(point.fit, unit).toFixed(4)),
  }));

  const saturationY =
    result.saturationPoint !== null
      ? convertToUnit(result.saturationPoint.arcHeightInch, unit)
      : undefined;
  const latestPoint = result.sortedPoints[result.sortedPoints.length - 1];
  const latestExposure = latestPoint?.exposure;

  return (
    <section className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 print:text-slate-500">
            Visualization
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white print:text-slate-900">
            Saturation Curve And Best-Fit Trend
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-3 print:border-slate-300 print:bg-slate-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Data Points
            </p>
            <p className="mt-1 text-lg font-semibold text-white print:text-slate-900">
              {result.validPoints.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-3 print:border-slate-300 print:bg-slate-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Spec Band
            </p>
            <p className="mt-1 text-lg font-semibold text-white print:text-slate-900">
              {result.specMinInch !== null && result.specMaxInch !== null ? "Loaded" : "Unset"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-3 print:border-slate-300 print:bg-slate-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Saturation Marker
            </p>
            <p className="mt-1 text-lg font-semibold text-white print:text-slate-900">
              {result.saturationPoint ? `${result.saturationPoint.exposure}T` : "--"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.92))] p-4 print:border-slate-300 print:bg-white">
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-300 print:text-slate-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-100" />
            Measured points
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
            <span className="h-2.5 w-8 rounded-full bg-cyan-400" />
            Log best-fit curve
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
            <span className="h-2.5 w-8 rounded-full bg-emerald-400/90" />
            Spec range band
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Saturation point
          </span>
        </div>

        <div className="h-[390px] w-full print:h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={320}>
            <ComposedChart margin={{ top: 16, right: 16, left: 8, bottom: 20 }} data={chartData}>
              <defs>
                <linearGradient id="fitArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="specBand" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.30} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.18} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.16)" strokeDasharray="4 4" />
              {result.specMinInch !== null && result.specMaxInch !== null ? (
                <ReferenceArea
                  y1={convertToUnit(result.specMinInch, unit)}
                  y2={convertToUnit(result.specMaxInch, unit)}
                  fill="url(#specBand)"
                  stroke="rgba(74,222,128,0.55)"
                  strokeOpacity={1}
                />
              ) : null}
              {result.specMinInch !== null ? (
                <ReferenceLine
                  y={convertToUnit(result.specMinInch, unit)}
                  stroke="rgba(74,222,128,0.70)"
                  strokeDasharray="6 4"
                />
              ) : null}
              {result.specMaxInch !== null ? (
                <ReferenceLine
                  y={convertToUnit(result.specMaxInch, unit)}
                  stroke="rgba(74,222,128,0.70)"
                  strokeDasharray="6 4"
                />
              ) : null}
              {result.saturationPoint !== null ? (
                <ReferenceLine
                  x={result.saturationPoint.exposure}
                  stroke="rgba(34,197,94,0.7)"
                  strokeDasharray="5 5"
                />
              ) : null}
              {latestExposure ? (
                <ReferenceLine
                  x={latestExposure}
                  stroke="rgba(148,163,184,0.35)"
                  strokeDasharray="3 5"
                />
              ) : null}
              <XAxis
                type="number"
                dataKey="exposure"
                stroke="#94a3b8"
                tickLine={false}
                domain={["dataMin", "dataMax"]}
              >
                <Label
                  value="Exposure Time (T multiplier)"
                  offset={-6}
                  position="insideBottom"
                  fill="#94a3b8"
                />
              </XAxis>
              <YAxis stroke="#94a3b8" tickLine={false} domain={["auto", "auto"]}>
                <Label
                  value={`Arc Height (${unit === "inch" ? "in" : "mm"})`}
                  position="insideLeft"
                  angle={-90}
                  fill="#94a3b8"
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                  backgroundColor: "#020617",
                  color: "#e2e8f0",
                }}
                formatter={(value, name) => {
                  const formattedValue =
                    typeof value === "number"
                      ? value.toFixed(unit === "inch" ? 4 : 3)
                      : `${value ?? "--"}`;

                  return [formattedValue, name === "measured" ? "Measured" : "Log Fit"];
                }}
                labelFormatter={(value) => `Exposure: ${value}T`}
              />
              <Area
                type="monotone"
                dataKey="fit"
                stroke="none"
                fill="url(#fitArea)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="fit"
                dot={false}
                stroke="#38bdf8"
                strokeWidth={3}
                isAnimationActive={false}
              />
              <Scatter dataKey="measured" fill="#f8fafc" isAnimationActive={false} />
              {result.saturationPoint !== null && saturationY !== undefined ? (
                <ReferenceDot
                  x={result.saturationPoint.exposure}
                  y={saturationY}
                  r={7}
                  fill="#22c55e"
                  stroke="#dcfce7"
                  strokeWidth={2}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4 print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Saturation Height
            </p>
            <p className="mt-2 text-xl font-semibold text-white print:text-slate-900">
              {result.saturationPoint
                ? formatArcHeight(result.saturationPoint.arcHeightInch, unit)
                : "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4 print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Last Exposure In Dataset
            </p>
            <p className="mt-2 text-xl font-semibold text-white print:text-slate-900">
              {latestExposure ? `${latestExposure}T` : "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4 print:border-slate-300 print:bg-white">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400 print:text-slate-500">
              Plot Note
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300 print:text-slate-700">
              The shaded green band marks the allowable intensity range, while the vertical dashed
              line highlights the detected saturation exposure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
