"use client";

import { useEffect, useState } from "react";

export type PortalUser = { id: string; name?: string | null; email: string; role: "CLIENT" | "CONSULTANT" | "ADMIN" };
export type SessionState = { user: PortalUser | null; configured: boolean; loading: boolean; error: string | null };
export type Question = { id: string; reference: string; subject: string; body: string; category: string; status: string; name?: string; email?: string; contactName?: string; contactEmail?: string; createdAt: string };
export type ResponseRecord = { id: string; body: string; sources: string; risks: string; assumptions: string; analysisDate: string; consultantId?: string; status?: string; publishedAt?: string | null; createdAt?: string };
export type QuestionEvent = { id: string; status?: string; toStatus?: string; type?: string; note?: string; createdAt: string };
export type QuestionDetail = { question: Question; responses: ResponseRecord[]; events: QuestionEvent[] };
export type Consultation = { id: string; reference?: string; name?: string; email?: string; contactName?: string; contactEmail?: string; topic: string; clientNotes?: string; notes?: string; status: string; preferredAt: string; confirmedAt?: string | null; meetingUrl?: string | null; createdAt: string };
export type ManagedContent = { id: string; slug: string; kind: "lesson" | "study" | "market" | "faq"; title: string; excerpt: string; body: string; level?: number | null; category: string; readMinutes: number; publishedAt?: string | null; author: string; featured?: boolean; status: "DRAFT" | "PUBLISHED" };

export const categories = [
  ["GENERAL_EDUCATION", "Getting started & general education"],
  ["COMPANY_RESEARCH", "Understanding a company"],
  ["SECTOR_ANALYSIS", "Sectors & market behavior"],
  ["VALUATION", "Valuation methods"],
  ["RISK_MANAGEMENT", "Understanding investment risk"],
  ["CONSULTATION_REQUEST", "Educational session"],
] as const;

export function displayLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers }, cache: "no-store" });
  let data: Record<string, unknown>;
  try { data = await response.json(); } catch { throw new Error("The service could not be reached. Please try again shortly."); }
  if (!response.ok) {
    const message = typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : "We could not complete that request. Please try again.";
    throw new Error(message);
  }
  return data as T;
}

export function usePortalSession(): SessionState {
  const [state, setState] = useState<SessionState>({ user: null, configured: false, loading: true, error: null });
  useEffect(() => {
    let active = true;
    apiRequest<{ user: PortalUser | null; configured: boolean }>("/api/session")
      .then((data) => { if (active) setState({ ...data, loading: false, error: null }); })
      .catch((error: Error) => { if (active) setState({ user: null, configured: false, loading: false, error: error.message }); });
    return () => { active = false; };
  }, []);
  return state;
}

export function pakistanDate(value?: string | null, includeTime = true) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", ...(includeTime ? { timeStyle: "short" as const } : {}) }).format(new Date(value)) + (includeTime ? " PKT" : "");
}

export function localPakistanInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function pakistanInputToIso(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Enter a valid Pakistan date and time.");
  const date = new Date(`${value}:00+05:00`);
  if (Number.isNaN(date.getTime()) || localPakistanInput(date.toISOString()) !== value) throw new Error("Enter a valid Pakistan date and time.");
  return date.toISOString();
}

export function pakistanToday() {
  return localPakistanInput(new Date().toISOString()).slice(0, 10);
}

export function safeMeetingUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function authErrorMessage(code: string) {
  const messages: Record<string, string> = {
    Verification: "That sign-in link has expired or has already been used. Request a new link below.",
    RateLimit: "Too many sign-in requests. Please wait before requesting another link.",
    InvalidEmail: "Enter a valid email address that you control.",
    ServiceUnavailable: "Email sign-in is temporarily unavailable. Please try again shortly.",
    EmailSignInError: "The sign-in email could not be sent. Please check your address and try again."
  };
  return messages[code] ?? "We could not complete sign-in. Request a new link or try again shortly.";
}
