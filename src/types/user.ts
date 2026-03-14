export interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  industry: string | null;
  salesStyle: SalesStyle;
  createdAt: string;
  updatedAt: string;
}

export type SalesStyle = "aggressive" | "defensive" | "friendly";

export interface UserProfile {
  name: string;
  company: string;
  jobTitle: string;
  industry: string;
  salesStyle: SalesStyle;
}
