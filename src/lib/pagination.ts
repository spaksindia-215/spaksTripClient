/**
 * Client-side pagination helpers for the public listing grids.
 *
 * PAGE_SIZE mirrors DEFAULT_PAGE_LIMIT in server/src/lib/pagination.ts. Keep the
 * two in sync — the client sends this explicitly rather than relying on the
 * server default, so a change here is what actually moves the page size.
 */

export const PAGE_SIZE = 25;

/** Envelope every paginated listing endpoint returns alongside `items`. */
export type PageInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/** Upper bound on pages a single fetchAllPages call will walk (safety valve). */
const MAX_PAGES = 40;

/**
 * Drains every page of a paginated endpoint into one array.
 *
 * Used by the grids that merge two or more independent sources (packages +
 * typed listings) into a single view. Server-side paging cannot compose across
 * merged sources — "page 2 of A" plus "page 2 of B" is not page 2 of the merged
 * grid — so those views fetch each source fully and paginate the merged array
 * client-side. Requests page 1 first, then fans out over the remaining pages.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{ items: T[]; pagination: PageInfo }>,
  limit = 100,
): Promise<T[]> {
  const first = await fetchPage(1, limit);
  const totalPages = Math.min(first.pagination?.totalPages ?? 1, MAX_PAGES);
  if (totalPages <= 1) return first.items;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2, limit)),
  );
  return [first.items, ...rest.map((r) => r.items)].flat();
}

/** Slices a fully-loaded array to one page. */
export function pageSlice<T>(items: T[], page: number, size = PAGE_SIZE): T[] {
  return items.slice((page - 1) * size, page * size);
}

/** Total pages for a fully-loaded array (floors at 1). */
export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}
