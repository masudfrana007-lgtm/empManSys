import { useState } from "react";
import { useLang } from "./LanguageContext";
import { useNavigate } from "react-router-dom";

const API = "http://159.198.40.145:5001";

export default function Login() {
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password: pass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t.loginFailed);
        setLoading(false);
        return;
      }

      // ✅ Save auth info
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      setLoading(false);

      // ✅ Route by role
      if (data.role === "super-admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(t.serverError);
      setLoading(false);
    }
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

      <div className="card">
        <h2>{t.login}</h2>

        <input
          placeholder={t.username}
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          type="password"
          placeholder={t.password}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button
          className="login-btn"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t.loggingIn : t.login}
        </button>

        {/* ⬅ Back to landing */}
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← {t.back}
        </button>
      </div>
    </div>
  );
}
