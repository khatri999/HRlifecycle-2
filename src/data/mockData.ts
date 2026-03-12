export type EmployeeStatus = "active" | "onboarding" | "notice-period" | "exited";
export type OnboardingStatus = "not-started" | "in-progress" | "completed";
export type ExitStatus = "none" | "resignation-submitted" | "notice-period" | "clearance" | "completed";
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
export type Department = "Engineering" | "Design" | "Marketing" | "HR" | "Finance" | "Admin" | "IT";
export type TaskDepartment = "HR" | "IT" | "Admin" | "Manager" | "Employee" | "Finance";

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: Department;
  role: string;
  manager: string;
  joiningDate: string;
  lastWorkingDay?: string;
  status: EmployeeStatus;
  onboardingStatus: OnboardingStatus;
  onboardingProgress: number;
  exitStatus: ExitStatus;
  exitProgress: number;
  avatar: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  verified: boolean;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedDepartment: TaskDepartment;
  deadline: string;
  status: TaskStatus;
  category: TaskDepartment;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface ExitTask {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedDepartment: TaskDepartment;
  deadline?: string;
  status: TaskStatus;
  category: TaskDepartment;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface Notification {
  id: string;
  type: "task-assigned" | "task-completed" | "deadline-reminder" | "workflow-started";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export const employees: Employee[] = [
  {
    id: "1", name: "Priya Sharma", email: "priya.sharma@realthingks.com", employeeId: "RT-1024",
    department: "Engineering", role: "Frontend Developer", manager: "Arjun Mehta",
    joiningDate: "2026-03-15", status: "onboarding", onboardingStatus: "in-progress",
    onboardingProgress: 45, exitStatus: "none", exitProgress: 0, avatar: "PS",
    documents: [
      { id: "d1", name: "Aadhar Card", type: "Government ID", uploadedAt: "2026-03-10", verified: true },
      { id: "d2", name: "Degree Certificate", type: "Educational", uploadedAt: "2026-03-10", verified: false },
    ],
  },
  {
    id: "2", name: "Rahul Verma", email: "rahul.verma@realthingks.com", employeeId: "RT-1025",
    department: "Design", role: "UI/UX Designer", manager: "Sneha Kapoor",
    joiningDate: "2026-03-18", status: "onboarding", onboardingStatus: "in-progress",
    onboardingProgress: 20, exitStatus: "none", exitProgress: 0, avatar: "RV", documents: [],
  },
  {
    id: "3", name: "Ananya Reddy", email: "ananya.reddy@realthingks.com", employeeId: "RT-0987",
    department: "Marketing", role: "Marketing Manager", manager: "Vikram Singh",
    joiningDate: "2024-06-01", status: "notice-period", onboardingStatus: "completed",
    onboardingProgress: 100, exitStatus: "notice-period", exitProgress: 35,
    lastWorkingDay: "2026-04-15", avatar: "AR",
    documents: [
      { id: "d3", name: "PAN Card", type: "Government ID", uploadedAt: "2024-06-01", verified: true },
      { id: "d4", name: "Bank Details", type: "Financial", uploadedAt: "2024-06-01", verified: true },
    ],
  },
  {
    id: "4", name: "Karan Patel", email: "karan.patel@realthingks.com", employeeId: "RT-0890",
    department: "Engineering", role: "Backend Developer", manager: "Arjun Mehta",
    joiningDate: "2023-09-15", status: "active", onboardingStatus: "completed",
    onboardingProgress: 100, exitStatus: "none", exitProgress: 0, avatar: "KP",
    documents: [
      { id: "d5", name: "Aadhar Card", type: "Government ID", uploadedAt: "2023-09-15", verified: true },
      { id: "d6", name: "Offer Letter", type: "Employment", uploadedAt: "2023-09-15", verified: true },
    ],
  },
  {
    id: "5", name: "Meera Joshi", email: "meera.joshi@realthingks.com", employeeId: "RT-0756",
    department: "HR", role: "HR Executive", manager: "Deepa Nair",
    joiningDate: "2023-01-10", status: "active", onboardingStatus: "completed",
    onboardingProgress: 100, exitStatus: "none", exitProgress: 0, avatar: "MJ", documents: [],
  },
  {
    id: "6", name: "Siddharth Gupta", email: "siddharth.gupta@realthingks.com", employeeId: "RT-1026",
    department: "Finance", role: "Financial Analyst", manager: "Ravi Kumar",
    joiningDate: "2026-03-22", status: "onboarding", onboardingStatus: "not-started",
    onboardingProgress: 0, exitStatus: "none", exitProgress: 0, avatar: "SG", documents: [],
  },
  {
    id: "7", name: "Neha Agarwal", email: "neha.agarwal@realthingks.com", employeeId: "RT-0812",
    department: "Engineering", role: "QA Engineer", manager: "Arjun Mehta",
    joiningDate: "2023-04-20", status: "notice-period", onboardingStatus: "completed",
    onboardingProgress: 100, exitStatus: "resignation-submitted", exitProgress: 15,
    lastWorkingDay: "2026-04-30", avatar: "NA", documents: [],
  },
  {
    id: "8", name: "Amit Deshmukh", email: "amit.deshmukh@realthingks.com", employeeId: "RT-0650",
    department: "IT", role: "System Administrator", manager: "Ravi Kumar",
    joiningDate: "2022-08-01", status: "active", onboardingStatus: "completed",
    onboardingProgress: 100, exitStatus: "none", exitProgress: 0, avatar: "AD", documents: [],
  },
];

export const onboardingTasks: OnboardingTask[] = [
  { id: "ot1", employeeId: "1", title: "Verify documents", description: "Verify all submitted employee documents", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-12", status: "completed", category: "HR", comments: [{ id: "c1", author: "Meera Joshi", text: "Aadhar verified, degree pending verification", timestamp: "2026-03-11 10:30" }], attachments: [] },
  { id: "ot2", employeeId: "1", title: "Upload offer letter", description: "Upload signed offer letter to employee profile", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-13", status: "completed", category: "HR", comments: [], attachments: [{ id: "a1", name: "Offer_Letter_PS.pdf", size: "245 KB", uploadedBy: "Meera Joshi", uploadedAt: "2026-03-12" }] },
  { id: "ot3", employeeId: "1", title: "Create employee record", description: "Set up employee in HR system with all details", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-13", status: "completed", category: "HR", comments: [], attachments: [] },
  { id: "ot4", employeeId: "1", title: "Create email account", description: "Set up official email account", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-03-14", status: "completed", category: "IT", comments: [{ id: "c2", author: "Amit Deshmukh", text: "Email created: priya.sharma@realthingks.com", timestamp: "2026-03-13 14:00" }], attachments: [] },
  { id: "ot5", employeeId: "1", title: "Provide system access", description: "Grant access to required tools and software", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-03-15", status: "in-progress", category: "IT", comments: [], attachments: [] },
  { id: "ot6", employeeId: "1", title: "Prepare laptop", description: "Configure and deliver work laptop", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-03-15", status: "pending", category: "IT", comments: [], attachments: [] },
  { id: "ot7", employeeId: "1", title: "Issue employee ID card", description: "Create and issue employee ID card", assignedTo: "Admin Team", assignedDepartment: "Admin", deadline: "2026-03-17", status: "pending", category: "Admin", comments: [], attachments: [] },
  { id: "ot8", employeeId: "1", title: "Provide office access", description: "Set up building and floor access cards", assignedTo: "Admin Team", assignedDepartment: "Admin", deadline: "2026-03-17", status: "pending", category: "Admin", comments: [], attachments: [] },
  { id: "ot9", employeeId: "1", title: "Assign mentor", description: "Assign an onboarding buddy/mentor", assignedTo: "Arjun Mehta", assignedDepartment: "Manager", deadline: "2026-03-15", status: "in-progress", category: "Manager", comments: [{ id: "c3", author: "Arjun Mehta", text: "Considering Karan Patel as mentor", timestamp: "2026-03-12 09:00" }], attachments: [] },
  { id: "ot10", employeeId: "1", title: "Create onboarding plan", description: "Create first week onboarding schedule", assignedTo: "Arjun Mehta", assignedDepartment: "Manager", deadline: "2026-03-14", status: "pending", category: "Manager", comments: [], attachments: [] },
  { id: "ot11", employeeId: "1", title: "Upload personal documents", description: "Upload government ID, certificates, etc.", assignedTo: "Priya Sharma", assignedDepartment: "Employee", deadline: "2026-03-18", status: "in-progress", category: "Employee", comments: [], attachments: [{ id: "a2", name: "Aadhar_Card.pdf", size: "180 KB", uploadedBy: "Priya Sharma", uploadedAt: "2026-03-10" }] },
  { id: "ot12", employeeId: "1", title: "Fill personal information form", description: "Complete personal details form", assignedTo: "Priya Sharma", assignedDepartment: "Employee", deadline: "2026-03-18", status: "pending", category: "Employee", comments: [], attachments: [] },
  { id: "ot13", employeeId: "1", title: "Read company policies", description: "Read and acknowledge company policies", assignedTo: "Priya Sharma", assignedDepartment: "Employee", deadline: "2026-03-20", status: "pending", category: "Employee", comments: [], attachments: [] },
  { id: "ot14", employeeId: "2", title: "Verify documents", description: "Verify all submitted employee documents", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-16", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "ot15", employeeId: "2", title: "Upload offer letter", description: "Upload signed offer letter", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-16", status: "completed", category: "HR", comments: [], attachments: [] },
  { id: "ot16", employeeId: "2", title: "Create email account", description: "Set up official email", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-03-17", status: "pending", category: "IT", comments: [], attachments: [] },
  { id: "ot17", employeeId: "2", title: "Assign mentor", description: "Assign onboarding buddy", assignedTo: "Sneha Kapoor", assignedDepartment: "Manager", deadline: "2026-03-18", status: "pending", category: "Manager", comments: [], attachments: [] },
  { id: "ot18", employeeId: "6", title: "Verify documents", description: "Verify all submitted employee documents", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-20", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "ot19", employeeId: "6", title: "Create employee record", description: "Set up employee in HR system", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-20", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "ot20", employeeId: "6", title: "Create email account", description: "Set up official email", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-03-21", status: "pending", category: "IT", comments: [], attachments: [] },
];

export const exitTasks: ExitTask[] = [
  { id: "et1", employeeId: "3", title: "Complete knowledge transfer", description: "Complete knowledge transfer to team members", assignedTo: "Vikram Singh", assignedDepartment: "Manager", deadline: "2026-04-01", status: "in-progress", category: "Manager", comments: [{ id: "c4", author: "Vikram Singh", text: "KT sessions scheduled for next 2 weeks", timestamp: "2026-03-10 11:00" }], attachments: [] },
  { id: "et2", employeeId: "3", title: "Confirm project handover", description: "Hand over all ongoing projects with documentation", assignedTo: "Vikram Singh", assignedDepartment: "Manager", deadline: "2026-04-08", status: "pending", category: "Manager", comments: [], attachments: [] },
  { id: "et3", employeeId: "3", title: "Disable system access", description: "Revoke all system access on LWD", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-04-15", status: "pending", category: "IT", comments: [], attachments: [] },
  { id: "et4", employeeId: "3", title: "Recover laptop and assets", description: "Collect work laptop, peripherals, and IT equipment", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-04-15", status: "pending", category: "IT", comments: [], attachments: [] },
  { id: "et5", employeeId: "3", title: "Collect ID card", description: "Collect employee ID card and access cards", assignedTo: "Admin Team", assignedDepartment: "Admin", deadline: "2026-04-15", status: "pending", category: "Admin", comments: [], attachments: [] },
  { id: "et6", employeeId: "3", title: "Recover office assets", description: "Collect any office furniture or equipment issued", assignedTo: "Admin Team", assignedDepartment: "Admin", deadline: "2026-04-15", status: "pending", category: "Admin", comments: [], attachments: [] },
  { id: "et7", employeeId: "3", title: "Process final settlement", description: "Calculate and process final settlement amount", assignedTo: "Finance Team", assignedDepartment: "Finance", deadline: "2026-04-20", status: "pending", category: "Finance", comments: [], attachments: [] },
  { id: "et8", employeeId: "3", title: "Clear dues", description: "Verify and clear any pending dues", assignedTo: "Finance Team", assignedDepartment: "Finance", deadline: "2026-04-20", status: "pending", category: "Finance", comments: [], attachments: [] },
  { id: "et9", employeeId: "3", title: "Conduct exit interview", description: "Schedule and conduct exit interview", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-04-10", status: "completed", category: "HR", comments: [{ id: "c5", author: "Meera Joshi", text: "Exit interview completed. Feedback recorded.", timestamp: "2026-03-08 15:00" }], attachments: [{ id: "a3", name: "Exit_Interview_AR.pdf", size: "120 KB", uploadedBy: "Meera Joshi", uploadedAt: "2026-03-08" }] },
  { id: "et10", employeeId: "3", title: "Generate experience letter", description: "Prepare and issue experience letter", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-04-15", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "et11", employeeId: "3", title: "Generate relieving letter", description: "Prepare and issue relieving letter on LWD", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-04-15", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "et12", employeeId: "7", title: "Manager approval", description: "Approve resignation request", assignedTo: "Arjun Mehta", assignedDepartment: "Manager", deadline: "2026-03-15", status: "completed", category: "Manager", comments: [{ id: "c6", author: "Arjun Mehta", text: "Resignation approved", timestamp: "2026-03-12 10:00" }], attachments: [] },
  { id: "et13", employeeId: "7", title: "HR acknowledgement", description: "Acknowledge resignation in HR system", assignedTo: "Meera Joshi", assignedDepartment: "HR", deadline: "2026-03-16", status: "pending", category: "HR", comments: [], attachments: [] },
  { id: "et14", employeeId: "7", title: "Complete knowledge transfer", description: "Complete KT to team", assignedTo: "Arjun Mehta", assignedDepartment: "Manager", deadline: "2026-04-15", status: "pending", category: "Manager", comments: [], attachments: [] },
  { id: "et15", employeeId: "7", title: "Disable system access", description: "Revoke system access on LWD", assignedTo: "Amit Deshmukh", assignedDepartment: "IT", deadline: "2026-04-30", status: "pending", category: "IT", comments: [], attachments: [] },
  { id: "et16", employeeId: "7", title: "Process final settlement", description: "Process final settlement", assignedTo: "Finance Team", assignedDepartment: "Finance", deadline: "2026-05-10", status: "pending", category: "Finance", comments: [], attachments: [] },
];

export const notifications: Notification[] = [
  { id: "n1", type: "task-assigned", title: "New Task Assigned", message: "Provide system access for Priya Sharma", timestamp: "2026-03-12 09:00", read: false, link: "/onboarding" },
  { id: "n2", type: "deadline-reminder", title: "Deadline Approaching", message: "Prepare laptop for Priya Sharma is due tomorrow", timestamp: "2026-03-14 08:00", read: false, link: "/tasks" },
  { id: "n3", type: "task-completed", title: "Task Completed", message: "Email account created for Priya Sharma", timestamp: "2026-03-13 14:00", read: false, link: "/onboarding" },
  { id: "n4", type: "workflow-started", title: "Exit Workflow Started", message: "Neha Agarwal submitted resignation", timestamp: "2026-03-11 10:00", read: true, link: "/exit" },
  { id: "n5", type: "task-assigned", title: "New Task Assigned", message: "Knowledge transfer for Ananya Reddy", timestamp: "2026-03-10 11:00", read: true, link: "/exit" },
  { id: "n6", type: "deadline-reminder", title: "Deadline Approaching", message: "HR acknowledgement for Neha Agarwal is overdue", timestamp: "2026-03-12 08:00", read: false, link: "/tasks" },
  { id: "n7", type: "workflow-started", title: "Onboarding Started", message: "Onboarding workflow generated for Siddharth Gupta", timestamp: "2026-03-09 09:00", read: true, link: "/onboarding" },
  { id: "n8", type: "task-assigned", title: "New Task Assigned", message: "Verify documents for Rahul Verma", timestamp: "2026-03-12 10:00", read: false, link: "/onboarding" },
];

export const dashboardStats = {
  totalEmployees: 8,
  activeEmployees: 3,
  onboarding: 3,
  noticePeriod: 2,
  pendingApprovals: 4,
  onboardingCompletionRate: 72,
  exitClearanceRate: 25,
};

// --- Task Workflow Engine ---

export interface OnboardingTaskTemplate {
  title: string;
  description: string;
  category: TaskDepartment;
  defaultAssignee: string;
  daysFromJoining: number;
}

export const onboardingTaskTemplates: OnboardingTaskTemplate[] = [
  { title: "Verify documents", description: "Verify all submitted employee documents", category: "HR", defaultAssignee: "Meera Joshi", daysFromJoining: -3 },
  { title: "Upload offer letter", description: "Upload signed offer letter to employee profile", category: "HR", defaultAssignee: "Meera Joshi", daysFromJoining: -3 },
  { title: "Create employee record", description: "Set up employee in HR system with all details", category: "HR", defaultAssignee: "Meera Joshi", daysFromJoining: -2 },
  { title: "Create email account", description: "Set up official email account", category: "IT", defaultAssignee: "Amit Deshmukh", daysFromJoining: -1 },
  { title: "Provide system access", description: "Grant access to required tools and software", category: "IT", defaultAssignee: "Amit Deshmukh", daysFromJoining: 0 },
  { title: "Prepare laptop", description: "Configure and deliver work laptop", category: "IT", defaultAssignee: "Amit Deshmukh", daysFromJoining: 0 },
  { title: "Issue employee ID card", description: "Create and issue employee ID card", category: "Admin", defaultAssignee: "Admin Team", daysFromJoining: 2 },
  { title: "Provide office access", description: "Set up building and floor access cards", category: "Admin", defaultAssignee: "Admin Team", daysFromJoining: 2 },
  { title: "Assign mentor", description: "Assign an onboarding buddy/mentor", category: "Manager", defaultAssignee: "", daysFromJoining: 0 },
  { title: "Create onboarding plan", description: "Create first week onboarding schedule", category: "Manager", defaultAssignee: "", daysFromJoining: -1 },
  { title: "Upload personal documents", description: "Upload government ID, certificates, etc.", category: "Employee", defaultAssignee: "", daysFromJoining: 3 },
  { title: "Fill personal information form", description: "Complete personal details form", category: "Employee", defaultAssignee: "", daysFromJoining: 3 },
  { title: "Read company policies", description: "Read and acknowledge company policies", category: "Employee", defaultAssignee: "", daysFromJoining: 5 },
];

export interface ExitTaskTemplate {
  title: string;
  description: string;
  category: TaskDepartment;
  defaultAssignee: string;
  daysBeforeLWD: number;
}

export const exitTaskTemplates: ExitTaskTemplate[] = [
  { title: "Complete knowledge transfer", description: "Complete knowledge transfer to team members", category: "Manager", defaultAssignee: "", daysBeforeLWD: 14 },
  { title: "Confirm project handover", description: "Hand over all ongoing projects with documentation", category: "Manager", defaultAssignee: "", daysBeforeLWD: 7 },
  { title: "Disable system access", description: "Revoke all system access on LWD", category: "IT", defaultAssignee: "Amit Deshmukh", daysBeforeLWD: 0 },
  { title: "Recover laptop and assets", description: "Collect work laptop, peripherals, and IT equipment", category: "IT", defaultAssignee: "Amit Deshmukh", daysBeforeLWD: 0 },
  { title: "Collect ID card", description: "Collect employee ID card and access cards", category: "Admin", defaultAssignee: "Admin Team", daysBeforeLWD: 0 },
  { title: "Recover office assets", description: "Collect any office furniture or equipment issued", category: "Admin", defaultAssignee: "Admin Team", daysBeforeLWD: 0 },
  { title: "Process final settlement", description: "Calculate and process final settlement amount", category: "Finance", defaultAssignee: "Finance Team", daysBeforeLWD: -5 },
  { title: "Clear dues", description: "Verify and clear any pending dues", category: "Finance", defaultAssignee: "Finance Team", daysBeforeLWD: -5 },
  { title: "Conduct exit interview", description: "Schedule and conduct exit interview", category: "HR", defaultAssignee: "Meera Joshi", daysBeforeLWD: 5 },
  { title: "Generate experience letter", description: "Prepare and issue experience letter", category: "HR", defaultAssignee: "Meera Joshi", daysBeforeLWD: 0 },
  { title: "Generate relieving letter", description: "Prepare and issue relieving letter on LWD", category: "HR", defaultAssignee: "Meera Joshi", daysBeforeLWD: 0 },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

let taskIdCounter = 100;

export function generateOnboardingTasks(employee: Employee): OnboardingTask[] {
  return onboardingTaskTemplates.map((tpl) => {
    const assignedTo = tpl.category === "Manager" ? employee.manager
      : tpl.category === "Employee" ? employee.name
      : tpl.defaultAssignee;
    return {
      id: `ot-gen-${++taskIdCounter}`,
      employeeId: employee.id,
      title: tpl.title,
      description: tpl.description,
      assignedTo,
      assignedDepartment: tpl.category,
      deadline: addDays(employee.joiningDate, tpl.daysFromJoining),
      status: "pending" as TaskStatus,
      category: tpl.category,
      comments: [],
      attachments: [],
    };
  });
}

export function generateExitTasks(employee: Employee): ExitTask[] {
  const lwd = employee.lastWorkingDay || addDays(new Date().toISOString().split("T")[0], 60);
  return exitTaskTemplates.map((tpl) => {
    const assignedTo = tpl.category === "Manager" ? employee.manager : tpl.defaultAssignee;
    return {
      id: `et-gen-${++taskIdCounter}`,
      employeeId: employee.id,
      title: tpl.title,
      description: tpl.description,
      assignedTo,
      assignedDepartment: tpl.category,
      deadline: addDays(lwd, -tpl.daysBeforeLWD),
      status: "pending" as TaskStatus,
      category: tpl.category,
      comments: [],
      attachments: [],
    };
  });
}

// Helper to compute department clearance stats
export function getDepartmentClearance(tasks: ExitTask[]) {
  const departments: TaskDepartment[] = ["Manager", "IT", "Admin", "Finance", "HR"];
  return departments.map((dept) => {
    const deptTasks = tasks.filter((t) => t.category === dept);
    const completed = deptTasks.filter((t) => t.status === "completed").length;
    return {
      department: dept,
      total: deptTasks.length,
      completed,
      progress: deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0,
    };
  }).filter((d) => d.total > 0);
}

export function getTasksByDepartment(tasks: Array<OnboardingTask | ExitTask>) {
  const deptMap: Record<string, { total: number; pending: number; completed: number }> = {};
  tasks.forEach((t) => {
    const dept = t.assignedDepartment;
    if (!deptMap[dept]) deptMap[dept] = { total: 0, pending: 0, completed: 0 };
    deptMap[dept].total++;
    if (t.status === "pending" || t.status === "overdue") deptMap[dept].pending++;
    if (t.status === "completed") deptMap[dept].completed++;
  });
  return Object.entries(deptMap).map(([dept, stats]) => ({ department: dept, ...stats }));
}
