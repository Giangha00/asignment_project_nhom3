export default function App() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 520 }}>
      <h1 style={{ fontSize: "1.25rem" }}>Dự án đang dùng backend API</h1>
      <p style={{ color: "#444", lineHeight: 1.6 }}>
        Không có trang <code>pages/</code>. Chạy server:{" "}
        <code style={{ background: "#eee", padding: "2px 6px" }}>npm run server</code> hoặc{" "}
        <code style={{ background: "#eee", padding: "2px 6px" }}>npm run dev</code>
      </p>
      <p style={{ color: "#444" }}>
        Kiểm tra: <code>http://localhost:4000/api/health</code> (đổi cổng theo <code>API_PORT</code> trong{" "}
        <code>.env</code>).
      </p>
    </main>
  );
}
