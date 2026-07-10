export function DashboardIcon({ name }: { name: string }) {
  const common = {
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "dashboard") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "reports") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <rect x="7" y="11" width="3" height="5" rx="1" />
        <rect x="12" y="7" width="3" height="9" rx="1" />
        <rect x="17" y="4" width="3" height="12" rx="1" />
      </svg>
    );
  }

  if (name === "models") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="M12 12 4 7.5" />
        <path d="m12 12 8-4.5" />
        <path d="M12 12v9" />
      </svg>
    );
  }

  if (name === "dataset" || name === "database") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
        <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
      </svg>
    );
  }

  if (name === "questions") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.2 9a3 3 0 1 1 4.9 2.3c-.9.6-1.4 1.1-1.4 2.2" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "access") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "clipboard") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4a3 3 0 0 1 6 0" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (name === "document") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    );
  }

  if (name === "model") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="m4.9 4.9 2.1 2.1" />
        <path d="m17 17 2.1 2.1" />
        <path d="m19.1 4.9-2.1 2.1" />
        <path d="m7 17-2.1 2.1" />
      </svg>
    );
  }

  if (name === "warning") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="m12 3 10 18H2z" />
        <path d="M12 9v5" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
