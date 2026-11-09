import AuthLayout from "../components/auth/AuthLayout";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <AuthLayout>
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        Welcome Back 👋
      </h1>

      <p className="mb-8 text-center text-slate-400">
        Sign in to continue using FinAssist AI
      </p>

      <LoginForm />
    </AuthLayout>
  );
}

export default Login;