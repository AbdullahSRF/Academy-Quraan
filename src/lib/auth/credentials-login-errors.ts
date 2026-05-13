import { CredentialsSignin } from "next-auth";

/** بريد غير صالح أو كلمة مرور فارغة (فشل التحقق قبل قاعدة البيانات). */
export class InvalidLoginFormSignin extends CredentialsSignin {
  code = "invalid_form";
}

/** بريد/كلمة مرور خاطئة، أو لا يوجد حساب بهذا البريد، أو لا توجد كلمة مرور مسجّلة. */
export class InvalidCredentialsSignin extends CredentialsSignin {
  code = "invalid_credentials";
}

/** الحساب معطّل من الإدارة. */
export class AccountDisabledSignin extends CredentialsSignin {
  code = "account_disabled";
}

/** الحساب ليس بدور مشرف — المنصة للمشرفين فقط. */
export class NotAdminSignin extends CredentialsSignin {
  code = "not_admin";
}
