import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntakeField } from "@shared/intakeSchema";

type AnswerValue = string | string[] | number | undefined;

export function IntakeFieldInput({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: AnswerValue;
  onChange: (val: AnswerValue) => void;
}) {
  const labelEl = (
    <label className="block text-sm font-semibold text-[#1C3D5A] mb-1.5">
      {field.label}
      {field.required && <span className="text-amber-700 ml-1">*</span>}
    </label>
  );

  switch (field.type) {
    case "text":
    case "number":
    case "date":
      return (
        <div>
          {labelEl}
          <Input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white"
          />
          {field.help && <p className="text-xs text-slate-500 mt-1">{field.help}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          {labelEl}
          <Textarea
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="bg-white"
          />
          {field.help && <p className="text-xs text-slate-500 mt-1">{field.help}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          {labelEl}
          <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "radio":
      return (
        <div>
          {labelEl}
          <div className="grid gap-2 sm:grid-cols-2">
            {(field.options ?? []).map((o) => {
              const active = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange(o.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    active
                      ? "border-amber-600 bg-amber-50 text-[#1C3D5A]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "checkbox": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      const toggle = (v: string) =>
        onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
      return (
        <div>
          {labelEl}
          <div className="grid gap-2 sm:grid-cols-2">
            {(field.options ?? []).map((o) => {
              const active = arr.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
                    active
                      ? "border-amber-600 bg-amber-50 text-[#1C3D5A]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      active ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300"
                    }`}
                  >
                    {active ? "✓" : ""}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case "scale": {
      const min = field.min ?? 0;
      const max = field.max ?? 10;
      const current = typeof value === "number" ? value : Number(value ?? min);
      return (
        <div>
          {labelEl}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => {
              const active = current === n && value !== undefined && value !== "";
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
                    active
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
