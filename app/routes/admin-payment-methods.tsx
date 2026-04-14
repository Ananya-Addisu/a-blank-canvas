import { useState } from 'react';
import { supabaseAdmin as supabase } from '~/lib/supabase.client';
import { Card, CardContent } from '~/components/ui/card/card';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { Pencil, Save, X } from 'lucide-react';
import styles from './admin-payment-methods.module.css';

interface PaymentMethod {
  id: string;
  method_name: string;
  account_name: string;
  account_number: string;
}

const ALLOWED_PAYMENT_METHODS = [
  {
    key: 'cbe',
    method_name: 'Commercial Bank of Ethiopia',
    aliases: ['commercial bank of ethiopia', 'cbe'],
    account_name: 'Asmamaw Abebaw',
    account_number: '1000610828276',
  },
  {
    key: 'boa',
    method_name: 'Bank of Abyssinia',
    aliases: ['bank of abyssinia', 'boa'],
    account_name: 'Asmamaw Abebaw',
    account_number: '163240955',
  },
  {
    key: 'telebirr',
    method_name: 'Telebirr',
    aliases: ['telebirr'],
    account_name: 'Wubamlak',
    account_number: '0918472699',
  },
] as const;

function normalizeMethodName(value: string) {
  return value.trim().toLowerCase();
}

function mergeAllowedMethods(methods: PaymentMethod[]): PaymentMethod[] {
  return ALLOWED_PAYMENT_METHODS.map((allowed, index) => {
    const existing = methods.find((method) =>
      (allowed.aliases as readonly string[]).includes(normalizeMethodName(method.method_name))
    );

    if (existing) {
      return {
        ...existing,
        method_name: allowed.method_name,
      };
    }

    return {
      id: `missing-${allowed.key}-${index}`,
      method_name: allowed.method_name,
      account_name: allowed.account_name,
      account_number: allowed.account_number,
    };
  });
}

export async function clientLoader() {
  const { data } = await supabase
    .from('payment_methods')
    .select('id, method_name, account_name, account_number')
    .order('created_at', { ascending: false });

  return { methods: mergeAllowedMethods((data || []) as PaymentMethod[]) };
}

export default function AdminPaymentMethods({ loaderData }: any) {
  const { methods: initialMethods } = loaderData;
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ account_name: '', account_number: '' });

  const startEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setEditForm({ account_name: m.account_name, account_number: m.account_number });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ account_name: '', account_number: '' });
  };

  const handleSave = async (id: string) => {
    if (!editForm.account_name.trim() || !editForm.account_number.trim()) return;

    const method = methods.find((item) => item.id === id);
    if (!method) return;

    const payload = {
      method_name: method.method_name,
      account_name: editForm.account_name.trim(),
      account_number: editForm.account_number.trim(),
    };

    setSaving(true);

    try {
      if (id.startsWith('missing-')) {
        const { data, error } = await supabase
          .from('payment_methods')
          .insert(payload)
          .select('id, method_name, account_name, account_number')
          .single();

        if (!error && data) {
          setMethods((prev) =>
            prev.map((item) => (item.id === id ? (data as PaymentMethod) : item))
          );
          cancelEdit();
        }

        return;
      }

      const { error } = await supabase
        .from('payment_methods')
        .update(payload)
        .eq('id', id);

      if (!error) {
        setMethods((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
        );
        cancelEdit();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payment Methods</h1>
      </div>

      <div className={styles.methodsList}>
        {methods.map((m) => (
          <Card key={m.id} className={styles.methodCard}>
            <CardContent className={styles.methodContent}>
              {editingId === m.id ? (
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-neutral-12)' }}>{m.method_name}</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <Label>Account Holder</Label>
                      <Input value={editForm.account_name} onChange={e => setEditForm(f => ({ ...f, account_name: e.target.value }))} placeholder="Account holder name" />
                    </div>
                    <div className={styles.formGroup}>
                      <Label>Account Number</Label>
                      <Input value={editForm.account_number} onChange={e => setEditForm(f => ({ ...f, account_number: e.target.value }))} placeholder="Account number" />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <Button size="sm" onClick={() => handleSave(m.id)} disabled={saving || !editForm.account_name.trim() || !editForm.account_number.trim()}>
                      <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X size={16} /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.methodInfo}>
                    <div className={styles.methodName}>{m.method_name}</div>
                    <div className={styles.methodDetail}>Account Holder: {m.account_name}</div>
                    <div className={styles.methodDetail}>Account Number: {m.account_number}</div>
                  </div>
                  <div className={styles.methodActions}>
                    <Button variant="outline" size="sm" onClick={() => startEdit(m)}>
                      <Pencil size={16} /> Edit
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
