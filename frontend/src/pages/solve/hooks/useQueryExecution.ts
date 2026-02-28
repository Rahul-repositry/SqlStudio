import { useState } from "react";
import axios from "axios";
import type { QueryResult, ApiResponse } from "../types.ts";

const BACKEND_URI = import.meta.env.VITE_BACKEND_URI as string;

interface UseQueryExecutionReturn {
  queryResult: QueryResult | null;
  isExecuting: boolean;
  error: string | null;
  executeQuery: (
    assignmentId: string | undefined,
    sqlQuery: string,
  ) => Promise<void>;
}

export const useQueryExecution = (): UseQueryExecutionReturn => {
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (
    assignmentId: string | undefined,
    sqlQuery: string,
  ): Promise<void> => {
    if (!sqlQuery.trim() || !assignmentId) return;

    setIsExecuting(true);
    setError(null);
    console.log("Executing query for assignment:", sqlQuery);
    try {
      const res = await axios.post<ApiResponse<QueryResult>>(
        `${BACKEND_URI}/api/submissions/execute`,
        {
          assignmentId,
          sqlQuery,
        },
      );
      console.log("Received query result:", res.data);
      if (res?.data?.data?.isSolved) {
        alert("Congratulations! You've solved the assignment!");
      }
      setQueryResult(res.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Execution failed. Check your SQL syntax.",
      );
      setQueryResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  return { queryResult, isExecuting, error, executeQuery };
};
