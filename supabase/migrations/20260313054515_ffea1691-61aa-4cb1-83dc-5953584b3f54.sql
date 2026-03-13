
-- ============================================================
-- EXIT CLEARANCE SYSTEM MIGRATION
-- ============================================================

-- 1. exit_clearance_forms (Step 1 - Employee self-service form)
CREATE TABLE public.exit_clearance_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_code TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  manager TEXT NOT NULL,
  last_working_day DATE NOT NULL,
  contact_number TEXT NOT NULL,
  personal_email TEXT NOT NULL,
  forwarding_address TEXT NOT NULL,
  handover_declaration BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'completed')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_clearance_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on exit_clearance_forms"
  ON public.exit_clearance_forms FOR ALL USING (true) WITH CHECK (true);

-- 2. exit_dept_tasks (Step 2 - Departmental clearance tasks)
CREATE TABLE public.exit_dept_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  clearance_form_id UUID REFERENCES public.exit_clearance_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL CHECK (department IN ('Manager', 'ProjectCoordinator', 'IT', 'Admin', 'Finance', 'HR')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'issue')),
  assigned_to TEXT,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_dept_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on exit_dept_tasks"
  ON public.exit_dept_tasks FOR ALL USING (true) WITH CHECK (true);

-- 3. document_templates (HR-managed templates)
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('offer_letter', 'joining_letter', 'experience_letter')),
  template_html TEXT NOT NULL DEFAULT '',
  placeholders JSONB NOT NULL DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on document_templates"
  ON public.document_templates FOR ALL USING (true) WITH CHECK (true);

-- 4. generated_documents
CREATE TABLE public.generated_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('offer_letter', 'joining_letter', 'experience_letter')),
  rendered_html TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'signed')),
  signature_data TEXT,
  stamp_data TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on generated_documents"
  ON public.generated_documents FOR ALL USING (true) WITH CHECK (true);

-- 5. exit_document_uploads (signed PDF storage references)
CREATE TABLE public.exit_document_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  document_id UUID REFERENCES public.generated_documents(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_document_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on exit_document_uploads"
  ON public.exit_document_uploads FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for exit documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('exit-documents', 'exit-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow all access to exit-documents bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'exit-documents')
  WITH CHECK (bucket_id = 'exit-documents');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_exit_clearance_forms_updated_at
  BEFORE UPDATE ON public.exit_clearance_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exit_dept_tasks_updated_at
  BEFORE UPDATE ON public.exit_dept_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default document templates
INSERT INTO public.document_templates (name, document_type, template_html, placeholders, created_by)
VALUES
(
  'Offer Letter',
  'offer_letter',
  '<div style="font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a;"><div style="text-align: center; margin-bottom: 32px;"><h1 style="font-size: 22px; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px;">REALTHINGKS</h1><p style="font-size: 12px; color: #666;">HR Department</p></div><div style="text-align: right; margin-bottom: 24px;"><p>Date: {{date}}</p></div><p><strong>To,</strong></p><p>{{employee_name}}</p><br/><h2 style="text-align: center; text-decoration: underline;">OFFER LETTER</h2><br/><p>Dear {{employee_name}},</p><p>We are pleased to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at RealThingks, effective from <strong>{{joining_date}}</strong>.</p><p>You will be reporting to <strong>{{manager_name}}</strong>.</p><br/><p>We look forward to welcoming you to our team.</p><br/><p>Yours sincerely,</p><br/><br/><p><strong>HR Department</strong></p><p>RealThingks</p></div>',
  '["employee_name", "designation", "department", "joining_date", "manager_name", "date"]'::jsonb,
  'System'
),
(
  'Joining Letter',
  'joining_letter',
  '<div style="font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a;"><div style="text-align: center; margin-bottom: 32px;"><h1 style="font-size: 22px; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px;">REALTHINGKS</h1><p style="font-size: 12px; color: #666;">HR Department</p></div><div style="text-align: right; margin-bottom: 24px;"><p>Date: {{date}}</p></div><p>Employee ID: <strong>{{employee_id}}</strong></p><br/><h2 style="text-align: center; text-decoration: underline;">JOINING LETTER</h2><br/><p>Dear {{employee_name}},</p><p>This is to confirm that you have joined RealThingks on <strong>{{joining_date}}</strong> as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department.</p><p>We welcome you to the RealThingks family and wish you a successful career with us.</p><br/><p>Yours sincerely,</p><br/><br/><p><strong>HR Department</strong></p><p>RealThingks</p></div>',
  '["employee_name", "employee_id", "designation", "department", "joining_date", "date"]'::jsonb,
  'System'
),
(
  'Experience Letter',
  'experience_letter',
  '<div style="font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a;"><div style="text-align: center; margin-bottom: 32px;"><h1 style="font-size: 22px; font-weight: bold; letter-spacing: 2px; margin-bottom: 4px;">REALTHINGKS</h1><p style="font-size: 12px; color: #666;">HR Department</p></div><div style="text-align: right; margin-bottom: 24px;"><p>Date: {{date}}</p><p>Ref: {{employee_id}}/EXP/{{year}}</p></div><h2 style="text-align: center; text-decoration: underline;">EXPERIENCE LETTER</h2><br/><p>To Whomsoever It May Concern,</p><br/><p>This is to certify that <strong>{{employee_name}}</strong> (Employee ID: <strong>{{employee_id}}</strong>) was employed with RealThingks as <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department from <strong>{{joining_date}}</strong> to <strong>{{last_working_day}}</strong>.</p><p>During the tenure, {{employee_name}} has demonstrated excellent skills and professionalism. We wish them success in all future endeavours.</p><br/><p>Issued in good faith and without any prejudice.</p><br/><p>Yours sincerely,</p><br/><br/><p><strong>Nishith Shah</strong></p><p>Director, RealThingks</p></div>',
  '["employee_name", "employee_id", "designation", "department", "joining_date", "last_working_day", "date", "year"]'::jsonb,
  'System'
);
