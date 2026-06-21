/**
 * i18n — Lightweight internationalisation for CEPHO
 *
 * Supports English (LTR) and Arabic (RTL).
 * Usage:
 *   import { useI18n } from "@/lib/i18n";
 *   const { t, dir, lang } = useI18n();
 *   <p>{t("nav.dashboard")}</p>
 */

export type Lang = "en" | "ar";

export const translations = {
  en: {
    // Navigation
    "nav.dashboard": "The Nexus",
    "nav.signal": "The Signal",
    "nav.chiefOfStaff": "Chief of Staff",
    "nav.projects": "Project Genesis",
    "nav.tasks": "Tasks",
    "nav.aiExperts": "AI-SME Experts",
    "nav.agents": "AI Agents",
    "nav.library": "Knowledge Library",
    "nav.vault": "Vault",
    "nav.settings": "Settings",
    "nav.search": "Search...",
    "nav.notifications": "Notifications",
    "nav.voiceNotes": "Voice Notes",
    "nav.subscriptions": "Subscriptions",
    "nav.emailAccounts": "Email Accounts",
    "nav.brandKit": "Brand Kit",
    "nav.analytics": "Analytics",
    "nav.security": "Security",

    // Common actions
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.create": "Create",
    "action.add": "Add",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export",
    "action.import": "Import",
    "action.refresh": "Refresh",
    "action.close": "Close",
    "action.confirm": "Confirm",
    "action.back": "Back",
    "action.next": "Next",
    "action.previous": "Previous",
    "action.submit": "Submit",
    "action.loading": "Loading...",
    "action.retry": "Retry",
    "action.viewAll": "View All",
    "action.signOut": "Sign Out",

    // Status labels
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.pending": "Pending",
    "status.completed": "Completed",
    "status.inProgress": "In Progress",
    "status.blocked": "Blocked",
    "status.cancelled": "Cancelled",
    "status.draft": "Draft",
    "status.published": "Published",
    "status.online": "Online",
    "status.offline": "Offline",

    // Priority labels
    "priority.critical": "Critical",
    "priority.high": "High",
    "priority.medium": "Medium",
    "priority.low": "Low",

    // Common UI
    "ui.noResults": "No results found",
    "ui.noData": "No data available",
    "ui.error": "Something went wrong",
    "ui.errorRetry": "Something went wrong. Please try again.",
    "ui.emptyState": "Nothing here yet",
    "ui.loadMore": "Load more",
    "ui.showLess": "Show less",
    "ui.total": "Total",
    "ui.of": "of",
    "ui.page": "Page",
    "ui.perPage": "Per page",
    "ui.sortBy": "Sort by",
    "ui.filterBy": "Filter by",
    "ui.clearFilters": "Clear filters",
    "ui.selected": "selected",
    "ui.selectAll": "Select all",
    "ui.deselectAll": "Deselect all",

    // Time
    "time.today": "Today",
    "time.yesterday": "Yesterday",
    "time.tomorrow": "Tomorrow",
    "time.thisWeek": "This week",
    "time.lastWeek": "Last week",
    "time.thisMonth": "This month",
    "time.lastMonth": "Last month",
    "time.createdAt": "Created",
    "time.updatedAt": "Updated",
    "time.dueDate": "Due date",
    "time.startDate": "Start date",
    "time.endDate": "End date",

    // Search
    "search.placeholder": "Search across tasks, projects, documents...",
    "search.results": "Search results",
    "search.noResults": "No results for",
    "search.recentSearches": "Recent searches",
    "search.categories.tasks": "Tasks",
    "search.categories.projects": "Projects",
    "search.categories.documents": "Documents",
    "search.categories.briefings": "Briefings",
    "search.categories.notes": "Voice Notes",

    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.accessibility": "Accessibility",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.profile": "Profile",

    // Accessibility
    "a11y.skipToContent": "Skip to main content",
    "a11y.mainNav": "Main navigation",
    "a11y.mainContent": "Main content",
    "a11y.toggleNav": "Toggle navigation",
    "a11y.closeModal": "Close modal",
    "a11y.openMenu": "Open menu",
    "a11y.loading": "Loading, please wait",
    "a11y.required": "Required field",
  },

  ar: {
    // Navigation
    "nav.dashboard": "النيكسوس",
    "nav.signal": "الإشارة",
    "nav.chiefOfStaff": "رئيس الموظفين",
    "nav.projects": "مشروع جينيسيس",
    "nav.tasks": "المهام",
    "nav.aiExperts": "خبراء الذكاء الاصطناعي",
    "nav.agents": "وكلاء الذكاء الاصطناعي",
    "nav.library": "مكتبة المعرفة",
    "nav.vault": "الخزنة",
    "nav.settings": "الإعدادات",
    "nav.search": "بحث...",
    "nav.notifications": "الإشعارات",
    "nav.voiceNotes": "الملاحظات الصوتية",
    "nav.subscriptions": "الاشتراكات",
    "nav.emailAccounts": "حسابات البريد الإلكتروني",
    "nav.brandKit": "هوية العلامة التجارية",
    "nav.analytics": "التحليلات",
    "nav.security": "الأمان",

    // Common actions
    "action.save": "حفظ",
    "action.cancel": "إلغاء",
    "action.delete": "حذف",
    "action.edit": "تعديل",
    "action.create": "إنشاء",
    "action.add": "إضافة",
    "action.search": "بحث",
    "action.filter": "تصفية",
    "action.export": "تصدير",
    "action.import": "استيراد",
    "action.refresh": "تحديث",
    "action.close": "إغلاق",
    "action.confirm": "تأكيد",
    "action.back": "رجوع",
    "action.next": "التالي",
    "action.previous": "السابق",
    "action.submit": "إرسال",
    "action.loading": "جاري التحميل...",
    "action.retry": "إعادة المحاولة",
    "action.viewAll": "عرض الكل",
    "action.signOut": "تسجيل الخروج",

    // Status labels
    "status.active": "نشط",
    "status.inactive": "غير نشط",
    "status.pending": "قيد الانتظار",
    "status.completed": "مكتمل",
    "status.inProgress": "قيد التنفيذ",
    "status.blocked": "محظور",
    "status.cancelled": "ملغى",
    "status.draft": "مسودة",
    "status.published": "منشور",
    "status.online": "متصل",
    "status.offline": "غير متصل",

    // Priority labels
    "priority.critical": "حرج",
    "priority.high": "عالي",
    "priority.medium": "متوسط",
    "priority.low": "منخفض",

    // Common UI
    "ui.noResults": "لا توجد نتائج",
    "ui.noData": "لا توجد بيانات متاحة",
    "ui.error": "حدث خطأ ما",
    "ui.errorRetry": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    "ui.emptyState": "لا يوجد شيء هنا بعد",
    "ui.loadMore": "تحميل المزيد",
    "ui.showLess": "عرض أقل",
    "ui.total": "الإجمالي",
    "ui.of": "من",
    "ui.page": "صفحة",
    "ui.perPage": "لكل صفحة",
    "ui.sortBy": "ترتيب حسب",
    "ui.filterBy": "تصفية حسب",
    "ui.clearFilters": "مسح الفلاتر",
    "ui.selected": "محدد",
    "ui.selectAll": "تحديد الكل",
    "ui.deselectAll": "إلغاء تحديد الكل",

    // Time
    "time.today": "اليوم",
    "time.yesterday": "أمس",
    "time.tomorrow": "غداً",
    "time.thisWeek": "هذا الأسبوع",
    "time.lastWeek": "الأسبوع الماضي",
    "time.thisMonth": "هذا الشهر",
    "time.lastMonth": "الشهر الماضي",
    "time.createdAt": "تاريخ الإنشاء",
    "time.updatedAt": "تاريخ التحديث",
    "time.dueDate": "تاريخ الاستحقاق",
    "time.startDate": "تاريخ البدء",
    "time.endDate": "تاريخ الانتهاء",

    // Search
    "search.placeholder": "البحث في المهام والمشاريع والمستندات...",
    "search.results": "نتائج البحث",
    "search.noResults": "لا توجد نتائج لـ",
    "search.recentSearches": "عمليات البحث الأخيرة",
    "search.categories.tasks": "المهام",
    "search.categories.projects": "المشاريع",
    "search.categories.documents": "المستندات",
    "search.categories.briefings": "الإحاطات",
    "search.categories.notes": "الملاحظات الصوتية",

    // Settings
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.theme": "المظهر",
    "settings.accessibility": "إمكانية الوصول",
    "settings.notifications": "الإشعارات",
    "settings.security": "الأمان",
    "settings.profile": "الملف الشخصي",

    // Accessibility
    "a11y.skipToContent": "تخطي إلى المحتوى الرئيسي",
    "a11y.mainNav": "التنقل الرئيسي",
    "a11y.mainContent": "المحتوى الرئيسي",
    "a11y.toggleNav": "تبديل التنقل",
    "a11y.closeModal": "إغلاق النافذة",
    "a11y.openMenu": "فتح القائمة",
    "a11y.loading": "جاري التحميل، يرجى الانتظار",
    "a11y.required": "حقل مطلوب",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/** Get the stored language preference, defaulting to English */
export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("cepho-lang") as Lang) ?? "en";
}

/** Persist the language preference */
export function setStoredLang(lang: Lang) {
  localStorage.setItem("cepho-lang", lang);
}

/** Get text direction for a language */
export function getLangDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

/** Translate a key for the given language */
export function translate(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
