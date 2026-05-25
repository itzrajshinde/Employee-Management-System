import { useParams, useNavigate } from "react-router-dom"
import { dummyPayslipData } from "../assets/assets"
import { Printer } from "lucide-react"

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"]

const PrintPayslips = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // Try sessionStorage first (for newly generated), fall back to dummy data
    const all = (() => {
        try { return JSON.parse(sessionStorage.getItem("payslips")) || dummyPayslipData }
        catch { return dummyPayslipData }
    })()

    const payslip = all.find((p) => p._id === id || p.id === id)

    if (!payslip) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Payslip not found.</p>
                    <button onClick={() => navigate("/payslips")}
                        className="text-indigo-600 hover:underline text-sm">← Back to Payslips</button>
                </div>
            </div>
        )
    }

    const emp = Array.isArray(payslip.employee) ? payslip.employee[0] : payslip.employee
    const period = `${MONTHS[payslip.month - 1]} ${payslip.year}`

    const handlePrint = () => window.print()

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">

            {/* Payslip card */}
            <div id="payslip-content" className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-10 print:shadow-none print:rounded-none print:max-w-full">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-widest text-slate-900 uppercase">Payslip</h1>
                    <p className="text-slate-400 text-sm mt-1">{period}</p>
                    <div className="w-12 h-px bg-slate-200 mx-auto mt-3" />
                </div>

                {/* Employee info */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Employee Name</p>
                        <p className="text-sm font-semibold text-slate-800">{emp?.firstName} {emp?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Position</p>
                        <p className="text-sm font-semibold text-slate-800">{emp?.position || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-sm font-semibold text-slate-800">{emp?.email || "—"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Period</p>
                        <p className="text-sm font-semibold text-slate-800">{period}</p>
                    </div>
                </div>

                {/* Salary breakdown */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
                    <div className="grid grid-cols-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Description</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Amount</span>
                    </div>
                    {[
                        { label: "Basic Salary", value: `$${payslip.basicSalary.toLocaleString()}`, bold: false },
                        { label: "Allowances",   value: `+$${payslip.allowances.toLocaleString()}`, bold: false },
                        { label: "Deductions",   value: `-$${payslip.deductions.toLocaleString()}`, bold: false },
                    ].map(({ label, value }) => (
                        <div key={label} className="grid grid-cols-2 px-5 py-3.5 border-b border-slate-50">
                            <span className="text-sm text-slate-600">{label}</span>
                            <span className="text-sm text-slate-700 text-right">{value}</span>
                        </div>
                    ))}
                    <div className="grid grid-cols-2 px-5 py-4 bg-slate-50">
                        <span className="text-sm font-bold text-slate-900">Net Salary</span>
                        <span className="text-sm font-bold text-slate-900 text-right">${payslip.netSalary.toLocaleString()}</span>
                    </div>
                </div>

                {/* Print button — hidden when printing */}
                <div className="flex justify-center print:hidden">
                    <button onClick={handlePrint}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-8 py-3 rounded-xl transition-colors shadow-md">
                        <Printer size={16} /> Print Payslip
                    </button>
                </div>
            </div>

            {/* Back link — hidden when printing */}
            <button onClick={() => navigate("/payslips")}
                className="mt-4 text-slate-400 hover:text-slate-600 text-xs transition-colors print:hidden">
                ← Back to Payslips
            </button>
        </div>
    )
}

export default PrintPayslips
