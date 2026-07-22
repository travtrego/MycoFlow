export interface ModalFieldOption {
  value: string;
  label: string;
}

export interface ModalField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  value?: string | number;
  placeholder?: string;
  options?: ModalFieldOption[];
}

export type ModalValues = Record<string, string | number>;

export interface SheetAction {
  label: string;
  variant?: "default" | "secondary" | "danger";
  onClick: () => void;
}

export type SheetConfig =
  | {
      mode: "form";
      title: string;
      sub?: string;
      fields: ModalField[];
      submitLabel?: string;
      onSubmit: (values: ModalValues) => void;
    }
  | {
      mode: "actions";
      title: string;
      sub?: string;
      actions: SheetAction[];
    };
