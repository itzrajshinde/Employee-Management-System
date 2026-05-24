import { CalendarDays, FileText, DollarSign, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmployeeDashboard = ({ data }) => {
    const emp = data.employee
    const navigate = useNavigate()

    const cards = [
        {
            icon: CalendarDays,
            value: data.currentMonthAttendance,
            title: "Days Present",
            subtitle: "This month",
        },
        {
            icon: FileText,
            value: data.pendingLeaves,
            title: "Pending Leaves",
            subtitle: "Awaiting approval",
        },
        {
            icon: DollarSign,
            value: data.latestPayslip ? `$${data.latestPayslip.netSalary?.toLocaleString()}` : "N/A",
            title: "Latest Payslip",
            subtitle: "Most recent payout",
        },
    ]

    return (
        <div className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-900">Welcome, {emp?.firstName}!</h1>
                <p className="text-slate-500 mt-1">
                    {emp?.position} — {emp?.department || "No Department"}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map(({ icon: Icon, value, title, subtitle }) => (
                    <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <Icon size={20} className="text-indigo-600" />
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
            <div className="flex items-center gap-3 mt-6">
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
        </div>
    )
}

export default EmployeeDashboard
