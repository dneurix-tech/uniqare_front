import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.email === "admin@uniqare.com" && form.password === "123456") {
      localStorage.setItem("uniqare_admin_logged_in", "true");
      navigate("/admin");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>uniqare Admin</h1>
        <p>Login to manage products and orders</p>

        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@uniqare.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="123456"
          />
        </div>

        <button className={styles.loginButton} type="submit">
          Login
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </form>
    </main>
  );
}