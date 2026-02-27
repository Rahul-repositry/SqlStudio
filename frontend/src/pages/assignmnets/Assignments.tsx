import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import "./assignment.scss";
import { Link } from "react-router-dom";
const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

interface Assignment {
  _id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  isSolved: boolean;
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const url = difficulty
          ? `${BACKEND_URI}/api/assignments?difficulty=${difficulty}`
          : `${BACKEND_URI}/api/assignments`;

        const { data } = await axios.get(url);
        setAssignments(data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [difficulty]);

  return (
    <div className="assignments-view">
      <header className="assignments-view__header">
        <div className="header-content">
          <h1 className="header-content__title">SQL Challenges</h1>
          <p className="header-content__subtitle">
            Master your queries with real-world scenarios.
          </p>
        </div>

        <div className="assignments-view__actions">
          <div className="filter-group">
            <label htmlFor="difficulty-select" className="filter-group__label">
              Difficulty
            </label>
            <select
              id="difficulty-select"
              className="select-field"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">Initializing Workspace...</div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((task) => (
            <div
              key={task._id}
              className={`task-card task-card--${task.difficulty.toLowerCase()}`}
            >
              <div className="task-card__status">
                {task.isSolved ? (
                  <FiCheckCircle className="icon--success" title="Solved" />
                ) : (
                  <FiCircle className="icon--muted" title="Unsolved" />
                )}
              </div>

              <div className="task-card__body">
                <div className="task-card__meta">
                  <span
                    className={`badge badge--${task.difficulty.toLowerCase()}`}
                  >
                    {task.difficulty}
                  </span>
                  <span className="task-card__id">#{task._id.slice(-4)}</span>
                </div>
                <h3 className="task-card__title">{task.title}</h3>
                <p className="task-card__desc">{task.description}</p>
              </div>

              <div className="task-card__footer">
                <Link to={`/dashboard/solve/${task._id}`}>
                  <button className="btn btn-primary btn-sm">
                    Solve Challenge
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
