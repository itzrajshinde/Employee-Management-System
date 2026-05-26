import { Users, Building2, CalendarCheck, FileText, TrendingUp, Clock } from 'lucide-react'

const AdminDashboard = ({ data }) => {
    const stats = [
        {
            icon: Users,
            value: data.totalEmployees ?? 0,
            label: "Total Employees",
            description: `${data.activeEmployees ?? 0} active`,
            color: "bg-indigo-50 text-indigo-600",
        },
        {
            icon: Building2,
            value: data.totalDepartments ?? 0,
            label: "Departments",
            description: "Organization units",
            color: "bg-violet-50 text-violet-600",
        },
        {
            icon: CalendarCheck,
            value: data.todayAttendance ?? 0,
            label: "Today's Attendance",
            description: "Present today",
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            icon: FileText,
            value: data.pendingLeaves ?? 0,
            label: "Pending Leaves",
            description: "Awaiting approval",
            color: "bg-amber-50 text-amber-600",
        },
    ]

    const leaveStatus = data.leaveStatus ?? {}
    const departments = (data.departments ?? []).filter(d => d.count > 0)
    const recentAttendance = data.recentAttendance ?? []

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1">Overview of your organization</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, value, label, description, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{value}</p>
                            <p className="text-sm font-medium text-slate-700">{label}</p>
                            <p className="text-xs text-slate-400">{description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Leave status breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-700">Leave Status</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: "Pending",  value: leaveStatus.PENDING  ?? 0, color: "bg-amber-400" },
                            { label: "Approved", value: leaveStatus.APPROVED ?? 0, color: "bg-emerald-400" },
                            { label: "Rejected", value: leaveStatus.REJECTED ?? 0, color: "bg-rose-400" },
                        ].map(({ label, value, color }) => {
                            const total = (leaveStatus.PENDING ?? 0) + (leaveStatus.APPROVED ?? 0) + (leaveStatus.REJECTED ?? 0)
                            const pct = total > 0 ? Math.round((value / total) * 100) : 0
                            return (
                                <div key={label}>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>{label}</span>
                                        <span>{value} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full">
                                        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                        {(leaveStatus.PENDING ?? 0) + (leaveStatus.APPROVED ?? 0) + (leaveStatus.REJECTED ?? 0) === 0 && (
                            <p className="text-xs text-slate-400 text-center py-2">No leave applications yet</p>
                        )}
                    </div>
                </div>

                {/* Department breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 size={16} className="text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-700">Employees by Department</h2>
                    </div>
                    {departments.length > 0 ? (
                        <div className="space-y-2">
                            {departments.slice(0, 5).map(({ name, count }) => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600 truncate">{name}</span>
                                    <span className="text-xs font-semibold text-slate-800 ml-2">{count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-2">No department data yet</p>
                    )}
                </div>
            </div>

            {/* Recent attendance */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-slate-400" />
                    <h2 className="text-sm font-semibold text-slate-700">Recent Attendance</h2>
                </div>
                {recentAttendance.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {recentAttendance.map((record) => (
                            <div key={record._id} className="flex items-center justify-between py-2.5">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {record.employeeId?.firstName} {record.employeeId?.lastName}
                                    </p>
                                    <p className="text-xs text-slate-400">{record.employeeId?.department}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        record.status === "PRESENT" ? "bg-emerald-50 text-emerald-600" :
                                        record.status === "LATE"    ? "bg-amber-50 text-amber-600" :
                                        "bg-rose-50 text-rose-600"
                                    }`}>
                                        {record.status}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {new Date(record.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No attendance records yet</p>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
