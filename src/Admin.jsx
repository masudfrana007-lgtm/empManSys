import { useEffect, useState } from "react";

const API = "http://159.198.40.145:5001";

export default function Admin({ onLogout }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "staff",
  });
  const [error, setError] = useState("");

  /* =========================
     FRONTEND ROLE PROTECTION
     ========================= */
  if (role !== "super-admin") {
    return (
      <div className="page bg">
        <div className="card">
          <h2>Access Denied</h2>
          <p>Super-admin access only</p>
          <button className="back-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     LOAD USERS
     ========================= */
  const loadUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================
     CREATE USER
     ========================= */
  const createUser = async () => {
    setError("");

    const res = await fetch(`${API}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Failed to create user");
      return;
    }

    setForm({ username: "", password: "", role: "staff" });
    loadUsers();
  };

  /* =========================
     UPDATE ROLE
     ========================= */
  const updateRole = async (id, role) => {
    await fetch(`${API}/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    loadUsers();
  };

  /* =========================
     DELETE USER
     ========================= */
  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadUsers();
  };

  return (
    <div className="page bg">
      <div className="card wide">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Super Admin Panel — User Management</h2>
          <button className="back-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* CREATE USER */}
        <h3 style={{ marginTop: 20 }}>Create User</h3>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
          <button className="btn btn-save" onClick={createUser}>
            Create
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {/* USERS TABLE */}
        <h3 style={{ marginTop: 30 }}>Users</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateRole(u.id, e.target.value)
                    }
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </td>
                <td>
                  {u.username !== "superadmin" && (
                    <button
                      className="btn btn-cancel"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
