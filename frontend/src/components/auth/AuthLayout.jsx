function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 backdrop-blur-xl shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;