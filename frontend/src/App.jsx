import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Roadmaps from "./pages/Roadmaps";
import Practice from "./pages/Practice";
import Projects from "./pages/Projects";
import CodingLab from "./pages/CodingLab";
import Companies from "./pages/Companies";
import Resources from "./pages/Resources";
import Resume from "./pages/Resume";
import Profile from "./pages/Profile";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminResources from "./pages/admin/AdminResources";
import AdminPracticeQuestions from "./pages/admin/AdminPracticeQuestions";
import AdminNotifications from "./pages/admin/AdminNotifications";

import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PageFade from "./components/PageFade";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <PageFade>
      <Routes>

        {/* =================================================
            PUBLIC PAGES
        ================================================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Password recovery must be reachable while signed out */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* =================================================
            PROTECTED PAGES
        ================================================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/roadmaps"
            element={<Roadmaps />}
          />

          <Route
            path="/practice"
            element={<Practice />}
          />

          <Route
            path="/coding-lab"
            element={<CodingLab />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/companies"
            element={<Companies />}
          />

          <Route
            path="/resources"
            element={<Resources />}
          />

          <Route
            path="/resume"
            element={<Resume />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />
        </Route>

        {/* =================================================
            ADMIN PAGES
        ================================================= */}

        <Route element={<AdminRoute />}>

          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/practice" element={<AdminPracticeQuestions />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />

        </Route>

      </Routes>
      </PageFade>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;