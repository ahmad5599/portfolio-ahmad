"use client";

import type { ATSScoreResult } from "@/lib/pdf/ats-scorer";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function scoreColor(percentage: number) {
  if (percentage >= 85) return { ring: "border-green-500", text: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" };
  if (percentage >= 70) return { ring: "border-blue-500", text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" };
  if (percentage >= 55) return { ring: "border-amber-500", text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" };
  return { ring: "border-red-500", text: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" };
}

function gradeColor(grade: string) {
  if (grade === "A") return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (grade === "B") return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
  if (grade === "C") return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  if (grade === "D") return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

function priorityDot(p: string) {
  if (p === "high") return "bg-red-500";
  if (p === "medium") return "bg-amber-500";
  return "bg-slate-400";
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ATSScoreCard() {
  const [result, setResult] = useState<ATSScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ats-score");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data: ATSScoreResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load score");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">ATS Compatibility Score</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How well your CV is optimized for Applicant Tracking Systems
            {result && !loading && (
              <span className="ml-2 text-muted-foreground/70">· scored {timeAgo(result.scoredAt)}</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchScore}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Scoring…" : "Refresh Score"}
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && !result && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Computing score…
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Score hero */}
            {(() => {
              const colors = scoreColor(result.percentage);
              return (
                <div className={`flex flex-col items-center gap-4 rounded-xl border-2 p-6 sm:flex-row sm:gap-8 ${colors.ring} ${colors.bg}`}>
                  {/* Big number */}
                  <div className="flex shrink-0 flex-col items-center">
                    <span className={`text-6xl font-extrabold leading-none ${colors.text}`}>
                      {result.totalScore}
                    </span>
                    <span className="mt-1 text-sm font-medium text-muted-foreground">
                      out of {result.maxScore}
                    </span>
                  </div>

                  {/* Grade + message */}
                  <div className="text-center sm:text-left">
                    <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                      <span className={`rounded-md px-2.5 py-1 text-base font-bold ${gradeColor(result.grade)}`}>
                        Grade {result.grade}
                      </span>
                      <span className={`text-sm font-semibold ${colors.text}`}>
                        {result.percentage}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>
                </div>
              );
            })()}

            {/* Category breakdown */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Score Breakdown</h3>
              <div className="space-y-3">
                {result.categories.map((cat) => {
                  const pct = Math.round((cat.score / cat.maxScore) * 100);
                  return (
                    <div key={cat.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{cat.name}</span>
                        <span className={cat.perfect ? "font-semibold text-green-600" : "text-muted-foreground"}>
                          {cat.score}/{cat.maxScore}{cat.perfect ? " ✓" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 85 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  Improvements ({result.improvements.length})
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Sorted by highest impact first. Address high-priority items to see the biggest score gains.
                </p>
                <div className="space-y-2">
                  {result.improvements.map((imp, i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
                    >
                      <div className="mt-1.5 shrink-0">
                        <span className={`block h-2 w-2 rounded-full ${priorityDot(imp.priority)}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {imp.category}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                            +{imp.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{imp.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.improvements.length === 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                🎉 Perfect score! Your CV is fully optimized — no improvements needed.
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Tip: After saving updates to your profile, experience, projects, or certifications — click <strong>Refresh Score</strong> to see your new score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
