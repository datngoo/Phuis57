export const STORAGE_KEY = "bat-keo-demo-v1";
export const TIMEZONE = "Asia/Ho_Chi_Minh";
export type Field = {
  id: string;
  name: string;
  district: string;
  address: string;
  total: number;
};
export type Match = {
  id: string;
  fieldId: string;
  start: string;
  filled: number;
  total: number;
  urgent: boolean;
  note: string;
  captain: string;
  owned?: boolean;
};
export type Member = { matchId: string; confirmed: boolean | null };
export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  time: string;
  mine?: boolean;
  system?: boolean;
};
export type Profile = { name: string; district: string; times: string[] };
export type DemoState = {
  version: 1;
  profile: Profile | null;
  matches: Match[];
  members: Member[];
  messages: Record<string, ChatMessage[]>;
};
export const fields: Field[] = [
  {
    id: "f1",
    name: "Sân Bờ Sông",
    district: "Thủ Đức",
    address: "Khu vực Hiệp Bình Chánh, Thủ Đức",
    total: 10,
  },
  {
    id: "f2",
    name: "Sân Nắng Chiều",
    district: "Thủ Đức",
    address: "Khu vực Linh Chiểu, Thủ Đức",
    total: 10,
  },
  {
    id: "f3",
    name: "Sân Góc Phố",
    district: "Thủ Đức",
    address: "Khu vực Bình Thọ, Thủ Đức",
    total: 14,
  },
  {
    id: "f4",
    name: "Sân Cỏ Xanh",
    district: "Thủ Đức",
    address: "Khu vực Linh Trung, Thủ Đức",
    total: 10,
  },
  {
    id: "f5",
    name: "Sân Cuối Tuần",
    district: "Thủ Đức",
    address: "Khu vực Trường Thọ, Thủ Đức",
    total: 10,
  },
];
export const fieldOf = (match: Match) =>
  fields.find((f) => f.id === match.fieldId)!;
export function localDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}-${parts.find((p) => p.type === "day")!.value}`;
}
export function atDay(
  offset: number,
  hour: number,
  minute = 0,
  now = new Date(),
) {
  const date = new Date(`${localDay(now)}T00:00:00+07:00`);
  date.setTime(
    date.getTime() + offset * 86400000 + (hour * 60 + minute) * 60000,
  );
  return date.toISOString();
}
export function weekEnd(now = new Date()) {
  const date = new Date(`${localDay(now)}T00:00:00+07:00`);
  const weekday = new Date(`${localDay(now)}T12:00:00Z`).getUTCDay();
  return new Date(
    date.getTime() + (weekday === 0 ? 1 : 8 - weekday) * 86400000,
  );
}
export function timeLabel(start: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(start));
}
export function dayLabel(start: string, now = new Date()) {
  if (localDay(new Date(start)) === localDay(now)) return "Hôm nay";
  if (
    localDay(new Date(start)) === localDay(new Date(now.getTime() + 86400000))
  )
    return "Ngày mai";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(start));
}
export function defaultDateTime(now = new Date()) {
  const date = new Date(now.getTime() + 2 * 3600000);
  return `${localDay(date)}T${timeLabel(date.toISOString())}`;
}
export function seedState(now = new Date()): DemoState {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  const first =
    hour < 18
      ? atDay(0, 19, 0, now)
      : new Date(now.getTime() + 75 * 60000).toISOString();
  const next =
    hour < 20
      ? atDay(0, 20, 30, now)
      : new Date(now.getTime() + 130 * 60000).toISOString();
  const base = [
    {
      id: "k1",
      fieldId: "f1",
      start: first,
      filled: 8,
      total: 10,
      urgent: true,
      captain: "Minh Anh",
      note: "Khoảng 80k/người, chia tại sân. Mang áo sáng màu nhé. Có sẵn bóng và áo bib, chỉ cần mang giày và tinh thần vui vẻ!",
    },
    {
      id: "k2",
      fieldId: "f2",
      start: next,
      filled: 9,
      total: 10,
      urgent: true,
      captain: "Hoàng Nam",
      note: "Khoảng 70k/người. Đá giao lưu sau giờ làm, ai cũng được chào đón. Có mặt trước 10 phút để khởi động.",
    },
    {
      id: "k3",
      fieldId: "f3",
      start: atDay(0, 22, 0, now),
      filled: 11,
      total: 14,
      urgent: false,
      captain: "Tuấn",
      note: "Sân 7, khoảng 90k/người. Đội có nước uống. Áo tối màu, tới sân gặp Tuấn nhé.",
    },
    {
      id: "k4",
      fieldId: "f4",
      start: atDay(1, 19, 0, now),
      filled: 7,
      total: 10,
      urgent: false,
      captain: "Huy",
      note: "Khoảng 75k/người. Giao lưu nhẹ nhàng, ưu tiên vui và đúng giờ.",
    },
    {
      id: "k5",
      fieldId: "f5",
      start: atDay(2, 20, 0, now),
      filled: 8,
      total: 10,
      urgent: false,
      captain: "Đức",
      note: "Khoảng 80k/người. Sân có chỗ gửi xe. Mọi người tự chuẩn bị nước uống.",
    },
    {
      id: "k6",
      fieldId: "f2",
      start: atDay(3, 18, 30, now),
      filled: 10,
      total: 10,
      urgent: false,
      captain: "Long",
      note: "Kèo đã đủ người. Hẹn bạn ở trận tiếp theo!",
    },
    {
      id: "k7",
      fieldId: "f1",
      start: atDay(-1, 19, 0, now),
      filled: 10,
      total: 10,
      urgent: false,
      captain: "Minh Anh",
      note: "Trận mẫu đã kết thúc, khoảng 80k/người. Bạn có thể thử xác nhận đã đá ở kèo này.",
    },
  ];
  return {
    version: 1,
    profile: null,
    matches: base,
    members: [{ matchId: "k7", confirmed: null }],
    messages: {
      k1: [
        {
          id: "m1",
          author: "Minh Anh",
          text: "Chào anh em! Tới sân trước 10 phút khởi động nha ⚽",
          time: new Date(now.getTime() - 30 * 60000).toISOString(),
        },
        {
          id: "m2",
          author: "Phúc",
          text: "Mình mang thêm bóng nhé. Hẹn mọi người ở sân!",
          time: new Date(now.getTime() - 15 * 60000).toISOString(),
        },
      ],
    },
  };
}
export function visibleMatches(
  state: DemoState,
  period: "today" | "week",
  district: string,
  now = new Date(),
) {
  return state.matches
    .filter(
      (m) =>
        new Date(m.start) > now &&
        (district === "Tất cả khu vực" || fieldOf(m).district === district) &&
        (period === "today"
          ? localDay(new Date(m.start)) === localDay(now)
          : new Date(m.start) < weekEnd(now)),
    )
    .sort(
      (a, b) =>
        Number(b.urgent && b.filled < b.total) -
          Number(a.urgent && a.filled < a.total) ||
        +new Date(a.start) - +new Date(b.start),
    );
}
export function joinMatch(
  state: DemoState,
  id: string,
  now = new Date(),
): DemoState {
  if (!state.profile) throw new Error("Tạo hồ sơ demo để tham gia kèo.");
  const match = state.matches.find((m) => m.id === id);
  if (!match || new Date(match.start) <= now)
    throw new Error("Kèo đã qua giờ đá.");
  if (state.members.some((m) => m.matchId === id))
    throw new Error("Bạn đã tham gia kèo này rồi.");
  if (match.filled >= match.total)
    throw new Error("Kèo đã đủ người. Hẹn bạn ở kèo tiếp theo!");
  return {
    ...state,
    matches: state.matches.map((m) =>
      m.id === id ? { ...m, filled: m.filled + 1 } : m,
    ),
    members: [...state.members, { matchId: id, confirmed: null }],
    messages: {
      ...state.messages,
      [id]: [
        ...(state.messages[id] || []),
        {
          id: `join-${now.getTime()}`,
          author: "",
          text: `${state.profile.name} đã tham gia kèo. Chào mừng ra sân!`,
          time: now.toISOString(),
          system: true,
        },
      ],
    },
  };
}
export function confirmMatch(
  state: DemoState,
  id: string,
  attended: boolean,
  now = new Date(),
): DemoState {
  const match = state.matches.find((m) => m.id === id);
  if (!match || new Date(match.start) > now)
    throw new Error("Chỉ xác nhận sau giờ bắt đầu trận.");
  if (!state.members.some((m) => m.matchId === id))
    throw new Error("Bạn chưa tham gia kèo này.");
  return {
    ...state,
    members: state.members.map((m) =>
      m.matchId === id ? { ...m, confirmed: attended } : m,
    ),
  };
}
export function trustSummary(state: DemoState, now = new Date()) {
  const past = state.members.filter((member) =>
    state.matches.some(
      (m) => m.id === member.matchId && new Date(m.start) <= now,
    ),
  );
  const played = past.filter((m) => m.confirmed === true).length;
  return {
    played,
    attendance: past.length ? Math.round((played / past.length) * 100) : null,
  };
}
export function isChatReadOnly(match: Match, now = new Date()) {
  return now.getTime() >= new Date(match.start).getTime() + 86400000;
}
export function sendChat(
  state: DemoState,
  id: string,
  text: string,
  now = new Date(),
): DemoState {
  const match = state.matches.find((m) => m.id === id);
  if (!state.profile || !match || !state.members.some((m) => m.matchId === id))
    throw new Error("Tham gia kèo để trò chuyện.");
  if (isChatReadOnly(match, now))
    throw new Error("Phòng chat đã chuyển sang chỉ đọc.");
  const body = text.trim();
  if (!body || body.length > 1000)
    throw new Error("Tin nhắn cần từ 1 đến 1.000 ký tự.");
  return {
    ...state,
    messages: {
      ...state.messages,
      [id]: [
        ...(state.messages[id] || []),
        {
          id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
          author: state.profile.name,
          text: body,
          time: now.toISOString(),
          mine: true,
        },
      ],
    },
  };
}
export function parseStored(raw: string | null): DemoState | null {
  try {
    const value = JSON.parse(raw || "null");
    if (
      !value ||
      value.version !== 1 ||
      !Array.isArray(value.matches) ||
      !Array.isArray(value.members) ||
      typeof value.messages !== "object" ||
      value.messages === null
    )
      return null;
    if (
      value.matches.some(
        (m: Match) =>
          !m ||
          typeof m.id !== "string" ||
          !fields.some((f) => f.id === m.fieldId) ||
          !Number.isFinite(Date.parse(m.start)) ||
          !Number.isInteger(m.total) ||
          !Number.isInteger(m.filled) ||
          m.filled < 0 ||
          m.filled > m.total ||
          m.total < 2 ||
          typeof m.note !== "string" ||
          typeof m.captain !== "string",
      )
    )
      return null;
    if (
      value.members.some(
        (m: Member) =>
          !m ||
          typeof m.matchId !== "string" ||
          ![true, false, null].includes(m.confirmed),
      )
    )
      return null;
    if (
      value.profile &&
      (typeof value.profile.name !== "string" ||
        typeof value.profile.district !== "string" ||
        !Array.isArray(value.profile.times))
    )
      return null;
    if (
      Object.values(value.messages).some(
        (list) =>
          !Array.isArray(list) ||
          list.some(
            (m: ChatMessage) =>
              !m ||
              typeof m.text !== "string" ||
              typeof m.author !== "string" ||
              !Number.isFinite(Date.parse(m.time)),
          ),
      )
    )
      return null;
    return value as DemoState;
  } catch {
    return null;
  }
}
