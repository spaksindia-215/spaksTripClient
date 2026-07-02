export function toDisplayName(email: string): string {
  const localPart = email.split("@")[0] ?? "";

  return localPart
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
