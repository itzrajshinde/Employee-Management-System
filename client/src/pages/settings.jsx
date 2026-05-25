import { useState } from "react"
import { dummyProfileData } from "../assets/assets"
import { User, Lock, Save, Eye, EyeOff, X } from "lucide-react"
import toast from "react-hot-toast"

const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"

const Settings = () => {
    const role = localStorage.getItem("userRole") || "ADMIN"

    // Profile state
    const [profile, setProfile] = useState({
        firstName: dummyProfileData.firstName,
        lastName: dummyProfileData.lastName,
        email: dummyProfileData.email,
        position: "",
        bio: "",
    })

    // Password state
    const [changingPassword, setChangingPassword] = useState(false)
    const [passwords, setPasswords] = useState({ old: "", new: "" })
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [savedPassword, setSavedPassword] = useState("password123") // simulated stored password

    const handleProfileSave = (e) => {
        e.preventDefault()
        toast.success("Profile updated successfully")
    }

    const handlePasswordSave = (e) => {
        e.preventDefault()
        if (passwords.old !== savedPassword) {
            toast.error("Old password is incorrect")
            return
        }
        if (passwords.new.length < 6) {
            toast.error("New password must be at least 6 characters")
            return
        }
        setSavedPassword(passwords.new)
        setPasswords({ old: "", new: "" })
        setChangingPassword(false)
        toast.success("Password changed successfully")
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
            </div>

            {/* Public Profile — admin only */}
            {role === "ADMIN" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
                    <div className="flex items-center gap-2 mb-6">
                        <User size={18} className="text-slate-500" />
                        <h2 className="text-base font-semibold text-slate-800">Public Profile</h2>
                    </div>
                    <form onSubmit={handleProfileSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={`${profile.firstName} ${profile.lastName}`}
                                    onChange={(e) => {
                                        const [first, ...rest] = e.target.value.split(" ")
                                        setProfile({ ...profile, firstName: first, lastName: rest.join(" ") })
                                    }}
                                    placeholder="John Doe"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    placeholder="johndoe@example.com"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
                            <input
                                type="text"
                                value={profile.position}
                                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                            <textarea
                                rows={3}
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                placeholder="Write a brief bio..."
                                className={`${inputCls} resize-none`}
                            />
                            <p className="text-xs text-slate-400 mt-1">This will be displayed on your profile.</p>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                                <Save size={15} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Password section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Lock size={16} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Password</p>
                            <p className="text-xs text-slate-400">Update your account password</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setChangingPassword(true)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        Change
                    </button>
                </div>
            </div>

            {/* Change Password modal */}
            {changingPassword && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock size={18} className="text-slate-700" />
                                <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
                            </div>
                            <button onClick={() => { setChangingPassword(false); setPasswords({ old: "", new: "", confirm: "" }) }}
                                className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordSave} className="px-6 pb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showOld ? "text" : "password"}
                                        required
                                        value={passwords.old}
                                        onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                                        className={`${inputCls} pr-10`}
                                    />
                                    <button type="button" onClick={() => setShowOld(!showOld)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        required
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className={`${inputCls} pr-10`}
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button"
                                    onClick={() => { setChangingPassword(false); setPasswords({ old: "", new: "", confirm: "" }) }}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings
