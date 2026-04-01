// ==========================================
// COOKIES
// ==========================================

export type CountryOption = {
  code: string; // ISO code (US, ES, MX...)
  dial: string; // +1, +34...
  label: string;
  flag: string; // emoji bandera
};

export const DEFAULT_COUNTRIES: CountryOption[] = [
  { code: "COL", dial: "+57", label: "Colombia", flag: "🇨🇴" },
  { code: "US", dial: "+1", label: "United States", flag: "🇺🇸" },
  { code: "ES", dial: "+34", label: "España", flag: "🇪🇸" },
  { code: "MX", dial: "+52", label: "México", flag: "🇲🇽" },
  { code: "AR", dial: "+54", label: "Argentina", flag: "🇦🇷" },
  { code: "BR", dial: "+55", label: "Brasil", flag: "🇧🇷" },
  { code: "CL", dial: "+56", label: "Chile", flag: "🇨🇱" },
  { code: "PE", dial: "+51", label: "Perú", flag: "🇵🇪" },
  { code: "EC", dial: "+593", label: "Ecuador", flag: "🇪🇨" },
  { code: "VE", dial: "+58", label: "Venezuela", flag: "🇻🇪" },
  { code: "BO", dial: "+591", label: "Bolivia", flag: "🇧🇴" },
  { code: "PY", dial: "+595", label: "Paraguay", flag: "🇵🇾" },
  { code: "UY", dial: "+598", label: "Uruguay", flag: "🇺🇾" },
  { code: "CR", dial: "+506", label: "Costa Rica", flag: "🇨🇷" },
  { code: "PA", dial: "+507", label: "Panamá", flag: "🇵🇦" },
  { code: "GT", dial: "+502", label: "Guatemala", flag: "🇬🇹" },
  { code: "CU", dial: "+53", label: "Cuba", flag: "🇨🇺" },
  { code: "DO", dial: "+1", label: "República Dominicana", flag: "🇩🇴" },
  { code: "FR", dial: "+33", label: "Francia", flag: "🇫🇷" },
  { code: "DE", dial: "+49", label: "Alemania", flag: "🇩🇪" },
  { code: "IT", dial: "+39", label: "Italia", flag: "🇮🇹" },
  { code: "GB", dial: "+44", label: "Reino Unido", flag: "🇬🇧" },
  { code: "CA", dial: "+1", label: "Canadá", flag: "🇨🇦" },
  { code: "AU", dial: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "JP", dial: "+81", label: "Japón", flag: "🇯🇵" },
  { code: "CN", dial: "+86", label: "China", flag: "🇨🇳" },
  { code: "IN", dial: "+91", label: "India", flag: "🇮🇳" },
  { code: "ZA", dial: "+27", label: "Sudáfrica", flag: "🇿🇦" },
];

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 días
  path: "/",
} as const;

export const COOKIE_NAMES = {
  ROLE: "user_role",
  COMPANY: "company_id",
  COMPANY_ROLE: "company_role",
  IP_CLIENT: "ip_client",
} as const;

// ==========================================
// CACHE TAGS
// ==========================================

export const CACHE_TAGS = {
  //session
  SESSION: {
    SINGLE: "session",
    USER_ID: "session-user-id",
    CURRENT_USER: "session-current-user",
    COMPANIES: "session-companies",
  },
  //departments
  DEPARTMENTS: {
    ALL: "departments:all",
    DETAIL: (id: number) => `departments:${id}`,
  },
  //municipalities
  MUNICIPALITIES: {
    ALL: "municipalities:all",
    BY_DEPARTMENT: (departmentId: number) =>
      `municipalities:by-department:${departmentId}`,
    DETAIL: (id: number) => `municipalities:${id}`,
  },
} as const;

// ==========================================
// STORAGE BUCKETS
// ==========================================

export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  SOME_LOGOS: "some-logos",
  SOME: "some-images",
} as const;

// ==========================================
// IMPORT CONFIG
// ==========================================

export const IMPORT_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_ROWS_PER_FILE: 10000,
  DEFAULT_BATCH_SIZE: 100,
  MIN_CONFIDENCE_THRESHOLD: 0.8, // 80%
  ALLOWED_FILE_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ] as const,
} as const;

// ==========================================
// VALIDATION
// ==========================================

export const FILE_LIMITS = {
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  LOGO_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as const,
} as const;
