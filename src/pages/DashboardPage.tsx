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
import type { Classroom, User, HapticPattern } from '../types';

// ── Greeting helpers ──────────────────────────────────────────────────────────

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const firstName = (name: string) => name.trim().split(' ')[0] || name;

// ── Progress helpers ──────────────────────────────────────────────────────────

const getLevel = (pct: number) =>
  pct <= 30 ? 'Inicial' : pct <= 79 ? 'En progreso' : 'Avanzado';

const levelColors: Record<string, string> = {
  Inicial: 'bg-white/[0.08] text-white/45',
  'En progreso': 'bg-[#EDC157]/15 text-[#EDC157]',
  Avanzado: 'bg-emerald-500/15 text-emerald-400',
};

const barColor = (pct: number) =>
  pct <= 30 ? 'bg-white/20' : pct <= 79 ? 'bg-[#EDC157]' : 'bg-emerald-400';

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

const roleLabelShort: Record<string, string> = {
  admin: 'Admin', lead_educator: 'Directora', educator: 'Educadora', student: 'Estudiante',
};
const roleColorShort: Record<string, string> = {
  admin: 'bg-[#FF6B35]/15 text-[#FF6B35]',
  lead_educator: 'bg-[#EDC157]/15 text-[#EDC157]',
  educator: 'bg-white/10 text-white/70',
  student: 'bg-white/[0.07] text-white/50',
};
const roleBarColor: Record<string, string> = {
  student: '#FF6B35', educator: '#EDC157', lead_educator: '#34D399', admin: 'rgba(255,255,255,0.35)',
};
const roleOrder = ['student', 'educator', 'lead_educator', 'admin'];

const ACTIVITY_DAYS = 14;

const buildActivity = (users: User[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (ACTIVITY_DAYS - 1 - i));
    return { date: d, count: 0 };
  });
  users.forEach((u) => {
    const c = new Date(u.created_at);
    c.setHours(0, 0, 0, 0);
    const idx = Math.round((c.getTime() - buckets[0].date.getTime()) / 86400000);
    if (idx >= 0 && idx < ACTIVITY_DAYS) buckets[idx].count++;
  });
  return buckets;
};

const fmtDay = (d: Date) => d.toLocaleDateString('es', { day: 'numeric', month: 'short' });

const Num = ({ children, color = '#fff' }: { children: React.ReactNode; color?: string }) => (
  <span className="font-bold tabular-nums" style={{ color }}>{children}</span>
);

const Panel = ({ title, aside, children, className = '' }: {
  title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string;
}) => (
  <section className={`surface border border-white/[0.08] rounded-2xl p-6 ${className}`}>
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {aside}
    </div>
    {children}
  </section>
);

const AdminDashboard = ({ userName }: { userName: string }) => {
  const [stats, setStats] = useState({ users: 0, classrooms: 0, patterns: 0, schools: 0 });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<[string, number][]>([]);
  const [activity, setActivity] = useState<ReturnType<typeof buildActivity>>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUsers(), getClassrooms(), getPatterns(), getSchools()])
      .then(([u, c, p, s]) => {
        setStats({ users: u.data.length, classrooms: c.data.length, patterns: p.data.length, schools: s.data.length });

        const roles: Record<string, number> = {};
        u.data.forEach((usr) => { roles[usr.role] = (roles[usr.role] ?? 0) + 1; });
        setRoleCounts(roles);

        const cats: Record<string, number> = {};
        p.data.forEach((pat: HapticPattern) => { cats[pat.category] = (cats[pat.category] ?? 0) + 1; });
        setCategoryCounts(Object.entries(cats).sort((a, b) => b[1] - a[1]));

        setActivity(buildActivity(u.data));
        setRecentUsers(
          [...u.data]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxDay = Math.max(1, ...activity.map((a) => a.count));
  const weekTotal = activity.slice(-7).reduce((s, a) => s + a.count, 0);
  const fortnightTotal = activity.reduce((s, a) => s + a.count, 0);
  const maxCat = Math.max(1, ...categoryCounts.map(([, n]) => n));

  return (
    <>
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wide mb-1.5">{getGreeting()}</p>
        <h1 className="page-title text-3xl">{firstName(userName)}</h1>

        {loading ? (
          <div className="mt-5 space-y-2.5 animate-pulse max-w-2xl">
            <div className="h-6 w-full bg-white/[0.06] rounded" />
            <div className="h-6 w-2/3 bg-white/[0.06] rounded" />
          </div>
        ) : (
          <p className="mt-4 max-w-3xl text-xl md:text-2xl leading-snug font-medium text-white/45">
            <Num>{stats.users}</Num> usuarios repartidos en{' '}
            <Num color="#34D399">{stats.schools}</Num> colegios y{' '}
            <Num color="#FF6B35">{stats.classrooms}</Num> salones, con{' '}
            <Num color="#EDC157">{stats.patterns}</Num> patrones hápticos en el catálogo.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { to: '/classrooms', label: 'Salones', Icon: School },
            { to: '/users', label: 'Usuarios', Icon: Users },
            { to: '/schools', label: 'Colegios', Icon: Building2 },
            { to: '/haptic-patterns', label: 'Patrones hápticos', Icon: Zap },
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group inline-flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full border border-white/[0.1] text-sm text-white/65 hover:text-white hover:border-[#FF6B35]/50 hover:bg-[#FF6B35]/[0.06] transition-colors duration-150"
            >
              <Icon size={14} className="text-white/40 group-hover:text-[#FF6B35] transition-colors" />
              {label}
              <ArrowRight size={12} className="text-white/20 group-hover:text-[#FF6B35] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 mb-6">
        <Panel
          title="Registros · últimos 14 días"
          aside={!loading && <span className="text-xs text-white/40"><Num color="#FF6B35">{weekTotal}</Num> esta semana · {fortnightTotal} en total</span>}
        >
          {loading ? (
            <div className="h-36 bg-white/[0.04] rounded-xl animate-pulse" />
          ) : fortnightTotal === 0 ? (
            <p className="h-36 flex items-center justify-center text-sm text-white/30">
              Sin registros nuevos en los últimos 14 días.
            </p>
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-36" role="img"
                aria-label={`Registros por día en los últimos ${ACTIVITY_DAYS} días, ${fortnightTotal} en total`}>
                {activity.map((a, i) => {
                  const isToday = i === activity.length - 1;
                  return (
                    <div key={i} className="flex-1 h-full flex items-end group relative"
                      title={`${fmtDay(a.date)}: ${a.count}`}>
                      <div
                        className="w-full rounded-t-md transition-all duration-200 group-hover:brightness-125"
                        style={{
                          height: a.count === 0 ? 3 : `${Math.max(8, (a.count / maxDay) * 100)}%`,
                          background: a.count === 0 ? 'rgba(255,255,255,0.07)' : isToday ? '#FF6B35' : 'rgba(255,107,53,0.45)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-white/35">
                <span>{fmtDay(activity[0].date)}</span>
                <span>Hoy</span>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Quién usa HapticLearn">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-3 bg-white/[0.06] rounded-full" />
              <div className="h-24 bg-white/[0.04] rounded-xl" />
            </div>
          ) : stats.users === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">Aún no hay usuarios.</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5" role="img"
                aria-label="Distribución de usuarios por rol">
                {roleOrder.filter((r) => roleCounts[r]).map((r) => (
                  <div key={r} style={{ flex: roleCounts[r], background: roleBarColor[r] }} />
                ))}
              </div>
              <ul className="space-y-2.5">
                {roleOrder.filter((r) => roleCounts[r]).map((r) => (
                  <li key={r} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5 text-white/70">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: roleBarColor[r] }} />
                      {roleLabelShort[r]}
                    </span>
                    <span className="text-white/45 tabular-nums">
                      <span className="text-white font-semibold">{roleCounts[r]}</span>
                      {' · '}{Math.round((roleCounts[r] / stats.users) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <Panel
          title="Usuarios recientes"
          aside={
            <Link to="/users" className="flex items-center gap-1 text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors">
              Ver todos <ArrowRight size={11} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-white/[0.08] rounded mb-1.5" />
                    <div className="h-2.5 w-36 bg-white/[0.05] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">Aún no hay usuarios registrados.</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B35]/15 flex items-center justify-center text-[#FF6B35] text-xs font-semibold shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                      <p className="text-xs text-white/35 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColorShort[u.role] ?? 'bg-white/10 text-white/50'}`}>
                    {roleLabelShort[u.role] ?? u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Patrones por categoría"
          aside={
            <Link to="/haptic-patterns" className="flex items-center gap-1 text-xs text-[#FF6B35] hover:text-[#FF6B35]/80 transition-colors">
              Catálogo <ArrowRight size={11} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-white/[0.05] rounded" />)}
            </div>
          ) : categoryCounts.length === 0 ? (
            <p className="text-sm text-white/30 py-6 text-center">Sin patrones en el catálogo.</p>
          ) : (
            <ul className="space-y-3.5">
              {categoryCounts.map(([cat, n]) => (
                <li key={cat}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white/70 capitalize">{cat}</span>
                    <span className="text-white font-semibold tabular-nums">{n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                    <div className="h-full rounded-full bg-[#EDC157]" style={{ width: `${(n / maxCat) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
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
        <p className="text-xs font-semibold text-[#EDC157] uppercase tracking-wide mb-1.5">{getGreeting()}</p>
        <h1 className="page-title text-3xl">{firstName(userName)}</h1>
        <p className="text-white/45 mt-1.5 text-sm">
          Directora ·{' '}
          {schoolName && (
            <span className="font-semibold text-[#EDC157]">{schoolName}</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Salones" value={loading ? '—' : cards.length}
          icon={School} iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Estudiantes" value={loading ? '—' : totalStudents}
          sub={`${totalCourses} curso${totalCourses !== 1 ? 's' : ''}`}
          icon={GraduationCap} iconBg="bg-[#EDC157]/15" iconColor="text-[#EDC157]" loading={loading} />
        <StatCard
          label="Progreso general"
          value={loading ? '—' : `${overallProgress}%`}
          sub={!loading ? getLevel(overallProgress) : undefined}
          icon={TrendingUp}
          iconBg={overallProgress <= 30 ? 'bg-white/[0.07]' : overallProgress <= 79 ? 'bg-[#EDC157]/15' : 'bg-emerald-500/15'}
          iconColor={overallProgress <= 30 ? 'text-white/45' : overallProgress <= 79 ? 'text-[#EDC157]' : 'text-emerald-400'}
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
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">{getGreeting()}</p>
        <h1 className="page-title text-3xl">{firstName(userName)}</h1>
        <p className="text-white/45 mt-1.5 text-sm">
          Sesión activa como <span className="font-semibold text-blue-400">Educadora</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Mis salones" value={loading ? '—' : cards.length}
          icon={School} iconBg="bg-[#FF6B35]/15" iconColor="text-[#FF6B35]" loading={loading} />
        <StatCard label="Estudiantes a cargo" value={loading ? '—' : totalStudents}
          icon={GraduationCap} iconBg="bg-[#EDC157]/15" iconColor="text-[#EDC157]" loading={loading} />
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
