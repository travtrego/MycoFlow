"use client";

import { useApp } from "./AppProvider";

export function Toast() {
  const { toastMsg } = useApp();
  return <div className={`toast${toastMsg ? " show" : ""}`}>{toastMsg}</div>;
}
