import { Link } from "react-router";
import { BookOpen, Plus, Thermometer, Play, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { LockedIcon } from "./locked-icon";
import TextLoading from "~/components/ui/text-loading/text-loading";
import type { Course } from "~/data/courses";
import styles from "./course-card.module.css";

interface CourseCardProps {
  course: Course & { is_bundle_exclusive?: boolean };
  className?: string;
  isLocked?: boolean;
}

export function CourseCard({ course, className, isLocked = false }: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    if (course.id === "1") return <BookOpen size={28} />;
    if (course.id === "2") return <Plus size={28} />;
    if (course.id === "3") return <Thermometer size={28} />;
    return <BookOpen size={28} />;
  };

  const targetUrl = isLocked ? `/course-preview/${course.id}` : `/course/${course.id}`;

  if (isLoading) {
    return (
      <div className={`${styles.loadingCard} ${className || ""}`}>
        <TextLoading
          texts={["Loading course...", "Preparing content...", "Almost there..."]}
          interval={800}
          className={styles.loadingText}
        />
      </div>
    );
  }

  return (
    <Link to={targetUrl} className={`${styles.cardLink} ${className || ""}`}>
      <div className={`${styles.card} ${isLocked ? styles.locked : ""}`}>
        {isLocked && (
          <div className={styles.lockCorner}>
            <LockedIcon size={18} className={styles.lockIcon} />
          </div>
        )}
        {course.is_bundle_exclusive && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'var(--color-primary-9, #1a73e8)', color: 'white', zIndex: 2, letterSpacing: '0.3px', textTransform: 'uppercase' as const }}>
            <Package size={10} />
            Bundle Only
          </div>
        )}
        <div className={styles.iconWrapper}>{getIcon()}</div>
        <div className={styles.content}>
          <h3 className={styles.title}>{course.title}</h3>
          <p className={styles.category}>{course.category}</p>
        </div>
        <div className={styles.footer}>
          {course.price && <div className={styles.price}>{course.price} ETB</div>}
        </div>
        <button className={styles.previewButton}>
          <Play size={14} />
          {isLocked ? "Preview" : "Open Course"}
        </button>
      </div>
    </Link>
  );
}
