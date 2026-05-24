import { Users, Building2, CalendarCheck, FileText } from 'lucide-react'

const AdminDashboard = ({ data }) => {
    const stats = [
        {
            icon: Users,
            value: data.totalEmployees,
            label: "Total Employees",
            description: "Active workforce",
        },
        {
            icon: Building2,
            value: data.totalDepartments,
            label: "Departments",
            description: "Organization units",
        },
        {
            icon: CalendarCheck,
            value: data.todayAttendance,
            label: "Today's Attendance",
            description: "Present today",
        },
        {
            icon: FileText,
            value: data.pendingLeaves,
            label: "Pending Leaves",
            description: "Awaiting approval",
        },
    ]

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1">Overview of your organization</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, value, label, description }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <Icon size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{value}</p>
                            <p className="text-sm font-medium text-slate-700">{label}</p>
                            <p className="text-xs text-slate-400">{description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminDashboard
