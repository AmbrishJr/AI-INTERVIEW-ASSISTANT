/** Browser-local data is isolated by authenticated account. No credentials are stored here. */
let accountId = "guest";
const volatile = new Map<string, string | null>();
export function setLocalAccount(id: string | null) {
  accountId = id ?? "guest";
}
export function localKey(key: string) {
  return `aicoach:${accountId}:${key}`;
}
export function readLocal(key: string) {
  const scoped = localKey(key);
  try {
    return volatile.has(scoped) ? volatile.get(scoped)! : localStorage.getItem(scoped);
  } catch {
    return volatile.get(scoped) ?? null;
  }
}
export function writeLocal(key: string, value: string | null): boolean {
  const scoped = localKey(key);
  try {
    if (value === null) localStorage.removeItem(scoped);
    else localStorage.setItem(scoped, value);
    volatile.delete(scoped);
    return true;
  } catch {
    volatile.set(scoped, value);
    return false;
  }
}
const legacyKeys = [
  "sessionHistory",
  "sessionNotes",
  "dashboardGoals",
  "profileName",
];
export function hasLegacyData() {
  try {
    return (
      !localStorage.getItem("aicoach:legacy-imported") &&
      legacyKeys.some((key) => localStorage.getItem(key))
    );
  } catch {
    return false;
  }
}
export function importLegacyData() {
  if (accountId === "guest" || !hasLegacyData()) return false;
  try {
    for (const key of legacyKeys) {
      const value = localStorage.getItem(key);
      if (value !== null && readLocal(key) === null && !writeLocal(key, value))
        return false;
    }
    localStorage.setItem("aicoach:legacy-imported", "true");
    return true;
  } catch {
    return false;
  }
}
