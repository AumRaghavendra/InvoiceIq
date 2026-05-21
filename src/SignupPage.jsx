import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

const Logo = () => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#4F46E5"/>
        <path d="M18 5 L10 18 L16 18 L14 27 L22 14 L16 14 Z" fill="white"/>
      </svg>
      <span className="text-xl font-bold" style={{ color: "#111827" }}>InvoiceIQ</span>
    </div>
  )
}

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.post("https://invoiceiq-backend-zjma.onrender.com/api/auth/signup", form)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("name", res.data.name)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F9FAFB" }}>
      <nav style={{ borderBottom: "0.5px solid #E5E7EB", background: "#FFFFFF" }} className="flex items-center px-10 py-5">
        <Logo />
      </nav>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm" style={{ border: "0.5px solid #E5E7EB" }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#111827" }}>Create account</h1>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>Get started with InvoiceIQ</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ border: "0.5px solid #E5E7EB" }}
                placeholder="Arjun Mehta" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ border: "0.5px solid #E5E7EB" }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ border: "0.5px solid #E5E7EB" }}
                placeholder="••••••••" />
            </div>

            {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full rounded-xl py-2 text-sm font-medium disabled:opacity-50 transition-all"
              style={{ background: "#4F46E5", color: "#fff", border: "none" }}
              onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
              onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-xs text-center" style={{ color: "#6B7280" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#4F46E5", textDecoration: "underline", textUnderlineOffset: "4px" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}