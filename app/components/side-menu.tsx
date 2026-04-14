import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useRouteLoaderData } from "react-router";
import { GraduationCap, Home, BookOpen, Trophy, LibraryBig, Download, Settings, User, LogOut, CreditCard, List, Info, MessageSquare, Sun, Moon } from "lucide-react";
import { ProfileAvatar } from "./profile-avatar";
import { LogoutConfirmModal } from "./logout-confirm-modal";
import { useColorScheme } from "@dazl/color-scheme/react";
import { getSession, getStudentAuth } from "~/lib/auth.client";
import styles from "./side-menu.module.css";

function ThemeToggleButton() {
  const { resolvedScheme, setColorScheme } = useColorScheme();
  const isDark = resolvedScheme === 'dark';
  return (
    <button
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      className={styles.themeToggleButton}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}

interface SideMenuProps {
  onClose: () => void;
}

export function SideMenu({ onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const rootData = useRouteLoaderData("root") as any;
  const [student, setStudent] = useState<any>(() => {
    const session = getSession();
    if (!session || session.userType !== "student") return null;
    return {
      id: session.userId,
      ...(session.userSnapshot || {}),
    };
  });

  const enableCompetitions = rootData?.enableCompetitions !== false;
  const enableLibrary = rootData?.enableLibrary !== false;
  const appName = rootData?.appName || 'Magster';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const nextStudent = await getStudentAuth();
      if (mounted) {
        setStudent(nextStudent);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onClose();
    navigate("/logout");
  };

  const isActive = (path: string) => location.pathname === path;
  const studentPhone = student?.phone_number
    ? student.phone_number.startsWith("+")
      ? student.phone_number
      : `+251${student.phone_number}`
    : "";

  const menuItems = [
    { to: "/home-page", icon: Home, label: "Home" },
    { to: "/my-courses", icon: BookOpen, label: "My Courses" },
    { to: "/my-enrollments", icon: List, label: "My Enrollments" },
    { to: "/my-payments", icon: CreditCard, label: "My Payments" },
    { to: "/downloads", icon: Download, label: "Downloads" },
    { to: "/testimonials", icon: MessageSquare, label: "Testimonials" },
    { to: "/student-how-to-use", icon: User, label: "How to Use" },
    { to: "/about", icon: Info, label: "About Us" },
  ];

  const accountItems = [
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <GraduationCap className={styles.logoIcon} />
          <span>{appName}</span>
        </div>
      </div>

      <div className={styles.profile}>
        <ProfileAvatar
          profilePicture={student?.profile_picture_url || student?.profile_picture}
          userName={student?.full_name || 'Student'}
          editable={false}
          size="md"
        />
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>{student?.full_name || 'Student Name'}</div>
          <div className={styles.profileEmail}>{studentPhone}</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>Navigation</div>
          <ul className={styles.navList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`${styles.navItem} ${isActive(item.to) ? styles.navItemActive : ""}`}
                    onClick={onClose}
                  >
                    <Icon className={styles.navIcon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>Account</div>
          <ul className={styles.navList}>
            {accountItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`${styles.navItem} ${isActive(item.to) ? styles.navItemActive : ""}`}
                    onClick={onClose}
                  >
                    <Icon className={styles.navIcon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <ThemeToggleButton />
          <button className={styles.logoutButton} onClick={handleLogoutClick}>
            <LogOut className={styles.navIcon} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
