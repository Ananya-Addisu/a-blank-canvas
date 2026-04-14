import { useState, useCallback } from "react";
import { Lock } from "lucide-react";
import styles from "./admin-access-gate.module.css";

interface AdminAccessGateProps {
  onAccessGranted: () => void;
  accessCode: string;
}

export function AdminAccessGate({ onAccessGranted, accessCode }: AdminAccessGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (code === accessCode) {
      sessionStorage.setItem("admin_access_granted", "true");
      onAccessGranted();
    } else {
      setError("Incorrect access code");
      setShake(true);
      setCode("");
      setTimeout(() => setShake(false), 500);
    }
  }, [code, accessCode, onAccessGranted]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.iconCircle}>
          <Lock size={28} />
        </div>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>Enter the access code to continue</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputGroup} ${shake ? styles.shake : ""}`}>
            <input
              type="password"
              className={styles.codeInput}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Access code"
              autoFocus
              autoComplete="off"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!code.trim()}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
