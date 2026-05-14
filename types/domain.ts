export type UserRole = "guest" | "candidate" | "company" | "admin";

export type JobStatus = "draft" | "pending_review" | "active" | "paused" | "rejected" | "expired";

export type ApplicationStage = "applied" | "review" | "interview" | "shortlist" | "offer" | "hired" | "rejected";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  avatar_path: string | null;
  cv_data?: CvData | null;
  cv_updated_at?: string | null;
};

export type CvData = {
  fullName?: string;
  title?: string;
  city?: string;
  phone?: string;
  email?: string;
  summary?: string;
  skills?: string;
  languages?: string;
  experience?: string;
  education?: string;
  certificates?: string;
  availability?: string;
};

export type Company = {
  id: number;
  owner_id?: string;
  name: string;
  slug: string;
  city: string | null;
  industry: string | null;
  description: string | null;
  logo_path: string | null;
  website: string | null;
  approved: boolean;
};

export type LookupItem = {
  id: number;
  name: string;
  slug: string;
};

export type Job = {
  id: number;
  title: string;
  slug: string;
  description: string;
  contract_type: string | null;
  salary_text: string | null;
  deadline: string | null;
  status: JobStatus;
  featured: boolean;
  company_id: number;
  companies?: Pick<Company, "id" | "name" | "slug" | "logo_path"> | null;
  categories?: { id: number; name: string } | null;
  cities?: { id: number; name: string } | null;
};

export type JobApplication = {
  id: number;
  job_id: number;
  candidate_id: string;
  stage: ApplicationStage;
  cover_letter: string | null;
  reference_code: string | null;
  created_at: string;
  jobs?: Pick<Job, "id" | "title" | "company_id"> & { companies?: Pick<Company, "name"> | null };
  profiles?: Profile | null;
};

export type Plan = {
  id: number;
  name: string;
  price_eur: number;
  active_jobs: number;
  unlock_credits: number;
  features: string[];
};

export type Order = {
  id: number;
  company_id: number;
  plan_id: number | null;
  status: "pending" | "paid" | "rejected" | "cancelled";
  amount_eur: number;
  payment_reference: string;
  activation_code: string | null;
  created_at: string;
  plans?: Pick<Plan, "name"> | null;
  companies?: Pick<Company, "name"> | null;
};

export type PaymentProof = {
  id: number;
  order_id: number;
  company_id: number;
  uploaded_by: string;
  amount_eur: number | null;
  file_path: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  orders?: Order | null;
  companies?: Pick<Company, "name"> | null;
};


export type SavedJob = {
  id: number;
  user_id: string;        // DB column is user_id (not candidate_id)
  job_id: number;
  created_at: string;
  jobs?: Job | null;
};

export type JobAlert = {
  id: number;
  candidate_id: string;   // DB column is candidate_id
  city_id: number | null;
  category_id: number | null;
  contract_type: string | null;
  keywords: string | null;
  active: boolean;
  created_at: string;
  cities?: { id: number; name: string } | null;
  categories?: { id: number; name: string } | null;
};

export type NotificationType =
  | "application_received" | "application_sent" | "stage_changed"
  | "company_approved" | "company_rejected"
  | "job_approved" | "job_rejected"
  | "payment_confirmed" | "payment_rejected"
  | "system";

export type Notification = {
  id: number;
  recipient_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type ApplicationComment = {
  id: number;
  application_id: number;
  author_id: string;
  text: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export type ApplicationLabel = {
  application_id: number;
  label: "top" | "interview" | "rejected" | "followup" | "star";
  created_at: string;
};

export type ApplicationEvent = {
  id: number;
  application_id: number;
  actor_id: string | null;
  from_stage: ApplicationStage | null;
  to_stage: ApplicationStage | null;
  created_at: string;
};

export type Subscription = {
  id: number;
  plan_id: number;
  plan_name: string;
  active_jobs: number;
  unlock_credits_remaining: number;
  active_until: string | null;
  status: "active" | "expired";
};

export type CompanyActivePlan = {
  subscription_id: number;
  plan_id: number;
  plan_name: string;
  active_jobs_limit: number;
  active_until: string | null;
  is_active: boolean;
};

export type BannerPlacement =
  | "homepage_top"
  | "homepage_middle"
  | "homepage_bottom"
  | "jobs_list_top"
  | "jobs_list_middle"
  | "jobs_list_bottom"
  | "jobs_left_tower"
  | "jobs_right_tower"
  | "job_detail_top"
  | "job_detail_bottom"
  | "company_pages_top"
  | "company_pages_bottom"
  | "city_page_top"
  | "category_page_top"
  | "footer_banner";

export type BannerFormat =
  | "leaderboard_728x90"
  | "large_leaderboard_970x90"
  | "billboard_970x250"
  | "medium_rectangle_300x250"
  | "half_page_300x600"
  | "wide_inline_1200x250"
  | "mobile_banner_320x50"
  | "mobile_large_320x100"
  | "mobile_inline_responsive";

export type BannerAudience = "all" | "candidates" | "companies";
export type BannerDevice = "all" | "desktop" | "mobile";

export type Banner = {
  id: number;
  title: string;
  image_path: string | null;
  target_url: string | null;
  placement: BannerPlacement | string;
  format: BannerFormat | string | null;
  target_audience: BannerAudience;
  device: BannerDevice;
  approved: boolean;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};
