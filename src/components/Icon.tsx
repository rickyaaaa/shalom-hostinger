import type { CSSProperties } from "react";

export function Icon({ name, className, style }: { name: "menu" | "close" | "user" | "chevron" | "star" | "check" | "arrow"; className?: string; style?: CSSProperties }) {
  const paths = {
    menu: <path d="M3 5h18M3 12h18M3 19h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    user: <><circle cx="10" cy="7" r="4" /><path d="M2 22v-3a8 8 0 0 1 13-6m4 0v8m-4-4h8" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    star: <path d="m12 2 3 6.3 7 .9-5.1 4.9 1.3 6.9-6.2-3.3L5.8 21l1.3-6.9L2 9.2l7-.9Z" />,
    check: <path d="m4 12 5 5L20 6" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return <svg className={className} style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
