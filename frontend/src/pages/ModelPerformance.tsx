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
import { Trophy } from "lucide-react";
import { modelService } from "../api/services";
import { useFetch } from "../hooks/useAsync";
import {
  Card,
  CardHeader,
  CardSkeleton,
  ErrorState,
  PageHeader,
  chartGrid,
  chartTick,
  tooltipBox,
} from "../components/ui";
import { Reveal } from "../components/motion";
import { fmtLacs, fmtNum } from "../utils/format";

export default function ModelPerformance() {
  const compare = useFetch(() => modelService.compare());
  const metrics = useFetch(() => modelService.metrics());

  if (compare.loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={4} />
      </div>
    );
  }
  if (compare.error) {
    return <ErrorState message={compare.error} onRetry={compare.reload} />;
  }

  const entries = compare.data?.comparison ?? [];
  const five = entries.filter((e) => e.stage === "training_stage");
  const served = entries.find((e) => e.selected);
  const extras = entries.filter(
    (e) => e.stage !== "training_stage" && !e.selected,
  );
  const r2Chart = five.map((e) => ({
    model: e.model,
    r2: e.validation_r2 ?? 0,
  }));
  const rmseChart = five.map((e) => ({
    model: e.model,
    rmse: e.validation_rmse_lacs ?? 0,
  }));
  const m = metrics.data;

  return (
    <div>
      <PageHeader
        eyebrow="Measured Results"
        title="Model Performance"
        description="Measured results from the training and optimisation stages — grouped 70/15/15 split, log-target, test partition scored once per selected model. Served model: the optimisation-stage XGBoost (E01)."
      />

      {served && (
        <Reveal>
        <Card className="relative mb-4 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
            aria-hidden
          />
          <CardHeader
            title={`${served.model}`}
            subtitle="Selected and served by the API — chosen in the optimisation stage"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/30 bg-gradient-to-r from-indigo-500/25 to-violet-500/25 px-3 py-1 text-[11px] font-semibold text-indigo-200 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                <Trophy className="h-3 w-3" />
                SERVED
              </span>
            }
          />
          <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4">
            {[
              ["Validation R²", served.validation_r2?.toFixed(4)],
              ["Test R² (once)", served.test_r2?.toFixed(4)],
              ["Test MAE", served.test_mae_lacs != null ? fmtLacs(served.test_mae_lacs) : undefined],
              ["Test RMSE", served.test_rmse_lacs != null ? fmtLacs(served.test_rmse_lacs) : undefined],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="num mt-1 font-display text-[22px] font-semibold text-slate-50">{value ?? "—"}</p>
              </div>
            ))}
          </div>
          {m && (
            <p className="border-t border-white/[0.06] px-5 py-3 text-xs leading-relaxed text-slate-400">
              Grouped cross-validation R² {m.metrics.grouped_cv.r2_mean.toFixed(4)} ±{" "}
              {m.metrics.grouped_cv.r2_std.toFixed(4)} · test MAPE{" "}
              {fmtNum(m.metrics.test.mape_pct, 1)}% · median absolute error{" "}
              {fmtLacs(m.metrics.test.median_ae_lacs)} · hyperparameters: depth{" "}
              {m.hyperparameters.max_depth}, learning rate{" "}
              {fmtNum(m.hyperparameters.learning_rate, 3)}, 1,154 trees.
            </p>
          )}
        </Card>
        </Reveal>
      )}

      <Reveal delay={0.06}>
      <Card>
        <CardHeader
          title="Candidate models — training stage"
          subtitle="Validation metrics after tuning (or baseline where untuned); MAPE and training time are the measured baseline values"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-xs font-medium text-slate-400">
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Val R²</th>
                <th className="px-5 py-3 font-medium">Val MAE</th>
                <th className="px-5 py-3 font-medium">Val RMSE</th>
                <th className="px-5 py-3 font-medium">Baseline MAPE</th>
                <th className="px-5 py-3 font-medium">CV R²</th>
                <th className="px-5 py-3 font-medium">Train time</th>
              </tr>
            </thead>
            <tbody>
              {five.map((e) => (
                <tr key={e.model} className="border-b border-white/[0.05] transition-all duration-200 last:border-0 hover:translate-x-[3px] hover:bg-indigo-400/[0.06]">
                  <td className="px-5 py-3 font-medium capitalize text-slate-100">
                    {e.model.replace("_regression", "").replace("_forest", " forest")}
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {e.tuned ? "Tuned candidate" : "Baseline only"}
                  </td>
                  <td className="num px-5 py-3 text-slate-200">{e.validation_r2?.toFixed(4) ?? "—"}</td>
                  <td className="num px-5 py-3 text-slate-200">{fmtLacs(e.validation_mae_lacs)}</td>
                  <td className="num px-5 py-3 text-slate-200">{fmtLacs(e.validation_rmse_lacs)}</td>
                  <td className="num px-5 py-3 text-slate-200">
                    {e.validation_mape_pct != null ? `${e.validation_mape_pct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="num px-5 py-3 text-slate-200">
                    {e.cv_r2_mean != null
                      ? `${e.cv_r2_mean.toFixed(3)} ± ${e.cv_r2_std?.toFixed(3)}`
                      : "—"}
                  </td>
                  <td className="num px-5 py-3 text-slate-200">
                    {e.baseline_train_time_s != null
                      ? `${e.baseline_train_time_s.toFixed(1)}s`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-white/[0.06] px-5 py-3 text-[11px] leading-relaxed text-slate-500">
          {compare.data?.note} The training-stage winner (tuned XGBoost) was
          superseded by the optimisation-stage champion above on validation
          RMSE under the same grouped protocol.
        </p>
      </Card>
      </Reveal>

      <Reveal delay={0.12}>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Validation R² by model" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r2Chart}>
                <defs>
                  <linearGradient id="r2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="model" tick={chartTick} axisLine={{ stroke: chartGrid }} tickLine={false} />
                <YAxis domain={[0, 1]} tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipBox}
                  cursor={{ fill: "rgba(129,140,248,0.07)" }}
                  formatter={(v: number) => [v.toFixed(4), "Validation R²"]}
                />
                <Bar dataKey="r2" radius={[4, 4, 0, 0]} animationDuration={850}>
                  {r2Chart.map((_, i) => (
                    <Cell key={i} fill="url(#r2Grad)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Validation RMSE by model (₹ lakh — lower is better)" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rmseChart}>
                <defs>
                  <linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="model" tick={chartTick} axisLine={{ stroke: chartGrid }} tickLine={false} />
                <YAxis tick={chartTick} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipBox}
                  cursor={{ fill: "rgba(52,211,153,0.07)" }}
                  formatter={(v: number) => [`₹${v.toFixed(2)} L`, "Validation RMSE"]}
                />
                <Bar dataKey="rmse" radius={[4, 4, 0, 0]} animationDuration={850}>
                  {rmseChart.map((_, i) => (
                    <Cell key={i} fill="url(#rmseGrad)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </Reveal>

      {extras.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Additional measured evaluations" subtitle="Other real evaluations recorded during the stages" />
          <div className="divide-y divide-white/[0.05]">
            {extras.map((e) => (
              <div key={e.model} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm transition-colors duration-200 hover:bg-white/[0.02]">
                <span className="text-slate-200">{e.model}</span>
                <span className="num text-slate-400">
                  {e.test_r2 != null
                    ? `R² ${e.test_r2.toFixed(4)} · RMSE ${fmtLacs(e.test_rmse_lacs)}`
                    : `Validation R² ${e.validation_r2?.toFixed(4)}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
