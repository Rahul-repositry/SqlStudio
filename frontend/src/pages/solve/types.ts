export interface Assignment {
  id: string;
  title: string;
  description: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  targetTable: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SandboxData {
  rows: Record<string, any>[];
  columns?: string[];
}

export interface QueryResult {
  rows: Record<string, any>[];
  isSolved?: boolean;
  message?: string;
  rowCount?: number;
  result?: object[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type ActiveTab = "results" | "schema";
