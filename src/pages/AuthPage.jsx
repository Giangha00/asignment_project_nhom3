import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        navigate("/boards", { replace: true });
      } else {
        if (!fullName.trim()) {
          setError("Vui lòng nhập họ tên");
          setBusy(false);
          return;
        }
        await register(fullName.trim(), email.trim(), password);
        setFullName("");
        setPassword("");
        setMode("login");
        setSuccess("Đăng ký thành công. Vui lòng đăng nhập bằng email và mật khẩu vừa tạo.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Đã có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a1628] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 20% 20%, rgba(0, 101, 255, 0.35), transparent 50%),
            radial-gradient(ellipse 100% 70% at 80% 30%, rgba(94, 77, 178, 0.4), transparent 45%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0, 196, 204, 0.2), transparent 40%),
            linear-gradient(165deg, #0d1b2a 0%, #1b263b 45%, #0a1628 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <header className="relative z-10 flex items-center px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <TrelloMark />
          <span className="text-xl sm:text-2xl">Nhóm 3</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#22272be6] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <h1 className="text-center text-2xl font-semibold text-white">
            {mode === "login" ? "Đăng nhập Nhóm 3" : "Tạo tài khoản"}
          </h1>
          <p className="mt-2 text-center text-sm text-[#9fadbc]">
            {mode === "login"
              ? "Chào mừng trở lại — quản lý bảng và công việc của bạn."
              : "Đăng ký miễn phí để bắt đầu không gian làm việc."}
          </p>

          <div className="mt-6 flex rounded-lg bg-[#1d2125] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-[#579dff] text-[#1d2125]"
                  : "text-[#9fadbc] hover:text-white"
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-[#579dff] text-[#1d2125]"
                  : "text-[#9fadbc] hover:text-white"
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                  Họ và tên
                </label>
                <input
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white placeholder:text-[#738496] focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white placeholder:text-[#738496] focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                Mật khẩu
              </label>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white placeholder:text-[#738496] focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
                placeholder="••••••••"
              />
            </div>

            {success && (
              <div
                className="rounded-[3px] border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
                role="status"
              >
                {success}
              </div>
            )}

            {error && (
              <div
                className="rounded-[3px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-[3px] bg-[#0c66e4] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0055cc] disabled:opacity-50"
            >
              {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#738496]">
            Demo: <span className="text-[#9fadbc]">demo@example.com</span> /{" "}
            <span className="text-[#9fadbc]">Demo123!</span>
          </p>
        </div>
      </main>
    </div>
  );
}

function TrelloMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="8" height="18" rx="1.5" fill="white" />
      <rect x="13" y="3" width="8" height="11" rx="1.5" fill="white" opacity="0.85" />
    </svg>
  );
}
