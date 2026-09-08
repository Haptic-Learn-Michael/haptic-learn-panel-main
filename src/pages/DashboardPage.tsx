import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, School, Zap, ArrowRight, TrendingUp, BookOpen,
  BarChart2, GraduationCap, Building2,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getUsers } from '../api/users.api';
import { getClassrooms } from '../api/classrooms.api';
import { getPatterns } from '../api/haptic-patterns.api';
import { getSchools } from '../api/schools.api';
import { getClassroomSummary, type ClassroomSummary } from '../api/progress.api';
import type { Classroom } from '../types';

// ── Progress helpers ──────────────────────────────────────────────────────────

const getLevel = (pct: number) =>
  pct <= 30 ? 'Inicial' : pct <= 79 ? 'En progreso' : 'Avanzado';

const levelColors: Record<string, string> = {
  Inicial: 'bg-white/[0.08] text-white/45',
  'En progreso': 'bg-[#FFD166]/15 text-[#FFD166]',
  Avanzado: 'bg-emerald-500/15 text-emerald-400',
};

const barColor = (pct: number) =>
  pct <= 30 ? 'bg-white/20' : pct <= 79 ? 'bg-[#FFD166]' : 'bg-emerald-400';

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="w-full h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${barColor(pct)}`}
      style={{ width: `${Math.max(pct, 2)}%` }}
    />
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon: Icon, iconBg, iconColor, loading,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string; loading: boolean;
}) => (
  <div className="surface border border-white/[0.08] rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={22} className={iconColor} />
    </div>
    <div>
      <p className="text-xs text-white/40 font-medium">{label}</p>
      {loading ? (
        <div className="h-7 w-14 bg-white/10 animate-pulse rounded-lg mt-1" />
      ) : (
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Classroom card ────────────────────────────────────────────────────────────

interface ClassroomCard {
  id: string;
  name: string;
  description?: string;
  code: string;
  studentCount: number;
  courseCount: number;
  avgProgress: number;
}

const computeAvgProgress = (summary: ClassroomSummary): number => {
  const { students, items, progress } = summary;
  const totalItems = items?.length ?? 0;
  if (!students?.length || !totalItems) return 0;
  const perStudent = students.map((s) => {
    const done = progress.filter(
      (p) => p.student_id === s.student_id && p.status === 'completed',
    ).length;
    return (done / totalItems) * 100;
  });
  return Math.round(perStudent.reduce((a, b) => a + b, 0) / perStudent.length);
};

const ClassroomCardItem = ({ c, loading }: { c?: ClassroomCard; loading?: boolean }) => {
  if (loading || !c) {
    return (
      <div className="surface border border-white/[0.08] rounded-2xl p-5 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
        <div className="h-3 w-20 bg-white/[0.06] rounded mb-4" />
        <div className="h-1.5 w-full bg-white/[0.07] rounded-full" />
      </div>
    );
  }

  const level = getLevel(c.avgProgress);

  return (
    <Link
      to={`/classrooms/${c.id}`}
      className="group surface border border-white/[0.08] rounded-2xl p-5 hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/[0.03] transition-all duration-150 block"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-[#FF6B35]/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <School size={16} className="text-[#FF6B35]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{c.name}</p>
            {c.description && (
              <p className="text-xs text-white/35 truncate mt-0.5">{c.description}</p>
            )}
          </div>
        </div>
        <ArrowRight
          size={15}
          className="text-white/15 group-hover:text-[#FF6B35] transition-colors flex-shrink-0 mt-1"
        />
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-white/35">
        <span className="flex items-center gap-1">
          <GraduationCap size={11} /> {c.studentCount} estudiante{c.studentCount !== 1 ? 's' : ''}
        </span>
        <span className="text-white/15">·</span>
        <span className="flex items-center gap-1">
          <BookOpen size={11} /> {c.courseCount} curso{c.courseCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30">Progreso general</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/50">{c.avgProgress}%</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${levelColors[level]}`}>
              {level}
            </span>
          </div>
        </div>
        <ProgressBar pct={c.avgProgress} />
      </div>
    </Link>
  );
};

// ── Admin dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = ({ userName }: { userName: string }) => {
  const [stats, setStats] = useState({ users: 0, classrooms: 0, patterns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getClassrooms(), getPatterns()])
      .then(([u, c, p]) => setStats({ users: u.data.length, classrooms: c.data.length, patterns: p.data.length }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="page-title text-3xl">Bienvenido, {userName}</h1>
        <p className="text-white/45 mt-1.5 text-sm">
          Sesión activa como <span className="font-semibold text-[#FF6B35]">Administrador</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Usuarios registrados" value={stats.users} icon={Users}
          iconBg="bg-[#FFD166]/15" iconColor="text-[#FFD166]" loading={loading} />
        <StatCard label="Salones" value={stats.classrooms} icon={School}
          iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Patrones hápticos" value={stats.patterns} icon={Zap}
          iconBg="bg-white/[0.07]" iconColor="text-white/55" loading={loading} />
      </div>

      <div className="surface border border-white/[0.08] rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/classrooms', label: 'Salones', sub: 'Gestionar salones', Icon: School, hover: 'hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/5', iconBg: 'bg-[#FF6B35]/15', iconColor: 'text-[#FF6B35]', arrow: 'group-hover:text-[#FF6B35]' },
            { to: '/users', label: 'Usuarios', sub: 'Gestionar usuarios', Icon: Users, hover: 'hover:border-[#FFD166]/40 hover:bg-[#FFD166]/5', iconBg: 'bg-[#FFD166]/15', iconColor: 'text-[#FFD166]', arrow: 'group-hover:text-[#FFD166]' },
            { to: '/haptic-patterns', label: 'Patrones hápticos', sub: 'Ver catálogo', Icon: Zap, hover: 'hover:border-white/25 hover:bg-white/5', iconBg: 'bg-white/10', iconColor: 'text-white/70', arrow: 'group-hover:text-white/60' },
          ].map(({ to, label, sub, Icon, hover, iconBg, iconColor, arrow }) => (
            <Link
              key={to}
              to={to}
              className={`group flex items-center justify-between p-4 rounded-xl border border-white/[0.08] transition-all duration-150 ${hover}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              </div>
              <ArrowRight size={16} className={`text-white/20 transition-colors ${arrow}`} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

// ── Director dashboard ────────────────────────────────────────────────────────

const DirectorDashboard = ({ userName }: { userName: string }) => {
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [cards, setCards] = useState<ClassroomCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: schools } = await getSchools();
        const school = schools[0];
        if (!school) { setLoading(false); return; }
        setSchoolId(school.id);
        setSchoolName(school.name);

        const { data: classrooms } = await getClassrooms();
        if (!classrooms.length) { setLoading(false); return; }

        const summaries = await Promise.allSettled(
          classrooms.map((c: Classroom) => getClassroomSummary(c.id)),
        );

        const built: ClassroomCard[] = classrooms.map((c: Classroom, i: number) => {
          const res = summaries[i];
          const summary = res.status === 'fulfilled' ? res.value.data : null;
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            code: c.code,
            studentCount: summary?.students?.length ?? 0,
            courseCount: summary?.courses?.length ?? 0,
            avgProgress: summary ? computeAvgProgress(summary) : 0,
          };
        });

        setCards(built);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = cards.reduce((s, c) => s + c.studentCount, 0);
  const totalCourses = cards.reduce((s, c) => s + c.courseCount, 0);
  const overallProgress =
    cards.length > 0
      ? Math.round(cards.reduce((s, c) => s + c.avgProgress, 0) / cards.length)
      : 0;
  const atRisk = cards.filter((c) => c.avgProgress <= 30 && c.studentCount > 0).length;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title text-3xl">Bienvenida, {userName}</h1>
        <p className="text-white/45 mt-1 text-sm">
          Directora ·{' '}
          {schoolName && (
            <span className="font-semibold text-[#FFD166]">{schoolName}</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Salones" value={loading ? '—' : cards.length}
          icon={School} iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Estudiantes" value={loading ? '—' : totalStudents}
          sub={`${totalCourses} curso${totalCourses !== 1 ? 's' : ''}`}
          icon={GraduationCap} iconBg="bg-[#FFD166]/15" iconColor="text-[#FFD166]" loading={loading} />
        <StatCard
          label="Progreso general"
          value={loading ? '—' : `${overallProgress}%`}
          sub={!loading ? getLevel(overallProgress) : undefined}
          icon={TrendingUp}
          iconBg={overallProgress <= 30 ? 'bg-white/[0.07]' : overallProgress <= 79 ? 'bg-[#FFD166]/15' : 'bg-emerald-500/15'}
          iconColor={overallProgress <= 30 ? 'text-white/45' : overallProgress <= 79 ? 'text-[#FFD166]' : 'text-emerald-400'}
          loading={loading}
        />
        <StatCard
          label="Salones en riesgo"
          value={loading ? '—' : atRisk}
          sub={atRisk > 0 ? 'progreso ≤ 30%' : 'Todo en orden'}
          icon={BarChart2}
          iconBg={atRisk > 0 ? 'bg-red-500/10' : 'bg-emerald-500/15'}
          iconColor={atRisk > 0 ? 'text-red-400' : 'text-emerald-400'}
          loading={loading}
        />
      </div>

      {/* Classrooms grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Mis salones
        </h2>
        <div className="flex items-center gap-3">
          {schoolId && (
            <Link
              to={`/schools/${schoolId}/stats`}
              className="flex items-center gap-1.5 text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors"
            >
              <BarChart2 size={13} /> Ver estadísticas completas
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <ClassroomCardItem key={i} loading />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="surface border border-white/[0.08] rounded-2xl p-12 text-center">
          <School size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No hay salones asignados a tu cuenta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((c) => <ClassroomCardItem key={c.id} c={c} />)}
        </div>
      )}

      {/* School detail link */}
      {schoolId && !loading && (
        <div className="mt-4 flex gap-3">
          <Link
            to={`/schools/${schoolId}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/45 hover:text-white hover:border-white/20 transition-all"
          >
            <Building2 size={15} /> Detalle del colegio
          </Link>
        </div>
      )}
    </>
  );
};

// ── Educator dashboard ────────────────────────────────────────────────────────

const EducatorDashboard = ({ userName }: { userName: string }) => {
  const [cards, setCards] = useState<ClassroomCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: classrooms } = await getClassrooms();
        if (!classrooms.length) { setLoading(false); return; }

        const summaries = await Promise.allSettled(
          classrooms.map((c: Classroom) => getClassroomSummary(c.id)),
        );

        const built: ClassroomCard[] = classrooms.map((c: Classroom, i: number) => {
          const res = summaries[i];
          const summary = res.status === 'fulfilled' ? res.value.data : null;
          return {
            id: c.id,
            name: c.name,
            description: c.description,
            code: c.code,
            studentCount: summary?.students?.length ?? 0,
            courseCount: summary?.courses?.length ?? 0,
            avgProgress: summary ? computeAvgProgress(summary) : 0,
          };
        });

        setCards(built);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudents = cards.reduce((s, c) => s + c.studentCount, 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="page-title text-3xl">Bienvenida, {userName}</h1>
        <p className="text-white/45 mt-1 text-sm">
          Sesión activa como <span className="font-semibold text-blue-400">Educadora</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Mis salones" value={loading ? '—' : cards.length}
          icon={School} iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Estudiantes a cargo" value={loading ? '—' : totalStudents}
          icon={GraduationCap} iconBg="bg-[#FFD166]/15" iconColor="text-[#FFD166]" loading={loading} />
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Mis salones
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <ClassroomCardItem key={i} loading />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="surface border border-white/[0.08] rounded-2xl p-12 text-center">
          <School size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/30">No estás asignada a ningún salón todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => <ClassroomCardItem key={c.id} c={c} />)}
        </div>
      )}
    </>
  );
};

// ── Page entry ────────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const name = user?.full_name ?? '';

  if (user?.role === 'admin') return <AdminDashboard userName={name} />;
  if (user?.role === 'lead_educator') return <DirectorDashboard userName={name} />;
  if (user?.role === 'educator') return <EducatorDashboard userName={name} />;

  return (
    <div className="text-white/40 text-sm py-10 text-center">
      Rol no reconocido.
    </div>
  );
};
