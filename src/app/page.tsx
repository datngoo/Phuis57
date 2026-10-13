"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Flag,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  Zap,
  UserRound,
  RotateCcw,
  ExternalLink,
  Pin,
} from "lucide-react";
import {
  STORAGE_KEY,
  fields,
  fieldOf,
  seedState,
  parseStored,
  visibleMatches,
  joinMatch,
  confirmMatch,
  trustSummary,
  sendChat,
  isChatReadOnly,
  timeLabel,
  dayLabel,
  localDay,
  defaultDateTime,
  type DemoState,
  type Match,
  type Profile,
} from "@/lib/demo";

type Tab = "discover" | "mine" | "chat" | "profile";
const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "discover", label: "Tìm kèo", icon: Flag },
  { id: "mine", label: "Kèo của tôi", icon: CalendarDays },
  { id: "chat", label: "Trò chuyện", icon: MessageCircle },
  { id: "profile", label: "Cá nhân", icon: UserRound },
];
const availability = [
  "17:00 – 19:00",
  "19:00 – 21:00",
  "21:00 – 23:00",
  "Cuối tuần",
];

function Ball({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" />
      <path
        d="m32 21 11 8-4 13H25l-4-13 11-8ZM32 21V4M43 29l16-5M39 42l10 13M25 42 15 55M21 29 5 24M18 8l-2 13L5 24M46 8l2 13 11 3M60 41l-13 3-1 11M4 41l13 3 1 11M23 59l9-8 9 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Pitch() {
  return (
    <div className="pitch-art" aria-hidden="true">
      <div className="pitch-outline">
        <div className="midline" />
        <div className="center-circle" />
        <div className="goal goal-left" />
        <div className="goal goal-right" />
        <span className="player p1">9</span>
        <span className="player p2">7</span>
        <span className="player p3">10</span>
        <span className="player p4">?</span>
        <Ball className="pitch-ball" />
        <svg className="pitch-trail" viewBox="0 0 300 160">
          <path
            d="M30 120Q100 15 218 75"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 7"
            fill="none"
          />
        </svg>
      </div>
      <span className="pitch-caption">CHỈ CÒN THIẾU BẠN.</span>
    </div>
  );
}
function Modal({
  title,
  subtitle,
  children,
  close,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab") {
        const focusables = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]',
        );
        if (!focusables?.length) return;
        const first = focusables[0],
          last = focusables[focusables.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={close} aria-label="Đóng">
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({
  title,
  text,
  action,
  actionLabel = "Tìm một kèo",
}: {
  title: string;
  text: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Ball />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="button primary" onClick={action}>
          {actionLabel}
          <ArrowRight size={17} />
        </button>
      )}
    </div>
  );
}
function Onboarding({
  close,
  done,
}: {
  close: () => void;
  done: (p: Profile) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Thủ Đức");
  const [times, setTimes] = useState(["19:00 – 21:00"]);
  const titles = [
    "Một chạm, vào sân.",
    "Anh em gọi bạn là gì?",
    "Bạn hay rảnh lúc nào?",
  ];
  return (
    <Modal
      close={close}
      title="Chào mừng đến Bắt Kèo"
      subtitle="Làm quen một chút, rồi ra sân thôi."
    >
      <div className="onboarding-progress">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= step ? "active" : ""} />
        ))}
      </div>
      <form
        className="form-content"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) setStep(step + 1);
          else done({ name: name.trim(), district, times });
        }}
      >
        <span className="eyebrow">BƯỚC {step + 1} / 3</span>
        <h3 className="onboarding-title">{titles[step]}</h3>
        {step === 0 ? (
          <>
            <div className="onboarding-ball">
              <Ball />
            </div>
            <label>
              Số điện thoại demo
              <input
                value="090 000 0000"
                readOnly
                aria-label="Số điện thoại demo"
              />
            </label>
            <p className="helper">
              Bạn đang thử bản demo: không gửi SMS, không cần nhập số điện thoại
              thật. Khi nối backend, bước này sẽ xác thực bằng OTP.
            </p>
          </>
        ) : step === 1 ? (
          <>
            <label>
              Tên của bạn
              <input
                autoComplete="given-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Minh"
                required
                maxLength={35}
                pattern=".*\S.*"
              />
            </label>
            <label>
              Khu vực
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {["Thủ Đức", "Bình Thạnh", "Gò Vấp", "Quận 7"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <p className="muted">
              Chọn một hoặc nhiều khung giờ. Bạn có thể đổi sau.
            </p>
            <div className="availability">
              {availability.map((t) => (
                <button
                  type="button"
                  key={t}
                  aria-pressed={times.includes(t)}
                  className={`choice ${times.includes(t) ? "selected" : ""}`}
                  onClick={() =>
                    setTimes(
                      times.includes(t)
                        ? times.filter((x) => x !== t)
                        : [...times, t],
                    )
                  }
                >
                  <Clock3 size={18} />
                  {t}
                  {times.includes(t) && <Check size={17} />}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="form-actions">
          {step > 0 && (
            <button
              type="button"
              className="button soft"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={17} />
              Quay lại
            </button>
          )}
          <button
            className="button primary grow"
            type="submit"
            disabled={step === 2 && !times.length}
          >
            {step === 2
              ? "Sẵn sàng ra sân"
              : step === 0
                ? "Tiếp tục với số demo"
                : "Tiếp tục"}
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function MatchForm({
  close,
  save,
  existing,
}: {
  close: () => void;
  save: (data: Omit<Match, "id" | "captain" | "owned">) => void;
  existing?: Match;
}) {
  const [fieldId, setFieldId] = useState(existing?.fieldId || fields[0].id);
  const [start, setStart] = useState(
    existing
      ? `${localDay(new Date(existing.start))}T${timeLabel(existing.start)}`
      : defaultDateTime(),
  );
  const [needed, setNeeded] = useState(
    existing ? existing.total - existing.filled : 2,
  );
  const [note, setNote] = useState(
    existing?.note ||
      "Khoảng 80k/người. Mang áo sáng màu, có mặt trước 10 phút nhé!",
  );
  const [urgent, setUrgent] = useState(existing?.urgent || false);
  const [error, setError] = useState("");
  const field = fields.find((f) => f.id === fieldId)!;
  const total = existing?.total || field.total;
  const minimumNeeded = existing ? 0 : 1;
  function submit(e: FormEvent) {
    e.preventDefault();
    const date = new Date(`${start}:00+07:00`);
    if (!Number.isFinite(+date) || +date <= Date.now())
      return setError("Chọn giờ bắt đầu trong tương lai nhé.");
    if (!Number.isInteger(needed) || needed < minimumNeeded || needed >= total)
      return setError(
        `Số người cần phải từ ${minimumNeeded} đến ${total - 1}.`,
      );
    save({
      fieldId,
      start: date.toISOString(),
      filled: total - needed,
      total,
      urgent,
      note: note.trim(),
    });
  }
  return (
    <Modal
      close={close}
      title={existing ? "Cập nhật kèo" : "Thiếu người? Lên kèo!"}
      subtitle="Bốn thông tin thôi. Anh em đang chờ."
    >
      <form className="form-content" onSubmit={submit}>
        <label>
          <span className="field-label">
            <span>01</span>Sân bóng
          </span>
          <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            {fields.map((f) => (
              <option
                key={f.id}
                value={f.id}
                disabled={!!existing && f.total !== existing.total}
              >
                {f.name} · {f.total === 14 ? "Sân 7" : "Sân 5"}
              </option>
            ))}
          </select>
          <span className="helper">
            Các sân trong demo là dữ liệu giả lập tại Thủ Đức.
            {existing && " Khi đổi sân, giữ nguyên loại sân của kèo."}
          </span>
        </label>
        <label>
          <span className="field-label">
            <span>02</span>Giờ bắt đầu
          </span>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <span className="helper">Giờ Việt Nam (UTC+7)</span>
        </label>
        <label>
          <span className="field-label">
            <span>03</span>Còn thiếu mấy người?
          </span>
          <div className="stepper">
            <button
              type="button"
              aria-label="Giảm số người"
              disabled={needed <= minimumNeeded}
              onClick={() => setNeeded(needed - 1)}
            >
              −
            </button>
            <input
              type="number"
              min={minimumNeeded}
              max={total - 1}
              required
              value={needed}
              onChange={(e) => setNeeded(Number(e.target.value))}
              aria-label="Số người còn thiếu"
            />
            <button
              type="button"
              aria-label="Tăng số người"
              disabled={needed >= total - 1}
              onClick={() => setNeeded(needed + 1)}
            >
              +
            </button>
            <span>người / {total} chỗ</span>
          </div>
        </label>
        <label>
          <span className="field-label">
            <span>04</span>Ghi chú
          </span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Phí dự kiến, màu áo, lời nhắn cho anh em…"
            maxLength={500}
          />
        </label>
        <label className="toggle-row">
          <span>
            <Zap size={18} />
            <span>
              Cần gấp<small>Ưu tiên hiển thị để sớm đủ người</small>
            </span>
          </span>
          <input
            type="checkbox"
            checked={urgent}
            onChange={(e) => setUrgent(e.target.checked)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary full">
          {existing ? "Lưu thay đổi" : "Đăng kèo"}
          <ArrowRight size={18} />
        </button>
      </form>
    </Modal>
  );
}

export default function Home() {
  const [state, setState] = useState<DemoState | null>(null);
  const stateRef = useRef<DemoState | null>(null);
  const [tab, setTab] = useState<Tab>("discover");
  const [period, setPeriod] = useState<"today" | "week">("week");
  const [district, setDistrict] = useState("Thủ Đức");
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<"detail" | "chat">("detail");
  const [onboarding, setOnboarding] = useState(false);
  const [pending, setPending] = useState<"create" | "profile" | string | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [about, setAbout] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState("");
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let saved = null;
    try {
      saved = parseStored(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* Private browsing still supports an in-memory demo. */
    }
    const initial = saved || seedState();
    stateRef.current = initial;
    setState(initial);
    if (initial.profile) setDistrict(initial.profile.district);
    const hash = new URLSearchParams(location.hash.slice(1));
    const id = hash.get("keo");
    if (id) {
      if (initial.matches.some((m) => m.id === id)) setSelected(id);
      else
        setToast(
          "Kèo này chỉ có trong trình duyệt đã tạo. Hãy thử một kèo mẫu.",
        );
    }
    const timer = setInterval(() => setClock((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected, panel, state?.messages]);
  function commit(next: DemoState) {
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setToast(
        "Trình duyệt không cho lưu dữ liệu. Bạn vẫn có thể thử trong phiên này.",
      );
    }
  }
  function attempt(fn: () => void) {
    try {
      fn();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Có lỗi, hãy thử lại.");
    }
  }
  function openMatch(id: string, mode: "detail" | "chat" = "detail") {
    setSelected(id);
    setPanel(mode);
    setMessage("");
    history.replaceState(null, "", `#keo=${encodeURIComponent(id)}`);
  }
  function closeMatch() {
    setSelected(null);
    history.replaceState(null, "", location.pathname + location.search);
  }
  function doJoin(id: string) {
    if (!stateRef.current?.profile) {
      setPending(id);
      setSelected(null);
      setOnboarding(true);
      return;
    }
    attempt(() => {
      commit(joinMatch(stateRef.current!, id));
      openMatch(id, "chat");
      setToast("Đã giữ chỗ cho bạn. Hẹn gặp ở sân!");
    });
  }
  function doCreate() {
    if (!stateRef.current?.profile) {
      setPending("create");
      setOnboarding(true);
    } else setCreating(true);
  }
  function finishOnboarding(profile: Profile) {
    const next = { ...stateRef.current!, profile };
    commit(next);
    setDistrict(profile.district);
    setOnboarding(false);
    if (pending === "create") setCreating(true);
    else if (pending && pending !== "profile") doJoin(pending);
    else setToast(`Chào ${profile.name}, sẵn sàng ra sân rồi!`);
    setPending(null);
  }
  async function share(match: Match) {
    const url = `${location.origin}${location.pathname}#keo=${encodeURIComponent(match.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(
        match.owned
          ? "Đã copy link. Kèo tự tạo chỉ lưu ở trình duyệt này trong bản demo."
          : "Đã copy link kèo. Gửi anh em cùng xem nhé!",
      );
    } catch {
      setToast(
        "Chưa copy được. Bạn có thể sao chép đường dẫn trên thanh địa chỉ.",
      );
    }
  }
  if (!state)
    return (
      <div className="loading">
        <Ball />
        <p>Đang tìm kèo cho bạn…</p>
      </div>
    );
  const now = new Date();
  void clock;
  const matches = visibleMatches(state, period, district, now);
  const mine = state.matches
    .filter((m) => state.members.some((member) => member.matchId === m.id))
    .sort((a, b) => +new Date(b.start) - +new Date(a.start));
  const upcoming = mine
    .filter((m) => new Date(m.start) > now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const past = mine.filter((m) => new Date(m.start) <= now);
  const active = state.matches.find((m) => m.id === selected);
  const member = active
    ? state.members.find((m) => m.matchId === active.id)
    : undefined;
  const urgentCount = matches.filter(
    (m) => m.urgent && m.filled < m.total,
  ).length;
  const trust = trustSummary(state);
  const initials =
    state.profile?.name
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase() || "B";
  function matchCard(match: Match) {
    const field = fieldOf(match),
      missing = match.total - match.filled;
    const joined = state!.members.some((m) => m.matchId === match.id);
    const pastMatch = new Date(match.start) <= now;
    return (
      <article
        className={`match-card ${match.urgent && missing > 0 ? "is-urgent" : ""}`}
        key={match.id}
      >
        <button
          className="card-main"
          onClick={() => openMatch(match.id)}
          aria-label={`Xem kèo ${field.name}, ${dayLabel(match.start)}, ${timeLabel(match.start)}`}
        >
          <div className="card-top">
            <span className="match-day">{dayLabel(match.start)}</span>
            {match.urgent && missing > 0 && !pastMatch && (
              <span className="badge urgent">
                <Zap size={12} fill="currentColor" />
                CẦN GẤP
              </span>
            )}
          </div>
          <div className="match-time">
            {timeLabel(match.start)}
            <span>
              –{" "}
              {timeLabel(
                new Date(+new Date(match.start) + 90 * 60000).toISOString(),
              )}
            </span>
          </div>
          <div className="match-field">
            <span className="field-icon">
              <MapPin size={19} />
            </span>
            <div>
              <h3>{field.name}</h3>
              <p>{field.district}</p>
            </div>
            <ChevronRight className="card-chevron" size={19} />
          </div>
        </button>
        <div className="card-bottom">
          <div className="slot-info">
            <div className="slots" aria-hidden="true">
              {Array.from({ length: match.total }, (_, i) => (
                <span key={i} className={i < match.filled ? "filled" : ""} />
              ))}
            </div>
            <p>
              {pastMatch ? (
                <b>Đã kết thúc</b>
              ) : missing ? (
                <>
                  Thiếu <b>{missing} người</b>
                  <span>
                    {" "}
                    · {match.filled}/{match.total}
                  </span>
                </>
              ) : (
                <b>Đã đủ người</b>
              )}
            </p>
          </div>
          <button
            className={`button card-action ${joined ? "soft" : missing ? "primary" : "disabled-button"}`}
            onClick={() =>
              openMatch(match.id, joined && !pastMatch ? "chat" : "detail")
            }
          >
            {pastMatch
              ? "Xem trận"
              : joined
                ? "Vào chat"
                : missing
                  ? "Tham gia"
                  : "Xem kèo"}
            {!pastMatch &&
              (joined ? (
                <MessageCircle size={16} />
              ) : missing ? (
                <ArrowRight size={16} />
              ) : (
                <CheckCheck size={16} />
              ))}
          </button>
        </div>
      </article>
    );
  }
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            aria-label="Bắt Kèo — Trang chủ"
            onClick={() => setTab("discover")}
          >
            <span className="brand-icon">
              <Ball />
            </span>
            <span>
              Bắt Kèo<span className="brand-dot">.</span>
            </span>
          </button>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {tabs.slice(0, 3).map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.id === "chat" && upcoming.length > 0 && (
                  <span className="nav-dot" />
                )}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button className="demo-label" onClick={() => setAbout(true)}>
              <span />
              BẢN DEMO
            </button>
            <button
              className={`avatar ${tab === "profile" ? "active" : ""}`}
              aria-label="Mở hồ sơ cá nhân"
              onClick={() => setTab("profile")}
            >
              {state.profile ? initials : <UserRound size={19} />}
            </button>
          </div>
        </div>
      </header>
      <main className="main-shell">
        <div className="page-context">
          <span>
            <span className="live-dot" />
            BÓNG ĐÁ PHỦI · SÀI GÒN
          </span>
          <span className="context-date">
            {new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
            }).format(now)}
          </span>
        </div>
        {tab === "discover" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="hero-kicker">
                  <span />
                  HẾT GIỜ LÀM. TỚI GIỜ ĐÁ.
                </div>
                <h1>
                  Tối nay,
                  <br />
                  ra sân thôi<span>.</span>
                </h1>
                <p>
                  Một kèo bóng. Vài người bạn mới.
                  <br className="mobile-only" /> Còn chờ gì nữa?
                </p>
                <button
                  className="hero-link"
                  onClick={() =>
                    document
                      .getElementById("match-list")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  Tìm kèo của bạn <ArrowDown size={16} />
                </button>
              </div>
              <Pitch />
              <div className="hero-index">01 / RA SÂN CÙNG NHAU</div>
            </section>
            <div className="content-layout">
              <section className="match-section" id="match-list">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">
                      ĐÚNG GIỜ. ĐÚNG SÂN. ĐỦ ANH EM.
                    </div>
                    <h2>
                      Kèo đang chờ bạn
                      <span className="count-pill">{matches.length}</span>
                    </h2>
                  </div>
                  <button className="button create-button" onClick={doCreate}>
                    <Plus size={18} />
                    Tạo kèo
                  </button>
                </div>
                <div className="filters">
                  <label className="area-filter">
                    <MapPin size={17} />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      aria-label="Lọc khu vực"
                    >
                      {[
                        "Thủ Đức",
                        "Bình Thạnh",
                        "Gò Vấp",
                        "Quận 7",
                        "Tất cả khu vực",
                      ].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} />
                  </label>
                  <div className="segmented" aria-label="Lọc thời gian">
                    <button
                      aria-pressed={period === "today"}
                      className={period === "today" ? "active" : ""}
                      onClick={() => setPeriod("today")}
                    >
                      Hôm nay
                    </button>
                    <button
                      aria-pressed={period === "week"}
                      className={period === "week" ? "active" : ""}
                      onClick={() => setPeriod("week")}
                    >
                      Tuần này
                    </button>
                  </div>
                </div>
                <div className="results-meta">
                  <span>
                    {urgentCount > 0 ? (
                      <>
                        <Zap size={14} />
                        {urgentCount} kèo cần bạn tiếp sức
                      </>
                    ) : (
                      <>
                        <Users size={14} />
                        Tìm đồng đội, ra sân cùng nhau
                      </>
                    )}
                  </span>
                  <span>Ưu tiên kèo cần gấp</span>
                </div>
                {matches.length ? (
                  <div className="match-grid">
                    {matches.map((m) => matchCard(m))}
                  </div>
                ) : (
                  <Empty
                    title="Khu vực này đang chờ kèo đầu tiên"
                    text="Thử Thủ Đức, chọn tuần này hoặc tự lên một kèo và rủ anh em nhé."
                    action={() => {
                      setDistrict("Thủ Đức");
                      setPeriod("week");
                    }}
                    actionLabel="Xem kèo Thủ Đức"
                  />
                )}
                <p className="list-footnote">
                  <span />
                  Sân và kèo mẫu để bạn trải nghiệm. Chưa phải lịch đá thật.
                </p>
              </section>
              <aside className="sidebar">
                <section className="captain-card">
                  <div className="mini-pitch">
                    <Flag size={29} />
                    <span>+1</span>
                  </div>
                  <span className="eyebrow">GỬI ĐỘI TRƯỞNG</span>
                  <h3>
                    Thiếu một người,
                    <br />
                    đừng thiếu một trận.
                  </h3>
                  <p>
                    Đăng kèo trong một phút.
                    <br />
                    Để Bắt Kèo tìm thêm đồng đội.
                  </p>
                  <button className="button outline full" onClick={doCreate}>
                    Lên kèo ngay
                    <Plus size={18} />
                  </button>
                </section>
                {upcoming[0] ? (
                  <section className="next-match">
                    <span className="eyebrow">HẸN BẠN Ở SÂN</span>
                    <h3>
                      {timeLabel(upcoming[0].start)}{" "}
                      <small>{dayLabel(upcoming[0].start)}</small>
                    </h3>
                    <p>
                      <MapPin size={15} />
                      {fieldOf(upcoming[0]).name}
                    </p>
                    <button onClick={() => openMatch(upcoming[0].id, "chat")}>
                      Mở phòng chat <ArrowRight size={16} />
                    </button>
                  </section>
                ) : (
                  <section className="how-it-works">
                    <span className="eyebrow">RA SÂN DỄ THÔI</span>
                    <div>
                      <span>01</span>
                      <p>
                        <b>Thấy kèo hợp</b>
                        <small>Đúng giờ rảnh, gần chỗ bạn.</small>
                      </p>
                    </div>
                    <div>
                      <span>02</span>
                      <p>
                        <b>Chạm là có chỗ</b>
                        <small>Tham gia ngay, không chờ duyệt.</small>
                      </p>
                    </div>
                    <div>
                      <span>03</span>
                      <p>
                        <b>Giữ lời, ra sân</b>
                        <small>Đồng đội đang đợi bạn.</small>
                      </p>
                    </div>
                  </section>
                )}
                <div className="promise">
                  <ShieldCheck size={20} />
                  <p>
                    Có kèo là có mặt.
                    <br />
                    <span>Uy tín đến từ những lần ra sân.</span>
                  </p>
                </div>
                <span className="sidebar-note">
                  ĐƯỢC LÀM CHO ANH EM MÊ BÓNG ĐÁ.
                </span>
              </aside>
            </div>
          </>
        ) : tab === "mine" ? (
          <section className="inner-page">
            <div className="section-heading">
              <div>
                <span className="eyebrow">LỊCH RA SÂN CỦA BẠN</span>
                <h1>
                  Kèo của tôi<span className="brand-dot">.</span>
                </h1>
                <p className="muted">Đã hẹn là gặp. Đồng đội đang chờ.</p>
              </div>
              <button className="button primary" onClick={doCreate}>
                <Plus size={18} />
                Tạo kèo
              </button>
            </div>
            {!state.profile ? (
              <Empty
                title="Lưu lại những cuộc hẹn trên sân"
                text="Tạo hồ sơ demo để tham gia, tạo kèo và thử xác nhận sau trận."
                action={() => {
                  setPending("profile");
                  setOnboarding(true);
                }}
                actionLabel="Tạo hồ sơ demo"
              />
            ) : (
              <>
                <h3 className="subheading">
                  Sắp ra sân <span>{upcoming.length}</span>
                </h3>
                {upcoming.length ? (
                  <div className="match-grid three-col">
                    {upcoming.map((m) => matchCard(m))}
                  </div>
                ) : (
                  <Empty
                    title="Chưa có lịch, bắt một kèo thôi"
                    text="Một trận bóng sau giờ làm là một cách hay để kết thúc ngày."
                    action={() => setTab("discover")}
                  />
                )}
                <h3 className="subheading past-heading">
                  Đã qua giờ đá <span>{past.length}</span>
                </h3>
                {past.map((m) => {
                  const attendance = state.members.find(
                    (x) => x.matchId === m.id,
                  )!;
                  return (
                    <article className="past-card" key={m.id}>
                      <div className="past-icon">
                        <CheckCheck />
                      </div>
                      <div className="past-copy">
                        <h3>{fieldOf(m).name}</h3>
                        <p>
                          {dayLabel(m.start)} · {timeLabel(m.start)}
                          {m.id === "k7" ? " · Trận mẫu để thử xác nhận" : ""}
                        </p>
                      </div>
                      <div className="attendance-actions">
                        {attendance.confirmed === null ? (
                          <>
                            <button
                              className="button primary"
                              onClick={() =>
                                attempt(() => {
                                  commit(
                                    confirmMatch(stateRef.current!, m.id, true),
                                  );
                                  setToast(
                                    "Thêm một lần ra sân. Hẹn kèo tiếp theo!",
                                  );
                                })
                              }
                            >
                              <Check size={17} />
                              Tôi đã đá trận này
                            </button>
                            <button
                              className="text-button muted"
                              onClick={() =>
                                attempt(() =>
                                  commit(
                                    confirmMatch(
                                      stateRef.current!,
                                      m.id,
                                      false,
                                    ),
                                  ),
                                )
                              }
                            >
                              Tôi không tham gia
                            </button>
                          </>
                        ) : (
                          <>
                            <span
                              className={`attendance-result ${attendance.confirmed ? "" : "missed"}`}
                            >
                              {attendance.confirmed ? (
                                <>
                                  <CheckCheck size={17} />
                                  Đã xác nhận tham gia
                                </>
                              ) : (
                                "Đã ghi nhận không tham gia"
                              )}
                            </span>
                            <button
                              className="text-button muted"
                              onClick={() =>
                                commit({
                                  ...state,
                                  members: state.members.map((x) =>
                                    x.matchId === m.id
                                      ? { ...x, confirmed: null }
                                      : x,
                                  ),
                                })
                              }
                            >
                              Sửa xác nhận
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </>
            )}
          </section>
        ) : tab === "chat" ? (
          <section className="inner-page narrow">
            <span className="eyebrow">CHỐT GIỜ, RỦ NHAU RA SÂN</span>
            <h1>
              Trò chuyện<span className="brand-dot">.</span>
            </h1>
            <p className="muted page-description">
              Mỗi kèo, một phòng chat. Giờ và sân luôn được ghim sẵn.
            </p>
            {state.profile && mine.length ? (
              <div className="chat-list">
                {mine.map((m) => {
                  const last = state.messages[m.id]?.at(-1);
                  return (
                    <button
                      key={m.id}
                      className="chat-list-item"
                      onClick={() => openMatch(m.id, "chat")}
                    >
                      <span className="chat-list-icon">
                        <Ball />
                      </span>
                      <span className="chat-list-copy">
                        <b>{fieldOf(m).name}</b>
                        <span>
                          {dayLabel(m.start)} · {timeLabel(m.start)}
                        </span>
                        <small>
                          {last
                            ? last.text
                            : "Anh em đã có mặt. Vào chào một câu nhé!"}
                        </small>
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <Empty
                title="Đồng đội ở ngay kèo tiếp theo"
                text="Tham gia một kèo để vào phòng chat và hẹn giờ ra sân."
                action={() => setTab("discover")}
              />
            )}
            <div className="info-note">
              <MessageCircle size={18} />
              <p>
                Chat demo lưu trên thiết bị của bạn. Chưa gửi tin nhắn tới người
                chơi khác.
              </p>
            </div>
          </section>
        ) : (
          <section className="inner-page narrow">
            <span className="eyebrow">CÓ KÈO LÀ CÓ MẶT</span>
            <h1>
              Góc của bạn<span className="brand-dot">.</span>
            </h1>
            {state.profile ? (
              <>
                <div className="profile-card">
                  <div className="profile-avatar">{initials}</div>
                  <h2>{state.profile.name}</h2>
                  <p>
                    <MapPin size={15} />
                    {state.profile.district}
                  </p>
                  <div className="trust-stats">
                    <div>
                      <strong>{trust.played}</strong>
                      <span>trận đã đá</span>
                    </div>
                    <div>
                      <strong>
                        {trust.attendance === null
                          ? "—"
                          : `${trust.attendance}%`}
                      </strong>
                      <span>có mặt</span>
                    </div>
                  </div>
                  <p className="profile-explanation">
                    Được tính từ kèo đã qua giờ đá và xác nhận của bạn trong bản
                    demo.
                  </p>
                </div>
                <form
                  className="profile-settings"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    const name = String(form.get("name") || "").trim();
                    if (!name) return;
                    const profile = {
                      ...state.profile!,
                      name,
                      district: String(form.get("district")),
                      times: form.getAll("times").map(String),
                    };
                    commit({ ...state, profile });
                    setDistrict(profile.district);
                    setToast("Đã lưu hồ sơ của bạn.");
                  }}
                >
                  <h3>Thông tin của bạn</h3>
                  <label>
                    Tên gọi
                    <input
                      name="name"
                      defaultValue={state.profile.name}
                      maxLength={35}
                      required
                      pattern=".*\S.*"
                    />
                  </label>
                  <label>
                    Khu vực
                    <select
                      name="district"
                      defaultValue={state.profile.district}
                    >
                      {["Thủ Đức", "Bình Thạnh", "Gò Vấp", "Quận 7"].map(
                        (d) => (
                          <option key={d}>{d}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <fieldset>
                    <legend>Khung giờ rảnh</legend>
                    <div className="profile-times">
                      {availability.map((t) => (
                        <label key={t}>
                          <input
                            type="checkbox"
                            name="times"
                            value={t}
                            defaultChecked={state.profile!.times.includes(t)}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button className="button primary" type="submit">
                    Lưu thay đổi
                    <Check size={16} />
                  </button>
                </form>
                <button
                  className="reset-button"
                  onClick={() => setResetting(true)}
                >
                  <RotateCcw size={16} />
                  Bắt đầu lại bản demo
                </button>
              </>
            ) : (
              <Empty
                title="Lần ra sân đầu tiên bắt đầu ở đây"
                text="Không chấm sao, không khai trình độ. Chỉ cần tên, khu vực và giờ rảnh."
                action={() => {
                  setPending("profile");
                  setOnboarding(true);
                }}
                actionLabel="Tạo hồ sơ demo"
              />
            )}
          </section>
        )}
        <footer className="site-footer">
          <span className="footer-wordmark">Bắt Kèo.</span>
          <span>Có kèo là có mặt.</span>
          <button onClick={() => setAbout(true)}>
            Về bản demo <ExternalLink size={12} />
          </button>
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
        {tabs.map((t) => (
          <button
            key={t.id}
            aria-current={tab === t.id ? "page" : undefined}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={21} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      {active && (
        <Modal
          wide={panel === "chat"}
          close={closeMatch}
          title={panel === "chat" ? "Phòng thay đồ" : "Hẹn gặp trên sân"}
          subtitle={
            panel === "chat"
              ? `${fieldOf(active).name} · ${active.filled} người trong kèo`
              : "Một trận bóng vui bắt đầu từ một lời hẹn."
          }
        >
          {panel === "chat" && member && state.profile ? (
            <>
              <div className="chat-pinned">
                <Pin size={18} />
                <div>
                  <b>
                    {dayLabel(active.start)} · {timeLabel(active.start)} ·{" "}
                    {fieldOf(active).name}
                  </b>
                  <p>{active.note || "Chưa có ghi chú."}</p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setPanel("detail")}
                  aria-label="Xem chi tiết kèo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="chat-body">
                <div className="chat-system-label">
                  Bắt đầu một kèo vui bằng một lời chào 👋
                </div>
                {(state.messages[active.id] || []).map((m) =>
                  m.system ? (
                    <p className="system-message" key={m.id}>
                      {m.text}
                    </p>
                  ) : (
                    <div
                      className={`chat-message ${m.mine ? "mine" : ""}`}
                      key={m.id}
                    >
                      {!m.mine && (
                        <span className="message-avatar">{m.author[0]}</span>
                      )}
                      <div>
                        {!m.mine && (
                          <b className="message-author">
                            {m.author}
                            {m.author === active.captain && (
                              <span>Đội trưởng</span>
                            )}
                          </b>
                        )}
                        <p>{m.text}</p>
                        <time>
                          {timeLabel(m.time)}
                          {m.mine && <CheckCheck size={12} />}
                        </time>
                      </div>
                    </div>
                  ),
                )}
                <div ref={chatEnd} />
              </div>
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault();
                  attempt(() => {
                    commit(sendChat(stateRef.current!, active.id, message));
                    setMessage("");
                  });
                }}
              >
                <input
                  aria-label="Tin nhắn"
                  placeholder={
                    isChatReadOnly(active)
                      ? "Phòng chat đã đóng sau 24 giờ"
                      : "Nhắn anh em một câu…"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1000}
                  disabled={isChatReadOnly(active)}
                />
                <button
                  className="send-button"
                  type="submit"
                  disabled={!message.trim() || isChatReadOnly(active)}
                  aria-label="Gửi tin nhắn"
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="chat-demo-note">
                Chat demo · Tin nhắn chỉ lưu trong trình duyệt này
              </p>
            </>
          ) : (
            <div className="detail-content">
              <div className="detail-time">
                <CalendarDays size={23} />
                <span>
                  {dayLabel(active.start)}
                  <strong>
                    {timeLabel(active.start)}{" "}
                    <small>
                      –{" "}
                      {timeLabel(
                        new Date(
                          +new Date(active.start) + 90 * 60000,
                        ).toISOString(),
                      )}
                    </small>
                  </strong>
                </span>
                {active.urgent && active.filled < active.total && (
                  <span className="badge urgent">
                    <Zap size={12} />
                    CẦN GẤP
                  </span>
                )}
              </div>
              <div className="detail-place">
                <div className="detail-pitch">
                  <MapPin size={26} />
                </div>
                <div>
                  <h3>{fieldOf(active).name}</h3>
                  <p>{fieldOf(active).address}</p>
                  <small>
                    Sân mẫu · {active.total === 14 ? "Sân 7" : "Sân 5"}
                  </small>
                </div>
              </div>
              <div className="detail-slots">
                <div>
                  <Users size={18} />
                  <b>
                    {active.filled >= active.total
                      ? "Đã đủ người"
                      : `Còn thiếu ${active.total - active.filled} người`}
                  </b>
                  <span>
                    {active.filled}/{active.total} chỗ
                  </span>
                </div>
                <div className="detail-progress">
                  <span
                    style={{
                      width: `${(active.filled / active.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="detail-note">
                <span className="eyebrow">LỜI NHẮN ĐỘI TRƯỞNG</span>
                <p>
                  {active.note || "Chưa có ghi chú. Vào chat để hỏi thêm nhé."}
                </p>
              </div>
              <div className="captain-row">
                <span className="captain-avatar">{active.captain[0]}</span>
                <div>
                  <b>{active.captain}</b>
                  <small>
                    Đội trưởng{active.owned ? " · Bạn" : " · Nhân vật demo"}
                  </small>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    setToast(
                      "Demo chưa có số Zalo thật của đội trưởng. Không có tin nhắn nào được gửi.",
                    )
                  }
                >
                  <MessageCircle size={16} />
                  Zalo <span className="tiny-label">DEMO</span>
                </button>
              </div>
              <div className="detail-actions">
                {member && state.profile ? (
                  <button
                    className="button primary grow"
                    onClick={() => setPanel("chat")}
                  >
                    <MessageCircle size={18} />
                    Vào phòng chat
                  </button>
                ) : (
                  <button
                    className="button primary grow"
                    disabled={
                      active.filled >= active.total ||
                      new Date(active.start) <= now
                    }
                    onClick={() => doJoin(active.id)}
                  >
                    {new Date(active.start) <= now
                      ? "Kèo đã kết thúc"
                      : active.filled >= active.total
                        ? "Kèo đã đủ người"
                        : "Tham gia kèo này"}
                    <ArrowRight size={18} />
                  </button>
                )}
                <button
                  className="button outline"
                  aria-label="Sao chép link kèo"
                  onClick={() => share(active)}
                >
                  <Copy size={18} />
                </button>
              </div>
              {active.owned && new Date(active.start) > now && (
                <button
                  className="text-button edit-match"
                  onClick={() => {
                    setEditing(active);
                    closeMatch();
                  }}
                >
                  <SlidersHorizontal size={15} />
                  Sửa giờ, sân và ghi chú
                </button>
              )}
              <p className="detail-footnote">
                <ShieldCheck size={14} />
                Giữ lời hẹn. Có mặt trước giờ đá 10 phút nhé.
              </p>
            </div>
          )}
        </Modal>
      )}
      {onboarding && (
        <Onboarding
          close={() => {
            setOnboarding(false);
            setPending(null);
          }}
          done={finishOnboarding}
        />
      )}
      {(creating || editing) && (
        <MatchForm
          existing={editing || undefined}
          close={() => {
            setCreating(false);
            setEditing(null);
          }}
          save={(data) => {
            if (editing) {
              const updated = { ...editing, ...data };
              commit({
                ...state,
                matches: state.matches.map((m) =>
                  m.id === editing.id ? updated : m,
                ),
              });
              setEditing(null);
              openMatch(updated.id);
              setToast("Đã cập nhật kèo và tin ghim phòng chat.");
            } else {
              const id = `keo-${Date.now()}`;
              const match = {
                ...data,
                id,
                captain: state.profile!.name,
                owned: true,
              };
              commit({
                ...state,
                matches: [...state.matches, match],
                members: [...state.members, { matchId: id, confirmed: null }],
              });
              setCreating(false);
              setTab("mine");
              openMatch(id);
              setToast("Đã đăng kèo. Rủ anh em ra sân thôi!");
            }
          }}
        />
      )}
      {about && (
        <Modal
          close={() => setAbout(false)}
          title="Một bản demo để cùng hoàn thiện"
          subtitle="Bắt Kèo · Phiên bản đầu tiên"
        >
          <div className="about-content">
            <Ball />
            <p>
              Tìm kèo nhanh, đủ người, ai cũng giữ lời. Đó là tất cả những gì
              Bắt Kèo muốn làm tốt.
            </p>
            <ul>
              <li>
                Bạn có thể thử tìm kèo, tạo kèo, tham gia, chat và xác nhận sau
                trận.
              </li>
              <li>
                Mọi sân, người chơi, hội thoại và chi phí đều là dữ liệu mẫu.
                Đây chưa phải các kèo thật.
              </li>
              <li>
                Dữ liệu chỉ lưu trên trình duyệt này. Link kèo tự tạo chưa đồng
                bộ sang thiết bị khác.
              </li>
              <li>
                Chưa gửi OTP, chưa chat nhiều người, chưa kết nối Zalo và không
                xử lý tiền.
              </li>
            </ul>
            <p className="helper">
              Sau khi chốt trải nghiệm, bản tiếp theo sẽ nối Supabase để xác
              thực, đồng bộ và kiểm tra uy tín phía máy chủ.
            </p>
            <button
              className="button primary full"
              onClick={() => setAbout(false)}
            >
              Bắt đầu trải nghiệm
              <ArrowRight size={18} />
            </button>
          </div>
        </Modal>
      )}
      {resetting && (
        <Modal
          close={() => setResetting(false)}
          title="Bắt đầu lại bản demo?"
          subtitle="Hồ sơ, kèo tự tạo và tin nhắn trên trình duyệt này sẽ được xóa."
        >
          <div className="form-content">
            <div className="form-actions">
              <button
                className="button outline grow"
                onClick={() => setResetting(false)}
              >
                Giữ lại
              </button>
              <button
                className="button primary grow"
                onClick={() => {
                  commit(seedState());
                  setResetting(false);
                  setTab("discover");
                  setDistrict("Thủ Đức");
                  setPeriod("week");
                  setToast("Đã làm mới bản demo.");
                }}
              >
                Bắt đầu lại
              </button>
            </div>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
