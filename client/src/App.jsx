import { Toaster } from "react-hot-toast"
import { Navigate, Route, Routes } from "react-router-dom"
import LoginLanding from "./pages/loginlanding"
import LoginForm from "./components/LoginForm"
import Dashboard from "./pages/dashboard"
import Employees from "./pages/employees"
import Attendance from "./pages/attendance"
import Leave from "./pages/leave"
import Payslips from "./pages/payslips"
import Settings from "./pages/settings"
import PrintPayslips from "./pages/printpayslips"
import Layouts from "./pages/layouts"
import { useAuth } from "../api/context/AuthContext"

// Redirect to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginLanding />} />
        <Route path="/login/admin" element={<LoginForm role="admin" />} />
        <Route path="/login/employee" element={<LoginForm role="employee" />} />
        <Route element={<ProtectedRoute><Layouts /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/print/payslips/:id" element={<PrintPayslips />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
