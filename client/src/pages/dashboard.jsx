import { useEffect, useState } from "react"
import { dummyAdminDashboardData, dummyEmployeeDashboardData } from "../assets/assets"
import Loading from "../components/Loading"
import EmployeeDashboard from "../components/EmployeeDashboard"
import AdminDashboard from "../components/AdminDashboard"

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const role = localStorage.getItem("userRole") || "ADMIN"

  useEffect(() => {
    const dashboardData = role === "ADMIN" ? dummyAdminDashboardData : dummyEmployeeDashboardData
    setData(dashboardData)
    setTimeout(() => setLoading(false), 1000)
  }, [role])

  if (loading) return <Loading />

  return role === "ADMIN"
    ? <AdminDashboard data={data} />
    : <EmployeeDashboard data={data} />
}

export default Dashboard
