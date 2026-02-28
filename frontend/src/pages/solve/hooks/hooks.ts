import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { ApiResponse, Assignment, SandboxData } from "../types.ts";

const BACKEND_URI = import.meta.env.VITE_BACKEND_URI as string;

interface UseAssignmentDataReturn {
  assignment: Assignment | null;
  sandboxData: SandboxData | null;
  error: string | null;
  loading: boolean;
}

export const useAssignmentData = (): UseAssignmentDataReturn => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPageData = async (): Promise<void> => {
      try {
        setLoading(true);

        // 1. Fetch Assignment Details
        const assignRes = await axios.get<ApiResponse<Assignment>>(
          `${BACKEND_URI}/api/assignments/${id}`,
        );
        const assignData = assignRes.data.data;
        console.log("Fetched Assignment Data:", assignData);

        setAssignment(assignData);

        // 2. Fetch Target Table Schema/Data for reference
        if (assignData.targetTable) {
          const tableRes = await axios.get<ApiResponse<SandboxData>>(
            `${BACKEND_URI}/api/sandbox/table/${assignData.targetTable}`,
          );
          setSandboxData(tableRes.data.data);
        }
      } catch (err) {
        setError("Failed to load assignment data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id]);

  return { assignment, sandboxData, error, loading };
};
