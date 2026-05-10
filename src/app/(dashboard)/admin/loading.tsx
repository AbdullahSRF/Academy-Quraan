import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminSectionLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="جاري التحميل">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-muted-bg" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted-bg" />
        ))}
      </div>
      <Card className="border-border">
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded bg-muted-bg" />
          <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded bg-muted-bg" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted-bg" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-muted-bg" />
        </CardContent>
      </Card>
    </div>
  );
}
