"use client";

import {
  type ReactNode,
  useState,
} from "react";

type TimelineSectionProps = {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function TimelineSection({
  icon,
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: TimelineSectionProps) {
  const [isOpen, setIsOpen] =
    useState(defaultOpen);

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (previous) => !previous
          )
        }
        aria-expanded={isOpen}
        className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xl">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                {title}
              </h2>

              {badge && (
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {badge}
                </span>
              )}
            </div>

            <p className="mt-2 break-keep text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          <span
            aria-hidden="true"
            className={`mt-1 shrink-0 text-lg text-slate-400 transition-transform ${
              isOpen
                ? "rotate-180"
                : ""
            }`}
          >
            ⌄
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </section>
  );
}