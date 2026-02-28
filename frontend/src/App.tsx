import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import AssignmentsPage from "./pages/assignmnets/Assignments.tsx";
import SolvePage from "./pages/solve/Solve.tsx";
import ProfilePage from "./pages/profile/Profile.tsx";
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard/assignments" replace />}
          />
          <Route
            index
            path="/dashboard/*"
            element={
              <Dashboard>
                <Routes>
                  <Route
                    index
                    element={<Navigate to="assignments" replace />}
                  />
                  <Route path="assignments" element={<AssignmentsPage />} />
                  <Route path="solve/:id" element={<SolvePage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Routes>
              </Dashboard>
            }
          />
          <Route path="/authpage/login" element={<AuthPage />} />
          <Route path="/authpage/signup" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
