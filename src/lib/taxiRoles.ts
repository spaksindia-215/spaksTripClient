import type { UserRole } from "@/lib/authClient";

/** Partners and agents have taxi management access. */
export function isTaxiManagerRole(role: UserRole): boolean {
  return role === "partner" || role === "agent";
}
