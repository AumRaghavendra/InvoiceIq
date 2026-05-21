import { useEffect, useState } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"

const API = "http://localhost:8080/api/invoices"

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
})

const healthConfig = {
  RED:    { dot: "🔴", label: "Overdue",  bg: "bg-red-50",    text: "text-red-700",    border: "border-l-4 border-red-400" },
  YELLOW: { dot: "🟡", label: "Due Soon", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-l-4 border-yellow-400" },
  GREEN:  { dot: "🟢", label: "On Track", bg: "bg-green-50",  text: "text-green-700",  border: "border-l-4 border-green-400" },
}

const Logo = () => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#4F46E5"/>
        <path d="M18 5 L10 18 L16 18 L14 27 L22 14 L16 14 Z" fill="white"/>
      </svg>
      <span className="text-xl font-bold" style={{ color: "#111827" }}>InvoiceIQ</span>
    </div>
  )
}

function HealthBadge({ riskLevel, dueDate }) {
  const config = healthConfig[riskLevel]
  const days = Math.abs(Math.round((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)))
  const label = riskLevel === "RED"
    ? `${config.dot} Overdue ${days}d`
    : riskLevel === "YELLOW"
    ? `${config.dot} Due by ${days}d`
    : `${config.dot} On Track`
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label}
    </span>
  )
}

function NudgeModal({ invoice, onClose, onSent }) {
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState("")

  useEffect(() => {
    const days = Math.round((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    const daysOverdue = Math.round((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))
    const isHardOverdue = invoice.riskLevel === "RED" && daysOverdue >= 30

    const prompt = isHardOverdue
      ? `Write a firm payment follow-up email. No pleasantries.
- Client: ${invoice.clientName}
- Invoice No: ${invoice.invoiceCode}
- Amount: ₹${invoice.amount.toLocaleString()}
- Due Date: ${invoice.dueDate} (${daysOverdue} days overdue)

Use this structure:
Greeting line, one firm sentence stating the invoice is unpaid and how many days overdue, request for immediate settlement, sign off as 'Team InvoiceIQ'.
No bullet points. Max 60 words.`

      : invoice.riskLevel === "RED"
      ? `Write a professional overdue payment reminder email.
- Client: ${invoice.clientName}
- Invoice No: ${invoice.invoiceCode}
- Amount: ₹${invoice.amount.toLocaleString()}
- Due Date: ${invoice.dueDate} (${daysOverdue} days overdue)

Use this exact structure:
1. Greeting line
2. One short paragraph referencing the invoice
3. A details block with Invoice No, Amount, Due Date, Status (Overdue by ${daysOverdue} days) — formatted with colons aligned
4. One closing line requesting payment
5. Sign off as 'Team InvoiceIQ'
No extra commentary. Max 120 words.`

      : `Write a friendly payment reminder email.
- Client: ${invoice.clientName}
- Invoice No: ${invoice.invoiceCode}
- Amount: ₹${invoice.amount.toLocaleString()}
- Due Date: ${invoice.dueDate} (due in ${days} days)

Use this structure:
Greeting, one sentence reminding about the invoice with amount and due date, one polite CTA, sign off as 'Team InvoiceIQ'.
No bullet points. Max 60 words.`

    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      })
    })
    .then(res => res.json())
    .then(data => {
      setDraft(data.choices[0].message.content)
      setLoading(false)
    })
    .catch(err => console.error("Fetch error:", err))
  }, [])

  const handleSend = async () => {
    setSending(true)
    setSendStatus("")
    try {
      await axios.post(`${API}/${invoice.id}/send`, { draft }, getAuthHeaders())
      setSendStatus("success")
      onSent(invoice.id)
    } catch (err) {
      setSendStatus("error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" style={{ border: "0.5px solid #E5E7EB" }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>Draft Follow-up</h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>{invoice.clientName} · ₹{invoice.amount.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>✕</button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4F46E5", borderTopColor: "transparent" }} />
              <p className="text-sm animate-pulse" style={{ color: "#9CA3AF" }}>Drafting email with AI...</p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              className="w-full rounded-xl p-4 text-sm h-48 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 whitespace-pre-wrap text-left"
              style={{ border: "0.5px solid #E5E7EB", color: "#374151" }}
              value={draft}
              onChange={e => setDraft(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => navigator.clipboard.writeText(draft)}
                className="flex-1 rounded-xl py-2 text-sm font-medium transition-all"
                style={{ border: "0.5px solid #C7D2FE", color: "#4F46E5", background: "transparent" }}
                onMouseOver={e => e.currentTarget.style.background = "#EEF2FF"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                Copy
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 rounded-xl py-2 text-sm font-medium disabled:opacity-50 transition-all"
                style={{ background: "#4F46E5", color: "#fff", border: "none" }}
                onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
                onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
              <button onClick={onClose} className="px-4 rounded-xl text-sm transition-all"
                style={{ border: "0.5px solid #E5E7EB", color: "#6B7280", background: "transparent" }}
                onMouseOver={e => e.currentTarget.style.background = "#F9FAFB"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                Close
              </button>
            </div>
            {sendStatus === "success" && (
              <p className="text-xs mt-2 text-center" style={{ color: "#16A34A" }}> Email sent to {invoice.clientEmail}</p>
            )}
            {sendStatus === "error" && (
              <p className="text-xs mt-2 text-center" style={{ color: "#EF4444" }}> Failed to send. Please try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AddInvoiceModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ clientName: "", clientEmail: "", amount: "", dueDate: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.clientName || !form.clientEmail || !form.amount || !form.dueDate) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(API, {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
      }, getAuthHeaders())
      onAdd(res.data)
      onClose()
    } catch (err) {
      setError("Failed to add invoice. Check your inputs.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" style={{ border: "0.5px solid #E5E7EB" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>Add Invoice</h2>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>✕</button>
        </div>
        <div className="flex flex-col gap-4">
          {["clientName", "clientEmail", "amount", "dueDate"].map((field) => (
            <div key={field}>
              <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>
                {field === "clientName" ? "Client Name" : field === "clientEmail" ? "Client Email" : field === "amount" ? "Amount (₹)" : "Due Date"}
              </label>
              <input
                name={field}
                type={field === "amount" ? "number" : field === "dueDate" ? "date" : field === "clientEmail" ? "email" : "text"}
                value={form[field]}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ border: "0.5px solid #E5E7EB" }}
                placeholder={field === "clientName" ? "Arjun Mehta" : field === "clientEmail" ? "arjun@mehta.in" : field === "amount" ? "50000" : ""}
              />
            </div>
          ))}
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full rounded-xl py-2 text-sm font-medium disabled:opacity-50 transition-all"
            style={{ background: "#4F46E5", color: "#fff", border: "none" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}>
            {loading ? "Adding..." : "Add Invoice"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  const userName = localStorage.getItem("name") || "User"

  useEffect(() => {
    axios.get(API, getAuthHeaders()).then(res => setInvoices(res.data))
  }, [])

  const markAsPaid = (id) => {
    axios.patch(`${API}/${id}/pay`, {}, getAuthHeaders())
      .then(res => setInvoices(invoices.map(inv => inv.id === id ? res.data : inv)))
  }

  const deleteInvoice = (id) => {
    if (!window.confirm("Delete this invoice?")) return
    axios.delete(`${API}/${id}`, getAuthHeaders())
      .then(() => setInvoices(invoices.filter(inv => inv.id !== id)))
  }

  const handleSent = (id) => {
    setInvoices(invoices.map(inv =>
      inv.id === id ? { ...inv, lastContactedAt: new Date().toISOString() } : inv
    ))
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const overdue = invoices.filter(i => i.riskLevel === "RED")
  const pending = invoices.filter(i => i.riskLevel === "YELLOW" || (i.riskLevel === "GREEN" && i.status !== "PAID"))

  const chartData = [
    { name: "Overdue", amount: overdue.reduce((s, i) => s + i.amount, 0) },
    { name: "Pending", amount: pending.reduce((s, i) => s + i.amount, 0) },
  ]

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white" style={{ borderBottom: "0.5px solid #E5E7EB" }}>
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#6B7280" }}>Hey, {userName}</span>
          <button onClick={() => navigate("/clients")}
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ color: "#6B7280", border: "0.5px solid #E5E7EB", background: "transparent" }}
            onMouseOver={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#D1D5DB" }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E5E7EB" }}>
            Clients
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="text-sm px-5 py-2 rounded-xl font-medium transition-all"
            style={{ background: "#4F46E5", color: "#fff", border: "none" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}>
            + Add Invoice
          </button>
          <button onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ color: "#DC2626", border: "0.5px solid #FECACA", background: "#FEF2F2" }}
            onMouseOver={e => { e.currentTarget.style.background = "#FECACA"; e.currentTarget.style.borderColor = "#FCA5A5" }}
            onMouseOut={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#FECACA" }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="px-10 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5" style={{ border: "0.5px solid #E5E7EB" }}>
            <p className="text-sm mb-1" style={{ color: "#6B7280" }}>Total Outstanding</p>
            <p className="text-2xl font-bold" style={{ color: "#111827" }}>₹{total.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-5" style={{ border: "0.5px solid #E5E7EB" }}>
            <p className="text-sm mb-1" style={{ color: "#6B7280" }}>Overdue Invoices</p>
            <p className="text-2xl font-bold" style={{ color: "#DC2626" }}>{overdue.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5" style={{ border: "0.5px solid #E5E7EB" }}>
            <p className="text-sm mb-1" style={{ color: "#6B7280" }}>Total Invoices</p>
            <p className="text-2xl font-bold" style={{ color: "#111827" }}>{invoices.length}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-5 mb-8" style={{ border: "0.5px solid #E5E7EB" }}>
          <p className="text-sm font-medium mb-4" style={{ color: "#6B7280" }}>Outstanding by Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #E5E7EB" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "#F9FAFB", borderBottom: "0.5px solid #E5E7EB" }}>
              <tr>
                {["Client", "Email", "Amount", "Due Date", "Health", "Last Contacted", "Action"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className={`transition-colors hover:bg-gray-50 ${healthConfig[inv.riskLevel].border}`}
                  style={{ borderBottom: "0.5px solid #F3F4F6" }}>
                  <td className="px-6 py-4 font-medium" style={{ color: "#111827" }}>{inv.clientName}</td>
                  <td className="px-6 py-4" style={{ color: "#6B7280" }}>{inv.clientEmail}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: "#111827" }}>₹{inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4" style={{ color: "#6B7280" }}>{inv.dueDate}</td>
                  <td className="px-6 py-4">
                    <HealthBadge riskLevel={inv.riskLevel} dueDate={inv.dueDate} />
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: "#9CA3AF" }}>
                    {inv.lastContactedAt ? new Date(inv.lastContactedAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
                        style={{ color: "#4F46E5", border: "1px solid #C7D2FE", background: "#E0E7FF" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#C7D2FE"; e.currentTarget.style.borderColor = "#A5B4FC" }}
                        onMouseOut={e => { e.currentTarget.style.background = "#E0E7FF"; e.currentTarget.style.borderColor = "#C7D2FE" }}
                      >
                        Draft follow-up 
                      </button>
                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => markAsPaid(inv.id)}
                          className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
                          style={{ color: "#16A34A", border: "1px solid #86EFAC", background: "#BBF7D0" }}
                          onMouseOver={e => { e.currentTarget.style.background = "#86EFAC"; e.currentTarget.style.borderColor = "#4ADE80" }}
                          onMouseOut={e => { e.currentTarget.style.background = "#BBF7D0"; e.currentTarget.style.borderColor = "#86EFAC" }}
                        >
                          Mark as Paid 
                        </button>
                      )}
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        className="text-xs font-medium px-3 py-1 rounded-lg transition-all"
                        style={{ color: "#DC2626", border: "1px solid #FECACA", background: "#FEE2E2" }}
                        onMouseOver={e => { e.currentTarget.style.background = "#FECACA"; e.currentTarget.style.borderColor = "#FCA5A5" }}
                        onMouseOut={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#FECACA" }}
                      >
                        Delete 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <NudgeModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} onSent={handleSent} />
      )}
      {showAddModal && (
        <AddInvoiceModal onClose={() => setShowAddModal(false)} onAdd={(newInv) => setInvoices([...invoices, newInv])} />
      )}
    </div>
  )
}