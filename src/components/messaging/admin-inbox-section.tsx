import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countUnreadAdminMessages, listAdminMessagesForUser } from "@/features/admin-messages/data";
import { markAdminInboxMessageReadFormAction } from "@/features/admin-messages/actions";

export async function AdminInboxSection({ userId }: { userId: string }) {
  const [unread, messages] = await Promise.all([
    countUnreadAdminMessages(userId),
    listAdminMessagesForUser(userId, 15),
  ]);

  if (messages.length === 0 && unread === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">رسائل الإدارة</CardTitle>
          {unread > 0 ? (
            <Badge variant="warning" className="font-bold">
              {unread} غير مقروء
            </Badge>
          ) : null}
        </div>
        <CardDescription>تنبيهات وملاحظات من المشرف على حسابك.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm font-bold text-muted">لا توجد رسائل بعد.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-bold text-foreground">{m.title}</p>
                  <span className="text-xs font-bold text-muted" dir="ltr">
                    {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm font-bold text-muted">{m.body}</p>
                {!m.readAt ? (
                  <form action={markAdminInboxMessageReadFormAction} className="mt-2">
                    <input type="hidden" name="messageId" value={m.id} />
                    <Button type="submit" size="sm" variant="outline" className="font-bold">
                      تعيين كمقروء
                    </Button>
                  </form>
                ) : (
                  <p className="mt-2 text-xs font-bold text-emerald-700">مقروءة</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
