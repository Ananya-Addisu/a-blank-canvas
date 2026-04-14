import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/admin-login";
import { Eye, EyeOff, Shield, Lock, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button/button";
import { Input } from "~/components/ui/input/input";
import { getSession, loginAdmin, saveSession } from "~/lib/auth.client";
import styles from "./admin-login.module.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Login - Magster" }, { name: "description", content: "Admin access portal" }];
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.userType === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (phoneNumber.length !== 9 || pin.length !== 4) {
        setError("Invalid phone number or PIN format");
        return;
      }

      const result = await loginAdmin(phoneNumber, pin);

      if (!result.success) {
        setError(result.error || 'Invalid admin credentials');
        return;
      }

      saveSession(result.user.id, 'admin');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <Loader2 size={32} className={styles.spinner} />
        </div>
      )}
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Shield className={styles.icon} size={64} />
        </div>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Admin Portal</h1>
            <p className={styles.subtitle}>Administrative Access Only</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.phoneInputWrapper}>
                <div className={styles.countryCode}>+251</div>
                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  className={styles.phoneInput}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  required
                />
              </div>
              <span className={styles.counter}>{phoneNumber.length}/9</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Admin PIN</label>
              <div className={styles.pinInputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <Input
                  name="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter 4-digit PIN"
                  className={styles.pinInput}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  required
                />
                <button type="button" className={styles.togglePin} onClick={() => setShowPin(!showPin)}>
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className={styles.counter}>{pin.length}/4</span>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className={styles.submitButton}
              disabled={isSubmitting || phoneNumber.length !== 9 || pin.length !== 4}
            >
              {isSubmitting ? "Logging in..." : "Access Admin Panel"}
            </Button>
          </form>

          <div className={styles.footer}>
            <Link to="/login" className={styles.backLink}>
              ← Back to Student Login
            </Link>
          </div>
        </div>

        <div className={styles.warning}>
          <p className={styles.warningText}>
            This portal is restricted to authorized administrators only. 
            All activities are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}