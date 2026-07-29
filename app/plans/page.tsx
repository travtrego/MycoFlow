import type { Metadata } from "next";
import { BUILD_ORDER, CHAPTERS, CROSS_CUTTING, MATRIX, PLAN_META, SOURCES, type Eco } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Future Plans — MycoFlow",
  description: "Dreamer Systems Revision C engineering disposition and build order.",
};

function EcoItem({ eco }: { eco: Eco }) {
  return (
    <details className={`eco eco-${eco.decision}`}>
      <summary>
        <div className="eco-meta">
          <span className="eco-id">{eco.id}</span>
          <span className="eco-sev">{eco.severity}</span>
          <span className="eco-decision">{eco.decision === "accept" ? "Accept" : "Revert"}</span>
        </div>
        <b>{eco.title}</b>
      </summary>
      <p className="eco-finding">{eco.finding}</p>
      <div className="eco-spec">
        <small>Revision C specification</small>
        <p>{eco.spec}</p>
      </div>
    </details>
  );
}

export default function PlansPage() {
  return (
    <>
      <div className="top">
        <div>
          <h2 className="page-title">Future Plans</h2>
          <div className="page-sub">
            {PLAN_META.program} · {PLAN_META.revision}
          </div>
        </div>
        <div className="avatar">⬡</div>
      </div>

      <div className="plan-hero">
        <div className="eyebrow">{PLAN_META.document}</div>
        <h3>{PLAN_META.headline}</h3>
        <p>{PLAN_META.deck}</p>
        <div className="plan-stats">
          {PLAN_META.stats.map((stat) => (
            <div className="plan-stat" key={stat.label}>
              <b className={`tone-${stat.tone}`}>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="plan-status">{PLAN_META.status}</div>
      </div>

      <div className="section-head">
        <h3>Disposition rules</h3>
        <span>{PLAN_META.date}</span>
      </div>
      <div className="detail-card">
        <p className="plan-lede">{PLAN_META.rules}</p>
      </div>

      <div className="section-head">
        <h3>Cross-cutting decisions</h3>
        <span>4 items</span>
      </div>
      <div className="eco-list">
        {CROSS_CUTTING.map((eco) => (
          <EcoItem eco={eco} key={eco.id} />
        ))}
      </div>

      {CHAPTERS.map((chapter) => (
        <section key={chapter.num}>
          <div className="plan-chapter">
            <div className="plan-num">{chapter.num}</div>
            <div>
              <h3>{chapter.name}</h3>
              <div className="plan-role">{chapter.role}</div>
              <p>{chapter.intro}</p>
            </div>
          </div>
          <div className="eco-list">
            {chapter.items.map((eco) => (
              <EcoItem eco={eco} key={eco.id} />
            ))}
          </div>
        </section>
      ))}

      <div className="section-head">
        <h3>Final disposition</h3>
        <span>19 proposals</span>
      </div>
      <div className="detail-card">
        {MATRIX.map((row) => (
          <div className={`matrix-row matrix-${row.tone}`} key={row.item}>
            <div className="matrix-head">
              <b>{row.item}</b>
              <span>{row.decision}</span>
            </div>
            <p>{row.action}</p>
          </div>
        ))}
      </div>

      <div className="section-head">
        <h3>Build order</h3>
        <span>9 steps</span>
      </div>
      <div className="detail-card">
        <ol className="plan-seq">
          {BUILD_ORDER.map((step, i) => (
            <li key={step.title}>
              <span className="plan-step">S{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{step.title}</b>
                <span>{step.detail}</span>
                {step.gate ? <span className="plan-gate">Gate: {step.gate}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="section-head">
        <h3>Technical basis</h3>
        <span>Source checks</span>
      </div>
      <div className="detail-card">
        {SOURCES.map((source) => (
          <div className="plan-source" key={source.source}>
            <b>{source.source}</b>
            <span>{source.note}</span>
          </div>
        ))}
      </div>

      <div className="plan-closer">
        <p>Accept what makes the prototype measurable.</p>
        <p>Revert what only sounds more engineered.</p>
        <p className="plan-closer-on">Build one chamber. Prove the air.</p>
      </div>
    </>
  );
}
