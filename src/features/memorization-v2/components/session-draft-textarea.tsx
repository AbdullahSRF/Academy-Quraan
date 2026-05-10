"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved";

function readFormStudentAndDate(formId: string): { studentId: string; date: string } {
  if (typeof document === "undefined") return { studentId: "", date: "" };
  const form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) return { studentId: "", date: "" };
  const fd = new FormData(form);
  return {
    studentId: String(fd.get("studentId") ?? ""),
    date: String(fd.get("sessionDate") ?? ""),
  };
}

export function SessionDraftTextarea({
  id,
  name,
  label,
  formId,
  field,
  defaultDate,
  initialStudentId,
  defaultValue,
  maxLength,
  placeholder,
  className,
}: {
  id: string;
  name: string;
  label: string;
  /** نموذج الحصة (يُقرأ منه الطالب والتاريخ لبناء مفتاح المسودة). */
  formId: string;
  field: "homework" | "notes";
  defaultDate: string;
  initialStudentId?: string;
  defaultValue: string;
  maxLength: number;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [parts, setParts] = React.useState(() => ({
    studentId: initialStudentId ?? "",
    date: defaultDate,
  }));

  const storageKey = React.useMemo(
    () => `academy-session-${field}-${parts.date || defaultDate}-${parts.studentId || "none"}`,
    [field, parts.date, parts.studentId, defaultDate],
  );

  React.useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    const sync = () => setParts(readFormStudentAndDate(formId));
    sync();
    form.addEventListener("change", sync);
    form.addEventListener("input", sync);
    return () => {
      form.removeEventListener("change", sync);
      form.removeEventListener("input", sync);
    };
  }, [formId]);

  /** عند تغيّر الطالب/التاريخ: تحميل مسودة المفتاح أو مسودة الخادم للواجب عند تطابق الطالب المبدئي. */
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setValue(stored);
        return;
      }
      if (field === "homework" && initialStudentId && parts.studentId === initialStudentId) {
        setValue(defaultValue);
        return;
      }
      setValue("");
    } catch {
      /* ignore */
    }
  }, [storageKey, field, parts.studentId, initialStudentId, defaultValue]);

  React.useEffect(() => {
    setSaveState("saving");
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        /* ignore */
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1400);
    }, 650);
    return () => window.clearTimeout(t);
  }, [value, storageKey]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {saveState === "saving" ? (
          <span className="text-xs font-bold text-muted">جارٍ الحفظ…</span>
        ) : saveState === "saved" ? (
          <span className="text-xs font-bold text-primary">تم الحفظ</span>
        ) : null}
      </div>
      <Textarea
        id={id}
        name={name}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="min-h-[88px] resize-y"
      />
    </div>
  );
}
