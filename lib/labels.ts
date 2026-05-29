import type { ApplicationStage, JobStatus, UserRole } from "@/types/domain";

export const roleLabels: Record<UserRole, string> = {
  guest: "Gost",
  candidate: "Kandidat",
  company: "Firma",
  admin: "Upravljanje"
};

export const roleHomes: Record<Exclude<UserRole, "guest">, string> = {
  candidate: "/profil",
  company: "/firma",
  admin: "/admin"
};

export const jobStatusLabels: Record<JobStatus, string> = {
  draft: "Nacrt",
  pending_review: "Čeka pregled",
  active: "Aktivan",
  paused: "Pauziran",
  rejected: "Odbijen",
  expired: "Istekao"
};

export const stageLabels: Record<ApplicationStage, string> = {
  applied: "Nova prijava",
  review: "Pregled",
  interview: "Razgovor",
  shortlist: "Uži izbor",
  offer: "Ponuda",
  hired: "Zaposlen",
  rejected: "Odbijeno"
};

export const stageOrder: ApplicationStage[] = [
  "applied", "review", "interview", "shortlist", "offer", "hired", "rejected"
];

/** Shared ATS label options — used in ats-client and ats-detail-panel */
export const ATS_LABEL_OPTS = [
  { key: "top"       as const, label: "Top kandidat",     labelShort: "Top",         color: "#22c55e" },
  { key: "interview" as const, label: "Za intervju",      labelShort: "Intervju",    color: "#f59e0b" },
  { key: "rejected"  as const, label: "Ne odgovara",      labelShort: "Ne odgovara", color: "#ef4444" },
  { key: "followup"  as const, label: "Provjeri kasnije", labelShort: "Kasniji",     color: "#a78bfa" },
  { key: "star"      as const, label: "Zvjezdica",        labelShort: "Zvjezdica",   color: "#3b82f6" },
] as const;

export type AtsLabelKey = typeof ATS_LABEL_OPTS[number]["key"];
