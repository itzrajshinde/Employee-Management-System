import { useEffect, useState } from "react"
import Loading from "../components/Loading"
import EmployeeDashboard from "../components/EmployeeDashboard"
import AdminDashboard from "../components/AdminDashboard"
import { useAuth } from "../../api/context/AuthContext"
import api from "../../api/axios"

const Dashboard = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const role = user?.role || "EMPLOYEE"

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => {
        const raw = res.data

        if (role === "ADMIN") {
          // Map backend admin response to component shape
          setData({
            totalEmployees:   raw.summary?.totalEmployees   ?? 0,
            activeEmployees:  raw.summary?.activeEmployees  ?? 0,
            totalDepartments: raw.departments?.length        ?? 0,
            todayAttendance:  raw.summary?.todayAttendance  ?? 0,
            pendingLeaves:    raw.summary?.pendingLeaves     ?? 0,
            departments:      raw.departments               ?? [],
            leaveStatus:      raw.leaveStatus               ?? {},
            recentAttendance: raw.recentAttendance          ?? [],
          })
        } else {
          // Map backend employee response to component shape
          setData({
            employee:               raw.employee                          ?? {},
            monthlyStats:           raw.monthlyStats                      ?? {},
            currentMonthAttendance: raw.monthlyStats?.presentDays         ?? 0,
            pendingLeaves:          (raw.leaveApplications ?? []).filter(l => l.status === "PENDING").length,
            latestPayslip:          raw.recentPayslips?.[0]               ?? null,
            leaveApplications:      raw.leaveApplications                 ?? [],
            recentPayslips:         raw.recentPayslips                    ?? [],
          })
        }
      })
      .catch((err) => {
        console.error("Dashboard error:", err)
        setError("Failed to load dashboard")
      })
      .finally(() => setLoading(false))
  }, [role])

  if (loading) return <Loading />

  if (error || !data) return (
    <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
      {error || "No data available"}
    </div>
  )

  return role === "ADMIN"
    ? <AdminDashboard data={data} />
    : <EmployeeDashboard data={data} />
}

export default Dashboard
