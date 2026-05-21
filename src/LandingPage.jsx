import { useNavigate } from "react-router-dom"

const Logo = ({ size = 32, textSize = "text-xl" }) => (
  <div className="flex items-center gap-2">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#4F46E5"/>
      <path d="M18 5 L10 18 L16 18 L14 27 L22 14 L16 14 Z" fill="white"/>
    </svg>
    <span className={`${textSize} font-bold`} style={{ color: "#111827" }}>InvoiceIQ</span>
  </div>
)

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* Navbar */}
      <nav style={{ borderBottom: "0.5px solid #E5E7EB" }} className="flex justify-between items-center px-10 py-5">
        <Logo size={32} textSize="text-xl" />
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ color: "#6B7280", border: "0.5px solid #E5E7EB", background: "transparent" }}
            onMouseOver={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#D1D5DB" }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E5E7EB" }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
            style={{ background: "#4F46E5", color: "#fff", border: "none" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-10 pt-28 pb-24">
        <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: "#4F46E5" }}>
          AI-powered invoice management
        </p>
        <h1 className="text-6xl font-bold leading-tight max-w-2xl mb-7" style={{ color: "#111827" }}>
          Stop chasing<br />payments.
        </h1>
        <p className="text-lg max-w-lg mb-10 leading-relaxed" style={{ color: "#6B7280" }}>
          InvoiceIQ scores every invoice for payment risk and writes follow-up emails with AI.
          Less time chasing clients. More time doing actual work.
        </p>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-medium px-6 py-3 rounded-xl transition-all"
            style={{ background: "#4F46E5", color: "#fff" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}
          >
            Get started free →
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-sm transition-all"
            style={{ color: "#6B7280", textDecoration: "underline", textUnderlineOffset: "4px", background: "transparent", border: "none" }}
            onMouseOver={e => e.currentTarget.style.color = "#111827"}
            onMouseOut={e => e.currentTarget.style.color = "#6B7280"}
          >
            Already have an account
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-10">
        <div style={{ borderTop: "0.5px solid #E5E7EB" }} />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-10 py-24 flex flex-col gap-0">
        <div className="flex justify-between items-start py-14" style={{ borderBottom: "0.5px solid #E5E7EB" }}>
          <div className="flex items-start gap-4 w-1/2">
            <span className="text-xs font-mono mt-1" style={{ color: "#C7C5F4" }}>01</span>
            <h3 className="text-xl font-semibold" style={{ color: "#111827" }}>Payment risk scoring</h3>
          </div>
          <p className="text-sm leading-relaxed w-1/2" style={{ color: "#6B7280" }}>
            Every invoice is automatically scored based on due date and payment history —
            RED, YELLOW, or GREEN. Know who needs a nudge before it becomes a problem.
          </p>
        </div>

        <div className="flex justify-between items-start py-14" style={{ borderBottom: "0.5px solid #E5E7EB" }}>
          <div className="flex items-start gap-4 w-1/2">
            <span className="text-xs font-mono mt-1" style={{ color: "#C7C5F4" }}>02</span>
            <h3 className="text-xl font-semibold" style={{ color: "#111827" }}>AI-drafted follow-ups</h3>
          </div>
          <p className="text-sm leading-relaxed w-1/2" style={{ color: "#6B7280" }}>
            One click generates a professional, context-aware follow-up email. The tone adjusts
            automatically — gentle for upcoming invoices, firm for long overdue ones.
            Edit and send in seconds.
          </p>
        </div>

        <div className="flex justify-between items-start py-14">
          <div className="flex items-start gap-4 w-1/2">
            <span className="text-xs font-mono mt-1" style={{ color: "#C7C5F4" }}>03</span>
            <h3 className="text-xl font-semibold" style={{ color: "#111827" }}>Direct email sending</h3>
          </div>
          <p className="text-sm leading-relaxed w-1/2" style={{ color: "#6B7280" }}>
            Send follow-up emails directly from InvoiceIQ without switching tabs.
            Every send is logged — so you always know when a client was last contacted.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-24" style={{ background: "#F3F4F6" }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#111827" }}>Ready to get paid faster?</h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Built for freelancers and small businesses tired of chasing invoices.
            </p>
          </div>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-medium px-8 py-3 rounded-xl whitespace-nowrap transition-all"
            style={{ background: "#4F46E5", color: "#fff" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}
          >
            Create free account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-6 flex justify-between items-center" style={{ borderTop: "0.5px solid #E5E7EB", background: "#FFFFFF" }}>
        <Logo size={24} textSize="text-sm" />
        <span className="text-xs" style={{ color: "#9CA3AF" }}>Spring Boot · React · Built by a solo developer</span>
      </footer>

    </div>
  )
}