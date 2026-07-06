import styles from "./Button.module.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  full = false,
  disabled = false,
  onClick,
}) {
  const buttonClass = [
    styles.button,
    styles[variant],
    full ? styles.full : "",
  ].join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}