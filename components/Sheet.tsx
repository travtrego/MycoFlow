"use client";

import { useState } from "react";
import { useApp } from "./AppProvider";
import type { ModalValues } from "@/lib/sheet-types";

function FormFields({
  fields,
  values,
  setValues,
}: {
  fields: Extract<NonNullable<ReturnType<typeof useApp>["sheet"]>, { mode: "form" }>["fields"];
  values: ModalValues;
  setValues: (v: ModalValues) => void;
}) {
  return (
    <div>
      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={`field-${f.key}`}>{f.label}</label>
          {f.type === "select" ? (
            <select
              id={`field-${f.key}`}
              value={values[f.key] ?? f.options?.[0]?.value ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`field-${f.key}`}
              type={f.type}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues({
                  ...values,
                  [f.key]: f.type === "number" ? e.target.valueAsNumber || 0 : e.target.value,
                })
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function Sheet() {
  const { sheet, closeSheet } = useApp();
  const [values, setValues] = useState<ModalValues>({});

  if (!sheet) return null;

  const handleClose = () => {
    setValues({});
    closeSheet();
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{sheet.title}</h3>
        {sheet.sub && <div className="sheet-sub">{sheet.sub}</div>}
        {sheet.mode === "form" ? (
          <>
            <FormFields fields={sheet.fields} values={values} setValues={setValues} />
            <div className="sheet-buttons">
              <button className="btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => {
                  const merged: ModalValues = { ...values };
                  sheet.fields.forEach((f) => {
                    if (!(f.key in merged)) {
                      merged[f.key] = f.value ?? (f.type === "select" ? f.options?.[0]?.value ?? "" : "");
                    }
                  });
                  sheet.onSubmit(merged);
                  setValues({});
                }}
              >
                {sheet.submitLabel || "Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="action-btns">
              {sheet.actions.map((a) => (
                <button
                  key={a.label}
                  className={`action-btn${a.variant === "secondary" ? " secondary" : ""}${
                    a.variant === "danger" ? " danger" : ""
                  }`}
                  onClick={a.onClick}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div className="sheet-buttons" style={{ marginTop: 14 }}>
              <button className="btn-cancel" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
