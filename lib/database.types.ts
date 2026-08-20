/**
 * Hand-written to match supabase/schema.sql.
 *
 * Small enough to keep honest by hand, and it makes inserts type-checked
 * rather than `any`. If the schema grows, replace this file with:
 *
 *   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRow = {
  login: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  public_repos: number;
  github_created_at: string | null;
  url: string | null;
  total_stars: number;
  merged_total: number;
  upstream_total: number;
  upstream_owner_count: number;
  last90: number;
  orgs: string[];
  langs: Json;
  days: Json;
  repos: Json;
  links: Json;
  score: number;
  score_parts: Json;
  status: string;
  source: string;
  submitted_ip_hash: string | null;
  fetched_at: string;
  created_at: string;
};

export type PatchRow = {
  id: number;
  login: string;
  repo: string;
  owner: string;
  number: number;
  title: string;
  url: string;
  merged_at: string | null;
};

export type RemovalRow = {
  id: number;
  login: string;
  reason: string | null;
  contact: string | null;
  handled: boolean;
  created_at: string;
};

export type SubmissionRow = {
  id: number;
  ip_hash: string;
  login: string | null;
  created_at: string;
};

export type SponsorInquiryRow = {
  id: number;
  name: string;
  email: string;
  company_url: string | null;
  message: string | null;
  ip_hash: string | null;
  handled: boolean;
  created_at: string;
};

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Partial<ProfileRow> & Pick<ProfileRow, "login" | "name">
      >;
      patches: Table<PatchRow, Omit<PatchRow, "id">>;
      removal_requests: Table<
        RemovalRow,
        Pick<RemovalRow, "login"> & Partial<RemovalRow>
      >;
      submissions: Table<
        SubmissionRow,
        Pick<SubmissionRow, "ip_hash"> & Partial<SubmissionRow>
      >;
      sponsor_inquiries: Table<
        SponsorInquiryRow,
        Pick<SponsorInquiryRow, "name" | "email"> & Partial<SponsorInquiryRow>
      >;
    };
    Views: Record<never, never>;
    Functions: {
      wall: {
        Args: { limit_n?: number; per_person?: number };
        Returns: {
          login: string;
          name: string;
          avatar: string | null;
          repo: string;
          owner: string;
          number: number;
          title: string;
          url: string;
          merged_at: string | null;
        }[];
      };
      board_totals: {
        Args: Record<string, never>;
        Returns: {
          contributors: number;
          upstream: number;
          stars: number;
          repos: number;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
