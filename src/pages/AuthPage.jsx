import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  changePasswordWithOtpRequest,
  forgotPasswordResetRequest,
  forgotPasswordSendOtpRequest,
  sendPasswordChangeOtpRequest,
} from "../api/authApi";

export function AuthPage() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <PasswordOtpTestPanel user={user} onLogout={logout} onGoBoards={() => navigate("/boards")} />;
  }

  return <LoginRegisterForm login={login} register={register} navigate={navigate} />;
}

function PasswordOtpTestPanel({ user, onLogout, onGoBoards }) {
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devOtpHint, setDevOtpHint] = useState("");
  const [expiresHint, setExpiresHint] = useState("");
  const [sendBusy, setSendBusy] = useState(false);
  const [changeBusy, setChangeBusy] = useState(false);

  async function handleSendOtp() {
    setError("");
    setSuccess("");
    setDevOtpHint("");
    setExpiresHint("");
    setSendBusy(true);
    try {
      const data = await sendPasswordChangeOtpRequest();
      setSuccess(data.message || "Đã gửi OTP.");
      if (data.expiresAt) {
        setExpiresHint(`Hết hạn: ${new Date(data.expiresAt).toLocaleString("vi-VN")}`);
      }
      if (data.devOtp) {
        setDevOtpHint(`[Dev] Mã OTP: ${data.devOtp} (chỉ hiện khi không gửi được email hoặc không cấu hình SMTP)`);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Không gửi được OTP");
    } finally {
      setSendBusy(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevOtpHint("");
    setChangeBusy(true);
    try {
      await changePasswordWithOtpRequest(newPassword, otpCode.replace(/\s/g, ""));
      setSuccess("Đã đổi mật khẩu. Lần sau hãy đăng nhập bằng mật khẩu mới.");
      setOtpCode("");
      setNewPassword("");
      setExpiresHint("");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangeBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#22272be6] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
        <h1 className="text-center text-2xl font-semibold text-white">Đổi mật khẩu (OTP)</h1>
        <p className="mt-2 text-center text-sm text-[#9fadbc]">
          Kiểm thử: gửi mã 6 số về email <span className="font-medium text-white">{user.email}</span>, sau đó nhập mã và mật khẩu
          mới.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onGoBoards}
            className="flex-1 min-w-[120px] rounded-[3px] border border-white/20 bg-transparent py-2 text-sm font-semibold text-white hover:bg-white/5"
          >
            Tới bảng
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 min-w-[120px] rounded-[3px] border border-white/20 bg-transparent py-2 text-sm font-semibold text-[#9fadbc] hover:bg-white/5 hover:text-white"
          >
            Đăng xuất
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-[#1d2125] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">Bước 1</p>
          <button
            type="button"
            disabled={sendBusy}
            onClick={handleSendOtp}
            className="mt-3 w-full rounded-[3px] bg-[#0c66e4] py-2.5 text-sm font-semibold text-white hover:bg-[#0055cc] disabled:opacity-50"
          >
            {sendBusy ? "Đang gửi…" : "Gửi mã OTP tới email"}
          </button>
          {expiresHint && <p className="mt-2 text-xs text-[#9fadbc]">{expiresHint}</p>}
        </div>

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">Bước 2</p>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
              Mã OTP (6 số)
            </label>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white tracking-widest placeholder:text-[#738496] focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
              placeholder="123456"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
              Mật khẩu mới
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white placeholder:text-[#738496] focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          {devOtpHint && (
            <div
              className="rounded-[3px] border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
              role="status"
            >
              {devOtpHint}
            </div>
          )}
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
            disabled={changeBusy}
            className="w-full rounded-[3px] bg-[#579dff] py-2.5 text-sm font-semibold text-[#1d2125] hover:bg-[#85b8ff] disabled:opacity-50"
          >
            {changeBusy ? "Đang đổi…" : "Xác nhận đổi mật khẩu"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

function LoginRegisterForm({ login, register, navigate }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotDevOtp, setForgotDevOtp] = useState("");
  const [forgotExpiresHint, setForgotExpiresHint] = useState("");
  const [sendOtpBusy, setSendOtpBusy] = useState(false);
  const [resetPwdBusy, setResetPwdBusy] = useState(false);

  function goLoginTab() {
    setMode("login");
    setError("");
    setSuccess("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotDevOtp("");
    setForgotExpiresHint("");
  }

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

  async function handleSendForgotOtp() {
    setError("");
    setSuccess("");
    setForgotDevOtp("");
    setForgotExpiresHint("");
    if (!email.trim()) {
      setError("Nhập email đã đăng ký");
      return;
    }
    setSendOtpBusy(true);
    try {
      const data = await forgotPasswordSendOtpRequest(email.trim());
      setSuccess(data.message || "Đã gửi OTP.");
      if (data.expiresAt) {
        setForgotExpiresHint(`Hết hạn: ${new Date(data.expiresAt).toLocaleString("vi-VN")}`);
      }
      if (data.devOtp) {
        setForgotDevOtp(
          `[Dev] Mã OTP: ${data.devOtp} (khi chưa cấu hình SMTP hoặc gửi mail lỗi)`
        );
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Không gửi được OTP");
    } finally {
      setSendOtpBusy(false);
    }
  }

  async function handleForgotReset(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setForgotDevOtp("");
    setResetPwdBusy(true);
    try {
      await forgotPasswordResetRequest(email.trim(), forgotOtp.replace(/\s/g, ""), forgotNewPassword);
      setSuccess("Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.");
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotExpiresHint("");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setResetPwdBusy(false);
    }
  }

  if (mode === "forgot") {
    return (
      <AuthShell>
        <div className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#22272be6] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          <h1 className="text-center text-2xl font-semibold text-white">Quên mật khẩu</h1>
          <p className="mt-2 text-center text-sm text-[#9fadbc]">
            Nhập email đã đăng ký → nhận mã OTP → đặt mật khẩu mới. Đăng ký tài khoản mới <strong>không</strong>{" "}
            gửi OTP.
          </p>

          <button
            type="button"
            onClick={goLoginTab}
            className="mt-4 w-full rounded-[3px] border border-white/20 py-2 text-sm font-medium text-[#9fadbc] hover:bg-white/5 hover:text-white"
          >
            ← Quay lại đăng nhập
          </button>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                Email đã đăng ký
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
            <button
              type="button"
              disabled={sendOtpBusy}
              onClick={handleSendForgotOtp}
              className="w-full rounded-[3px] bg-[#0c66e4] py-2.5 text-sm font-semibold text-white hover:bg-[#0055cc] disabled:opacity-50"
            >
              {sendOtpBusy ? "Đang gửi…" : "Gửi mã OTP tới email"}
            </button>
            {forgotExpiresHint && <p className="text-xs text-[#9fadbc]">{forgotExpiresHint}</p>}
          </div>

          <form onSubmit={handleForgotReset} className="mt-6 space-y-4 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">Đặt lại mật khẩu</p>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                Mã OTP (6 số)
              </label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white tracking-widest focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9fadbc]">
                Mật khẩu mới
              </label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                className="w-full rounded-[3px] border border-[#738496] bg-[#1d2125] px-3 py-2.5 text-sm text-white focus:border-[#579dff] focus:outline-none focus:ring-2 focus:ring-[#579dff]/40"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            {forgotDevOtp && (
              <div className="rounded-[3px] border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                {forgotDevOtp}
              </div>
            )}
            {success && (
              <div className="rounded-[3px] border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-[3px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={resetPwdBusy}
              className="w-full rounded-[3px] bg-[#579dff] py-2.5 text-sm font-semibold text-[#1d2125] hover:bg-[#85b8ff] disabled:opacity-50"
            >
              {resetPwdBusy ? "Đang xử lý…" : "Đặt lại mật khẩu"}
            </button>
          </form>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[420px] rounded-xl border border-white/10 bg-[#22272be6] p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
        <h1 className="text-center text-2xl font-semibold text-white">
          {mode === "login" ? "Đăng nhập Nhóm 3" : "Tạo tài khoản"}
        </h1>
        <p className="mt-2 text-center text-sm text-[#9fadbc]">
          {mode === "login"
            ? "Chào mừng trở lại — quản lý bảng và công việc của bạn."
            : "Đăng ký miễn phí — không gửi OTP, chỉ cần email và mật khẩu."}
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
              mode === "login" ? "bg-[#579dff] text-[#1d2125]" : "text-[#9fadbc] hover:text-white"
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
              mode === "register" ? "bg-[#579dff] text-[#1d2125]" : "text-[#9fadbc] hover:text-white"
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
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                  setForgotOtp("");
                  setForgotNewPassword("");
                  setForgotDevOtp("");
                  setForgotExpiresHint("");
                }}
                className="mt-2 text-xs font-medium text-[#579dff] hover:underline"
              >
                Quên mật khẩu? (OTP qua email)
              </button>
            )}
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
          Sau khi đăng nhập, mở lại trang này (<span className="text-[#9fadbc]">/</span>) để thử đổi mật khẩu bằng OTP.
        </p>
      </div>
    </AuthShell>
  );
}

function AuthShell({ children }) {
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

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">{children}</main>
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
