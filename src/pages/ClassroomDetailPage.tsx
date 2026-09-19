import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, UserPlus, Trash2, Users, GraduationCap,
  BookOpen, ChevronDown, TrendingUp, Zap, Hash, Type, HelpCircle, Mic,
  CheckCircle2, Clock, Circle,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter, ModalError, ModalField, BtnCancel, BtnPrimary } from '../components/Modal';
import {
  getClassroom,
  getClassroomEducators,
  getClassroomStudents,
  addEducator,
  removeEducator,
  enrollStudent,
  removeStudent,
} from '../api/classrooms.api';
import { getCoursesByClassroom, getContentItemsByCourse } from '../api/courses.api';
import {
  getClassroomSummary,
  getStudentProgressByCourse,
  type ClassroomSummary,
  type StudentItemProgress,
} from '../api/progress.api';
import { useAuthStore } from '../store/auth.store';
import type {
  Classroom, ClassroomEducator, ClassroomStudent,
  CourseWithEducator, ContentItem, ContentType,
} from '../types';

// ── Status colors ─────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  active: 'bg-[#EDC157]/20 text-[#EDC157]',
  pending: 'bg-white/10 text-white/55',
  suspended: 'bg-red-500/20 text-red-400',
};

// ── Content type metadata ─────────────────────────────────────────────────────

const contentTypeMeta: Record<ContentType, { label: string; color: string; Icon: React.ElementType }> = {
  letter:     { label: 'Letra',     color: 'bg-blue-500/15 text-blue-400',    Icon: Type },
  number:     { label: 'Número',    color: 'bg-violet-500/15 text-violet-400', Icon: Hash },
  braille:    { label: 'Braille',   color: 'bg-[#FF6B35]/15 text-[#FF6B35]', Icon: Zap },
  quiz_mc:    { label: 'Quiz',      color: 'bg-[#EDC157]/15 text-[#EDC157]', Icon: HelpCircle },
  quiz_voice: { label: 'Quiz Voz',  color: 'bg-emerald-500/15 text-emerald-400', Icon: Mic },
};

// ── Progress helpers ──────────────────────────────────────────────────────────

const getLevel = (pct: number) =>
  pct <= 30 ? 'Inicial' : pct <= 79 ? 'En progreso' : 'Avanzado';

const levelColors: Record<string, string> = {
  Inicial: 'bg-white/[0.08] text-white/45',
  'En progreso': 'bg-[#EDC157]/15 text-[#EDC157]',
  Avanzado: 'bg-emerald-500/15 text-emerald-400',
};

const barColor = (pct: number) =>
  pct <= 30 ? 'bg-white/25' : pct <= 79 ? 'bg-[#EDC157]' : 'bg-emerald-400';

const ProgressBar = ({ pct, thin }: { pct: number; thin?: boolean }) => (
  <div className={`w-full ${thin ? 'h-1' : 'h-1.5'} bg-white/[0.07] rounded-full overflow-hidden`}>
    <div
      className={`h-full rounded-full transition-all ${barColor(pct)}`}
      style={{ width: `${Math.max(pct, 2)}%` }}
    />
  </div>
);

interface StudentProgress { id: string; name: string; progress: number }
interface CourseProgress { avgProgress: number; students: StudentProgress[] }

const computeProgressByCourse = (
  courseId: string,
  summary: ClassroomSummary,
): CourseProgress => {
  const { students, items, progress } = summary;
  const courseItemIds = new Set(
    items.filter((i) => i.course_id === courseId).map((i) => i.id),
  );
  const totalItems = courseItemIds.size;

  const studentStats: StudentProgress[] = students.map((s) => {
    const done = totalItems > 0
      ? progress.filter(
          (p) =>
            p.student_id === s.student_id &&
            courseItemIds.has(p.content_item_id) &&
            p.status === 'completed',
        ).length
      : 0;
    return {
      id: s.student_id,
      name: s.users?.full_name ?? '—',
      progress: totalItems > 0 ? Math.round((done / totalItems) * 100) : 0,
    };
  });

  const avg =
    studentStats.length > 0 && totalItems > 0
      ? Math.round(studentStats.reduce((a, b) => a + b.progress, 0) / studentStats.length)
      : 0;

  return { avgProgress: avg, students: studentStats };
};

// ── AddMemberModal ────────────────────────────────────────────────────────────

const AddMemberModal = ({
  title, subtitle, label, icon, onClose, onAdd,
}: {
  title: string; subtitle: string; label: string;
  icon: React.ElementType; onClose: () => void; onAdd: (id: string) => Promise<void>;
}) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onAdd(value.trim());
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al agregar. Verifica el ID.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} subtitle={subtitle} icon={icon} onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <ModalError message={error} />}
          <ModalField label={label} required>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] placeholder:text-white/25 transition"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
            />
          </ModalField>
        </ModalBody>
        <ModalFooter>
          <BtnCancel onClick={onClose} />
          <BtnPrimary loading={loading} label="Agregar" loadingLabel="Agregando…" />
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ── Activity + student detail ─────────────────────────────────────────────────

const statusMeta = {
  completed:   { Icon: CheckCircle2, color: 'text-emerald-400', label: 'Completada' },
  in_progress: { Icon: Clock,        color: 'text-[#EDC157]',   label: 'En curso' },
  not_started: { Icon: Circle,       color: 'text-white/20',    label: 'Sin comenzar' },
};

// ── CourseCard ────────────────────────────────────────────────────────────────

const CourseCard = ({
  course,
  isOpen,
  onToggle,
  items,
  itemsLoading,
  progress,
}: {
  course: CourseWithEducator;
  isOpen: boolean;
  onToggle: () => void;
  items: ContentItem[] | undefined;
  itemsLoading: boolean;
  progress: CourseProgress | null;
}) => {
  const itemCount = items?.length ?? 0;
  const level = progress ? getLevel(progress.avgProgress) : null;

  // Per-student activity expansion
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [studentCache, setStudentCache] = useState<Record<string, StudentItemProgress[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<Set<string>>(new Set());

  const toggleStudent = async (studentId: string) => {
    setExpandedStudents((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
    if (studentCache[studentId] !== undefined) return;
    setLoadingStudents((prev) => new Set(prev).add(studentId));
    try {
      const { data } = await getStudentProgressByCourse(studentId, course.id);
      setStudentCache((prev) => ({ ...prev, [studentId]: data }));
    } catch {
      setStudentCache((prev) => ({ ...prev, [studentId]: [] }));
    } finally {
      setLoadingStudents((prev) => { const n = new Set(prev); n.delete(studentId); return n; });
    }
  };

  return (
    <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Course header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="w-9 h-9 bg-[#EDC157]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-[#EDC157]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white leading-tight">{course.title}</p>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                course.is_published
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-white/[0.07] text-white/35'
              }`}
            >
              {course.is_published ? 'Publicado' : 'Borrador'}
            </span>
          </div>
          <p className="text-xs text-white/35 mt-0.5 truncate">
            {course.description
              ? course.description
              : course.users?.full_name
              ? `Por ${course.users.full_name}`
              : ''}
            {course.description && course.users?.full_name && (
              <span className="text-white/20"> · Por {course.users.full_name}</span>
            )}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 mr-1 flex-shrink-0">
          {progress && itemCount > 0 && progress.students.length > 0 ? (
            <>
              <div className="w-20">
                <ProgressBar pct={progress.avgProgress} />
              </div>
              <span className="text-sm font-semibold text-white/60 w-8 text-right">
                {progress.avgProgress}%
              </span>
              {level && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${levelColors[level]}`}>
                  {level}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-white/20">Sin progreso aún</span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-white/25 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className="border-t border-white/[0.06]">
          {/* ── Actividades ── */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Actividades
            </p>
            {itemsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-white/[0.04] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <p className="text-xs text-white/25 py-2">
                Este curso no tiene actividades aún.
              </p>
            ) : (
              <div className="space-y-1.5">
                {items.map((item) => {
                  const meta = contentTypeMeta[item.content_type];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-[10px] font-mono text-white/20 w-5 text-right flex-shrink-0">
                        {item.sort_order + 1}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium flex-shrink-0 ${meta.color}`}>
                        <Icon size={10} />
                        {meta.label}
                      </div>
                      <span className="text-sm text-white/80 flex-1 min-w-0 truncate">
                        {item.title}
                      </span>
                      {item.talkback_text && (
                        <span className="text-[10px] text-white/20 italic hidden sm:block truncate max-w-[120px]">
                          "{item.talkback_text}"
                        </span>
                      )}
                      {item.haptic_patterns && (
                        <span className="text-[10px] bg-[#FF6B35]/10 text-[#FF6B35]/60 px-2 py-0.5 rounded-lg flex-shrink-0 hidden sm:block">
                          {item.haptic_patterns.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Progreso por estudiante ── */}
          {progress && progress.students.length > 0 && itemCount > 0 && (
            <div className="px-5 pb-4 border-t border-white/[0.04] pt-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Progreso por estudiante
              </p>
              <div className="space-y-0.5">
                {progress.students.map((s) => {
                  const isExpanded = expandedStudents.has(s.id);
                  const isLoading = loadingStudents.has(s.id);
                  const progressData = studentCache[s.id];
                  const level = getLevel(s.progress);
                  return (
                    <div key={s.id}>
                      <button
                        onClick={() => toggleStudent(s.id)}
                        className="w-full flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className="w-6 h-6 bg-white/[0.05] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white/35 text-[10px] font-semibold">
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-white/50 w-32 truncate flex-shrink-0">{s.name}</span>
                        <div className="flex-1"><ProgressBar pct={s.progress} thin /></div>
                        <span className="text-xs text-white/40 w-8 text-right flex-shrink-0">{s.progress}%</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${levelColors[level]}`}>
                          {level}
                        </span>
                        {isLoading
                          ? <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin flex-shrink-0" />
                          : <ChevronDown size={12} className={`text-white/20 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        }
                      </button>

                      {isExpanded && (
                        <div className="ml-7 mt-1 mb-2 border-l border-white/[0.07] pl-3">
                          {isLoading || !progressData ? (
                            <div className="space-y-1 py-1">
                              {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-white/[0.04] rounded animate-pulse" />)}
                            </div>
                          ) : items && items.length > 0 ? (() => {
                            const progressMap: Record<string, StudentItemProgress> = {};
                            progressData.forEach((p) => { progressMap[p.content_item_id] = p; });
                            const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
                            return (
                              <div className="space-y-0.5 py-1">
                                {sorted.map((item) => {
                                  const prog = progressMap[item.id];
                                  const status = prog?.status ?? 'not_started';
                                  const { Icon, color, label: statusLabel } = statusMeta[status];
                                  const meta = contentTypeMeta[item.content_type];
                                  const TypeIcon = meta?.Icon ?? BookOpen;
                                  return (
                                    <div
                                      key={item.id}
                                      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg ${status === 'not_started' ? 'opacity-45' : ''}`}
                                    >
                                      <Icon size={13} className={`flex-shrink-0 ${color}`} />
                                      <span className="text-[10px] font-mono text-white/15 w-4 text-right flex-shrink-0">
                                        {item.sort_order + 1}
                                      </span>
                                      {meta && (
                                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium flex-shrink-0 ${meta.color}`}>
                                          <TypeIcon size={8} />{meta.label}
                                        </div>
                                      )}
                                      <span className="text-xs text-white/65 flex-1 min-w-0 truncate">{item.title}</span>
                                      {prog?.score !== null && prog?.score !== undefined && (
                                        <span className="text-[10px] text-white/30 flex-shrink-0">{prog.score} pts</span>
                                      )}
                                      {prog?.attempts != null && prog.attempts > 0 && (
                                        <span className="text-[10px] text-white/20 flex-shrink-0">{prog.attempts}×</span>
                                      )}
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                        status === 'completed' ? 'bg-emerald-500/10 text-emerald-400'
                                        : status === 'in_progress' ? 'bg-[#EDC157]/10 text-[#EDC157]'
                                        : 'bg-white/[0.04] text-white/20'
                                      }`}>
                                        {statusLabel}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })() : (
                            <p className="text-xs text-white/25 py-2">Sin actividades cargadas.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No-students notice */}
          {progress && progress.students.length === 0 && (
            <div className="px-5 pb-4">
              <p className="text-xs text-white/25">No hay estudiantes inscritos en el salón.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'educators' | 'students' | 'courses';

export const ClassroomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  // ── Core state ──
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [educators, setEducators] = useState<ClassroomEducator[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [tab, setTab] = useState<Tab>('educators');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [modal, setModal] = useState<'educators' | 'students' | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

  // ── Courses tab state ──
  const [fullCourses, setFullCourses] = useState<CourseWithEducator[]>([]);
  const [courseItems, setCourseItems] = useState<Record<string, ContentItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<ClassroomSummary | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  const canManage =
    user?.role === 'admin' || classroom?.lead_educator_id === user?.id;

  // ── Initial load ──
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [classRes, edRes, stRes] = await Promise.all([
          getClassroom(id),
          getClassroomEducators(id),
          getClassroomStudents(id),
        ]);
        setClassroom(classRes.data);
        setEducators(edRes.data);
        setStudents(stRes.data);
      } catch {
        setError('Error al cargar el salón.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Refresh helpers ──
  const refreshEducators = async () => {
    if (!id) return;
    setTabLoading(true);
    try {
      const { data } = await getClassroomEducators(id);
      setEducators(data);
    } finally {
      setTabLoading(false);
    }
  };

  const refreshStudents = async () => {
    if (!id) return;
    setTabLoading(true);
    try {
      const { data } = await getClassroomStudents(id);
      setStudents(data);
    } finally {
      setTabLoading(false);
    }
  };

  // ── Courses tab: lazy load courses + summary once ──
  const loadCourses = async () => {
    if (!id || coursesLoaded) return;
    setCoursesLoading(true);
    try {
      const [coursesRes, summaryRes] = await Promise.all([
        getCoursesByClassroom(id),
        getClassroomSummary(id),
      ]);
      setFullCourses(coursesRes.data);
      setSummary(summaryRes.data);
      setCoursesLoaded(true);
    } finally {
      setCoursesLoading(false);
    }
  };

  // ── Per-course: lazy load activities ──
  const loadCourseItems = async (courseId: string) => {
    if (courseItems[courseId] !== undefined || loadingItems.has(courseId)) return;
    setLoadingItems((prev) => new Set(prev).add(courseId));
    try {
      const { data } = await getContentItemsByCourse(courseId);
      setCourseItems((prev) => ({ ...prev, [courseId]: data }));
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'courses') loadCourses();
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
        loadCourseItems(courseId);
      }
      return next;
    });
  };

  // ── Member handlers ──
  const handleAddEducator = async (educatorId: string) => {
    if (!id) return;
    await addEducator(id, educatorId);
    await refreshEducators();
  };

  const handleAddStudent = async (studentId: string) => {
    if (!id) return;
    await enrollStudent(id, studentId);
    await refreshStudents();
  };

  const handleRemoveEducator = async (educatorId: string) => {
    if (!id || !confirm('¿Remover este educador del salón?')) return;
    setRemoving(educatorId);
    try {
      await removeEducator(id, educatorId);
      setEducators((prev) => prev.filter((e) => e.educator_id !== educatorId));
    } finally {
      setRemoving(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!id || !confirm('¿Desinscribir este estudiante?')) return;
    setRemoving(studentId);
    try {
      await removeStudent(id, studentId);
      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    } finally {
      setRemoving(null);
    }
  };

  // ── Guards ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/30 text-sm">
        Cargando salón…
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-2xl px-5 py-4 text-sm">
        {error || 'Salón no encontrado.'}
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        to="/classrooms"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Salones
      </Link>

      {/* Header */}
      <div className="surface border border-white/[0.08] rounded-2xl p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap size={24} className="text-[#FF6B35]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="page-title text-xl">{classroom.name}</h1>
            {classroom.description && (
              <p className="text-sm text-white/45 mt-0.5">{classroom.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
              <span>
                Código:{' '}
                <span className="font-mono font-semibold text-white/60">{classroom.code}</span>
              </span>
              <span>
                Creado:{' '}
                {new Date(classroom.created_at).toLocaleDateString('es', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="surface border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/[0.06]">
          {(['educators', 'students', 'courses'] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = {
              educators: `Educadores (${educators.length})`,
              students: `Estudiantes (${students.length})`,
              courses: coursesLoaded ? `Cursos (${fullCourses.length})` : 'Cursos',
            };
            const icons: Record<Tab, React.ElementType> = {
              educators: Users,
              students: GraduationCap,
              courses: BookOpen,
            };
            const Icon = icons[t];
            return (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                <Icon size={15} /> {labels[t]}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {/* ── Tab: Educators ── */}
          {tab === 'educators' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/40">
                  {educators.length} educador{educators.length !== 1 ? 'es' : ''} asignado{educators.length !== 1 ? 's' : ''}
                </p>
                {canManage && (
                  <button
                    onClick={() => setModal('educators')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF6B35] border border-[#FF6B35]/30 rounded-xl hover:bg-[#FF6B35]/10 transition-colors"
                  >
                    <UserPlus size={13} /> Asignar educador
                  </button>
                )}
              </div>
              {tabLoading ? (
                <p className="text-sm text-white/30 text-center py-4">Cargando…</p>
              ) : educators.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No hay educadores asignados.</p>
              ) : (
                <ul className="space-y-2">
                  {educators.map((e) => (
                    <li
                      key={e.educator_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FF6B35]/15 rounded-full flex items-center justify-center">
                          <span className="text-[#FF6B35] text-xs font-semibold">
                            {e.users?.full_name?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {e.users?.full_name ?? 'Sin nombre'}
                          </p>
                          <p className="text-xs text-white/35">{e.users?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.users?.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[e.users.status] ?? 'bg-white/10 text-white/50'}`}>
                            {e.users.status}
                          </span>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleRemoveEducator(e.educator_id)}
                            disabled={removing === e.educator_id}
                            className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* ── Tab: Students ── */}
          {tab === 'students' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/40">
                  {students.length} estudiante{students.length !== 1 ? 's' : ''} inscrito{students.length !== 1 ? 's' : ''}
                </p>
                {(canManage || user?.role === 'lead_educator') && (
                  <button
                    onClick={() => setModal('students')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FF6B35] border border-[#FF6B35]/30 rounded-xl hover:bg-[#FF6B35]/10 transition-colors"
                  >
                    <UserPlus size={13} /> Inscribir estudiante
                  </button>
                )}
              </div>
              {tabLoading ? (
                <p className="text-sm text-white/30 text-center py-4">Cargando…</p>
              ) : students.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No hay estudiantes inscritos.</p>
              ) : (
                <ul className="space-y-2">
                  {students.map((s) => (
                    <li
                      key={s.student_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#EDC157]/15 rounded-full flex items-center justify-center">
                          <span className="text-[#EDC157] text-xs font-semibold">
                            {s.users?.full_name?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {s.users?.full_name ?? 'Sin nombre'}
                          </p>
                          <p className="text-xs text-white/35">{s.users?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.users?.qr_code && (
                          <span className="text-xs font-mono text-white/25 bg-white/5 px-1.5 py-0.5 rounded-lg">
                            QR: {s.users.qr_code.substring(0, 8)}…
                          </span>
                        )}
                        {s.users?.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.users.status] ?? 'bg-white/10 text-white/50'}`}>
                            {s.users.status}
                          </span>
                        )}
                        {(canManage || user?.role === 'lead_educator') && (
                          <button
                            onClick={() => handleRemoveStudent(s.student_id)}
                            disabled={removing === s.student_id}
                            className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* ── Tab: Courses ── */}
          {tab === 'courses' && (
            <>
              {coursesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/[0.04] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : fullCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">No hay cursos en este salón aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fullCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isOpen={expandedCourses.has(course.id)}
                      onToggle={() => toggleCourse(course.id)}
                      items={courseItems[course.id]}
                      itemsLoading={loadingItems.has(course.id)}
                      progress={summary ? computeProgressByCourse(course.id, summary) : null}
                    />
                  ))}

                  {/* Footer summary */}
                  <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
                    <TrendingUp size={13} className="text-white/20" />
                    <span className="text-xs text-white/30">
                      {fullCourses.length} curso{fullCourses.length !== 1 ? 's' : ''} ·{' '}
                      {fullCourses.filter((c) => c.is_published).length} publicado{fullCourses.filter((c) => c.is_published).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'educators' && (
        <AddMemberModal
          title="Asignar educador"
          subtitle="Ingresa el UUID del educador a agregar"
          label="UUID del educador"
          icon={Users}
          onClose={() => setModal(null)}
          onAdd={handleAddEducator}
        />
      )}
      {modal === 'students' && (
        <AddMemberModal
          title="Inscribir estudiante"
          subtitle="Ingresa el UUID del estudiante a inscribir"
          label="UUID del estudiante"
          icon={GraduationCap}
          onClose={() => setModal(null)}
          onAdd={handleAddStudent}
        />
      )}
    </div>
  );
};
