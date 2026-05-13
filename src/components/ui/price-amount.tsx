import { cn } from "@/lib/utils";

type PriceAmountProps = {
  children: React.ReactNode;
  className?: string;
};

/** عرض مبلغ أو سعر باتجاه RTL (مناسب لـ «200 ج.م» والأرقام مع النص العربي). */
export function PriceAmount({ children, className }: PriceAmountProps) {
  return (
    <span dir="rtl" className={cn("inline-block tabular-nums", className)}>
      {children}
    </span>
  );
}
