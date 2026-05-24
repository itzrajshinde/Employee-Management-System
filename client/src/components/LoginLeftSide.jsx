const LoginLeftSide = () => {
    return (
      <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200">
            <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blue-3xl"></div>
            <div className="relative z-10 flex flex-col items-start justify-center p-12 1g:p-20 w-full h-full">
                <h1 className="text-4x1 1g:text-5x1 font-medium text-white mb-6 leading-tight tracking-tight">Employee <br /> Managament System</h1>
                <p className="text-slate-400 text-1g max-w-md leading-relaxed">Streamline your workforce operations, track attendance, manage payroll, andempower your team securely.</p>
            </div>
      </div>
    )
  }
  
  export default LoginLeftSide