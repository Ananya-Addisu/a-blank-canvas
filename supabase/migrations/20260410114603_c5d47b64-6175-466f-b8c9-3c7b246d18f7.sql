
-- Add feedback_mode to quizzes table: 'after_submit' (default) or 'immediate'
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS feedback_mode text NOT NULL DEFAULT 'after_submit';

-- Add gated_bundle_id to competitions for bundle-gating
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS gated_bundle_id uuid REFERENCES public.bundles(id) ON DELETE SET NULL;
