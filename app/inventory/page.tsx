"use client";

import { useApp } from "@/components/AppProvider";
import { inventoryTotal } from "@/lib/selectors";

export default function InventoryPage() {
  const { state, ready } = useApp();
  if (!ready) return null;

  const total = inventoryTotal(state);

  return (
    <>
      <div className="top">
        <div>
          <h2 className="page-title">Inventory</h2>
          <div className="page-sub">Dried stock currently on hand</div>
        </div>
        <div className="avatar">📦</div>
      </div>
      <div className="inventory-card">
        {Object.keys(state.inventory).length ? (
          Object.entries(state.inventory).map(([sp, g]) => (
            <div className="inventory-row" key={sp}>
              <div>
                <b>{sp}</b>
                <span>Current dried stock</span>
              </div>
              <strong>{g} g</strong>
            </div>
          ))
        ) : (
          <div className="empty-note">No dried inventory yet.</div>
        )}
      </div>
      <div className="total">
        <span>Total dried inventory</span>
        <b>{total} g</b>
      </div>

      <div className="section-head">
        <h3>Lifetime harvested</h3>
        <span>All-time dry yield</span>
      </div>
      <div className="inventory-card">
        {Object.keys(state.lifetimeInventory).length ? (
          Object.entries(state.lifetimeInventory).map(([sp, g]) => (
            <div className="inventory-row" key={sp}>
              <div>
                <b>{sp}</b>
                <span>Across all completed flushes</span>
              </div>
              <strong>{g} g</strong>
            </div>
          ))
        ) : (
          <div className="empty-note">No completed flushes yet.</div>
        )}
      </div>
    </>
  );
}
