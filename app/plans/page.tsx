import type { Metadata } from "next";
import { APPROACHES, CLOSER, DECISION_LENS, PORTFOLIO_META, type Block, type Figure } from "@/lib/dreamer";

export const metadata: Metadata = {
  title: "Future Plans — MycoFlow",
  description: "Dreamer Systems concept portfolio — Integrated Cube, AX-80 Adaptive Airframe, and the 3-Chamber Platform.",
};

function FigureCard({ figure }: { figure: Figure }) {
  return (
    <a className="fig" href={figure.src} target="_blank" rel="noreferrer">
      <div className="fig-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={figure.src} alt={figure.caption} loading="lazy" decoding="async" />
      </div>
      <div className="fig-cap">
        <b>{figure.caption}</b>
        <span>{figure.note}</span>
      </div>
    </a>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "facts") {
    return (
      <div className="blk">
        <h4>{block.title}</h4>
        <dl className="blk-facts">
          {block.items.map((item) => (
            <div key={item.k}>
              <dt>{item.k}</dt>
              <dd>{item.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (block.kind === "list") {
    return (
      <div className="blk">
        <h4>{block.title}</h4>
        <ul className="blk-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {block.note ? <p className="blk-note">{block.note}</p> : null}
      </div>
    );
  }

  if (block.kind === "steps") {
    return (
      <div className="blk">
        <h4>{block.title}</h4>
        <ol className="blk-steps">
          {block.items.map((item, i) => (
            <li key={item.t}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{item.t}</b>
                <small>{item.d}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="blk">
      <h4>{block.title}</h4>
      <div className="blk-scroll">
        <table className="blk-table">
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            {PORTFOLIO_META.program} · {PORTFOLIO_META.doc}
          </div>
        </div>
        <div className="avatar">⬡</div>
      </div>

      <div className="plan-hero">
        <div className="eyebrow">Three design approaches</div>
        <h3>{PORTFOLIO_META.headline}</h3>
        <p>{PORTFOLIO_META.deck}</p>
        <div className="plan-status">
          <b>Recommended sequence</b>
          {PORTFOLIO_META.sequence}
        </div>
      </div>

      <div className="section-head">
        <h3>Source documents</h3>
        <span>{PORTFOLIO_META.date}</span>
      </div>
      <div className="detail-card plan-files">
        {PORTFOLIO_META.files.map((file) => (
          <a href={file.href} download key={file.href}>
            <b>{file.label}</b>
            <span>{file.note}</span>
          </a>
        ))}
      </div>

      {APPROACHES.map((approach) => (
        <section key={approach.num}>
          <div className="plan-chapter">
            <div className="plan-num">{approach.num}</div>
            <div>
              <h3>{approach.name}</h3>
              <div className="plan-role">{approach.approach}</div>
              <p>{approach.tagline}</p>
              <div className="plan-tags">
                {approach.optimizes.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="fig-list">
            {approach.figures.map((figure) => (
              <FigureCard figure={figure} key={figure.src} />
            ))}
          </div>

          <div className="blk-list-wrap">
            {approach.blocks.map((block) => (
              <BlockView block={block} key={block.title} />
            ))}
          </div>
        </section>
      ))}

      <div className="section-head">
        <h3>Decision lens</h3>
        <span>Side by side</span>
      </div>
      <div className="detail-card">
        <div className="blk-scroll">
          <table className="blk-table lens">
            <thead>
              <tr>
                {DECISION_LENS.head.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_LENS.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
