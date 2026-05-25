import { useState } from "react"
import { dummyPayslipData, dummyEmployeeData } from "../assets/assets"
import { Download, Plus, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"]

const JOHN_DOE_ID = "69b411e6f8a807df391d7b13"

const EMPTY_FORM = { employeeId: "", month: "", year: new Date().getFullYear(), basicSalary: "", allowances: "", deductions: "" }

const Payslips = () => {
    const role = localStorage.getItem("userRole") || "ADMIN"
    const [payslips, setPayslips] = useState(() => {
        // seed sessionStorage with dummy data on first load
        const stored = sessionStorage.getItem("payslips")
        if (!stored) {
            sessionStorage.setItem("payslips", JSON.stringify(dummyPayslipData))
            return dummyPayslipData
        }
        return JSON.parse(stored)
    })
    const [generating, setGenerating] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)

    const visiblePayslips = role === "ADMIN"
        ? payslips
        : payslips.filter((p) => {
            const emp = p.employee
            return emp?.firstName === "John" && emp?.lastName === "Doe"
        })

    const getPeriod = (p) => `${MONTHS[p.month - 1]} ${p.year}`

    const navigate = useNavigate()

    const handleGenerate = (e) => {
        e.preventDefault()
        const basic = Number(form.basicSalary)
        const allowances = Number(form.allowances) || 0
        const deductions = Number(form.deductions) || 0
        const emp = dummyEmployeeData.find((e) => e._id === form.employeeId)
        const newPayslip = {
            _id: Date.now().toString(),
            employeeId: form.employeeId,
            month: Number(form.month),
            year: Number(form.year),
            basicSalary: basic,
            allowances,
            deductions,
            netSalary: basic + allowances - deductions,
            employee: emp || null,
        }
        const updated = [newPayslip, ...payslips]
        setPayslips(updated)
        sessionStorage.setItem("payslips", JSON.stringify(updated))
        setForm(EMPTY_FORM)
        setGenerating(false)
        navigate(`/print/payslips/${newPayslip._id}`)
    }

    const handleDownload = (p) => {
        const emp = p.employee
        const empName = emp ? `${emp.firstName}_${emp.lastName}` : "Employee"
        const lines = [
            "========== PAYSLIP ==========",
            `Employee  : ${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`,
            `Position  : ${emp?.position ?? "—"}`,
            `Department: ${emp?.department ?? "—"}`,
            `Period    : ${getPeriod(p)}`,
            "-----------------------------",
            `Basic Salary : $${p.basicSalary.toLocaleString()}`,
            `Allowances   : $${p.allowances.toLocaleString()}`,
            `Deductions   : $${p.deductions.toLocaleString()}`,
            "-----------------------------",
            `Net Salary   : $${p.netSalary.toLocaleString()}`,
            "=============================",
        ]
        const blob = new Blob([lines.join("\n")], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Payslip_${empName}_${getPeriod(p).replace(" ", "_")}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Payslips</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Generate and manage employee payslips</p>
                </div>
                <button onClick={() => setGenerating(true)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200">
                    <Plus size={16} /> Generate Payslip
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Basic Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visiblePayslips.map((p) => {
                                const emp = p.employee
                                const empName = emp ? `${emp.firstName} ${emp.lastName}` : "—"
                                return (
                                    <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{empName}</td>
                                        <td className="px-6 py-4 text-slate-500">{getPeriod(p)}</td>
                                        <td className="px-6 py-4 text-slate-700">${p.basicSalary.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">${p.netSalary.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => navigate(`/print/payslips/${p._id}`)}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors">
                                                <Download size={13} /> Download
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {visiblePayslips.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No payslips found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Payslip modal — admin only */}
            {generating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                        <div className="px-6 py-5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">Generate Monthly Payslip</h2>
                            <button onClick={() => setGenerating(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGenerate} className="px-6 pb-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
                                <select required value={form.employeeId}
                                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                    <option value="">Select employee</option>
                                    {dummyEmployeeData.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} ({emp.position})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
                                    <select required value={form.month}
                                        onChange={(e) => setForm({ ...form, month: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                        <option value="">Select month</option>
                                        {MONTHS.map((m, i) => (
                                            <option key={m} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                                    <input type="number" required value={form.year}
                                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Basic Salary</label>
                                <input type="number" min="0" required placeholder="5000" value={form.basicSalary}
                                    onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Allowances</label>
                                    <input type="number" min="0" placeholder="0" value={form.allowances}
                                        onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Deductions</label>
                                    <input type="number" min="0" placeholder="0" value={form.deductions}
                                        onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setGenerating(false)}
                                    className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                                    Generate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Payslips
