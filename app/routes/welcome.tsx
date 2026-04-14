import { Link, useNavigate } from "react-router";
import TextLoading from "~/components/ui/text-loading/text-loading";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import type { Route } from "./+types/welcome";
import { useState, useEffect } from "react";
import { getSession } from "~/lib/auth.client";

import styles from "./welcome.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Welcome to Magster - Your Learning Journey Starts Here" },
    { name: "description", content: "Transform your education with Magster. Access world-class courses, compete with peers, and learn at your own pace." }
  ];
}

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.userType === 'student') {
        navigate('/home-page', { replace: true });
        return;
      } else if (session.userType === 'teacher') {
        navigate('/teacher', { replace: true });
        return;
      } else if (session.userType === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
    }
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.splashLogo}>
          <GraduationCap size={72} strokeWidth={1.5} />
        </div>
        <h1 className={styles.splashTitle}>Magster</h1>
        <TextLoading
          texts={["Welcome to Magster...", "Loading your journey...", "Preparing platform...", "Almost ready..."]}
          interval={2000}
          className={styles.splashLoadingText}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.welcomeBadge}>
          <Sparkles size={16} />
          <span>Welcome to the Future of Learning</span>
        </div>
        
        <div className={styles.logoCircle}>
          <GraduationCap size={72} strokeWidth={1.5} />
        </div>
        
        <h1 className={styles.title}>Magster</h1>
        <p className={styles.tagline}>Learn Smarter, Anytime, Anywhere</p>
        <p className={styles.subtitle}>Your gateway to knowledge and excellence</p>
        
        <div className={styles.ctaGroup}>
          <Link to="/login" className={styles.ctaButtonPrimary}>
            Get Started
            <ArrowRight size={20} />
          </Link>
          <Link to="/signup" className={styles.ctaButtonSecondary}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}