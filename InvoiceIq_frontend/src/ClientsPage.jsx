import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const API = "https://invoiceiq-backend-zjma.onrender.com/api/clients"

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
})

const inputStyle = {
  border: "0.5px solid #E5E7EB",
  borderRadius: "12px",
  padding: "8px 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
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

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" style={{ border: "0.5px solid #E5E7EB" }}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold" style={{ color: "#111827" }}>{title}</h2>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ClientForm({ form, onChange, error, loading, submitLabel, onSubmit, onCancel }) {
  const fields = [
    { name: "name", label: "Full Name *", placeholder: "Arjun Mehta" },
    { name: "company", label: "Company", placeholder: "Mehta & Co." },
    { name: "email", label: "Email *", type: "email", placeholder: "arjun@mehta.in" },
    { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  ]
  return (
    <div className="flex flex-col gap-4">
      {fields.map(f => (
        <div key={f.name}>
          <label className="text-xs mb-1 block" style={{ color: "#6B7280" }}>{f.label}</label>
          <input
            name={f.name}
            type={f.type || "text"}
            value={form[f.name]}
            onChange={onChange}
            placeholder={f.placeholder}
            style={inputStyle}
            className="focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      ))}
      {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={onSubmit} disabled={loading}
          className="flex-1 rounded-xl py-2 text-sm font-medium disabled:opacity-50 transition-all"
          style={{ background: "#4F46E5", color: "#fff", border: "none" }}
          onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
          onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}>
          {loading ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-4 rounded-xl text-sm transition-all"
            style={{ border: "0.5px solid #E5E7EB", color: "#6B7280", background: "transparent" }}
            onMouseOver={e => e.currentTarget.style.background = "#F9FAFB"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return }
    setLoading(true)
    try {
      const res = await axios.post(API, form, getAuthHeaders())
      onAdd(res.data)
      onClose()
    } catch { setError("Failed to add client.") }
    finally { setLoading(false) }
  }

  return (
    <ModalShell title="Add Client" onClose={onClose}>
      <ClientForm
        form={form}
        onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
        error={error}
        loading={loading}
        submitLabel="Add Client"
        onSubmit={handleSubmit}
      />
    </ModalShell>
  )
}

function EditClientModal({ client, onClose, onUpdate }) {
  const [form, setForm] = useState({
    name: client.name || "", company: client.company || "",
    email: client.email || "", phone: client.phone || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return }
    setLoading(true)
    try {
      const res = await axios.put(`${API}/${client.id}`, form, getAuthHeaders())
      onUpdate(res.data)
      onClose()
    } catch { setError("Failed to update client.") }
    finally { setLoading(false) }
  }

  return (
    <ModalShell title="Edit Client" onClose={onClose}>
      <ClientForm
        form={form}
        onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
        error={error}
        loading={loading}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </ModalShell>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(API, getAuthHeaders()).then(res => setClients(res.data))
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return
    await axios.delete(`${API}/${id}`, getAuthHeaders())
    setClients(clients.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB" }}>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white" style={{ borderBottom: "0.5px solid #E5E7EB" }}>
        <Logo />
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")}
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ color: "#6B7280", border: "0.5px solid #E5E7EB", background: "transparent" }}
            onMouseOver={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#D1D5DB" }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#E5E7EB" }}>
            Dashboard
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="text-sm px-5 py-2 rounded-xl font-medium transition-all"
            style={{ background: "#4F46E5", color: "#fff", border: "none" }}
            onMouseOver={e => e.currentTarget.style.background = "#4338CA"}
            onMouseOut={e => e.currentTarget.style.background = "#4F46E5"}>
            + Add Client
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
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#4F46E5" }}>Client Book</p>
          <h2 className="text-2xl font-bold mt-1" style={{ color: "#111827" }}>Your Clients</h2>
        </div>

        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #E5E7EB" }}>
          {clients.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base mb-1" style={{ color: "#6B7280" }}>No clients yet</p>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>Add your first client to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: "#F9FAFB", borderBottom: "0.5px solid #E5E7EB" }}>
                <tr>
                  {["Name", "Company", "Email", "Phone", "Added", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "0.5px solid #F3F4F6" }}>
                    <td className="px-6 py-4 font-medium" style={{ color: "#111827" }}>{c.name}</td>
                    <td className="px-6 py-4" style={{ color: "#6B7280" }}>{c.company || "—"}</td>
                    <td className="px-6 py-4" style={{ color: "#6B7280" }}>{c.email}</td>
                    <td className="px-6 py-4" style={{ color: "#6B7280" }}>{c.phone || "—"}</td>
                    <td className="px-6 py-4 text-xs" style={{ color: "#9CA3AF" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setEditingClient(c)} title="Edit"
                          className="text-lg transition-colors" style={{ color: "#9CA3AF" }}
                          onMouseOver={e => e.currentTarget.style.color = "#4F46E5"}
                          onMouseOut={e => e.currentTarget.style.color = "#9CA3AF"}>
                          ✎
                        </button>
                        <button onClick={() => handleDelete(c.id)} title="Delete"
                          className="transition-colors" style={{ color: "#9CA3AF" }}
                          onMouseOver={e => e.currentTarget.style.color = "#EF4444"}
                          onMouseOut={e => e.currentTarget.style.color = "#9CA3AF"}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onAdd={(c) => setClients([...clients, c])} />
      )}
      {editingClient && (
        <EditClientModal client={editingClient} onClose={() => setEditingClient(null)}
          onUpdate={(updated) => setClients(clients.map(c => c.id === updated.id ? updated : c))} />
      )}
    </div>
  )
}
