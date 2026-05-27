import type { UserProfile } from "../types";
import { IDENTITY_TEMPLATES } from "../constants/identityTemplates";

/** Profilden paylaşım / takımyıldızı için tek kimlik metni (HomeScreen ile aynı mantık). */
export function getIdentitySentence(profile: UserProfile): string {
  const tmpl = profile.identityTagId
    ? IDENTITY_TEMPLATES.find((t) => t.id === profile.identityTagId)
    : null;
  const fromTemplate = tmpl?.identityStatement?.trim();
  const why = profile.habitWhy?.trim();
  if (fromTemplate) return fromTemplate;
  if (why) return why;
  return `${profile.habitName} yolunda ilerliyorsun.`;
}
