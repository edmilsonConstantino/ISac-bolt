// src/components/ui/date-input.tsx
// Masked DD/MM/YYYY input that auto-advances between segments
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string; // YYYY-MM-DD (empty string = no date)
  onChange: (value: string) => void; // emits YYYY-MM-DD or ""
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
}

function toParts(yyyymmdd: string): [string, string, string] {
  if (!yyyymmdd) return ["", "", ""];
  const [y, m, d] = yyyymmdd.split("-");
  return [d ?? "", m ?? "", y ?? ""];
}

function fromParts(dd: string, mm: string, yyyy: string): string {
  if (!dd && !mm && !yyyy) return "";
  // Only emit full date when all parts are complete
  if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

export function DateInput({ value, onChange, className, disabled, hasError, id }: DateInputProps) {
  const [dd, setDd] = useState("");
  const [mm, setMm] = useState("");
  const [yyyy, setYyyy] = useState("");

  const ddRef = useRef<HTMLInputElement>(null);
  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  // Sync from external value
  useEffect(() => {
    const [d, m, y] = toParts(value);
    setDd(d);
    setMm(m);
    setYyyy(y);
  }, [value]);

  const emit = (d: string, m: string, y: string) => {
    onChange(fromParts(d, m, y));
  };

  const handleDd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDd(raw);
    emit(raw, mm, yyyy);
    if (raw.length === 2) mmRef.current?.focus();
  };

  const handleMm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMm(raw);
    emit(dd, raw, yyyy);
    if (raw.length === 2) yyyyRef.current?.focus();
  };

  const handleYyyy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYyyy(raw);
    emit(dd, mm, raw);
  };

  // Backspace from mm → focus dd, from yyyy → focus mm
  const handleMmKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && mm === "") ddRef.current?.focus();
  };
  const handleYyyyKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && yyyy === "") mmRef.current?.focus();
  };

  const baseSegment =
    "bg-transparent border-none outline-none text-slate-800 font-semibold text-sm placeholder-slate-400 p-0 m-0 leading-none";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 w-full h-12 pl-11 pr-4 border-2 rounded-xl transition-all",
        hasError ? "border-red-500 bg-red-50" : "border-slate-200 bg-white",
        "focus-within:ring-2 focus-within:ring-[#F5821F]/20 focus-within:border-[#F5821F]",
        disabled && "opacity-60 pointer-events-none bg-slate-50",
        className
      )}
    >
      <input
        ref={ddRef}
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        value={dd}
        onChange={handleDd}
        disabled={disabled}
        className={cn(baseSegment, "w-7 text-center")}
        maxLength={2}
        autoComplete="off"
      />
      <span className="text-slate-400 font-semibold text-sm select-none">/</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={mm}
        onChange={handleMm}
        onKeyDown={handleMmKey}
        disabled={disabled}
        className={cn(baseSegment, "w-7 text-center")}
        maxLength={2}
        autoComplete="off"
      />
      <span className="text-slate-400 font-semibold text-sm select-none">/</span>
      <input
        ref={yyyyRef}
        type="text"
        inputMode="numeric"
        placeholder="AAAA"
        value={yyyy}
        onChange={handleYyyy}
        onKeyDown={handleYyyyKey}
        disabled={disabled}
        className={cn(baseSegment, "w-12 text-center")}
        maxLength={4}
        autoComplete="off"
      />
    </div>
  );
}
