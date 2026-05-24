import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { dummyProfileData } from '../assets/assets'
import {
    User as UserIcon,
    X as XIcon,
    Menu as MenuIcon,
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileText,
    DollarSign,
    Settings,
    LogOut
} from 'lucide-react'

const adminNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/leave', label: 'Leave', icon: FileText },
    { to: '/payslips', label: 'Payslips', icon: DollarSign },
    { to: '/settings', label: 'Settings', icon: Settings },
]

const employeeNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/leave', label: 'Leave', icon: FileText },
    { to: '/payslips', label: 'Payslips', icon: DollarSign },
    { to: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = () => {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [userName, setUserName] = useState('')
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('userRole')
        navigate('/login')
    }

    // Read role set during login
    const role = localStorage.getItem('userRole') || 'EMPLOYEE'
    const navItems = role === 'EMPLOYEE' ? adminNavItems : employeeNavItems

    useEffect(() => {
        setUserName(dummyProfileData.firstName + ' ' + dummyProfileData.lastName)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const sidebarContent = (
        <div className='flex flex-col h-full'>
            {/* Brand header */}
            <div className='px-5 pt-6 pb-5 border-b border-white/10'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <UserIcon className='text-white size-7' />
                        <div>
                            <p className='font-semibold text-[13px] text-white tracking-wide'>Employee MS</p>
                            <p className='text-[11px] text-slate-500 font-medium'>Management System</p>
                        </div>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className='lg:hidden text-slate-400 hover:text-white p-1'>
                        <XIcon size={20} />
                    </button>
                </div>
            </div>

            {/* User profile card */}
            {userName && (
                <div className='mx-3 mt-4 p-3 rounded-lg bg-white/5 border border-white/10'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0'>
                            <span className='text-white text-xs font-semibold'>
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className='text-sm font-medium text-white'>{userName}</p>
                            <p className='text-[11px] text-slate-400 capitalize'>{role.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section label */}
            <div className='px-5 pt-6 pb-2'>
                <p className='text-[10px] font-semibold text-slate-500 tracking-widest uppercase'>Navigation</p>
            </div>

            {/* Navigation List */}
            <nav className='flex-1 px-3 space-y-0.5'>
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                                isActive
                                    ? 'bg-indigo-600/80 text-white font-medium'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className='px-3 pb-6 pt-2 border-t border-white/10 mt-2'>
                <button onClick={handleLogout} className='flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150'>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile hamburger button */}
            <button onClick={() => setMobileOpen(true)} className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10'>
                <MenuIcon size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40' onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar - desktop */}
            <aside className='hidden lg:flex flex-col h-full w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shrink-0 border-r border-white/10'>
                {sidebarContent}
            </aside>

            {/* Sidebar - mobile */}
            <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white z-50 flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>
        </>
    )
}

export default Sidebar
