interface SampleRow {
  id: number;
  name: string;
  salary: number | null;
  // If rows can have any dynamic fields, use: [key: string]: any;
}

// 2. Define the viewer object that contains table metadata
interface SampleDataViewer {
  _id: string;
  tableName: string;
  columns: string[];
  sampleRows: SampleRow[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  targetTable: string;
  sampleDataViewer?: SampleDataViewer[];
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

export type ActiveTab = "results" | "schema" | "expected";
