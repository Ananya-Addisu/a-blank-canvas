import { Link, useLocation, useRouteLoaderData } from "react-router";
import { Home, BookOpen, GraduationCap, Download, Award } from "lucide-react";
import styles from "./bottom-nav.module.css";

export function BottomNav() {
  const location = useLocation();
  const rootData = useRouteLoaderData("root") as any;
  const enableCompetitions = rootData?.enableCompetitions !== false;
  const enableLibrary = rootData?.enableLibrary !== false;

  const navItems = [
    { path: "/home-page", icon: Home, label: "Home" },
    { path: "/my-courses", icon: GraduationCap, label: "My Courses" },
    { path: "/downloads", icon: Download, label: "Downloads" },
    ...(enableLibrary ? [{ path: "/library", icon: BookOpen, label: "Library" }] : []),
    ...(enableCompetitions ? [{ path: "/competitions", icon: Award, label: "Compete" }] : []),
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link key={item.path} to={item.path} className={styles.navItem} data-active={isActive}>
            <Icon className={styles.navIcon} size={22} />
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}