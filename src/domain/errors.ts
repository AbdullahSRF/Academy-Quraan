/** خطأ نطاق يُعاد لطبقة التطبيق أو الـ Action بدل رمي أخطاء Prisma خامة للمستخدم. */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
