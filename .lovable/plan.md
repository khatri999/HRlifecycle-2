
## Plan: Exit Clearance Automation & Document Generation System

### What exists today
- `ExitManagement.tsx` — accordion list of employees in exit, shows exit workflow steps + departmental clearance tasks
- `mockData.ts` — `ExitTask`, `Employee`, `generateExitTasks()`, `getDepartmentClearance()` in mock state
- `Documents.tsx` — basic static document list per employee
- No Supabase tables yet; everything is frontend mock data

---

### Architecture Decision
All data will be persisted in Supabase. The document generation will be template-based (HR uploads a template with placeholders; system renders a filled preview). PDF export will use the browser's print API (no external dependency needed). Signature/stamp will be a canvas-based overlay drawn on the rendered document.

---

### Database Schema (5 migrations)

**1. `exit_clearance_forms`** — Employee self-service clearance form (Step 1)
```
id, employee_id (ref employees), contact_number, personal_email,
forwarding_address, handover_declaration (bool), submitted_at, status
```

**2. `exit_tasks`** — Departmental clearance tasks (Step 2)  
```
id, employee_id, title, description, department (Manager/IT/Admin/Finance/HR/ProjectCoordinator),
status (pending/completed/issue), assigned_to, deadline, comments (jsonb), attachments (jsonb)
```

**3. `document_templates`** — HR-uploaded templates (Step 4)
```
id, name (offer_letter/joining_letter/experience_letter),
template_html (text), placeholders (jsonb), created_by, updated_at
```

**4. `generated_documents`** — Filled documents per employee (Step 4)
```
id, employee_id, template_id, document_type, rendered_html (text),
status (draft/pending_approval/approved/signed), created_at, approved_by, approved_at
```

**5. `exit_document_uploads`** — Signed PDF storage (Step 6)
```
id, employee_id, document_id, file_url, uploaded_by, uploaded_at
```

Storage bucket: `exit-documents` (private, HR access only)

---

### New Pages & Components

#### 1. `ExitManagement.tsx` — OVERHAULED
Refactor into a tabbed interface with three tabs per employee:
- **Clearance** — existing departmental tasks view (upgraded with "issue" status + Project Coordinator dept)
- **Documents** — document generation panel
- **Timeline** — exit workflow steps stepper

Add `ExitClearanceForm` sheet/dialog (Step 1) — triggered when no form submitted yet.

#### 2. New component: `ExitClearanceFormDialog.tsx`
Modal form with all Step 1 fields + handover declaration checkbox.
Saves to `exit_clearance_forms` table. On submit → auto-generates exit tasks.

#### 3. New component: `DeptClearanceBoard.tsx`
Upgraded departmental clearance view:
- 6 department columns: Manager, Project Coordinator, IT, Admin, Finance, HR
- Each task card has 3-button status toggle: Pending / Completed / Issue
- HR sees an overall tracker; each dept sees only their tasks
- Finance "Full & Final Settlement" completion unlocks document generation

#### 4. New page: `DocumentGeneration.tsx` (or panel within Exit Management)
**Template Management section (HR only):**
- Upload/edit HTML templates for 3 document types
- Template variables shown: `{{employee_name}}`, `{{employee_id}}`, `{{designation}}`, etc.

**Document Generation section:**
- "Generate" buttons for each document type (unlocked progressively)
- Offer Letter & Joining Letter — always available once clearance form submitted
- Experience Letter — unlocked after Finance marks Full & Final as completed
- Preview panel shows rendered HTML with filled data
- "Send for Approval" button → updates status to `pending_approval`

#### 5. New component: `DocumentApprovalPanel.tsx`
**Nishith Shah's approval view:**
- Shows pending Experience Letters for review
- Signature canvas (HTML5 Canvas, draw-your-signature)
- Company stamp upload or pre-set stamp image overlay
- "Approve & Sign" button → saves signature as base64, updates status to `signed`

#### 6. Updated `Documents.tsx`
Add "Exit Documents" tab per employee showing:
- Generated documents with status badges
- Upload signed PDF button (HR)
- Download buttons
- "Send to Employee" action (triggers email via Supabase edge function / toast for now)

---

### Data Flow

```text
Employee submits resignation
        ↓
HR confirms Last Working Day
        ↓
[Step 1] ExitClearanceFormDialog — employee fills form
        ↓
[Step 2] auto-generate exit_tasks for 6 departments
        ↓
Departments mark tasks: pending → completed / issue
        ↓
Finance marks "Full & Final Settlement" → completed
        ↓                     [UNLOCKS]
[Step 4] HR generates documents (Offer / Joining / Experience Letter)
        ↓
[Step 5] System shows Experience Letter to Nishith Shah for approval
        → Signature canvas + stamp overlay → "Approve & Sign"
        ↓
[Step 6] HR downloads PDF → uploads signed doc → employee's Exit Documents
        ↓
[Step 7] HR sends email (toast action) → exit status → "completed"
```

---

### Files to Create / Modify

| Action | File |
|--------|------|
| Create | `src/pages/ExitManagement.tsx` (rewrite) |
| Create | `src/components/exit/ExitClearanceFormDialog.tsx` |
| Create | `src/components/exit/DeptClearanceBoard.tsx` |
| Create | `src/components/exit/DocumentGenerationPanel.tsx` |
| Create | `src/components/exit/DocumentApprovalDialog.tsx` |
| Create | `src/components/exit/ExitDocumentsTab.tsx` |
| Modify | `src/pages/Documents.tsx` (add exit docs tab) |
| Modify | `src/data/mockData.ts` (add Project Coordinator dept + issue status) |
| DB | 5 migration SQL files via migration tool |
| Storage | `exit-documents` bucket |

---

### Key Design Choices
- **No new routes** — all exit flow lives inside `/exit` with tabbed employee cards
- **Progressive unlocking** — document generation buttons are disabled until Finance clears settlement
- **Signature** — HTML5 canvas in a dialog, no external lib needed
- **PDF export** — `window.print()` with a print-specific CSS class on the rendered document div
- **Templates** — stored as HTML strings with `{{placeholder}}` syntax; JS `.replace()` fills them
- **Mock → Supabase** — existing mock data seeded into Supabase tables on first load if tables are empty

---

### Implementation Order
1. Run 5 DB migrations + create storage bucket
2. Rewrite `ExitManagement.tsx` with tabbed layout
3. Build `ExitClearanceFormDialog` (Step 1)
4. Build `DeptClearanceBoard` with issue status + unlock logic (Step 2-3)
5. Build `DocumentGenerationPanel` with template engine (Step 4)
6. Build `DocumentApprovalDialog` with signature canvas (Step 5)
7. Build `ExitDocumentsTab` with upload + PDF download (Step 6-7)
