import { useSyncExternalStore } from "react";
import type { BrowserLocationHook } from "wouter/use-browser-location";
type Guard = (proceed: () => void) => void;
let guard: Guard | null = null;
export function clearNavigationGuard() {
  guard = null;
}
export function requestGuardedAction(action: () => void) {
  if (guard)
    guard(() => {
      guard = null;
      action();
    });
  else action();
}
export function registerNavigationGuard(next: Guard) {
  guard = next;
  return () => {
    if (guard === next) guard = null;
  };
}
let currentUrl = window.location.pathname + window.location.search;
let index = Number(window.history.state?.aicoachIndex ?? 0);
window.history.replaceState(
  { ...window.history.state, aicoachIndex: index },
  "",
  currentUrl,
);
const listeners = new Set<() => void>();
let restoring: (() => void) | null = null;
let bypassPop = false;
const notify = () => {
  currentUrl = window.location.pathname + window.location.search;
  index = Number(window.history.state?.aicoachIndex ?? index);
  listeners.forEach((fn) => fn());
};
window.addEventListener("popstate", () => {
  if (restoring) {
    const fn = restoring;
    restoring = null;
    fn();
    return;
  }
  if (bypassPop || !guard) {
    bypassPop = false;
    notify();
    return;
  }
  const target = Number(window.history.state?.aicoachIndex);
  const delta = target - index;
  if (Number.isFinite(target) && delta !== 0) {
    const activeGuard = guard;
    restoring = () =>
      activeGuard(() => {
        bypassPop = true;
        window.history.go(delta);
      });
    window.history.go(-delta);
  } else {
    const destination = window.location.pathname + window.location.search;
    window.history.replaceState(
      { ...window.history.state, aicoachIndex: index },
      "",
      currentUrl,
    );
    guard(() => commit(destination));
  }
});
function commit(
  to: string | URL,
  options?: { replace?: boolean; state?: unknown },
) {
  const nextIndex = options?.replace ? index : index + 1;
  window.history[options?.replace ? "replaceState" : "pushState"](
    {
      ...(typeof options?.state === "object" && options.state
        ? options.state
        : {}),
      aicoachIndex: nextIndex,
    },
    "",
    to,
  );
  notify();
  window.scrollTo({ top: 0 });
}
const navigate: ReturnType<BrowserLocationHook>[1] = (to, options) => {
  if (String(to) === currentUrl) return;
  if (guard) guard(() => commit(to, options));
  else commit(to, options);
};
export const useGuardedLocation: BrowserLocationHook = () => {
  const path = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => currentUrl.split("?")[0],
  );
  return [path, navigate];
};
