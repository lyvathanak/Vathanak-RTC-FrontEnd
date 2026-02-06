// src/stores/global/useSubject.js
import { ref, computed, watch } from "vue";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";

/* ---------- robust base URL + helpers (prod safe) ---------- */
const FALLBACK_BASE = import.meta.env.VITE_API_TARGET_URL;
const RESOLVED_BASE =
  (api?.defaults?.baseURL &&
    String(api.defaults.baseURL).replace(/\/+$/, "")) ||
  (import.meta?.env?.VITE_API_BASE_URL &&
    String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "")) ||
  FALLBACK_BASE;

const buildURL = (path) =>
  `${RESOLVED_BASE}/${String(path || "").replace(/^\/+/, "")}`;

/* ---------- small utils ---------- */
const approxEq = (a, b, eps = 1e-9) => Math.abs(Number(a) - Number(b)) <= eps;

export function useSubject() {
  /* ---------- state ---------- */
  const loading = ref(false);
  const exporting = ref(false);

  const subjects = ref([]);
  const meta = ref({
    current_page: 1,
    from: 0,
    to: 0,
    total: 0,
    per_page: 25,
    last_page: 1,
  });

  const page = ref(1);
  const pageSize = ref(10);
  const search = ref("");

  const filters = ref({
    department_id: "",
    program_id: "",
    academic_year: "", // ✅
    credit: "",
    total_hours: "",
  });

  const filterHours = ref("");

  const loadingRefData = ref(false);
  const departments = ref([]);
  const programs = ref([]);
  const deptMap = ref(new Map());
  const programMap = ref(new Map());

  /* delete dialog state */
  const subjectToDelete = ref(null);
  const deletingId = ref(null);

  /* ---------- formatters ---------- */
  function formatCredit(n) {
    const num = Number(n ?? 0);
    if (!Number.isFinite(num)) return "0.00";
    if (Number.isInteger(num)) return num.toFixed(2);
    const hundred = Math.round((num % 1) * 100);
    if (hundred === 50) return (Math.floor(num) + 0.5).toString();
    return num.toFixed(2).replace(/\.?0+$/, "");
  }

  function formatHour(v) {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return "0";
    return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.00$/, "");
  }

  function programNameFromSubject(s) {
    const inline = s.program_name ?? s.program?.program_name ?? s.program?.name;
    if (inline) return inline;
    const pid = s.program_id ?? s.programId ?? s.program?.id;
    if (!pid) return "-";
    return programMap.value.get(String(pid))?.name ?? `#${pid}`;
  }

  function departmentNameFromSubject(s) {
    const inline =
      s.department_name ?? s.department?.department_name ?? s.department?.name;
    if (inline) return inline;

    let depId = s.department_id ?? s.departmentId ?? s.department?.id ?? null;
    if (!depId) {
      const pid = s.program_id ?? s.programId ?? s.program?.id ?? null;
      if (pid) depId = programMap.value.get(String(pid))?.department_id ?? null;
    }
    if (!depId) return "-";
    return deptMap.value.get(String(depId))?.name ?? `#${depId}`;
  }

  /* ---------- ref data ---------- */
  const departmentsWithPrograms = computed(() => {
    const set = new Set(
      programs.value.map((p) => Number(p.department_id)).filter(Number.isFinite)
    );
    return departments.value.filter((d) => set.has(Number(d.id)));
  });

  const filteredProgramOptions = computed(() => {
    if (!filters.value.department_id) return [];
    const dep = String(filters.value.department_id);
    return programs.value.filter((p) => String(p.department_id ?? "") === dep);
  });

  async function fetchRefData() {
    loadingRefData.value = true;

    try {
      // ✅ only two endpoints (dept + program)
      const [deptRes, progRes] = await Promise.all([
        api.get("/managements/get_all_department"),
        api.get("/managements/get_all_program"),
      ]);

      // -------- departments --------
      const dres = deptRes?.data || {};
      const dlist = Array.isArray(dres?.all_department)
        ? dres.all_department
        : [];

      departments.value = dlist.map((d) => ({
        id: Number(d.id),
        name: String(d.department_name ?? d.name ?? ""),
      }));
      deptMap.value = new Map(departments.value.map((d) => [String(d.id), d]));

      // -------- programs --------
      const pres = progRes?.data || {};
      const plist = Array.isArray(pres?.programs) ? pres.programs : [];

      programs.value = plist.map((p) => ({
        id: Number(p.id),
        name: String(p.program_name ?? p.name ?? ""),
        department_id: p.department_id ?? null,
        // ✅ include academic_year from program so you can filter later
        academic_year: String(p.academic_year ?? p.academicYear ?? ""),
      }));

      programMap.value = new Map(programs.value.map((p) => [String(p.id), p]));
    } catch (err) {
      console.error("fetchRefData failed:", err);
      // keep UI stable
      departments.value = [];
      programs.value = [];
      deptMap.value = new Map();
      programMap.value = new Map();
    } finally {
      loadingRefData.value = false;
    }
  }

  const filteredAcademicOptions = computed(() => {
    if (!filters.value.program_id) return [];
    const p = programMap.value.get(String(filters.value.program_id));
    const year = p?.academic_year || "";
    return year ? [year] : [];
  });

  function onDeptFilterChange() {
    if (filters.value.program_id) {
      const p = programMap.value.get(String(filters.value.program_id));
      if (
        !p ||
        String(p.department_id ?? "") !==
          String(filters.value.department_id ?? "")
      ) {
        filters.value.program_id = "";
      }
    }

    // ✅ reset academic_year
    filters.value.academic_year = "";

    fetchSubjects(1);
  }

  function onProgramFilterChange() {
    // ✅ reset academic year when program changes
    filters.value.academic_year = "";
    fetchSubjects(1);
  }

  /* ---------- data fetching ---------- */
  const MAX_PAGES_TO_PULL = 50;

  const hasClientFilters = () =>
    !!(
      filters.value.department_id ||
      filters.value.program_id ||
      filters.value.academic_year || // ✅
      (filters.value.credit !== "" && filters.value.credit != null) ||
      (filters.value.total_hours !== "" && filters.value.total_hours != null)
    );

  async function fetchOnePage(p, q) {
    const isSearch = !!(q && q.trim());
    const url = isSearch
      ? "/managements/search_paginate_subjects"
      : "/managements/get_all_subjects";

    const params = { page: p, per_page: pageSize.value };
    if (isSearch) params.search = q.trim();

    const { data } = await api.get(url, { params });

    const pack = data?.subjects || {};
    const rows = Array.isArray(pack.data) ? pack.data : [];

    const m = {
      current_page: pack.current_page ?? p,
      from: pack.from ?? (rows.length ? 1 : 0),
      to: pack.to ?? rows.length,
      total: pack.total ?? rows.length,
      per_page: pack.per_page ?? pageSize.value,
      last_page: pack.last_page ?? 1,
    };

    return { rows, meta: m };
  }

  async function fetchSubjects(p = 1) {
    loading.value = true;
    try {
      const q = (search.value || "").trim();
      const first = await fetchOnePage(p, q);

      let rows = first.rows;
      let serverMeta = first.meta;

      // if client filters exist => pull more pages for full filtering set
      if (hasClientFilters()) {
        const all = [...rows];
        const lastPage = Number(serverMeta.last_page || 1);
        const limit = Math.min(lastPage, MAX_PAGES_TO_PULL);

        for (let i = 1; i <= limit; i++) {
          if (i === p) continue;
          const more = await fetchOnePage(i, q);
          all.push(...more.rows);
        }
        rows = all;
      }

      // normalize
      const normalized = rows.map((r) => {
        const code =
          r.subject_code ?? r.code ?? r.subjectCode ?? r.course_code ?? "";
        const name =
          r.subject_name ??
          r.name ??
          r.title ??
          r.subject ??
          r.subjectName ??
          "";
        const totalHours =
          r.total_hours ?? r.total_hour ?? r.totalTime ?? r.totalHours ?? 0;
        const practiceHours =
          r.practice_hours ??
          r.practice_hour ??
          r.practiceTime ??
          r.practiceHours ??
          0;

        const pid = r.program_id ?? r.programId ?? r.program?.id ?? null;
        let did = r.department_id ?? r.departmentId ?? r.department?.id ?? null;
        if (!did && pid) {
          const pm = programMap.value.get(String(pid));
          if (pm) did = pm.department_id ?? null;
        }

        return {
          ...r,
          subject_code: code,
          subject_name: name,
          program_id: pid,
          department_id: did,
          total_hours: totalHours,
          practice_hours: practiceHours,
          __code: code || "-",
          __name: name || "-",
        };
      });

      // client filters + client search (extra)
      let list = normalized;

      if (filters.value.department_id) {
        const wanted = String(filters.value.department_id);
        list = list.filter((r) => String(r.department_id ?? "") === wanted);
      }
      if (filters.value.program_id) {
        const wanted = String(filters.value.program_id);
        list = list.filter((r) => String(r.program_id ?? "") === wanted);
      }
      if (filters.value.academic_year) {
        const wanted = String(filters.value.academic_year);
        list = list.filter((r) => {
          const pid = r.program_id ?? r.programId ?? r.program?.id ?? null;
          const p = pid ? programMap.value.get(String(pid)) : null;
          return String(p?.academic_year ?? "") === wanted;
        });
      }

      if (filters.value.credit !== "" && filters.value.credit != null) {
        list = list.filter((r) => approxEq(r.credit, filters.value.credit));
      }
      if (
        filters.value.total_hours !== "" &&
        filters.value.total_hours != null
      ) {
        list = list.filter((r) =>
          approxEq(r.total_hours, filters.value.total_hours)
        );
      }

      if (q) {
        const ql = q.toLowerCase();
        list = list.filter((r) => {
          const hay = [
            r.__code,
            r.__name,
            r.description,
            programNameFromSubject(r),
            departmentNameFromSubject(r),
          ]
            .map((x) => String(x || "").toLowerCase())
            .join(" ");
          return hay.includes(ql);
        });
      }

      // meta + slice
      if (hasClientFilters()) {
        const start = (p - 1) * pageSize.value;
        const end = start + pageSize.value;

        subjects.value = list.slice(start, end);
        const total = list.length;

        meta.value = {
          current_page: p,
          from: total ? start + 1 : 0,
          to: Math.min(end, total),
          total,
          per_page: pageSize.value,
          last_page: Math.max(1, Math.ceil(total / pageSize.value)),
        };
      } else {
        subjects.value = list;
        meta.value = {
          current_page: serverMeta.current_page ?? p,
          from:
            serverMeta.from ??
            (p - 1) * (serverMeta.per_page || pageSize.value) + 1,
          to:
            serverMeta.to ??
            (p - 1) * (serverMeta.per_page || pageSize.value) + list.length,
          total: serverMeta.total ?? list.length,
          per_page: serverMeta.per_page ?? pageSize.value,
          last_page:
            serverMeta.last_page ??
            Math.max(
              1,
              Math.ceil(
                (serverMeta.total ?? list.length) /
                  (serverMeta.per_page ?? pageSize.value)
              )
            ),
        };
      }

      page.value = meta.value.current_page;
    } finally {
      loading.value = false;
    }
  }

  /* ---------- delete ---------- */
  async function confirmDelete() {
    const row = subjectToDelete.value;
    if (!row || !row.id) return;
    const id = row.id;
    deletingId.value = id;

    const endpoints = [
      `/managements/remove_subject/${id}`,
      buildURL(`/managements/remove_subject/${id}`),
      `/managements/delete_subject/${id}`,
      buildURL(`/managements/delete_subject/${id}`),
    ];

    let lastErr = null;

    for (const url of endpoints) {
      try {
        await api.delete(url, { withCredentials: true });

        subjects.value = subjects.value.filter(
          (r) => Number(r.id) !== Number(id)
        );
        if (subjects.value.length === 0 && page.value > 1)
          page.value = page.value - 1;

        await fetchSubjects(page.value);

        showNotification("Subject deleted successfully!", "success");
        deletingId.value = null;
        subjectToDelete.value = null;
        return;
      } catch (e) {
        lastErr = e;
      }
    }

    const msg =
      lastErr?.response?.data?.message ||
      lastErr?.response?.data?.error ||
      lastErr?.message ||
      "Failed to delete subject";

    showNotification(msg, "error");
    deletingId.value = null;
    subjectToDelete.value = null;
  }

  /* ---------- export ---------- */
  async function exportData() {
    if (exporting.value) return;
    exporting.value = true;

    try {
      const q = (search.value || "").trim();
      const params = {};
      if (q) params.search = q;

      const { data } = await api.get("/managements/export_subjects", {
        params,
        responseType: "blob",
      });

      if (!(data instanceof Blob)) throw new Error("No file returned");

      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const dl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = dl;
      a.download = `subjects-${new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, "")}.csv`;
      a.click();

      window.URL.revokeObjectURL(dl);
    } catch {
      showNotification("Export is not available yet on the server.", "error");
    } finally {
      exporting.value = false;
    }
  }

  /* ---------- pagination helpers ---------- */
  function handlePageChange(p) {
    page.value = p;
    fetchSubjects(p);
  }

  function handlePageSizeChange(size) {
    pageSize.value = Number(size) || 25;
    page.value = 1;
    fetchSubjects(1);
  }

  /* ---------- debounce ---------- */
  let debounceTimer;
  function debouncedFetch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSubjects(1), 300);
  }

  /* ---------- filter helpers ---------- */
  function clearFilter(key) {
    if (key === "search") {
      search.value = "";
      debouncedFetch();
      return;
    }
    if (key === "department_id") filters.value.department_id = "";
    if (key === "program_id") filters.value.program_id = "";
    if (key === "academic_id") filters.value.academic_year = "";
    if (key === "credit") filters.value.credit = "";
    if (key === "total_hours") {
      filters.value.total_hours = "";
      filterHours.value = "";
    }
    fetchSubjects(1);
  }

  function clearAllFilters() {
    search.value = "";
    filters.value = {
      department_id: "",
      program_id: "",
      academic_year: "",
      credit: "",
      total_hours: "",
    };
    filterHours.value = "";
    fetchSubjects(1);
  }

  let timeDebounce;
  watch(filterHours, (val) => {
    clearTimeout(timeDebounce);
    timeDebounce = setTimeout(() => {
      const isEmpty =
        val === "" ||
        val == null ||
        (typeof val === "string" && val.trim() === "");
      if (isEmpty) {
        filters.value.total_hours = "";
        fetchSubjects(1);
        return;
      }
      const parsed = typeof val === "number" ? val : parseFloat(String(val));
      filters.value.total_hours =
        Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
      fetchSubjects(1);
    }, 250);
  });

  /* ---------- convenient totals (for dashboard) ---------- */
  const totalSubjects = computed(
    () => meta.value.total ?? subjects.value.length ?? 0
  );
  const totalDepartments = computed(() => departments.value.length);

  return {
    loading,
    exporting,
    subjects,
    meta,
    page,
    pageSize,
    search,
    filters,
    filterHours,

    loadingRefData,
    departments,
    programs,
    departmentsWithPrograms,
    filteredProgramOptions,
    filteredAcademicOptions, // ✅

    subjectToDelete,
    deletingId,

    formatCredit,
    formatHour,
    programNameFromSubject,
    departmentNameFromSubject,

    fetchRefData,
    fetchSubjects,
    onDeptFilterChange,
    onProgramFilterChange, // ✅
    clearFilter,
    clearAllFilters, // ✅
    confirmDelete,
    exportData,
    handlePageChange,
    handlePageSizeChange,
    debouncedFetch,

    totalSubjects,
    totalDepartments,
  };
}
