"use client";

import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import type { ModalValues } from "@/lib/sheet-types";

export function Fab() {
  const { openSheet, closeSheet, addCulture, addBatchDirect, toast } = useApp();
  const router = useRouter();

  const openNewCultureForm = () => {
    openSheet({
      mode: "form",
      title: "New culture",
      sub: "Add an agar plate or liquid culture jar.",
      submitLabel: "Add culture",
      fields: [
        { key: "species", label: "Species", type: "text", placeholder: "e.g. Golden Teacher" },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "agar", label: "Agar" },
            { value: "lc", label: "Liquid culture" },
          ],
        },
        {
          key: "storage",
          label: "Storage",
          type: "select",
          options: [
            { value: "room", label: "Room temperature" },
            { value: "fridge", label: "Refrigerated" },
          ],
        },
        { key: "qty", label: "Quantity", type: "number", value: 1 },
      ],
      onSubmit: (v: ModalValues) => {
        if (!v.species) {
          toast("Enter a species name");
          return;
        }
        const id = addCulture({
          species: String(v.species),
          type: v.type === "lc" ? "lc" : "agar",
          storage: v.storage === "fridge" ? "fridge" : "room",
          qty: Number(v.qty) || 1,
        });
        closeSheet();
        toast(`${id} added`);
      },
    });
  };

  const openNewBatchForm = () => {
    openSheet({
      mode: "form",
      title: "New batch",
      sub: "Start a grain jar/bag batch from spores, print, or an unlisted culture.",
      submitLabel: "Start batch",
      fields: [
        { key: "species", label: "Species", type: "text", placeholder: "e.g. B+" },
        { key: "qty", label: "Jars / bags", type: "number", value: 4 },
        {
          key: "unit",
          label: "Unit",
          type: "select",
          options: [
            { value: "jars", label: "Jars" },
            { value: "bags", label: "Bags" },
          ],
        },
      ],
      onSubmit: (v: ModalValues) => {
        if (!v.species) {
          toast("Enter a species name");
          return;
        }
        const id = addBatchDirect(String(v.species), Number(v.qty) || 1, String(v.unit || "jars"));
        closeSheet();
        router.push(`/batches/${id}`);
        toast(`${id} started`);
      },
    });
  };

  const openActionSheet = () => {
    openSheet({
      mode: "actions",
      title: "Add to lab",
      sub: "What are you starting?",
      actions: [
        {
          label: "New culture (agar / LC)",
          onClick: () => {
            closeSheet();
            openNewCultureForm();
          },
        },
        {
          label: "New batch (grain inoculation)",
          onClick: () => {
            closeSheet();
            openNewBatchForm();
          },
        },
      ],
    });
  };

  return (
    <button className="fab" onClick={openActionSheet} aria-label="Add">
      +
    </button>
  );
}
