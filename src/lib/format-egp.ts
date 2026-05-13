/**
 * تنسيق مبالغ بالجنيه المصري: الرقم أولًا بأرقام لاتينية (0–9)، ثم «ج.م».
 * يحوّل أرقامًا عربية/فارسية في النص المدخل إلى لاتينية قبل التحليل.
 */

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXT_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function normalizeDigitChars(s: string): string {
  let out = "";
  for (const ch of s) {
    const i = ARABIC_INDIC.indexOf(ch);
    if (i !== -1) {
      out += String(i);
      continue;
    }
    const j = EXT_ARABIC_INDIC.indexOf(ch);
    if (j !== -1) {
      out += String(j);
      continue;
    }
    out += ch;
  }
  return out;
}

function parseAmountString(raw: string): number {
  const cleaned = normalizeDigitChars(raw.trim()).replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** مبلغ بأرقام إنجليزية فقط (بدون لاحقة العملة). */
export function toLatinDigitsAmount(amount: string | number | { toString(): string } | null | undefined): string {
  if (amount == null || amount === "") return "0";
  const raw = typeof amount === "object" ? amount.toString() : String(amount);
  const n = parseAmountString(raw);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

/** مثل: `200 ج.م` أو `200 ج.م شهريًا`. */
export function formatEgp(
  amount: string | number | { toString(): string } | null | undefined,
  options?: { monthly?: boolean },
): string {
  const num = toLatinDigitsAmount(amount);
  const base = `${num} ج.م`;
  return options?.monthly ? `${base} شهريًا` : base;
}
