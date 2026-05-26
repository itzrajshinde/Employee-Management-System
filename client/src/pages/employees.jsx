import { useState, useEffect } from "react"
import { DEPARTMENTS } from "../assets/assets"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import api from "../../api/axios"
import toast from "react-hot-toast"

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5"
const sectionCls = "text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2 pb-1"

const EMPTY_NEW = {
    firstName: "", lastName: "", email: "", position: "",
    department: DEPARTMENTS[0], phone: "", basicSalary: "",
    role: "EMPLOYEE", workEmail: "", password: ""
}

const Employees = () => {
    const [search, setSearch] = useState("")
    const [department, setDepartment] = useState("All Departments")
    const [employees, setEmployees] = useState([])
    const [editingEmp, setEditingEmp] = useState(null)
    const [addingEmp, setAddingEmp] = useState(false)
    const [newEmp, setNewEmp] = useState(EMPTY_NEW)

    // Load employees from API
    useEffect(() => {
        api.get("/employees")
            .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
            .catch((err) => toast.error(err.response?.data?.error || "Failed to load employees"))
    }, [])

    const filtered = employees.filter((emp) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
        const matchesSearch = fullName.includes(search.toLowerCase()) ||
            emp.position.toLowerCase().includes(search.toLowerCase())
        const matchesDept = department === "All Departments" || emp.department === department
        return matchesSearch && matchesDept
    })

    const handleDelete = async (emp) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return
        try {
            await api.delete(`/employees/${emp._id}`)
            setEmployees((prev) => prev.filter((e) => e._id !== emp._id))
            toast.success("Employee deleted")
        } catch {
            toast.error("Failed to delete employee")
        }
    }

    const handleAddSave = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.post("/employees", {
                ...newEmp,
                email: newEmp.email || newEmp.workEmail,
                basicSalary: Number(newEmp.basicSalary) || 0,
            })
            setEmployees((prev) => [data.employee, ...prev])
            setNewEmp(EMPTY_NEW)
            setAddingEmp(false)
            toast.success("Employee added successfully")
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to add employee")
        }
    }

    const handleEditSave = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.put(`/employees/${editingEmp._id}`, editingEmp)
            setEmployees((prev) => prev.map((emp) => emp._id === data._id ? data : emp))
            setEditingEmp(null)
            toast.success("Employee updated")
        } catch {
            toast.error("Failed to update employee")
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your team members</p>
                </div>
                <button onClick={() => setAddingEmp(true)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors duration-200">
                    <Plus size={16} /> Add Employee
                </button>
            </div>

            {/* Search + filter */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search employees..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                </div>
                <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition">
                    <option value="All Departments">All Departments</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Employee cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((emp) => {
                    const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase()
                    return (
                        <div key={emp._id} className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <button onClick={() => setEditingEmp({ ...emp, role: emp.role || "EMPLOYEE" })}
                                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-colors" title="Edit">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(emp)}
                                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-300 shadow-sm transition-colors" title="Delete">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="px-4 pt-4">
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{emp.department}</span>
                            </div>
                            <div className="flex justify-center py-6">
                                {emp.image ? (
                                    <img src={emp.image} alt={emp.firstName} className="w-20 h-20 rounded-full object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 text-xl font-semibold">{initials}</span>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 pb-5">
                                <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{emp.position}</p>
                            </div>
                        </div>
                    )
                })}
                {filtered.length === 0 && (
                    <p className="col-span-full text-center text-slate-400 py-12">No employees found.</p>
                )}
            </div>

            {/* Edit modal */}
            {editingEmp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900">Edit Employee</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Update employee details</p>
                        </div>
                        <form onSubmit={handleEditSave} className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>First Name</label>
                                    <input type="text" required value={editingEmp.firstName}
                                        onChange={(e) => setEditingEmp({ ...editingEmp, firstName: e.target.value })}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Last Name</label>
                                    <input type="text" required value={editingEmp.lastName}
                                        onChange={(e) => setEditingEmp({ ...editingEmp, lastName: e.target.value })}
                                        className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Position</label>
                                <input type="text" required value={editingEmp.position}
                                    onChange={(e) => setEditingEmp({ ...editingEmp, position: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Department</label>
                                    <select value={editingEmp.department}
                                        onChange={(e) => setEditingEmp({ ...editingEmp, department: e.target.value })}
                                        className={inputCls}>
                                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>System Role</label>
                                    <select value={editingEmp.role || "EMPLOYEE"}
                                        onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value })}
                                        className={inputCls}>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingEmp(null)}
                                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee modal */}
            {addingEmp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-900">Add Employee</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Fill in the new employee details</p>
                        </div>
                        <form onSubmit={handleAddSave} className="px-6 py-5 space-y-4">
                            {/* Personal info */}
                            <p className={sectionCls}>Personal Info</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>First Name</label>
                                    <input type="text" required value={newEmp.firstName}
                                        onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Last Name</label>
                                    <input type="text" required value={newEmp.lastName}
                                        onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                                        className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Position</label>
                                <input type="text" required value={newEmp.position}
                                    onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Department</label>
                                    <select value={newEmp.department}
                                        onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                                        className={inputCls}>
                                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Basic Salary</label>
                                    <input type="number" min="0" value={newEmp.basicSalary}
                                        onChange={(e) => setNewEmp({ ...newEmp, basicSalary: e.target.value })}
                                        className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Phone</label>
                                <input type="tel" value={newEmp.phone}
                                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Personal Email</label>
                                <input type="email" value={newEmp.email}
                                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                                    placeholder="personal@email.com"
                                    className={inputCls} />
                            </div>

                            {/* System role */}
                            <p className={sectionCls}>System Role</p>
                            <div>
                                <label className={labelCls}>Role</label>
                                <select value={newEmp.role}
                                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                                    className={inputCls}>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            {/* Account setup */}
                            <p className={sectionCls}>Account Setup</p>
                            <div>
                                <label className={labelCls}>Work Email</label>
                                <input type="email" required value={newEmp.workEmail}
                                    onChange={(e) => setNewEmp({ ...newEmp, workEmail: e.target.value })}
                                    placeholder="name@company.com"
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Password</label>
                                <input type="password" required value={newEmp.password}
                                    onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                                    placeholder="••••••••"
                                    className={inputCls} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                                    Add Employee
                                </button>
                                <button type="button" onClick={() => setAddingEmp(false)}
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

export default Employees
