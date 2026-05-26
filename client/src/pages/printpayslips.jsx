import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Printer } from "lucide-react"
import api from "../../api/axios"
import Loading from "../components/Loading"

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"]

const PrintPayslips = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [payslip, setPayslip] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/payslips/${id}`)
            .then((res) => setPayslip(res.data.payslip))
            .catch(() => setPayslip(null))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loading />

    if (!payslip) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-slate-500 mb-4">Payslip not found.</p>
                <button onClick={() => navigate("/payslips")} className="text-indigo-600 hover:underline text-sm">
                    ← Back to Payslips
                </button>
            </div>
        </div>
    )

    const emp = payslip.employeeId
    const period = `${MONTHS[payslip.month - 1]} ${payslip.year}`

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-10 print:shadow-none print:rounded-none print:max-w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-widest text-slate-900 uppercase">Payslip</h1>
                    <p className="text-slate-400 text-sm mt-1">{period}</p>
                    <div className="w-12 h-px bg-slate-200 mx-auto mt-3" />
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-8">
                    {[
                        { label: "Employee Name", value: `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}` },
                        { label: "Position",      value: emp?.position   || "—" },
                        { label: "Department",    value: emp?.department || "—" },
                        { label: "Period",        value: period },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-sm font-semibold text-slate-800">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
                    <div className="grid grid-cols-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Description</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Amount</span>
                    </div>
                    {[
                        { label: "Basic Salary", value: `₹${payslip.basicSalary.toLocaleString()}` },
                        { label: "Allowances",   value: `+₹${payslip.allowances.toLocaleString()}` },
                        { label: "Deductions",   value: `-₹${payslip.deductions.toLocaleString()}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="grid grid-cols-2 px-5 py-3.5 border-b border-slate-50">
                            <span className="text-sm text-slate-600">{label}</span>
                            <span className="text-sm text-slate-700 text-right">{value}</span>
                        </div>
                    ))}
                    <div className="grid grid-cols-2 px-5 py-4 bg-slate-50">
                        <span className="text-sm font-bold text-slate-900">Net Salary</span>
                        <span className="text-sm font-bold text-slate-900 text-right">₹{payslip.netSalary.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-center print:hidden">
                    <button onClick={() => window.print()}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-8 py-3 rounded-xl transition-colors shadow-md">
                        <Printer size={16} /> Print Payslip
                    </button>
                </div>
            </div>

            <button onClick={() => navigate("/payslips")}
                className="mt-4 text-slate-400 hover:text-slate-600 text-xs transition-colors print:hidden">
                ← Back to Payslips
            </button>
        </div>
    )
}

export default PrintPayslips
