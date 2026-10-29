import { describe, expect, it } from "vitest";
import { authErrorMessage, localPakistanInput, pakistanInputToIso, safeMeetingUrl } from "./portal-client";

describe("appointment display and link safety", () => {
  it("converts Pakistan wall-clock times across a UTC date boundary", () => {
    expect(pakistanInputToIso("2026-10-29T01:30")).toBe("2026-10-28T20:30:00.000Z");
    expect(localPakistanInput("2026-10-28T20:30:00.000Z")).toBe("2026-10-29T01:30");
  });
  it("rejects invalid calendar dates instead of silently moving an appointment", () => {
    expect(() => pakistanInputToIso("2026-02-30T10:00")).toThrow();
    expect(() => pakistanInputToIso("2026-10-29T25:00")).toThrow();
    expect(() => pakistanInputToIso("2026-10-29")).toThrow();
    expect(pakistanInputToIso("")).toBeNull();
  });
  it("allows an ordinary HTTPS meeting URL", () => {
    expect(safeMeetingUrl("https://meet.google.com/abc-defg-hij")).toBe("https://meet.google.com/abc-defg-hij");
  });
  it.each(["javascript:alert(1)", "data:text/html,test", "http://meet.example.com/room", "https://name:secret@example.com/room", "not a URL"])("does not render an unsafe meeting link: %s", value => {
    expect(safeMeetingUrl(value)).toBeNull();
  });
  it("shows a useful throttling message without surfacing server error details", () => {
    expect(authErrorMessage("RateLimit")).toContain("wait");
    expect(authErrorMessage("unexpected-sensitive-error")).not.toContain("unexpected-sensitive-error");
  });
});
