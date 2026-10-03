import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Home,
  Play,
  Search,
  Send,
  Heart,
  User,
  Settings,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { AppProvider, useC } from "./context/AppContext";
import { Auth, PwaInstallButton } from "./components/Shared";
import CallOverlay from "./components/CallOverlay";
import Modals from "./components/Modals";
import HomePage from "./pages/HomePage";
import ReelsPage from "./pages/ReelsPage";
import SearchPage from "./pages/SearchPage";
import ExplorePage from "./pages/ExplorePage";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

function PwaUpdatePrompt({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-[100] px-3">
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex min-h-14 w-full max-w-[360px] items-center gap-3 rounded-xl border border-neutral-200 bg-white/95 p-2.5 pl-3 text-sm shadow-[0_12px_36px_rgba(0,0,0,.22)] backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <RefreshCw size={17} />
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold">
          Yangi versiya tayyor
        </span>
        <button
          onClick={() =>
            window.dispatchEvent(new Event("instakids-activate-update"))
          }
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white transition hover:bg-sky-500"
        >
          <RefreshCw size={15} /> Yangilash
        </button>
      </div>
    </div>
  );
}

function SaveLoginPrompt({ account, close }) {
  const [error, setError] = useState("");
  if (!account) return null;
  const save = async () => {
    if (
      !window.PasswordCredential ||
      typeof navigator.credentials?.store !== "function"
    ) {
      setError(
        "Bu brauzer parolni to‘g‘ridan-to‘g‘ri saqlashni qo‘llamaydi. Brauzerning password manager sozlamalarini tekshiring.",
      );
      return;
    }
    try {
      await navigator.credentials.store(
        new window.PasswordCredential({
          id: account.username,
          password: account.password,
          name: account.username,
        }),
      );
      close();
    } catch {
      setError(
        "Parol saqlanmadi. Brauzerda parol saqlashga ruxsat berilganini tekshiring.",
      );
    }
  };
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-login-title"
        className="w-full max-w-[390px] overflow-hidden rounded-3xl border border-white/15 bg-white text-neutral-900 shadow-[0_28px_90px_rgba(0,0,0,.35)] dark:bg-[#101a30] dark:text-white"
      >
        <div className="bg-gradient-to-br from-fuchsia-600 via-violet-600 to-sky-500 px-6 pb-7 pt-6 text-white">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <KeyRound size={27} />
          </div>
          <h2 id="save-login-title" className="text-xl font-extrabold">
            Kirish ma’lumotlarini saqlaymizmi?
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/85">
            Keyingi safar tez kirish uchun akkaunt va parolni brauzerning xavfsiz
            password manager’ida saqlang.
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 dark:border-white/10 dark:bg-white/5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300">
              <ShieldCheck size={21} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{account.username}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Parol faqat brauzerda saqlanadi
              </p>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-500">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={close}
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold transition hover:bg-neutral-100 dark:border-white/15 dark:hover:bg-white/10"
            >
              Hozir emas
            </button>
            <button
              onClick={save}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:brightness-110"
            >
              Saqlash
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ProfilePage id={id} goChat={(userId) => navigate(`/messages/${userId}`)} />
  );
}

function MessagesRoute() {
  const { id } = useParams();
  const { peer, setPeer } = useC();
  const navigate = useNavigate();
  const choosePeer = (userId) => {
    setPeer(userId);
    navigate(userId ? `/messages/${userId}` : "/messages");
  };
  const currentPeer = id || peer || null;
  return <MessagesPage peer={currentPeer} setPeer={choosePeer} />;
}

function AppShell() {
  const { me, A, unreadN, unreadM, accessInfo } = useC();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pwaUpdateReady, setPwaUpdateReady] = useState(false);
  const [saveLoginAccount, setSaveLoginAccount] = useState(null);

  useEffect(() => {
    const askToSaveLogin = (event) => setSaveLoginAccount(event.detail);
    window.addEventListener("instakids-save-login", askToSaveLogin);
    const showUpdate = () => setPwaUpdateReady(true);
    if ("serviceWorker" in navigator) {
      window.addEventListener("instakids-update-ready", showUpdate);
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration?.waiting && navigator.serviceWorker.controller)
            showUpdate();
        })
        .catch(() => {});
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.waiting && navigator.serviceWorker.controller)
            showUpdate();
        })
        .catch(() => {});
    }
    return () => {
      window.removeEventListener("instakids-update-ready", showUpdate);
      window.removeEventListener("instakids-save-login", askToSaveLogin);
    };
  }, []);

  if (!me)
    return (
      <>
        <Auth A={A} accessInfo={accessInfo} />
        <PwaUpdatePrompt visible={pwaUpdateReady} />
        <SaveLoginPrompt
          account={saveLoginAccount}
          close={() => setSaveLoginAccount(null)}
        />
      </>
    );

  const isAdmin = me.isAdmin;
  const nav = [
    ["/", Home, "Home", unreadN * 0],
    ["/reels", Play, "Reels"],
    ["/notifications", Heart, "Notifications", unreadN],
    ["/search", Search, "Search"],
    ["/messages", Send, "Messages", unreadM],
    [`/profile/${me.id}`, User, me.username],
    ...(isAdmin ? [["/admin", Settings, "Admin"]] : []),
  ];

  const conversationOpen = /^\/messages\/[^/]+$/.test(pathname);
  const active = pathname.startsWith("/profile/")
    ? "/profile/" + me.id
    : pathname;
  const go = (path) => navigate(path);
  const Badge = ({ n }) =>
    n > 0 ? (
      <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff3040] px-1 text-[10px] font-bold text-white">
        {n}
      </span>
    ) : null;
  return (
    <div
      className={`min-h-screen bg-white text-neutral-900 dark:bg-[#0b1224] dark:text-neutral-100 ${conversationOpen ? "conversation-open" : ""}`}
    >
      <aside className="ig-sidebar fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-neutral-200 bg-white px-3 pb-5 pt-7 dark:border-[#1d2a45] dark:bg-[#070b19] md:flex">
        <nav className="space-y-1">
          {nav.map(([path, I, label, badge]) => (
            <button
              key={path}
              onClick={() => go(path)}
              className="group flex w-full items-center gap-4 rounded-xl p-3.5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <span
                className={`relative transition group-hover:scale-110 ${active === path ? "text-[#f5a400]" : ""}`}
              >
                <I size={26} strokeWidth={active === path ? 2.8 : 1.8} />
                <Badge n={badge} />
              </span>
              <span
                className={`sidebar-label text-[15px] ${active === path ? "font-bold" : ""}`}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-neutral-200 pt-3 dark:border-[#1d2a45]">
          <PwaInstallButton iconOnly />
        </div>
      </aside>

      {!conversationOpen && (
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-[#1d2a45] dark:bg-[#070b19] md:hidden">
          <span className="font-logo text-2xl text-neutral-900 dark:text-white">
            InstaKids
          </span>
          <div className="flex items-center gap-3">
            <PwaInstallButton compact />
            <button
              onClick={() => navigate("/notifications")}
              aria-label="Bildirishnomalar"
              className="relative p-1"
            >
              <Heart size={23} />
              <Badge n={unreadN} />
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                aria-label="Admin panel"
                className="p-1"
              >
                <Settings size={22} />
              </button>
            )}
          </div>
        </header>
      )}

      <div
        className={`app-page-shell ${conversationOpen ? "pb-0" : "pb-16"} md:pb-0`}
      >
        {accessInfo.restriction?.active && (
          <div
            role="status"
            className="mx-auto mt-3 max-w-[900px] rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          >
            Admin cheklovi faol. Xabar, like va follow vaqtincha ishlamaydi.
            Tugash vaqti:{" "}
            {new Date(accessInfo.restriction.until).toLocaleString("uz-UZ")}.
          </div>
        )}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagesRoute />} />
          <Route path="/messages/:id" element={<MessagesRoute />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile/:id" element={<ProfileRoute />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!conversationOpen && (
        <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-neutral-200 bg-white dark:border-[#1d2a45] dark:bg-[#070b19] md:hidden">
          {nav
            .filter(
              (x) =>
                [
                  "/",
                  "/reels",
                  "/messages",
                  "/search",
                  `/profile/${me.id}`,
                ].includes(x[0]) ||
                (isAdmin && x[0] === "/admin"),
            )
            .map(([path, I, , badge]) => (
              <button
                key={path}
                onClick={() => go(path)}
                className={`relative p-2 ${active === path ? "text-[#f5a400]" : ""}`}
              >
                <I size={26} strokeWidth={active === path ? 2.8 : 1.8} />
                <Badge n={badge} />
              </button>
            ))}
        </nav>
      )}
      <CallOverlay />
      <Modals />
      <PwaUpdatePrompt visible={pwaUpdateReady} />
      <SaveLoginPrompt
        account={saveLoginAccount}
        close={() => setSaveLoginAccount(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
