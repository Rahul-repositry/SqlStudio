import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AssignmentsPage from "./pages/assignmnets/Assignments";
import SolvePage from "./pages/solve/Solve";
import ProfilePage from "./pages/profile/Profile";
import axios from "axios";
import { useEffect, useState } from "react";

axios.defaults.withCredentials = true;
const BACKEND_URI = import.meta.env.VITE_BACKEND_URI as string;

const ProtectedRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URI}/api/auth/getme`, {
          withCredentials: true,
        });

        localStorage.setItem("user", JSON.stringify(response.data.data));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session invalid or expired:", error);

        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading Workspace...
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/authpage/login" replace />
  );
};
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard/assignments" replace />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
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
          </Route>
          <Route path="/authpage/login" element={<AuthPage />} />
          <Route path="/authpage/signup" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
