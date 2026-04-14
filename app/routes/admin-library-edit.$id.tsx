import { Form, redirect, useNavigate, useLoaderData } from 'react-router';
import type { Route } from './+types/admin-library-edit.$id';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Textarea } from '~/components/ui/textarea/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select/select';
import { ArrowLeft } from 'lucide-react';
import styles from './admin-library.module.css';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';



export async function clientLoader({ params }: any) {
  const { data: item } = await supabase.from('library_items').select('*').eq('id', params.id).single();
  return { item };
}

export async function clientAction({ request, params }: any) {
  const formData = await request.formData();
  await supabase.from('library_items').update({ name: formData.get('name'), description: formData.get('description'), icon: formData.get('icon'), status: formData.get('status') }).eq('id', params.id);
  return { success: true };
}


export default function AdminLibraryEdit({ loaderData }: Route.ComponentProps) {
  const { item } = loaderData as any;
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="outline" onClick={() => navigate('/admin/library')}>
          <ArrowLeft size={20} />
          Back to Library
        </Button>
        <h1 className={styles.title}>Edit Library Tab</h1>
      </div>

      <div className={styles.formContainer}>
        <Form method="post" className={styles.form}>
          <div className={styles.formGroup}>
            <Label htmlFor="name">Tab Name</Label>
            <Input id="name" name="name" placeholder="Enter tab name" required defaultValue={item?.name} />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Enter tab description" required rows={3} defaultValue={item?.description} />
          </div>

          <div className={styles.formGroup}>
            <Label htmlFor="icon">Icon</Label>
            <Select name="icon" required defaultValue={item?.icon || 'Book'}>
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
            <Select name="status" required defaultValue={item?.status || 'active'}>
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
            <Button type="submit">Update Tab</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
