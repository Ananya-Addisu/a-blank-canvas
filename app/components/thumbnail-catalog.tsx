import { useState } from 'react';
import { Check } from 'lucide-react';
import { Input } from '~/components/ui/input/input';
import styles from './thumbnail-catalog.module.css';

// Featured path images (generated for Magster bundles)
import featuredBusiness from '~/assets/featured-business.jpg';
import featuredEngineering from '~/assets/featured-engineering.jpg';
import featuredFreshman from '~/assets/featured-freshman-sem1.jpg';
import featuredGrade12 from '~/assets/featured-grade12-prep.jpg';
import featuredHealth from '~/assets/featured-health-science.jpg';
import featuredLaw from '~/assets/featured-law.jpg';
import featuredNatural from '~/assets/featured-natural-science.jpg';
import featuredSocial from '~/assets/featured-social-science.jpg';
import featuredTech from '~/assets/featured-technology.jpg';

const FEATURED_PATH_THUMBNAILS = [
  { url: featuredFreshman, category: 'Featured', label: 'Freshman Sem 1' },
  { url: featuredGrade12, category: 'Featured', label: 'Grade 12 Prep' },
  { url: featuredNatural, category: 'Featured', label: 'Natural Science' },
  { url: featuredSocial, category: 'Featured', label: 'Social Science' },
  { url: featuredBusiness, category: 'Featured', label: 'Business' },
  { url: featuredEngineering, category: 'Featured', label: 'Engineering' },
  { url: featuredHealth, category: 'Featured', label: 'Health Science' },
  { url: featuredLaw, category: 'Featured', label: 'Law' },
  { url: featuredTech, category: 'Featured', label: 'Technology' },
];

// Pre-built catalog of education-themed thumbnail images from Unsplash
const THUMBNAIL_CATALOG = [
  // Science & Biology
  { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', category: 'Science', label: 'Microscope Lab' },
  { url: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400', category: 'Science', label: 'Chemistry Lab' },
  { url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400', category: 'Science', label: 'Science Research' },
  { url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400', category: 'Science', label: 'DNA Helix' },
  { url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400', category: 'Science', label: 'Biology Plants' },
  
  // Math & Engineering
  { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', category: 'Math', label: 'Math Equations' },
  { url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', category: 'Math', label: 'Geometry' },
  { url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400', category: 'Math', label: 'Calculator' },
  { url: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400', category: 'Engineering', label: 'Engineering' },
  { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400', category: 'Engineering', label: 'Blueprint' },
  
  // Technology & CS
  { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', category: 'Technology', label: 'Coding' },
  { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', category: 'Technology', label: 'Circuit Board' },
  { url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400', category: 'Technology', label: 'Programming' },
  { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400', category: 'Technology', label: 'Cybersecurity' },
  
  // Medicine & Health
  { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400', category: 'Medicine', label: 'Medical Lab' },
  { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400', category: 'Medicine', label: 'Stethoscope' },
  { url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400', category: 'Medicine', label: 'Anatomy' },
  { url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400', category: 'Medicine', label: 'Healthcare' },
  
  // Business & Economics
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', category: 'Business', label: 'Analytics' },
  { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', category: 'Business', label: 'Business' },
  { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', category: 'Business', label: 'Finance' },
  { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400', category: 'Business', label: 'Stock Market' },
  
  // Law & Social Sciences
  { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400', category: 'Law', label: 'Law Books' },
  { url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400', category: 'Law', label: 'Justice' },
  { url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', category: 'Education', label: 'Library' },
  { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', category: 'Education', label: 'Study Desk' },
  
  // Arts & Humanities
  { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400', category: 'Arts', label: 'Art Painting' },
  { url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400', category: 'Arts', label: 'Photography' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', category: 'Arts', label: 'Portrait' },
  
  // General Education
  { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400', category: 'Education', label: 'Classroom' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', category: 'Education', label: 'School' },
  { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400', category: 'Education', label: 'Students' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400', category: 'Education', label: 'Writing' },
  { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', category: 'Education', label: 'Books Stack' },
  { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', category: 'Education', label: 'Library Shelves' },
  
  // Nature & Environment 
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', category: 'Science', label: 'Forest' },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', category: 'Science', label: 'Earth Space' },
  { url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400', category: 'Science', label: 'Space' },
  { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400', category: 'Science', label: 'Galaxy' },
];

const ALL_THUMBNAILS = [...FEATURED_PATH_THUMBNAILS, ...THUMBNAIL_CATALOG];
const CATEGORIES = ['All', 'Featured', ...Array.from(new Set(THUMBNAIL_CATALOG.map(t => t.category)))];

interface ThumbnailCatalogProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
}

export function ThumbnailCatalog({ value, onChange, name = 'thumbnail_url' }: ThumbnailCatalogProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = ALL_THUMBNAILS.filter(t => {
    if (category !== 'All' && t.category !== category) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.catalog}>
      <label className={styles.label}>Choose Thumbnail</label>
      <input type="hidden" name={name} value={value || ''} />
      
      <div className={styles.searchRow}>
        <Input
          placeholder="Search images..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.categoryTabs}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            className={`${styles.categoryTab} ${category === cat ? styles.active : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((thumb) => (
          <div
            key={thumb.url}
            className={`${styles.item} ${value === thumb.url ? styles.selected : ''}`}
            onClick={() => onChange(thumb.url)}
            title={thumb.label}
          >
            <img src={thumb.url} alt={thumb.label} loading="lazy" />
            {value === thumb.url && (
              <div className={styles.checkmark}>
                <Check size={12} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
