import type { Metadata } from "next";
import { BUILD_ORDER, CLOSER, PLAN_META, PROGRAM_WIDE, SECTIONS, SOURCES, type Spec } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Future Plans — MycoFlow",
  description: "Dreamer Systems Revision C — chamber program specification and build order.",
};

function SpecCard({ item }: { item: Spec }) {
  return (
    <div className="spec">
      <div className="spec-meta">
        <span className={`spec-level level-${item.level.toLowerCase()}`}>{item.level}</span>
        <span className="spec-ref">{item.ref}</span>
      </div>
      <b className="spec-title">{item.title}</b>
      <p className="spec-body">{item.spec}</p>
      <details className="spec-why">
        <summary>Why</summary>
        <p>{item.why}</p>
      </details>
    </div>
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
        <div className="eyebrow">Chamber program</div>
        <h3>{PLAN_META.headline}</h3>
        <p>{PLAN_META.deck}</p>
        <div className="plan-stats">
          {PLAN_META.stats.map((stat) => (
            <div className="plan-stat" key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="plan-status">{PLAN_META.status}</div>
      </div>

      <div className="section-head">
        <h3>Source documents</h3>
        <span>{PLAN_META.date}</span>
      </div>
      <div className="detail-card plan-files">
        <a href="/docs/dreamer-systems-revision-c.pdf" download>
          <b>Revision C — PDF</b>
          <span>Full disposition, print layout · 58 KB</span>
        </a>
        <a href="/docs/dreamer-systems-revision-c.html" download>
          <b>Revision C — HTML</b>
          <span>Full disposition, original web layout · 32 KB</span>
        </a>
      </div>

      <div className="section-head">
        <h3>Program-wide</h3>
        <span>{PROGRAM_WIDE.length} specs</span>
      </div>
      <div className="spec-list">
        {PROGRAM_WIDE.map((item) => (
          <SpecCard item={item} key={item.ref} />
        ))}
      </div>

      {SECTIONS.map((section) => (
        <section key={section.num}>
          <div className="plan-chapter">
            <div className="plan-num">{section.num}</div>
            <div>
              <h3>{section.name}</h3>
              <div className="plan-role">{section.role}</div>
              <p>{section.intro}</p>
            </div>
          </div>
          <div className="spec-list">
            {section.items.map((item) => (
              <SpecCard item={item} key={item.ref} />
            ))}
          </div>
        </section>
      ))}

      <div className="section-head">
        <h3>Build order</h3>
        <span>{BUILD_ORDER.length} steps</span>
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
        {CLOSER.map((line, i) => (
          <p key={line} className={i === CLOSER.length - 1 ? "plan-closer-on" : undefined}>
            {line}
          </p>
        ))}
      </div>
    </>
  );
}
