import { useEffect, useState } from "react";
import { useLang } from "./LanguageContext";

const API = "http://159.198.40.145:5001";

export default function Home({ onLogout }) {
  const { t, lang, changeLang } = useLang();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const canEdit = role === "admin" || role === "super-admin";

  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  /* =========================
     FILTER STATE
     ========================= */
  const [filters, setFilters] = useState({
    name: "",
    join_date: "",
    office: "",
    nationality: "",
    room: "",
    status: "",
  });

  /* =========================
     LOAD EMPLOYEES (FIFO)
     ========================= */
  const loadEmployees = async () => {
    const res = await fetch(`${API}/api/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setEmployees(data); // assume backend returns ASC
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* =========================
     FILTER LOGIC
     ========================= */
  const filtered = employees.filter((e) =>
    (e.name || "").toLowerCase().includes(filters.name.toLowerCase()) &&
    (e.join_date || "").toLowerCase().includes(filters.join_date.toLowerCase()) &&
    (e.office || "").toLowerCase().includes(filters.office.toLowerCase()) &&
    (e.nationality || "").toLowerCase().includes(filters.nationality.toLowerCase()) &&
    (e.room || "").toLowerCase().includes(filters.room.toLowerCase()) &&
    (e.status || "").toLowerCase().includes(filters.status.toLowerCase())
  );

  /* =========================
     VALIDATION
     ========================= */
  const isFormValid = () => {
    return (
      form.name &&
      form.join_date &&
      form.office &&
      form.nationality &&
      form.room &&
      form.status
    );
  };

  /* =========================
     EDIT HANDLERS
     ========================= */
  const startEdit = (emp) => {
    setEditingId(emp.id);
    setForm({ ...emp });
  };

  const cancelEdit = () => {
    if (form.isNew) {
      setEmployees((prev) => prev.filter((e) => e.id !== editingId));
    }
    setEditingId(null);
    setForm({});
  };

  const saveEdit = async () => {
    if (!isFormValid()) {
      alert(t.allFieldsRequired);
      return;
    }

    if (form.isNew) {
      /* CREATE */
      const res = await fetch(`${API}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          joinDate: form.join_date,
          office: form.office,
          nationality: form.nationality,
          room: form.room,
          status: form.status,
        }),
      });

      const data = await res.json();

      // ✅ Replace temp row (NO duplicate, NO empty row)
      setEmployees((prev) =>
        prev.map((e) => (e.id === editingId ? data : e))
      );
    } else {
      /* UPDATE */
      await fetch(`${API}/api/employees/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          joinDate: form.join_date,
          office: form.office,
          nationality: form.nationality,
          room: form.room,
          status: form.status,
        }),
      });

      setEmployees((prev) =>
        prev.map((e) => (e.id === editingId ? { ...form } : e))
      );
    }

    setEditingId(null);
    setForm({});
  };

  const addEmployee = () => {
    const tempEmp = {
      id: Date.now(), // temp ID
      name: "",
      join_date: "",
      office: "",
      nationality: "",
      room: "",
      status: "",
      isNew: true,
    };

    // ✅ FIFO → append temp row at bottom
    setEmployees((prev) => [...prev, tempEmp]);
    setEditingId(tempEmp.id);
    setForm(tempEmp);
  };

  return (
    <div className="page bg">
      {/* 🌐 Language Switch */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={() => changeLang("en")} disabled={lang === "en"}>
          EN
        </button>
        <button onClick={() => changeLang("zh")} disabled={lang === "zh"}>
          中文
        </button>
      </div>

      <div className="card wide">
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{t.employeeInfo}</h2>
          <button className="back-btn" onClick={onLogout}>
            {t.logout}
          </button>
        </div>

        {/* ADD BUTTON */}
        {canEdit && (
          <button
            className="login-btn"
            style={{ marginTop: 12 }}
            onClick={addEmployee}
            disabled={editingId !== null}
          >
            {t.addEmployee}
          </button>
        )}

        {/* SEARCH ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.5fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
            gap: 8,
            marginTop: 16,
          }}
        >
          <input disabled placeholder="#" />
          <input placeholder={t.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <input placeholder={t.joinDate} onChange={(e) => setFilters({ ...filters, join_date: e.target.value })} />
          <input placeholder={t.office} onChange={(e) => setFilters({ ...filters, office: e.target.value })} />
          <input placeholder={t.nationality} onChange={(e) => setFilters({ ...filters, nationality: e.target.value })} />
          <input placeholder={t.room} onChange={(e) => setFilters({ ...filters, room: e.target.value })} />
          <input placeholder={t.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} />
        </div>

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>{t.name}</th>
              <th>{t.joinDate}</th>
              <th>{t.office}</th>
              <th>{t.nationality}</th>
              <th>{t.room}</th>
              <th>{t.status}</th>
              <th>{t.action}</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td>

                {editingId === e.id ? (
                  <>
                    <td><input value={form.name} onChange={(ev) => setForm({ ...form, name: ev.target.value })} /></td>
                    <td><input value={form.join_date} onChange={(ev) => setForm({ ...form, join_date: ev.target.value })} /></td>
                    <td><input value={form.office} onChange={(ev) => setForm({ ...form, office: ev.target.value })} /></td>
                    <td><input value={form.nationality} onChange={(ev) => setForm({ ...form, nationality: ev.target.value })} /></td>
                    <td><input value={form.room} onChange={(ev) => setForm({ ...form, room: ev.target.value })} /></td>
                    <td><input value={form.status} onChange={(ev) => setForm({ ...form, status: ev.target.value })} /></td>
                    <td>
                      <button className="btn btn-save" onClick={saveEdit}>{t.save}</button>
                      <button className="btn btn-cancel" onClick={cancelEdit}>{t.cancel}</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{e.name}</td>
                    <td>{e.join_date}</td>
                    <td>{e.office}</td>
                    <td>{e.nationality}</td>
                    <td>{e.room}</td>
                    <td>{e.status}</td>
                    <td>
                      {canEdit && (
                        <button className="btn btn-edit" onClick={() => startEdit(e)}>
                          {t.edit}
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
