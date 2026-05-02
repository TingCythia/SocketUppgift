import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatUser = {
  id: string;
  username: string;
  room: string;
};

type ChatMessage = {
  username: string;
  text: string;
};

type MediaMessage = {
  user: string;
  url: string;
};

type TimelineItem =
  | ({ type: "message" } & ChatMessage)
  | ({ type: "media" } & MediaMessage);

type RoomUsersPayload = {
  room: string;
  users: ChatUser[];
};

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : window.location.origin);

const pageBackground =
  "bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34rem),linear-gradient(135deg,#f8fafc_0%,#edf2f7_100%)]";
const eyebrowClass =
  "text-xs font-bold uppercase tracking-normal text-slate-500";
const inputClass =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

function buildRoomKey(owner: string, room: string) {
  return `${owner}::${room}`;
}

function formatRoomLabel(roomKey: string) {
  const [owner, ...roomParts] = roomKey.split("::");
  const room = roomParts.join("::");

  if (!owner || !room) return roomKey;
  return `${owner} / ${room}`;
}

function App() {
  const [username, setUsername] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [activeRoom, setActiveRoom] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<TimelineItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currentUser = username.trim();
  const memberCount = users.length;

  const roomLabel = useMemo(() => {
    if (!activeRoom) return "Choose a room";
    return formatRoomLabel(activeRoom);
  }, [activeRoom]);

  useEffect(() => {
    if (!isJoined) return;

    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit("joinRoom", {
      username: currentUser,
      room: joinedRoom,
    });

    socket.on("roomUsers", ({ room, users }: RoomUsersPayload) => {
      setActiveRoom(room);
      setUsers(users);
    });

    socket.on("message", (message: ChatMessage) => {
      setMessages((current) => [...current, { type: "message", ...message }]);
    });

    socket.on("command", (media: MediaMessage) => {
      setMessages((current) => [...current, { type: "media", ...media }]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, isJoined, joinedRoom]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const owner = ownerName.trim();
    const room = roomName.trim();
    if (!currentUser || !owner || !room) return;

    const roomKey = buildRoomKey(owner, room);

    setMessages([]);
    setUsers([]);
    setJoinedRoom(roomKey);
    setActiveRoom(roomKey);
    setIsJoined(true);
  }

  function leaveRoom() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsJoined(false);
    setJoinedRoom("");
    setActiveRoom("");
    setUsers([]);
    setMessages([]);
    setDraft("");
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();
    if (!message) return;

    socketRef.current?.emit("chatMessages", message);
    setDraft("");
  }

  if (!isJoined) {
    return (
      <main
        className={`grid min-h-screen place-items-center p-4 text-slate-900 [font-family:Inter,Arial,sans-serif] sm:p-8 ${pageBackground}`}
      >
        <section
          className="w-full max-w-[30rem] rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_24px_70px_rgba(23,32,51,0.16)] backdrop-blur-xl sm:p-8"
          aria-labelledby="join-title"
        >
          <BrandBlock eyebrow="Realtime rooms" title="ChatFlow" />

          <p className="my-6 leading-7 text-slate-500">
            Enter the room owner's name and room name exactly as shared. Messages
            are live only and never saved.
          </p>

          <form className="grid gap-4" onSubmit={joinRoom}>
            <label className="grid gap-2" htmlFor="username">
              <span className="text-sm font-bold text-slate-700">Username</span>
              <input
                className={inputClass}
                id="username"
                type="text"
                value={username}
                placeholder="Enter username"
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>

            <label className="grid gap-2" htmlFor="owner">
              <span className="text-sm font-bold text-slate-700">Room owner</span>
              <input
                className={inputClass}
                id="owner"
                type="text"
                value={ownerName}
                placeholder="Example: Cynthia"
                onChange={(event) => setOwnerName(event.target.value)}
                required
              />
              <span className="text-xs font-medium text-slate-500">
                Friends need the owner's exact name to join the same group.
              </span>
            </label>

            <label className="grid gap-2" htmlFor="room">
              <span className="text-sm font-bold text-slate-700">Room name</span>
              <input
                className={inputClass}
                id="room"
                type="text"
                value={roomName}
                placeholder="Example: friday-study-group"
                onChange={(event) => setRoomName(event.target.value)}
                required
              />
              <span className="text-xs font-medium text-slate-500">
                Room owner and room name are case-sensitive: Study and study are
                different rooms.
              </span>
            </label>

            <button
              className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-extrabold text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] transition hover:-translate-y-px hover:bg-blue-700"
              type="submit"
            >
              Join chat
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen p-0 text-slate-900 [font-family:Inter,Arial,sans-serif] md:p-6 ${pageBackground}`}
    >
      <div className="mx-auto grid h-screen min-h-screen w-full overflow-hidden bg-white shadow-[0_24px_70px_rgba(23,32,51,0.16)] md:h-[calc(100vh-3rem)] md:min-h-[42rem] md:max-w-[78rem] md:grid-cols-[19rem_minmax(0,1fr)] md:rounded-[1.35rem] md:border md:border-slate-200/90">
        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 bg-slate-50 p-5 md:flex md:flex-col md:items-stretch md:border-b-0 md:border-r">
          <BrandBlock eyebrow="ChatFlow" title="Workspace chat" compact />

          <section
            className="hidden rounded-2xl border border-slate-200 bg-white p-4 md:block"
            aria-labelledby="room-heading"
          >
            <p className={eyebrowClass} id="room-heading">
              Current room
            </p>
            <h2 className="mt-1 [overflow-wrap:anywhere] text-2xl font-extrabold">
              {roomLabel}
            </h2>
            <p className="mt-2 font-bold text-slate-500">{memberCount} online</p>
          </section>

          <section
            className="hidden min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-4 md:block"
            aria-labelledby="users-heading"
          >
            <div className="flex items-center justify-between gap-2">
              <p className={eyebrowClass} id="users-heading">
                Online now
              </p>
              <StatusDot />
            </div>
            <ul className="mt-4 grid gap-2">
              {users.map((user) => (
                <li
                  className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 font-bold text-slate-700 before:h-2 before:w-2 before:flex-none before:rounded-full before:bg-emerald-500 before:content-['']"
                  key={user.id}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </section>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 font-extrabold text-slate-600 transition hover:border-blue-200 hover:bg-blue-100 hover:text-blue-600 md:w-full"
            type="button"
            onClick={leaveRoom}
          >
            <i className="fas fa-sign-out-alt" aria-hidden="true" />
            Leave room
          </button>
        </aside>

        <section
          className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-[linear-gradient(rgba(248,250,252,0.9),rgba(248,250,252,0.9)),repeating-linear-gradient(45deg,transparent_0_18px,rgba(37,99,235,0.035)_18px_19px)]"
          aria-label={`${roomLabel} conversation`}
        >
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/85 p-4 backdrop-blur-xl md:min-h-24 md:px-6">
            <div>
              <p className={eyebrowClass}>Live conversation</p>
              <h1 className="mt-1 text-xl font-extrabold">{roomLabel}</h1>
            </div>
            <span className="hidden min-h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 sm:inline-flex">
              <StatusDot />
              Active
            </span>
          </header>

          <div className="min-h-0 overflow-y-auto p-4 scroll-smooth md:p-6" aria-live="polite">
            {messages.length === 0 ? (
              <div className="grid h-full place-content-center gap-3 text-center text-slate-500">
                <i className="fas fa-comments text-3xl text-slate-400" aria-hidden="true" />
                <p>No messages yet. Start the conversation.</p>
              </div>
            ) : (
              messages.map((item, index) =>
                item.type === "message" ? (
                  <article
                    className={[
                      "mb-4 w-fit max-w-[92%] [overflow-wrap:anywhere] border px-4 py-3 shadow-[0_10px_30px_rgba(23,32,51,0.08)] md:max-w-[min(38rem,82%)]",
                      item.username === currentUser
                        ? "ml-auto rounded-[1rem_1rem_0.3rem_1rem] border-blue-200 bg-white"
                        : "rounded-[1rem_1rem_1rem_0.3rem] border-blue-100 bg-blue-50",
                    ].join(" ")}
                    key={`${item.username}-${item.text}-${index}`}
                  >
                    <p className="mb-1 text-sm font-extrabold text-blue-700">
                      {item.username}
                    </p>
                    <p className="leading-6 text-slate-800">{item.text}</p>
                  </article>
                ) : (
                  <article
                    className={[
                      "mb-4 w-fit max-w-[92%] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(23,32,51,0.08)] md:max-w-[min(24rem,82%)]",
                      item.user === currentUser ? "ml-auto" : "",
                    ].join(" ")}
                    key={`${item.user}-${item.url}-${index}`}
                  >
                    <h3 className="mb-2 text-sm font-extrabold text-blue-700">
                      {item.user}
                    </h3>
                    <img
                      className="block h-40 w-40 rounded-xl object-cover"
                      src={item.url}
                      alt={`Shared by ${item.user}`}
                    />
                  </article>
                )
              )
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            className="grid grid-cols-[minmax(0,1fr)_3.15rem] gap-3 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl md:px-6 md:py-4"
            onSubmit={sendMessage}
          >
            <input
              className={inputClass}
              id="message"
              type="text"
              value={draft}
              placeholder="Write a message or try /gif"
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
              required
            />
            <button
              className="inline-flex min-h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700"
              type="submit"
              aria-label="Send message"
            >
              <i className="fas fa-paper-plane" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

type BrandBlockProps = {
  eyebrow: string;
  title: string;
  compact?: boolean;
};

function BrandBlock({ eyebrow, title, compact = false }: BrandBlockProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-700 text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
        <i className="fas fa-comment-dots" aria-hidden="true" />
      </span>
      <div>
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1
          className={
            compact
              ? "mt-0.5 hidden text-base font-extrabold leading-tight sm:block"
              : "mt-1 text-3xl font-extrabold sm:text-4xl"
          }
          id="join-title"
        >
          {title}
        </h1>
      </div>
    </div>
  );
}

function StatusDot() {
  return (
    <span
      className="inline-block h-2 w-2 flex-none rounded-full bg-emerald-500 shadow-[0_0_0_4px_#d1fae5]"
      aria-hidden="true"
    />
  );
}

export default App;
