import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" index={true} element={<h1>Dashboard</h1>} />
          <Route path="/authpage/login" element={<AuthPage />} />
          <Route path="/authpage/signup" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
