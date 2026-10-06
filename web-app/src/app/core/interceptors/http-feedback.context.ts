import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SUPPRESS_GLOBAL_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);

export function suppressGlobalErrorNotification(): HttpContext {
  return new HttpContext().set(SUPPRESS_GLOBAL_ERROR_NOTIFICATION, true);
}
