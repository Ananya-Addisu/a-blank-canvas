import { useState } from 'react';
import { Plus, Calendar, BookOpen, Package, Trash2 } from 'lucide-react';
import type { Route } from './+types/admin-courses';
import styles from './admin-courses.module.css';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table/table';
import { ThumbnailCatalog } from '~/components/thumbnail-catalog';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader() {
  const [coursesRes, teachersRes] = await Promise.all([
    supabase.from('courses').select('*, teacher:teachers(id, full_name)').order('created_at', { ascending: false }),
    supabase.from('teachers').select('id, full_name').eq('is_approved', true).order('full_name'),
  ]);
  return { courses: coursesRes.data || [], teachers: teachersRes.data || [] };
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  if (intent === 'create' || intent === 'update') {
    const courseData: any = {
      name: formData.get('name'), description: formData.get('description'),
      category: formData.get('category'), department: formData.get('department'),
      price: Number(formData.get('price')), teacher_id: formData.get('teacher_id'),
      is_bundle_exclusive: formData.get('is_bundle_exclusive') === 'true',
      thumbnail_url: formData.get('thumbnail_url') || null,
    };
    if (intent === 'update') {
      await supabase.from('courses').update(courseData).eq('id', formData.get('id'));
    } else {
      await supabase.from('courses').insert(courseData);
    }
  } else if (intent === 'delete') {
    await supabase.from('courses').delete().eq('id', formData.get('id'));
  }
  return { success: true };
}


export default function AdminCourses({ loaderData: rawLoaderData }: Route.ComponentProps) {
  const loaderData = rawLoaderData as any;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isBundleExclusive, setIsBundleExclusive] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState('');

  const filteredCourses = loaderData.courses.filter((course: any) => {
    if (filterCategory !== 'all' && course.category !== filterCategory) return false;
    if (filterTeacher !== 'all' && course.teacher_id !== filterTeacher) return false;
    return true;
  });

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setIsBundleExclusive(course.is_bundle_exclusive || false);
    setSelectedThumbnail(course.thumbnail_url || '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
    setIsBundleExclusive(false);
    setSelectedThumbnail('');
  };

  const categories = [...new Set(loaderData.courses.map((c: any) => c.category))];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Courses Management</h1>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingCourse(null);
          setIsBundleExclusive(false);
        }
      }}>
        <DialogTrigger asChild>
          <Button className={styles.addButton}>
            <Plus size={20} />
            Add Course
          </Button>
        </DialogTrigger>
        <DialogContent className={styles.dialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <BookOpen size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
          </DialogHeader>
          {/* Fix #9: Don't reset editingCourse before form submits - use setTimeout */}
          <form 
            method="post" 
            onSubmit={() => {
              setTimeout(() => handleCloseDialog(), 100);
            }}
          >
            <input type="hidden" name="intent" value={editingCourse ? 'update' : 'create'} />
            {editingCourse && <input type="hidden" name="id" value={editingCourse.id} />}
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <Label htmlFor="name" className={styles.label}>Course Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Enter course name" 
                  required 
                  defaultValue={editingCourse?.name}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="description" className={styles.label}>Course Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter course description"
                  required
                  rows={3}
                  defaultValue={editingCourse?.description}
                  className={styles.textarea}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="category" className={styles.label}>Category</Label>
                  <Select name="category" required defaultValue={editingCourse?.category || 'Year 1'}>
                    <SelectTrigger className={styles.select}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Year 1">Year 1</SelectItem>
                      <SelectItem value="Year 2">Year 2</SelectItem>
                      <SelectItem value="Year 3">Year 3</SelectItem>
                      <SelectItem value="Year 4">Year 4</SelectItem>
                      <SelectItem value="Year 5">Year 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.formGroup}>
                  <Label htmlFor="department" className={styles.label}>Department</Label>
                  <Select name="department" required defaultValue={editingCourse?.department}>
                    <SelectTrigger className={styles.select}>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Math">Math</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <Label htmlFor="price" className={styles.label}>Price (ETB)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    required
                    defaultValue={editingCourse?.price}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <Label htmlFor="teacher_id" className={styles.label}>Assigned Teacher</Label>
                  <Select name="teacher_id" required defaultValue={editingCourse?.teacher_id}>
                    <SelectTrigger className={styles.select}>
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {loaderData.teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Thumbnail Catalog */}
              <ThumbnailCatalog
                value={selectedThumbnail}
                onChange={setSelectedThumbnail}
              />
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: isBundleExclusive ? 'var(--color-primary-3, #e8f0fe)' : 'var(--color-neutral-3, #f5f5f5)', border: '1px solid var(--color-neutral-6, #ddd)', cursor: 'pointer' }} onClick={() => setIsBundleExclusive(!isBundleExclusive)}>
                  <Package size={20} style={{ color: isBundleExclusive ? 'var(--color-primary-11, #1a73e8)' : 'var(--color-neutral-9, #999)' }} />
                  <div style={{ flex: 1 }}>
                    <Label className={styles.label} style={{ cursor: 'pointer', marginBottom: '2px' }}>Bundle Exclusive</Label>
                    <p style={{ fontSize: '12px', color: 'var(--color-neutral-10, #666)', margin: 0 }}>Students must purchase the bundle to access this course</p>
                  </div>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: isBundleExclusive ? 'var(--color-primary-9, #1a73e8)' : 'var(--color-neutral-7, #ccc)', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: isBundleExclusive ? '20px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
                <input type="hidden" name="is_bundle_exclusive" value={isBundleExclusive ? 'true' : 'false'} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className={styles.cancelButton}>
                Cancel
              </Button>
              <Button type="submit" className={styles.submitButton}>
                {editingCourse ? 'Update' : 'Add'} Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent className={styles.dialog}>
          <DialogHeader className={styles.modalHeader}>
            <div className={styles.modalIcon}>
              <Trash2 size={28} />
            </div>
            <DialogTitle className={styles.modalTitle}>Delete Course</DialogTitle>
            <DialogDescription>
              Delete "{courseToDelete?.name}"? This will remove the course and all its content permanently.
            </DialogDescription>
          </DialogHeader>
          <div className={styles.modalFooter}>
            <Button type="button" variant="outline" onClick={() => setCourseToDelete(null)} className={styles.cancelButton}>
              Cancel
            </Button>
            <form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={courseToDelete?.id || ''} />
              <Button type="submit" variant="destructive" className={styles.submitButton}>
                Delete Course
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <div className={styles.filters}>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className={styles.filterSelect}>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat as string} value={cat as string}>{cat as string}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTeacher} onValueChange={setFilterTeacher}>
          <SelectTrigger className={styles.filterSelect}>
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teachers</SelectItem>
            {loaderData.teachers.map((teacher: any) => (
              <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={styles.tableCard}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={styles.tableHead}>Course Name</TableHead>
              <TableHead className={styles.tableHead}>Teacher</TableHead>
              <TableHead className={styles.tableHead}>Category</TableHead>
              <TableHead className={styles.tableHead}>Type</TableHead>
              <TableHead className={styles.tableHead}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course: any) => (
              <TableRow 
                key={course.id} 
                className={styles.tableRow}
                onClick={() => handleEdit(course)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell className={styles.nameCell}>{course.name}</TableCell>
                <TableCell className={styles.teacherCell}>{course.teacher?.full_name || 'Not assigned'}</TableCell>
                <TableCell className={styles.categoryCell}>{course.category}</TableCell>
                <TableCell>{course.is_bundle_exclusive ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, background: 'var(--color-primary-3, #e8f0fe)', color: 'var(--color-primary-11, #1a73e8)' }}><Package size={12} />Bundle Only</span> : '—'}</TableCell>
                {/* Fix #5: Delete course button */}
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCourseToDelete(course);
                    }}
                  >
                      <Trash2 size={14} />
                      Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
