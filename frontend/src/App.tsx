import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AssignmentsPage from "./pages/assignmnets/Assignments";
import SolvedPage from "./pages/solved2/Solved";
import ProfilePage from "./pages/profile/Profile";
import axios from "axios";
axios.defaults.withCredentials = true;
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
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
                  <Route path="solved" element={<SolvedPage />} />
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
