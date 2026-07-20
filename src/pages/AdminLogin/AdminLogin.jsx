import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/storage";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await adminLogin(
        form.email.trim(),
        form.password
      );

      navigate("/uniqare-control-panel-9x7", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>UNIQARE Admin</h1>
        <p>Login to manage products and orders</p>

        <div className={styles.formGroup}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            minLength={8}
            required
          />
        </div>

        <button
          className={styles.loginButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}
