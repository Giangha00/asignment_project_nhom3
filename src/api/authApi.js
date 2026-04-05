import { api, authStorage } from "./client";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerRequest(fullName, email, password) {
  const { data } = await api.post("/auth/register", { fullName, email, password });
  return data;
}

/** Quên mật khẩu: gửi OTP reset_password tới email (không cần đăng nhập). */
export async function forgotPasswordSendOtpRequest(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

/** Đặt lại mật khẩu bằng OTP từ email quên mật khẩu. */
export async function forgotPasswordResetRequest(email, otpCode, newPassword) {
  const { data } = await api.post("/auth/reset-password", { email, otpCode, newPassword });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/users/me");
  return data;
}

/** Gửi OTP đổi mật khẩu tới email đăng ký (cần đăng nhập). */
export async function sendPasswordChangeOtpRequest() {
  const { data } = await api.post("/users/me/password-change/send-otp");
  return data;
}

/** Đổi mật khẩu sau khi nhận OTP qua email. */
export async function changePasswordWithOtpRequest(newPassword, otpCode) {
  const { data } = await api.patch("/users/me/password", { newPassword, otpCode });
  return data;
}

export function persistSession(token) {
  authStorage.setToken(token);
}

export function clearSession() {
  authStorage.clear();
}
