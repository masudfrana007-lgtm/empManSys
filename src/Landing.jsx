import { useNavigate } from "react-router-dom";
import { useLang } from "./LanguageContext";

export default function Landing() {
  const { t, lang, changeLang } = useLang();
  const navigate = useNavigate();

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
        <h1>{t.appTitle}</h1>

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          {t.login}
        </button>
      </div>
    </div>
  );
}
