import { useState, useEffect } from "react"
import { getWorkingHoursDisplay, getDayTypeDisplay } from "../assets/assets"
import { format, parseISO } from "date-fns"
import { CalendarDays, Clock, Timer, LogIn, LogOut, Users } from "lucide-react"
import api from "../../api/axios"
import { useAuth } from "../../api/context/AuthContext"
import Loading from "../components/Loading"
import toast from "react-hot-toast"

const StatusBadge = ({ status }) => (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        status === "PRESENT" ? "bg-emerald-100 text-emerald-700" :
        status === "LATE"    ? "bg-amber-100 text-amber-700" :
        "bg-rose-100 text-rose-600"
    }`}>{status}</span>
)

// ─── Admin View ───────────────────────────────────────────────────────────────
const AdminAttendance = () => {
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState("")

    const load = async (date = "") => {
        setLoading(true)
        try {
            const query = date ? `?date=${date}` : ""
            const res = await api.get(`/attendance/all${query}`)
            setRecords(res.data.attendance ?? [])
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to load attendance")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const totalPresent = records.filter(r => r.status === "PRESENT" || r.status === "LATE").length
    const totalLate    = records.filter(r => r.status === "LATE").length
    const avgHrs = records.length
        ? (records.reduce((s, r) => s + (r.workingHours || 0), 0) / records.length).toFixed(1)
        : 0

    if (loading) return <Loading />

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                <p className="text-slate-500 text-sm mt-0.5">All employee attendance records</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: Users,        label: "Total Present",  value: totalPresent },
                    { icon: Clock,        label: "Late Arrivals",  value: totalLate },
                    { icon: Timer,        label: "Avg. Work Hrs",  value: `${avgHrs} Hrs` },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 px-6 py-5 flex items-center gap-4 shadow-sm">
                        <Icon size={20} className="text-slate-400 shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                            <p className="text-2xl font-semibold text-slate-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
                <input type="date" value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); load(e.target.value) }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                {dateFilter && (
                    <button onClick={() => { setDateFilter(""); load("") }}
                        className="text-xs text-slate-500 hover:text-slate-700 underline">
                        Clear filter
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Employee", "Department", "Date", "Check In", "Check Out", "Hours", "Day Type", "Status"].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {records.map((r) => {
                                const { label: dayLabel, className: dayCls } = getDayTypeDisplay(r)
                                const emp = r.employeeId
                                return (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {emp ? `${emp.firstName} ${emp.lastName}` : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{emp?.department || "—"}</td>
                                        <td className="px-5 py-4 text-slate-700">
                                            {r.date ? format(parseISO(r.date), "MMM dd, yyyy") : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {r.checkIn ? format(parseISO(r.checkIn), "hh:mm aa") : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {r.checkOut ? format(parseISO(r.checkOut), "hh:mm aa") : (
                                                <span className="text-indigo-500 text-xs font-medium">In progress</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{getWorkingHoursDisplay(r)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dayCls}`}>{dayLabel}</span>
                                        </td>
                                        <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                                    </tr>
                                )
                            })}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── Employee View ────────────────────────────────────────────────────────────
const EmployeeAttendance = ({ user }) => {
    const [records, setRecords] = useState([])
    const [todayRecord, setTodayRecord] = useState(null)
    const [employeeId, setEmployeeId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [clocking, setClocking] = useState(false)

    const clockedIn = todayRecord?.checkIn && !todayRecord?.checkOut

    useEffect(() => {
        const load = async () => {
            try {
                const profileRes = await api.get("/profile")
                const empId = profileRes.data.profile?._id
                setEmployeeId(empId)
                if (!empId) return

                const attRes = await api.get(`/attendance/${empId}`)
                const allRecords = attRes.data.attendance ?? []
                setRecords(allRecords)

                const today = new Date()
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                const todayRec = allRecords.find(r => new Date(r.date) >= startOfDay)
                setTodayRecord(todayRec ?? null)
            } catch {
                toast.error("Failed to load attendance")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

    const handleClock = async () => {
        if (!employeeId) return toast.error("Employee profile not found")
        setClocking(true)
        try {
            if (!clockedIn) {
                const { data } = await api.post("/attendance/clock-in", { employeeId })
                setTodayRecord(data.attendance)
                setRecords(prev => [data.attendance, ...prev.filter(r => r._id !== data.attendance._id)])
                toast.success("Clocked in successfully")
            } else {
                const { data } = await api.post("/attendance/clock-out", { employeeId })
                setTodayRecord(data.attendance)
                setRecords(prev => prev.map(r => r._id === data.attendance._id ? data.attendance : r))
                toast.success("Clocked out successfully")
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Clock action failed")
        } finally {
            setClocking(false)
        }
    }

    const daysPresent  = records.filter(r => r.status === "PRESENT" || r.status === "LATE").length
    const lateArrivals = records.filter(r => r.status === "LATE").length
    const avgWorkHrs   = records.length
        ? (records.reduce((sum, r) => sum + (r.workingHours || 0), 0) / records.length).toFixed(1)
        : 0

    if (loading) return <Loading />

    return (
        <div className="animate-fade-in pb-24">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                <p className="text-slate-500 text-sm mt-0.5">Track your work hours and daily check-ins</p>
            </div>

            {todayRecord && (
                <div className={`mb-6 px-5 py-4 rounded-xl border text-sm flex items-center gap-3 ${
                    clockedIn
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}>
                    <Clock size={16} />
                    {clockedIn
                        ? `Clocked in at ${format(parseISO(todayRecord.checkIn), "hh:mm aa")} — remember to clock out`
                        : `Today complete — ${todayRecord.workingHours}h worked (${todayRecord.dayType})`
                    }
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: CalendarDays, label: "Days Present",  value: daysPresent },
                    { icon: Clock,        label: "Late Arrivals", value: lateArrivals },
                    { icon: Timer,        label: "Avg. Work Hrs", value: `${avgWorkHrs} Hrs` },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 px-6 py-5 flex items-center gap-4 shadow-sm">
                        <Icon size={20} className="text-slate-400 shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                            <p className="text-2xl font-semibold text-slate-900">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Date", "Check In", "Check Out", "Working Hours", "Day Type", "Status"].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {records.map((r) => {
                                const { label: dayLabel, className: dayCls } = getDayTypeDisplay(r)
                                return (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-700">
                                            {r.date ? format(parseISO(r.date), "MMM dd, yyyy") : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {r.checkIn ? format(parseISO(r.checkIn), "hh:mm aa") : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {r.checkOut ? format(parseISO(r.checkOut), "hh:mm aa") : (
                                                <span className="text-indigo-500 text-xs font-medium">In progress</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{getWorkingHoursDisplay(r)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${dayCls}`}>{dayLabel}</span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                                    </tr>
                                )
                            })}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No attendance records yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <button onClick={handleClock} disabled={clocking}
                className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white transition-colors duration-200 disabled:opacity-60 ${
                    clockedIn ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                }`}>
                {clockedIn ? <LogOut size={20} /> : <LogIn size={20} />}
                <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">
                        {clocking ? "Please wait..." : clockedIn ? "Clock Out" : "Clock In"}
                    </p>
                    <p className="text-xs opacity-80">{clockedIn ? "end your work day" : "start your work day"}</p>
                </div>
            </button>
        </div>
    )
}

// ─── Main export ──────────────────────────────────────────────────────────────
const Attendance = () => {
    const { user } = useAuth()
    return user?.role === "ADMIN"
        ? <AdminAttendance />
        : <EmployeeAttendance user={user} />
}

export default Attendance
