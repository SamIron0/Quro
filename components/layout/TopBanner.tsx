"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DISMISS_KEY = "quro:new-ml-bank-banner:dismissed";

export function TopBanner() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const wasDismissed = window.localStorage.getItem(DISMISS_KEY) === "true";
    setIsVisible(!wasDismissed);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!pathname?.includes("/cos325/python_mcq")) return;

    window.localStorage.setItem(DISMISS_KEY, "true");
    setIsVisible(false);
  }, [pathname]);

  const dismissBanner = () => {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setIsVisible(false);
  };

  if (!isReady || !isVisible) return null;

  return (
    <div className="border-b border-[#c9a84c]/40 bg-[#fff8e7] text-[#6b4e00] dark:border-[#c9a84c]/30 dark:bg-[#3a2f14] dark:text-[#f0dda0]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p className="text-sm">
          New Machine Learning question bank is now live.
          {" "}
          <Link
            href="/courses/cos325/python_mcq/setup"
            className="font-semibold underline decoration-2 underline-offset-2 hover:opacity-80"
          >
            Start practicing
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss announcement"
          className="group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c9a84c]/40 bg-white/70 text-[#7a5b00] shadow-sm transition-all duration-200 hover:border-[#b7912f] hover:bg-white hover:text-[#5f4700] hover:shadow dark:border-[#c9a84c]/30 dark:bg-black/20 dark:text-[#f3df9d] dark:hover:border-[#ddbf63] dark:hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8e7] dark:focus-visible:ring-offset-[#3a2f14]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-105"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
