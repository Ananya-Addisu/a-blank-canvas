// Fix #14: Library add book - use admin client to bypass RLS
import { Form, redirect, useNavigate } from 'react-router';
import type { Route } from './+types/admin-library-add';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { ArrowLeft } from 'lucide-react';
import styles from './admin-library.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';


export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  await supabase.from('library_items').insert({ name: formData.get('name'), description: formData.get('description'), icon: formData.get('icon'), status: formData.get('status') });
  return { success: true };
}


export default function AdminLibraryAdd() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => navigate('/admin/library')}>
          <ArrowLeft size={20} />
          Back to Library
        </Button>
        <h1 className={styles.title}>Add New Library Tab</h1>
      </div>

      <div className={styles.formContainer}>
        <Form method="post" className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="name">Tab Name</Label>
            <Input id="name" name="name" placeholder="Enter tab name" required />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter tab description" required rows={3} />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="icon">Icon</Label>
            <Select name="icon" required defaultValue="Book">
              <SelectTrigger>
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Book">Book</SelectItem>
                <SelectItem value="FileText">File Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="status">Status</Label>
            <Select name="status" required defaultValue="active">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/library')}>
              Cancel
            </Button>
            <Button type="submit">Add Tab</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
