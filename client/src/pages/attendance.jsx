import { useState } from "react"
import { dummyAttendanceData, getWorkingHoursDisplay, getDayTypeDisplay } from "../assets/assets"
import { format, parseISO } from "date-fns"
import { CalendarDays, Clock, Timer, LogIn, LogOut } from "lucide-react"

const Attendance = () => {
    const [records, setRecords] = useState(dummyAttendanceData)
    const [clockedIn, setClockedIn] = useState(false)

    // Stats
    const daysPresent = records.filter((r) => r.status === "PRESENT").length
    const lateArrivals = records.filter((r) => {
        if (!r.checkIn) return false
        const hour = new Date(r.checkIn).getHours()
        return hour >= 10
    }).length
    const avgWorkHrs = records.length
        ? (records.reduce((sum, r) => sum + (r.workingHours || 0), 0) / records.length).toFixed(1)
        : 0

    const handleClock = () => {
        if (!clockedIn) {
            const now = new Date().toISOString()
            setRecords((prev) => [{
                _id: Date.now().toString(),
                date: now,
                checkIn: now,
                checkOut: null,
                status: "PRESENT",
                workingHours: null,
                dayType: null,
            }, ...prev])
            setClockedIn(true)
        } else {
            const now = new Date()
            setRecords((prev) => prev.map((r, i) => {
                if (i === 0 && !r.checkOut) {
                    const diffHours = (now - new Date(r.checkIn)) / (1000 * 60 * 60)
                    return { ...r, checkOut: now.toISOString(), workingHours: parseFloat(diffHours.toFixed(2)), dayType: diffHours >= 7 ? "Full Day" : "Half Day" }
                }
                return r
            }))
            setClockedIn(false)
        }
    }

    return (
        <div className="animate-fade-in pb-24">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
                <p className="text-slate-500 text-sm mt-0.5">Track your work hours and daily check-ins</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: CalendarDays, label: "Days Present", value: daysPresent },
                    { icon: Clock, label: "Late Arrivals", value: lateArrivals },
                    { icon: Timer, label: "Avg. Work Hrs", value: `${avgWorkHrs} Hrs` },
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

            {/* Recent Activity table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {["Date", "Check In", "Check Out", "Working Hours", "Day Type", "Status"].map((h) => (
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
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                r.status === "PRESENT"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-rose-100 text-rose-600"
                                            }`}>{r.status}</span>
                                        </td>
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

            {/* Floating Clock In/Out button */}
            <button
                onClick={handleClock}
                className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white transition-colors duration-200 ${
                    clockedIn ? "bg-rose-500 hover:bg-rose-600" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
                {clockedIn ? <LogOut size={20} /> : <LogIn size={20} />}
                <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">{clockedIn ? "Clock Out" : "Clock In"}</p>
                    <p className="text-xs opacity-80">{clockedIn ? "end your work day" : "start your work day"}</p>
                </div>
            </button>
        </div>
    )
}

export default Attendance
