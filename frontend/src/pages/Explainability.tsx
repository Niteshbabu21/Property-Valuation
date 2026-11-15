import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import PropertyForm from "../components/PropertyForm";
import Waterfall from "../components/Waterfall";
import { modelService, valuationService } from "../api/services";
import { useAsync, useFetch } from "../hooks/useAsync";
import type { Contribution, PropertyFeatures } from "../types/api";
import {
  Card,
  CardHeader,
  CardSkeleton,
  ErrorState,
  PageHeader,
  chartGrid,
  tooltipBox,
} from "../components/ui";
import { Reveal } from "../components/motion";
import { fmtLacs } from "../utils/format";
import { loadLastProperty, saveLastProperty } from "../utils/storage";

function ContributionRow({ c }: { c: Contribution }) {
  const up = c.shap_log > 0;
  return (
    <div className="group flex items-center justify-between border-b border-white/[0.05] py-2.5 transition-all duration-200 last:border-0 hover:translate-x-[3px] hover:bg-white/[0.03]">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
            up
              ? "bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 text-emerald-300 ring-emerald-300/30"
              : "bg-gradient-to-br from-rose-500/30 to-rose-500/10 text-rose-300 ring-rose-300/30"
          }`}
        >
          {up ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </span>
        <div>
          <p className="text-sm text-slate-100">{c.feature}</p>
          <p className="text-xs text-slate-500">{String(c.value ?? "—")}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`num text-sm font-medium ${up ? "text-emerald-300" : "text-rose-300"}`}>
          ×{c.price_factor.toFixed(2)}
        </p>
        <p className="num text-xs text-slate-500">
          {up ? "+" : ""}
          {c.shap_log.toFixed(3)} log
        </p>
      </div>
    </div>
  );
}

export default function Explainability() {
  const explain = useAsync(async (f: PropertyFeatures) =>
    valuationService.explain(f),
  );
  const global = useFetch(() => modelService.shapSummary());
  const data = explain.data;

  const onSubmit = async (features: PropertyFeatures) => {
    saveLastProperty(features);
    await explain.run(features);
  };

  const chartData = (global.data?.ranking ?? []).map((r) => ({
    feature: r.feature,
    importance: r.mean_abs_shap_log,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="SHAP Explainability"
        title="AI Explainability"
        description="SHAP explanations for the served model. Local contributions are computed per property by the backend's TreeExplainer; the global ranking is the model's precomputed SHAP summary over a documented 2,000-property sample."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Explain a property" subtitle="POST /api/valuation/explain" />
          <div className="px-5 py-5">
            <PropertyForm
              initial={loadLastProperty()}
              onSubmit={onSubmit}
              submitting={explain.loading}
              submitLabel="Generate explanation"
            />
            {explain.error && (
              <div className="mt-4">
                <ErrorState message={explain.error} />
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Global feature importance"
            subtitle="Mean |SHAP| in log space · GET /api/models/shap-summary"
          />
          {global.loading && (
            <div className="px-5 py-4">
              <CardSkeleton rows={5} />
            </div>
          )}
          {global.error && (
            <p className="px-5 py-4 text-sm text-rose-300">{global.error}</p>
          )}
          {global.data && (
            <div className="h-80 px-3 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 16 }}>
                  <defs>
                    <linearGradient id="shapGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                    <linearGradient id="shapGradDim" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3d4a6b" />
                      <stop offset="100%" stopColor="#5b6b94" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#8b98b8", fontSize: 11 }} axisLine={{ stroke: chartGrid }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="feature"
                    tick={{ fill: "#c3cbdf", fontSize: 10 }}
                    width={130}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipBox}
                    cursor={{ fill: "rgba(129,140,248,0.07)" }}
                    formatter={(v: number) => [v.toFixed(3), "mean |SHAP|"]}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} animationDuration={850}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i < 3 ? "url(#shapGrad)" : "url(#shapGradDim)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {global.data && (
            <p className="border-t border-white/[0.06] px-5 py-3 text-[11px] leading-relaxed text-slate-500">
              Baseline (SHAP base value): {global.data.base_value_log.toFixed(3)} log ≈{" "}
              {fmtLacs(global.data.baseline_price_lacs)}. {global.data.provenance}
            </p>
          )}
        </Card>
      </div>

      {data && (
        <Reveal>
        <div className="mt-4 space-y-4">
          <Card>
            <CardHeader
              title="Local explanation"
              subtitle={`${data.property.LOCALITY}, ${data.property.CITY} — predicted ${fmtLacs(data.prediction.predicted_price_lacs)} vs baseline ${fmtLacs(data.baseline_price_lacs)}`}
              action={
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    data.additivity.verified
                      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300"
                      : "border-rose-300/30 bg-rose-400/10 text-rose-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      data.additivity.verified
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                        : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]"
                    }`}
                  />
                  Additivity {data.additivity.verified ? "verified" : "failed"} · err{" "}
                  {data.additivity.abs_error.toExponential(1)}
                </span>
              }
            />
            <div className="px-5 py-4">
              <Waterfall
                baseValueLog={data.base_value_log}
                contributions={data.contributions}
              />
              <p className="mt-2 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-slate-300">
                {data.explanation}
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Raised the price" subtitle="Positive SHAP contributions" />
              <div className="px-5 py-2">
                {data.top_positive.length ? (
                  data.top_positive.map((c) => (
                    <ContributionRow key={c.feature} c={c} />
                  ))
                ) : (
                  <p className="py-4 text-sm text-slate-400">None.</p>
                )}
              </div>
            </Card>
            <Card>
              <CardHeader title="Lowered the price" subtitle="Negative SHAP contributions" />
              <div className="px-5 py-2">
                {data.top_negative.length ? (
                  data.top_negative.map((c) => (
                    <ContributionRow key={c.feature} c={c} />
                  ))
                ) : (
                  <p className="py-4 text-sm text-slate-400">None.</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="All 20 feature contributions" subtitle="Aggregated to source features from the encoded model space; price factor = exp(SHAP)" />
            <div className="grid grid-cols-1 gap-x-8 px-5 py-2 md:grid-cols-2">
              {data.contributions.map((c) => (
                <ContributionRow key={c.feature} c={c} />
              ))}
            </div>
          </Card>
        </div>
        </Reveal>
      )}
    </div>
  );
}
