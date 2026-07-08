import type { CabOffer, CabType } from "@/lib/mock/cabs";

export type { CabOffer, CabType };

export type CabSearchInput = {
  from: string;
  to: string;
  date: string;
};

export async function searchCabs(input: CabSearchInput): Promise<CabOffer[]> {
  void input;
  return [];
}

export async function getCab(id: string): Promise<CabOffer | null> {
  void id;
  return null;
}
