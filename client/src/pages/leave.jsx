import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Plus, Thermometer, Umbrella, Palmtree, Check, X } from "lucide-react"
import api from "../../api/axios"
import { useAuth } from "../../api/context/AuthContext"
import Loading from "../components/Loading"
import toast from "react-hot-toast"

const typeBadge = {
    SICK:   "bg-rose-100 text-rose-600",
    CASUAL: "bg-blue-100 text-blue-600",
    ANNUAL: "bg-purple-100 text-purple-600",
}

const statusBadge = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-600",
    PENDING:  "bg-amber-100 text-amber-600",
}

const EMPTY_FORM = { type: "SICK", startDate: "", endDate: "", reason: "" }

const Leave = () => {
    const { user } = useAuth()
    const role = user?.role || "EMPLOYEE"

    const [leaves, setLeaves] = useState([])
    const [employeeId, setEmployeeId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    useEffect(() => {
        const load = async () => {
            try {
                if (role === "EMPLOYEE") {
                    const profileRes = await api.get("/profile")
                    const empId = profileRes.data.profile?._id
                    setEmployeeId(empId)
                    const res = await api.get(`/leaves?employeeId=${empId}`)
                    setLeaves(res.data.leaves ?? [])
                } else {
                    const res = await api.get("/leaves")
                    setLeaves(res.data.leaves ?? [])
                }
            } catch (err) {
                toast.error(err.response?.data?.error || "Failed to load leaves")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [role])

    const handleApply = async (e) => {
        e.preventDefault()
        if (!employeeId) {
            toast.error("Employee profile not found. Contact admin.")
            return
        }
        try {
            const { data } = await api.post("/leaves", {
                employeeId,
                type: form.type,
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason,
            })
            setLeaves(prev => [data.leave, ...prev])
            setForm(EMPTY_FORM)
            setApplying(false)
            toast.success("Leave application submitted")
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit leave")
        }
    }

    const updateStatus = async (id, status) => {
        try {
            const { data } = await api.patch(`/leaves/${id}`, { status })
            setLeaves(prev => prev.map(l => l._id === id ? data.leave : l))
            toast.success(`Leave ${status.toLowerCase()}`)
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update leave status")
        }
    }

    if (loading) return <Loading />

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Leave Management</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage leave applications</p>
                </div>
                {role === "EMPLOYEE" && (
                    <button onClick={() => setApplying(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Plus size={16} /> Apply for Leave
                    </button>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: Thermometer, label: "Sick Leave",   type: "SICK" },
                    { icon: Umbrella,    label: "Casual Leave", type: "CASUAL" },
                    { icon: Palmtree,    label: "Annual Leave", type: "ANNUAL" },
                ].map(({ icon: Icon, label, type }) => {
                    const count = leaves.filter(l => l.type === type && l.status === "APPROVED").length
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

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">Leave History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {role === "ADMIN" ? "All employee leave requests" : "Your leave requests"}
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
                            {leaves.map((leave) => {
                                const emp = leave.employeeId
                                const empName = emp ? `${emp.firstName} ${emp.lastName}` : "—"
                                const start = leave.startDate ? format(parseISO(leave.startDate), "MMM dd, yyyy") : "—"
                                const end   = leave.endDate   ? format(parseISO(leave.endDate),   "MMM dd, yyyy") : "—"
                                return (
                                    <tr key={leave._id} className="group hover:bg-slate-50 transition-colors">
                                        {role === "ADMIN" && <td className="px-6 py-4 font-medium text-slate-800">{empName}</td>}
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadge[leave.type] || "bg-slate-100 text-slate-600"}`}>
                                                {leave.type}
                                            </span>
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
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateStatus(leave._id, "APPROVED")}
                                                            className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
                                                            <Check size={15} />
                                                        </button>
                                                        <button onClick={() => updateStatus(leave._id, "REJECTED")}
                                                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors" title="Reject">
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                ) : <span className="text-xs text-slate-400">—</span>}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                            {leaves.length === 0 && (
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

            {/* Apply modal */}
            {applying && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900">Apply for Leave</h2>
                        </div>
                        <form onSubmit={handleApply} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    {["SICK", "CASUAL", "ANNUAL"].map(t => (
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
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
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
