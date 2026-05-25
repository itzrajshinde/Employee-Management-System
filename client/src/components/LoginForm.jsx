import { Link, useNavigate } from "react-router-dom"
import LoginLeftSide from "./LoginLeftSide"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

const LoginForm = ({ role }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const title = role === "admin" ? "Admin Portal" : "Employee Portal"
    const subtitle = role === "admin"
        ? "Sign in to manage the organization."
        : "Sign in to access your account."

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        localStorage.setItem('userRole', role === 'admin' ? 'ADMIN' : 'EMPLOYEE')
        setLoading(false)
        navigate('/dashboard')
    }

    return (
      <div className='min-h-screen flex flex-col md:flex-row'>
            <LoginLeftSide />
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md animate-fade-in">
                    <Link to='/login' className='inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors'>
                        <ArrowLeft size={16}/> Back to Portals
                    </Link>
                    <div className="mb-8">
                        <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-2">{title}</h2>
                        <p className="text-slate-500">{subtitle}</p>
                    </div>

                    {error && (
                        <div className='mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-start gap-3'>
                            <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0'/>
                            {error}
                        </div>
                    )}

                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder='you@example.com'
                                className='w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-slate-700 mb-2'>Password</label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder='••••••••'
                                    className='w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition'
                                />
                                <button
                                    type='button'
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors duration-200'
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
      </div>
    )
}

export default LoginForm
