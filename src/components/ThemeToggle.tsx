import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { HEADER_SECONDARY_BUTTON_CLASS } from "@/components/marketing/typography";

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? "light",
    () => "light",
  );
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`${HEADER_SECONDARY_BUTTON_CLASS} w-8 shrink-0 !px-0`}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("theme-preference", {
            detail: isDark ? "light" : "dark",
          }),
        )
      }
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
