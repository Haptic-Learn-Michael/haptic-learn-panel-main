import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart2, Users, School, ArrowLeft, TrendingUp, ChevronDown,
  BookOpen, CheckCircle2, Clock, Circle, Zap, Hash, Type, HelpCircle, Mic,
} from 'lucide-react';
import { getSchool, getSchoolEducators, getSchoolClassrooms } from '../api/schools.api';
import {
  getClassroomSummary,
  getStudentProgressByCourse,
  type ClassroomSummary,
  type StudentItemProgress,
} from '../api/progress.api';
import { getContentItemsByCourse } from '../api/courses.api';
import type { Classroom, SchoolEducator, ContentItem, ContentType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentCourseStats { id: string; name: string; progress: number }
interface CourseStats { id: string; title: string; itemCount: number; avgProgress: number; students: StudentCourseStats[] }
interface ClassroomStats {
  id: string; name: string; totalStudents: number; avgProgress: number;
  levelCounts: { inicial: number; enProgreso: number; avanzado: number };
  courses: CourseStats[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLevel = (pct: number) =>
  pct <= 30 ? 'Inicial' : pct <= 79 ? 'En progreso' : 'Avanzado';

const levelColors: Record<string, string> = {
  Inicial: 'bg-white/[0.08] text-white/45',
  'En progreso': 'bg-[#FFD166]/15 text-[#FFD166]',
  Avanzado: 'bg-emerald-500/15 text-emerald-400',
};

const barColor = (pct: number) =>
  pct <= 30 ? 'bg-white/25' : pct <= 79 ? 'bg-[#FFD166]' : 'bg-emerald-400';

const computeStats = (classroom: Classroom, summary: ClassroomSummary): ClassroomStats => {
  const { courses, students, items, progress } = summary;

  const courseStats: CourseStats[] = courses.map((course) => {
    const courseItems = items.filter((i) => i.course_id === course.id);
    const totalItems = courseItems.length;
    const courseItemIds = new Set(courseItems.map((i) => i.id));

    const studentStats: StudentCourseStats[] = students.map((s) => {
      const done = totalItems > 0
        ? progress.filter(
            (p) => p.student_id === s.student_id && courseItemIds.has(p.content_item_id) && p.status === 'completed',
          ).length
        : 0;
      return { id: s.student_id, name: s.users?.full_name ?? '—', progress: totalItems > 0 ? Math.round((done / totalItems) * 100) : 0 };
    });

    const avgProgress =
      studentStats.length > 0 && totalItems > 0
        ? Math.round(studentStats.reduce((a, b) => a + b.progress, 0) / studentStats.length)
        : 0;

    return { id: course.id, title: course.title, itemCount: totalItems, avgProgress, students: studentStats };
  });

  const totalItems = items.length;
  const levelCounts = { inicial: 0, enProgreso: 0, avanzado: 0 };
  let avgProgress = 0;

  if (students.length > 0 && totalItems > 0) {
    const perStudent = students.map((s) => {
      const done = progress.filter((p) => p.student_id === s.student_id && p.status === 'completed').length;
      return (done / totalItems) * 100;
    });
    avgProgress = Math.round(perStudent.reduce((a, b) => a + b, 0) / perStudent.length);
    perStudent.forEach((pct) => {
      if (pct <= 30) levelCounts.inicial++;
      else if (pct <= 79) levelCounts.enProgreso++;
      else levelCounts.avanzado++;
    });
  }

  return { id: classroom.id, name: classroom.name, totalStudents: students.length, avgProgress, levelCounts, courses: courseStats };
};

// ─── Content type metadata ─────────────────────────────────────────────────────

const contentTypeMeta: Record<string, { label: string; color: string }> = {
  letter:     { label: 'Letra',    color: 'bg-blue-500/15 text-blue-400' },
  number:     { label: 'Número',   color: 'bg-violet-500/15 text-violet-400' },
  braille:    { label: 'Braille',  color: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  quiz_mc:    { label: 'Quiz',     color: 'bg-[#FFD166]/15 text-[#FFD166]' },
  quiz_voice: { label: 'Quiz Voz', color: 'bg-emerald-500/15 text-emerald-400' },
};

const contentTypeIcon: Record<string, React.ElementType> = {
  letter: Type, number: Hash, braille: Zap, quiz_mc: HelpCircle, quiz_voice: Mic,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon: Icon, iconBg, iconColor, loading,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string; loading: boolean;
}) => (
  <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-white/40 font-medium">{label}</p>
      {loading ? <div className="h-8 w-14 bg-white/10 animate-pulse rounded-lg mt-1" /> : <p className="text-2xl font-bold text-white leading-tight">{value}</p>}
      {sub && !loading && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ProgressBar = ({ pct, thin }: { pct: number; thin?: boolean }) => (
  <div className={`w-full ${thin ? 'h-1' : 'h-1.5'} bg-white/[0.07] rounded-full overflow-hidden`}>
    <div className={`h-full rounded-full transition-all ${barColor(pct)}`} style={{ width: `${Math.max(pct, 2)}%` }} />
  </div>
);

// ─── Activity detail row ──────────────────────────────────────────────────────

const statusMeta = {
  completed:   { Icon: CheckCircle2, color: 'text-emerald-400',  label: 'Completada' },
  in_progress: { Icon: Clock,        color: 'text-[#FFD166]',    label: 'En curso' },
  not_started: { Icon: Circle,       color: 'text-white/20',     label: 'Sin comenzar' },
};

const ActivityRow = ({
  item,
  progress,
}: {
  item: ContentItem;
  progress?: StudentItemProgress;
}) => {
  const status = progress?.status ?? 'not_started';
  const { Icon, color, label } = statusMeta[status];
  const meta = contentTypeMeta[item.content_type] ?? { label: item.content_type, color: 'bg-white/10 text-white/40' };
  const TypeIcon = contentTypeIcon[item.content_type] ?? BookOpen;

  return (
    <div className={`flex items-center gap-2.5 py-2 px-3 rounded-lg ${status === 'not_started' ? 'opacity-50' : ''}`}>
      <Icon size={14} className={`flex-shrink-0 ${color}`} />
      <span className="text-[10px] font-mono text-white/20 w-4 text-right flex-shrink-0">
        {item.sort_order + 1}
      </span>
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${meta.color}`}>
        <TypeIcon size={9} />
        {meta.label}
      </div>
      <span className="text-xs text-white/70 flex-1 min-w-0 truncate">{item.title}</span>
      {progress?.score !== null && progress?.score !== undefined && (
        <span className="text-[10px] text-white/30 flex-shrink-0">{progress.score} pts</span>
      )}
      {progress?.attempts && progress.attempts > 0 && (
        <span className="text-[10px] text-white/20 flex-shrink-0">{progress.attempts}× intento{progress.attempts !== 1 ? 's' : ''}</span>
      )}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
        status === 'completed' ? 'bg-emerald-500/10 text-emerald-400'
        : status === 'in_progress' ? 'bg-[#FFD166]/10 text-[#FFD166]'
        : 'bg-white/[0.05] text-white/25'
      }`}>
        {label}
      </span>
    </div>
  );
};

// ─── Student expandable row ───────────────────────────────────────────────────

const StudentRow = ({
  student,
  courseId,
  courseItems,
  progressData,
  isExpanded,
  isLoading,
  onToggle,
}: {
  student: StudentCourseStats;
  courseId: string;
  courseItems: ContentItem[] | undefined;
  progressData: StudentItemProgress[] | undefined;
  isExpanded: boolean;
  isLoading: boolean;
  onToggle: () => void;
}) => {
  const level = getLevel(student.progress);

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors text-left px-1"
      >
        <div className="w-6 h-6 bg-white/[0.05] rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white/35 text-[10px] font-semibold">
            {student.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-white/50 w-28 truncate flex-shrink-0">{student.name}</span>
        <div className="flex-1"><ProgressBar pct={student.progress} thin /></div>
        <span className="text-xs text-white/40 w-8 text-right flex-shrink-0">{student.progress}%</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${levelColors[level]}`}>{level}</span>
        {isLoading
          ? <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin flex-shrink-0" />
          : <ChevronDown size={12} className={`text-white/20 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        }
      </button>

      {isExpanded && (
        <div className="ml-6 mt-1 mb-2 border-l border-white/[0.07] pl-3">
          {isLoading || !courseItems ? (
            <div className="space-y-1 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-white/[0.04] rounded animate-pulse" />
              ))}
            </div>
          ) : courseItems.length === 0 ? (
            <p className="text-xs text-white/25 py-2">Sin actividades en este curso.</p>
          ) : (() => {
            const progressMap: Record<string, StudentItemProgress> = {};
            (progressData ?? []).forEach((p) => { progressMap[p.content_item_id] = p; });
            const sorted = [...courseItems].sort((a, b) => a.sort_order - b.sort_order);
            return (
              <div className="space-y-0.5">
                {sorted.map((item) => (
                  <ActivityRow key={item.id} item={item} progress={progressMap[item.id]} />
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SchoolStatsPage = () => {
  const { id } = useParams<{ id: string }>();

  const [schoolName, setSchoolName] = useState('');
  const [educators, setEducators] = useState<SchoolEducator[]>([]);
  const [classroomStats, setClassroomStats] = useState<ClassroomStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Per-student expandable state
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [studentProgressCache, setStudentProgressCache] = useState<Record<string, StudentItemProgress[]>>({});
  const [courseItemsCache, setCourseItemsCache] = useState<Record<string, ContentItem[]>>({});
  const [loadingStudents, setLoadingStudents] = useState<Set<string>>(new Set());

  const toggleSalon = (salId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(salId) ? next.delete(salId) : next.add(salId);
      return next;
    });

  const toggleStudent = async (studentId: string, courseId: string) => {
    const key = `${courseId}:${studentId}`;

    setExpandedStudents((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

    if (studentProgressCache[key] !== undefined) return;

    setLoadingStudents((prev) => new Set(prev).add(key));
    try {
      const fetches: Promise<any>[] = [getStudentProgressByCourse(studentId, courseId)];
      if (!courseItemsCache[courseId]) {
        fetches.push(getContentItemsByCourse(courseId));
      }
      const results = await Promise.all(fetches);
      setStudentProgressCache((prev) => ({ ...prev, [key]: results[0].data }));
      if (results[1]) {
        setCourseItemsCache((prev) => ({ ...prev, [courseId]: results[1].data }));
      }
    } catch {
      setStudentProgressCache((prev) => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingStudents((prev) => { const next = new Set(prev); next.delete(key); return next; });
    }
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [schoolRes, educatorsRes, classroomsRes] = await Promise.all([
          getSchool(id),
          getSchoolEducators(id),
          getSchoolClassrooms(id),
        ]);
        setSchoolName(schoolRes.data.name);
        setEducators(educatorsRes.data);

        const classrooms: Classroom[] = classroomsRes.data;
        const summaries = await Promise.all(
          classrooms.map((c) =>
            getClassroomSummary(c.id)
              .then((r) => computeStats(c, r.data))
              .catch(() => ({
                id: c.id, name: c.name, totalStudents: 0, avgProgress: 0,
                levelCounts: { inicial: 0, enProgreso: 0, avanzado: 0 }, courses: [],
              })),
          ),
        );
        setClassroomStats(summaries);
      } catch {
        setError('Error al cargar estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const activeEducators = educators.filter((e) => e.users?.status === 'active').length;
  const totalStudents = classroomStats.reduce((sum, c) => sum + c.totalStudents, 0);
  const totalCourses = classroomStats.reduce((s, c) => s + c.courses.length, 0);
  const overallProgress =
    classroomStats.length > 0
      ? Math.round(classroomStats.reduce((s, c) => s + c.avgProgress, 0) / classroomStats.length)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to={`/schools/${id}`} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={15} /> Detalle del colegio
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart2 size={20} className="text-[#FF6B35]" />
          </div>
          <div>
            <h1 className="page-title text-2xl">Estadísticas</h1>
            {schoolName && <p className="text-white/40 text-sm mt-0.5">{schoolName}</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Educadoras activas" value={activeEducators}
          sub={educators.length > activeEducators ? `de ${educators.length} total` : undefined}
          icon={Users} iconBg="bg-[#FFD166]/15" iconColor="text-[#FFD166]" loading={loading} />
        <StatCard label="Salones" value={classroomStats.length}
          icon={School} iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Estudiantes" value={totalStudents}
          sub={`${totalCourses} curso${totalCourses !== 1 ? 's' : ''}`}
          icon={Users} iconBg="bg-white/[0.07]" iconColor="text-white/55" loading={loading} />
        <StatCard label="Progreso general" value={`${overallProgress}%`}
          sub={getLevel(overallProgress)} icon={TrendingUp}
          iconBg={overallProgress <= 30 ? 'bg-white/[0.07]' : overallProgress <= 79 ? 'bg-[#FFD166]/15' : 'bg-emerald-500/15'}
          iconColor={overallProgress <= 30 ? 'text-white/45' : overallProgress <= 79 ? 'text-[#FFD166]' : 'text-emerald-400'}
          loading={loading} />
      </div>

      {/* Accordion */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Detalle por salón</h2>
        {!loading && classroomStats.length > 0 && (
          <button
            onClick={() =>
              expanded.size === classroomStats.length
                ? setExpanded(new Set())
                : setExpanded(new Set(classroomStats.map((c) => c.id)))
            }
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            {expanded.size === classroomStats.length ? 'Colapsar todo' : 'Expandir todo'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-[#22063F] border border-white/[0.08] rounded-2xl animate-pulse" />)}
        </div>
      ) : classroomStats.length === 0 ? (
        <div className="bg-[#22063F] border border-white/[0.08] rounded-2xl p-10 text-center">
          <School size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No hay salones en este colegio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classroomStats.map((c) => {
            const isOpen = expanded.has(c.id);
            const level = getLevel(c.avgProgress);
            return (
              <div key={c.id} className="bg-[#22063F] border border-white/[0.08] rounded-2xl overflow-hidden transition-all">
                {/* Classroom row */}
                <button
                  onClick={() => toggleSalon(c.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <School size={16} className="text-[#FF6B35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white leading-tight">{c.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">
                      {c.totalStudents} estudiante{c.totalStudents !== 1 ? 's' : ''} · {c.courses.length} curso{c.courses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 mr-1">
                    <div className="w-24"><ProgressBar pct={c.avgProgress} /></div>
                    <span className="text-sm font-semibold text-white/60 w-9 text-right">{c.avgProgress}%</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${levelColors[level]}`}>{level}</span>
                  </div>
                  <ChevronDown size={16} className={`text-white/25 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Courses */}
                {isOpen && (
                  <div className="border-t border-white/[0.06]">
                    {c.courses.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-white/25">Sin cursos en este salón.</p>
                    ) : (
                      c.courses.map((course, idx) => (
                        <div key={course.id} className={`px-5 py-4 ${idx < c.courses.length - 1 ? 'border-b border-white/[0.04]' : ''}`}>
                          {/* Course header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-7 h-7 bg-[#FFD166]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <BookOpen size={13} className="text-[#FFD166]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-white">{course.title}</p>
                                <span className="text-[10px] bg-white/[0.06] text-white/30 px-2 py-0.5 rounded-full">
                                  {course.itemCount} ítem{course.itemCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {course.itemCount > 0 && course.students.length > 0 && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className="w-32"><ProgressBar pct={course.avgProgress} /></div>
                                  <span className="text-xs text-white/35">{course.avgProgress}% promedio</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[getLevel(course.avgProgress)]}`}>
                                    {getLevel(course.avgProgress)}
                                  </span>
                                </div>
                              )}
                              {course.itemCount === 0 && (
                                <p className="text-xs text-white/25 mt-1">Sin ítems de contenido aún.</p>
                              )}
                            </div>
                          </div>

                          {/* Per-student rows (expandable) */}
                          {course.itemCount > 0 && course.students.length > 0 && (
                            <div className="ml-10 space-y-0.5">
                              {course.students.map((s) => {
                                const key = `${course.id}:${s.id}`;
                                return (
                                  <StudentRow
                                    key={s.id}
                                    student={s}
                                    courseId={course.id}
                                    courseItems={courseItemsCache[course.id]}
                                    progressData={studentProgressCache[key]}
                                    isExpanded={expandedStudents.has(key)}
                                    isLoading={loadingStudents.has(key)}
                                    onToggle={() => toggleStudent(s.id, course.id)}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
