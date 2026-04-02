"use client";

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  ComposedChart,
  Label,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";

import { DatasetResult, UnitSystem, convertToUnit, formatArcHeight } from "@/app/lib/calculator";

type ChartPanelProps = {
  result: DatasetResult;
  unit: UnitSystem;
};

export function ChartPanel({ result, unit }: ChartPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = result.chartPoints.map((point) => ({
    exposure: Number(point.exposure.toFixed(4)),
    measured:
      typeof point.measured === "number" ? Number(convertToUnit(point.measured, unit).toFixed(4)) : null,
    fit: Number(convertToUnit(point.fit, unit).toFixed(4)),
  }));

  const saturationY =
    result.saturationPoint !== null
      ? convertToUnit(result.saturationPoint.arcHeightInch, unit)
      : undefined;

  return (
    <section className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] print:border-slate-300 print:bg-white print:shadow-none">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 print:text-slate-500">
          Visualization
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white print:text-slate-900">
          Saturation Curve And Best-Fit Trend
        </h2>
      </div>

      <div className="h-[360px] w-full print:h-[320px]">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={320}>
            <ComposedChart margin={{ top: 16, right: 16, left: 8, bottom: 20 }} data={chartData}>
              <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="4 4" />
              {result.specMinInch !== null && result.specMaxInch !== null ? (
                <ReferenceArea
                  y1={convertToUnit(result.specMinInch, unit)}
                  y2={convertToUnit(result.specMaxInch, unit)}
                  fill="rgba(16,185,129,0.10)"
                  strokeOpacity={0}
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
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-sm text-slate-300 print:border-slate-300 print:bg-slate-50 print:text-slate-700">
            Chart initializes in the browser and is included in the printed report.
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300 print:text-slate-700">
        <span className="rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
          White markers: measured points
        </span>
        <span className="rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
          Cyan curve: logarithmic best fit
        </span>
        <span className="rounded-full border border-slate-700 px-3 py-2 print:border-slate-300">
          Green marker: saturation point {result.saturationPoint ? `(${formatArcHeight(result.saturationPoint.arcHeightInch, unit)})` : ""}
        </span>
      </div>
    </section>
  );
}
