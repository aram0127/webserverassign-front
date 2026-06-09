export interface User {
  id: number;
  email: string;
  name: string;
  role: "developer" | "client";
}

export interface Project {
  id: number;
  title: string;
  clientId: number;
  clientName: string;
  deadline: string;
  dDay: { value: number; label: string };
  employmentType: "contract" | "resident";
  employmentTypeLabel: string;
  budget: number;
  budgetKind: string;
  projectCategory: string;
  planningStatus: string;
  meetingRegion: string;
  workDescription: string;
  workMethod: string;
  estimatedDuration: string;
  status: "open" | "closed";
  statusLabel: string;
  applicantCount: number;
  fields: string[];
  skills: string[];
  createdAt: string;
}
