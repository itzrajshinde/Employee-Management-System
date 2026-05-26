import { CalendarDays, FileText, DollarSign, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmployeeDashboard = ({ data }) => {
    const emp = data.employee ?? {}
    const navigate = useNavigate()
    const monthlyStats = data.monthlyStats ?? {}
    const leaveApplications = data.leaveApplications ?? []
    const recentPayslips = data.recentPayslips ?? []

    const cards = [
        {
            icon: CalendarDays,
            value: data.currentMonthAttendance ?? 0,
            title: "Days Present",
            subtitle: "This month",
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            icon: FileText,
            value: data.pendingLeaves ?? 0,
            title: "Pending Leaves",
            subtitle: "Awaiting approval",
            color: "bg-amber-50 text-amber-600",
        },
        {
            icon: DollarSign,
            value: data.latestPayslip
                ? `₹${data.latestPayslip.netSalary?.toLocaleString()}`
                : "N/A",
            title: "Latest Payslip",
            subtitle: data.latestPayslip
                ? `${new Date(0, data.latestPayslip.month - 1).toLocaleString('default', { month: 'long' })} ${data.latestPayslip.year}`
                : "No payslip yet",
            color: "bg-indigo-50 text-indigo-600",
        },
    ]

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Welcome, {emp.firstName || "Employee"}!
                </h1>
                <p className="text-slate-500 mt-1">
                    {emp.position && emp.department
                        ? `${emp.position} — ${emp.department}`
                        : "Employee Portal"}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map(({ icon: Icon, value, title, subtitle, color }) => (
                    <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{value}</p>
                            <p className="text-sm font-medium text-slate-700">{title}</p>
                            <p className="text-xs text-slate-400">{subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/attendance')}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                    Mark Attendance <ArrowRight size={16} />
                </button>
                <button
                    onClick={() => navigate('/leave')}
                    className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
                >
                    Apply for Leave
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monthly attendance breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-700">This Month</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Present",       value: monthlyStats.presentDays      ?? 0, color: "text-emerald-600" },
                            { label: "Late",          value: monthlyStats.lateDays          ?? 0, color: "text-amber-600"  },
                            { label: "Absent",        value: monthlyStats.absentDays        ?? 0, color: "text-rose-600"   },
                            { label: "Working Hours", value: `${monthlyStats.totalWorkingHours ?? 0}h`, color: "text-indigo-600" },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-slate-50 rounded-lg p-3">
                                <p className={`text-lg font-semibold ${color}`}>{value}</p>
                                <p className="text-xs text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent leave applications */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-700">Recent Leaves</h2>
                    </div>
                    {leaveApplications.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {leaveApplications.slice(0, 4).map((leave) => (
                                <div key={leave._id} className="flex items-center justify-between py-2.5">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{leave.type}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        leave.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                                        leave.status === "REJECTED" ? "bg-rose-50 text-rose-600" :
                                        "bg-amber-50 text-amber-600"
                                    }`}>
                                        {leave.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-4">No leave applications yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
