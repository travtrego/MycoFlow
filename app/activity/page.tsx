"use client";

import { useApp } from "@/components/AppProvider";

export default function ActivityPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  return (
    <>
      <div className="top">
        <div>
          <h2 className="page-title">Activity</h2>
          <div className="page-sub">Recent cultivation events</div>
        </div>
        <div className="avatar">🕘</div>
      </div>
      <div className="detail-card">
        {state.activity.length ? (
          state.activity.map((a, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-dot" />
              <div>
                <b>{a.text}</b>
                <span>{a.sub || ""}</span>
              </div>
              <time>{a.date}</time>
            </div>
          ))
        ) : (
          <div className="empty-note">No activity yet.</div>
        )}
      </div>
    </>
  );
}
