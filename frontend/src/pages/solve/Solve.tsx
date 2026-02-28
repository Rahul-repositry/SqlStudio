import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAssignmentData } from "./hooks/hooks.ts";
import { useQueryExecution } from "./hooks/useQueryExecution.ts";
import TableRenderer from "./components/TableRenderer.tsx";
import type { ActiveTab } from "./types.ts";
import "./solve.scss";
import axios from "axios";
import { FiCpu, FiLoader } from "react-icons/fi";
const BACKEND_URI = import.meta.env.VITE_BACKEND_URI as string;

const Solve: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    assignment,
    sandboxData,
    error: fetchError,
    loading,
  } = useAssignmentData();
  const {
    queryResult,
    isExecuting,
    error: executionError,
    executeQuery,
  } = useQueryExecution();
  console.log(queryResult);
  const [sqlQuery, setSqlQuery] = useState<string>(
    "-- Write your SQL query here\n",
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("results");
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const handleGetHint = async () => {
    if (isHintLoading) return;
    setIsHintLoading(true);

    try {
      const { data } = await axios.post(`${BACKEND_URI}/api/ai/hint`, {
        assignmentId: id,
        currentQuery: sqlQuery,
      });
      setHint(data.data.hint);
    } catch (err) {
      console.error("AI Hint Error:", err);
    } finally {
      setIsHintLoading(false);
    }
  };
  const handleExecute = async (): Promise<void> => {
    await executeQuery(id, sqlQuery);
    setActiveTab("results");
  };

  if (loading) {
    return <div className="solver-page__loading">Loading Workspace</div>;
  }

  if (fetchError || !assignment) {
    return (
      <div className="solver-page__error">
        {fetchError || "Assignment not found"}
      </div>
    );
  }

  return (
    <div className="solver-page">
      {/* Question Section - Top */}
      <section className="solver-page__question-section">
        <div className="solver-page__question-header">
          <span
            className={`solver-page__difficulty solver-page__difficulty--${assignment.difficulty.toLowerCase()}`}
          >
            {assignment.difficulty}
          </span>
          <h2>{assignment.title}</h2>
        </div>

        <div className="solver-page__question-content">
          <h3>Description</h3>
          <p>{assignment.description}</p>

          <h3>Task</h3>
          <div className="solver-page__task-box">{assignment.question}</div>
        </div>
      </section>

      <div className="solver-page__ai-section">
        <div className="solver-page__ai-controls">
          <button
            className={`btn-ai ${isHintLoading ? "btn-ai--loading" : ""}`}
            onClick={handleGetHint}
            disabled={isHintLoading}
          >
            {isHintLoading ? <FiLoader className="spin" /> : <FiCpu />}
            {hint ? "Refresh Hint" : "Get AI Hint"}
          </button>
        </div>

        {hint && (
          <div className="solver-page__hint-bubble">
            <div className="hint-header">AI Assistant</div>
            <p className="hint-text">{hint}</p>
          </div>
        )}
      </div>

      {/* Editor Section - Middle */}
      <section className="solver-page__editor-section">
        <div className="solver-page__toolbar">
          <span className="solver-page__filename">query.sql</span>
          <button
            className={`solver-page__run-btn ${isExecuting ? "solver-page__run-btn--loading" : ""}`}
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? "Executing" : "▶ Run Query"}
          </button>
        </div>

        <div className="solver-page__editor-wrapper">
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={sqlQuery}
            onChange={(value) => setSqlQuery(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              padding: { top: 12 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </section>

      {/* Results Section - Bottom */}
      <section className="solver-page__results-section">
        <div className="solver-page__tabs">
          <button
            className={`solver-page__tab-btn ${activeTab === "results" ? "solver-page__tab-btn--active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Results
          </button>
          <button
            className={`solver-page__tab-btn ${activeTab === "expected" ? "solver-page__tab-btn--active" : ""}`}
            onClick={() => setActiveTab("expected")}
          >
            Expected Output :
          </button>
          <button
            className={`solver-page__tab-btn ${activeTab === "schema" ? "solver-page__tab-btn--active" : ""}`}
            onClick={() => setActiveTab("schema")}
          >
            Table: {assignment.targetTable}
          </button>
        </div>

        <div className="solver-page__output">
          {executionError && (
            <div className="solver-page__error">
              <strong>Error:</strong> {executionError}
            </div>
          )}

          {!executionError && activeTab === "results" && (
            <TableRenderer
              data={queryResult?.result || []}
              emptyMessage="→ Run a query to see results"
            />
          )}

          {activeTab === "expected" && (
            <TableRenderer
              data={assignment?.sampleDataViewer[0]?.sampleRows || []}
              emptyMessage="→ Loading sampleData..."
            />
          )}

          {activeTab === "schema" && (
            <TableRenderer
              data={sandboxData?.rows}
              emptyMessage="→ Loading table schema..."
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Solve;
