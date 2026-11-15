import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, BrainCircuit, Coins, ShieldAlert } from "lucide-react";
import PropertyForm from "../components/PropertyForm";
import { riskService, valuationService } from "../api/services";
import { useAsync } from "../hooks/useAsync";
import type { PropertyFeatures, RiskData, ValuationData } from "../types/api";
import { Card, CardHeader, ErrorState, PageHeader } from "../components/ui";
import { CountUp, SPRING } from "../components/motion";
import { fmtDateTime, fmtLacs } from "../utils/format";
import { loadLastProperty, saveLastProperty } from "../utils/storage";

export default function Valuation() {
  const [result, setResult] = useState<ValuationData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const predict = useAsync(
    async (features: PropertyFeatures) => valuationService.predict(features),
  );

  const onSubmit = async (features: PropertyFeatures) => {
    saveLastProperty(features);
    setRisk(null);
    const out = await predict.run(features);
    setResult(out);
    if (out) {
      // Calibrated uncertainty for this price band comes from the risk API.
      riskService
        .assess(features, out.predicted_price_lacs)
        .then(setRisk)
        .catch(() => setRisk(null));
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="ML Valuation"
        title="Property Valuation"
        description="Enter the property's model features. The estimate is produced by the served XGBoost model through the Flask API — nothing is simulated in the browser."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Property features"
            subtitle="Prefilled with a sample Bengaluru listing — edit any field"
          />
          <div className="px-5 py-5">
            <PropertyForm
              initial={loadLastProperty()}
              onSubmit={onSubmit}
              submitting={predict.loading}
              submitLabel="Estimate price"
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Valuation result" subtitle="From POST /api/valuation/predict" />
            <div className="px-5 py-5">
              {predict.error && <ErrorState message={predict.error} />}
              {!predict.error && !result && (
                <p className="text-sm leading-relaxed text-slate-400">
                  Submit the form to receive the model's estimate, its
                  calibrated uncertainty for the price band, and links to the
                  full explanation, risk and tokenisation views.
                </p>
              )}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={SPRING}
                >
                  <p className="eyebrow">Estimated price</p>
                  <p className="num text-gradient mt-2 font-display text-[44px] font-bold leading-none tracking-tight drop-shadow-[0_0_24px_rgba(139,92,246,0.35)]">
                    <CountUp
                      value={result.predicted_price_lacs}
                      format={fmtLacs}
                      duration={0.9}
                    />
                  </p>
                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Model</dt>
                      <dd className="text-slate-100">{result.model_id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Predicted at</dt>
                      <dd className="text-slate-100">{fmtDateTime(result.timestamp)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Request ID</dt>
                      <dd className="max-w-[140px] truncate text-slate-100">
                        {result.request_id}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-400">History</dt>
                      <dd className="flex items-center gap-1.5 text-slate-100">
                        {result.history_saved ? (
                          <>
                            <BadgeCheck className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                            Saved
                          </>
                        ) : (
                          "Not saved (database unavailable)"
                        )}
                      </dd>
                    </div>
                  </dl>
                  {risk?.uncertainty && (
                    <div className="mt-4 rounded-xl border border-indigo-300/20 bg-indigo-400/[0.07] px-4 py-3">
                      <p className="text-xs font-medium text-indigo-200">
                        Calibrated prediction uncertainty
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        For properties in this predicted price band, 80% of the
                        served model's held-out test errors were within{" "}
                        <span className="font-medium text-slate-100">
                          ±{risk.uncertainty.calibrated_ape_p80_pct.toFixed(1)}%
                        </span>{" "}
                        (calibrated on {risk.uncertainty.calibration_n} untouched
                        test properties).
                      </p>
                    </div>
                  )}
                  <div className="mt-5 grid grid-cols-1 gap-2">
                    <Link
                      to="/explainability"
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-400/[0.07] hover:shadow-[0_10px_24px_rgba(168,85,247,0.18)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/35 to-violet-500/10 text-violet-300 ring-1 ring-violet-300/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                        <BrainCircuit className="h-4 w-4" />
                      </span>
                      Explain this valuation (SHAP)
                      <span className="ml-auto text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-300">→</span>
                    </Link>
                    <Link
                      to="/risk"
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-amber-400/[0.07] hover:shadow-[0_10px_24px_rgba(251,191,36,0.15)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/30 to-amber-400/10 text-amber-300 ring-1 ring-amber-300/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                      Assess property risk
                      <span className="ml-auto text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-amber-300">→</span>
                    </Link>
                    <Link
                      to="/tokenisation"
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-sm text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/[0.07] hover:shadow-[0_10px_24px_rgba(34,211,238,0.16)]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/30 to-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                        <Coins className="h-4 w-4" />
                      </span>
                      Calculate token supply
                      <span className="ml-auto text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-300">→</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
