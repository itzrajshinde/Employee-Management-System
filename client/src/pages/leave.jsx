import { useState } from "react"
import { dummyLeaveData } from "../assets/assets"
import { format, parseISO } from "date-fns"
import { Plus, Thermometer, Umbrella, Palmtree, Check, X } from "lucide-react"

const typeBadge = {
    SICK:   "bg-rose-100 text-rose-600",
    CASUAL: "bg-blue-100 text-blue-600",
    ANNUAL: "bg-purple-100 text-purple-600",
    UNPAID: "bg-slate-100 text-slate-600",
}

const statusBadge = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-600",
    PENDING:  "bg-amber-100 text-amber-600",
}

const EMPTY_FORM = { type: "SICK", paidType: "PAID", startDate: "", endDate: "", reason: "" }

const Leave = () => {
    const role = localStorage.getItem("userRole") || "ADMIN"
    const currentUser = { firstName: "John", lastName: "Doe" }

    const [leaves, setLeaves] = useState(dummyLeaveData)
    const [hoveredId, setHoveredId] = useState(null)
    const [applying, setApplying] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    const visibleLeaves = role === "ADMIN"
        ? leaves
        : leaves.filter((l) => {
            const emp = Array.isArray(l.employee) ? l.employee[0] : l.employee
            return emp?.firstName === currentUser.firstName && emp?.lastName === currentUser.lastName
        })

    const handleApply = (e) => {
        e.preventDefault()
        setLeaves((prev) => [{
            _id: Date.now().toString(),
            type: form.type,
            paidType: form.paidType,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            reason: form.reason,
            status: "PENDING",
            employee: { firstName: currentUser.firstName, lastName: currentUser.lastName },
        }, ...prev])
        setForm(EMPTY_FORM)
        setApplying(false)
    }

    const updateStatus = (id, status) => {
        setLeaves((prev) => prev.map((l) => l._id === id ? { ...l, status } : l))
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Leave Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage leave applications</p>
                </div>
                {role === "EMPLOYEE" && (
                    <button onClick={() => setApplying(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200">
                        <Plus size={16} /> Apply for Leave
                    </button>
                )}
            </div>

            {/* Leave summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: Thermometer, label: "Sick Leave",   type: "SICK" },
                    { icon: Umbrella,    label: "Casual Leave", type: "CASUAL" },
                    { icon: Palmtree,    label: "Annual Leave", type: "ANNUAL" },
                ].map(({ icon: Icon, label, type }) => {
                    const count = visibleLeaves.filter((l) => l.type === type && l.status === "APPROVED").length
                    return (
                        <div key={type} className="bg-white rounded-xl border border-slate-200 px-6 py-5 flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Icon size={18} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                <p className="text-2xl font-semibold text-slate-900 leading-none">
                                    {count} <span className="text-sm font-normal text-slate-400">taken</span>
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Leave table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">Leave History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {role === "ADMIN" ? "All employee leave requests" : "Your previous leave requests"}
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {role === "ADMIN" && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                {role === "ADMIN" && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visibleLeaves.map((leave) => {
                                const emp = Array.isArray(leave.employee) ? leave.employee[0] : leave.employee
                                const empName = emp ? `${emp.firstName} ${emp.lastName}` : "—"
                                const start = leave.startDate ? format(parseISO(leave.startDate), "MMM dd, yyyy") : "—"
                                const end = leave.endDate ? format(parseISO(leave.endDate), "MMM dd, yyyy") : "—"
                                return (
                                    <tr key={leave._id} className="group hover:bg-slate-50 transition-colors"
                                        onMouseEnter={() => setHoveredId(leave._id)}
                                        onMouseLeave={() => setHoveredId(null)}>
                                        {role === "ADMIN" && (
                                            <td className="px-6 py-4 font-medium text-slate-800">{empName}</td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge[leave.type] || "bg-slate-100 text-slate-600"}`}>
                                                {leave.type}
                                            </span>
                                            {leave.paidType && (
                                                <span className="ml-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                    {leave.paidType}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{start} — {end}</td>
                                        <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{leave.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[leave.status] || ""}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        {role === "ADMIN" && (
                                            <td className="px-6 py-4">
                                                {leave.status === "PENDING" ? (
                                                    <div className={`flex items-center gap-2 transition-opacity duration-150 ${hoveredId === leave._id ? "opacity-100" : "opacity-0"}`}>
                                                        <button onClick={() => updateStatus(leave._id, "APPROVED")}
                                                            className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
                                                            <Check size={15} />
                                                        </button>
                                                        <button onClick={() => updateStatus(leave._id, "REJECTED")}
                                                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors" title="Reject">
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                            {visibleLeaves.length === 0 && (
                                <tr>
                                    <td colSpan={role === "ADMIN" ? 6 : 4} className="px-6 py-10 text-center text-slate-400">
                                        No leave records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Apply for Leave modal */}
            {applying && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900">Apply for Leave</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Submit a new leave request</p>
                        </div>
                        <form onSubmit={handleApply} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Category</label>
                                <div className="flex gap-3">
                                    {["PAID", "UNPAID"].map((pt) => (
                                        <button key={pt} type="button"
                                            onClick={() => setForm({ ...form, paidType: pt })}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                                form.paidType === pt
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}>
                                            {pt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    {["SICK", "CASUAL", "ANNUAL"].map((t) => (
                                        <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Leave</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                                    <input type="date" required value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                                    <input type="date" required value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
                                <textarea required rows={3} value={form.reason}
                                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Briefly describe the reason..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                                    Submit Request
                                </button>
                                <button type="button" onClick={() => setApplying(false)}
                                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Leave
