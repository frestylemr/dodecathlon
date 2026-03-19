import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ── Constants ──────────────────────────────────────────────────────────────
const ROUNDS = [
  { name: "Round of 64", pts: 1 },
  { name: "Round of 32", pts: 2 },
  { name: "Sweet 16", pts: 4 },
  { name: "Elite 8", pts: 8 },
  { name: "Final Four", pts: 16 },
  { name: "Championship", pts: 32 },
];

const REGIONS = ["East", "West", "South", "Midwest"];
const SEEDS = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

const SPORTS = [
  { id: "ncaa", name: "NCAA Basketball", status: "active", description: "Standard bracket, 64 teams" },
  { id: "nba", name: "NBA Playoffs", status: "upcoming", description: "Coming soon" },
  { id: "nhl", name: "NHL Playoffs", status: "upcoming", description: "Coming soon" },
  { id: "mlb", name: "MLB / Baseball", status: "upcoming", description: "Coming soon" },
  { id: "golf", name: "Golf", status: "upcoming", description: "Coming soon" },
  { id: "tennis", name: "Tennis", status: "upcoming", description: "Coming soon" },
  { id: "nfl", name: "NFL", status: "upcoming", description: "Coming soon" },
  { id: "ncaafb", name: "NCAA Football", status: "upcoming", description: "Coming soon" },
  { id: "soccer", name: "Soccer", status: "upcoming", description: "Coming soon" },
  { id: "racing", name: "Racing", status: "upcoming", description: "Coming soon" },
  { id: "special", name: "Special Events", status: "upcoming", description: "Coming soon" },
  { id: "tbd", name: "TBD", status: "upcoming", description: "Coming soon" },
];

function generateBracket() {
  const bracket = [];
  REGIONS.forEach(region => {
    for (let i = 0; i < 8; i++) {
      bracket.push({
        id: `${region}-R1-G${i + 1}`, round: 0, region,
        home: `${region} ${SEEDS[i * 2]} seed`,
        away: `${region} ${SEEDS[i * 2 + 1]} seed`,
        gameNum: i + 1,
      });
    }
  });
  REGIONS.forEach(region => {
    for (let i = 0; i < 4; i++)
      bracket.push({ id: `${region}-R2-G${i + 1}`, round: 1, region, home: `W(${region}-R1-G${i * 2 + 1})`, away: `W(${region}-R1-G${i * 2 + 2})` });
  });
  REGIONS.forEach(region => {
    for (let i = 0; i < 2; i++)
      bracket.push({ id: `${region}-R3-G${i + 1}`, round: 2, region, home: `W(${region}-R2-G${i * 2 + 1})`, away: `W(${region}-R2-G${i * 2 + 2})` });
  });
  REGIONS.forEach(region =>
    bracket.push({ id: `${region}-R4-G1`, round: 3, region, home: `W(${region}-R3-G1)`, away: `W(${region}-R3-G2)` })
  );
  bracket.push({ id: "FF-G1", round: 4, region: "Final Four", home: "W(East-R4-G1)", away: "W(West-R4-G1)" });
  bracket.push({ id: "FF-G2", round: 4, region: "Final Four", home: "W(South-R4-G1)", away: "W(Midwest-R4-G1)" });
  bracket.push({ id: "CHAMP", round: 5, region: "Championship", home: "W(FF-G1)", away: "W(FF-G2)" });
  return bracket;
}

const ALL_GAMES = generateBracket();

// ── Styles ────────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; color: #e8e6e0; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }
  .nav-btn { background: none; border: none; cursor: pointer; color: #888; font-family: 'DM Sans', sans-serif; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 14px; border-radius: 4px; transition: all 0.2s; }
  .nav-btn:hover { color: #e8e6e0; background: rgba(255,255,255,0.05); }
  .nav-btn.active { color: #c9a84c; }
  .gold-btn { background: #c9a84c; color: #0a0a0f; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 22px; border-radius: 3px; transition: all 0.2s; }
  .gold-btn:hover { background: #e0be6a; }
  .gold-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .ghost-btn { background: none; border: 1px solid #333; color: #888; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; border-radius: 3px; transition: all 0.2s; }
  .ghost-btn:hover { border-color: #666; color: #ccc; }
  .danger-btn { background: none; border: 1px solid #4a2a2a; color: #c87d7d; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; border-radius: 3px; transition: all 0.2s; }
  .danger-btn:hover { background: #2a1a1a; }
  .card { background: #13131a; border: 1px solid #222; border-radius: 6px; }
  .input-field { background: #0f0f16; border: 1px solid #2a2a3a; color: #e8e6e0; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px 14px; border-radius: 4px; width: 100%; transition: border-color 0.2s; }
  .input-field:focus { outline: none; border-color: #c9a84c; }
  .pick-btn { background: #0f0f16; border: 1px solid #2a2a3a; color: #666; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 12px; border-radius: 3px; transition: all 0.15s; text-align: left; width: 100%; }
  .pick-btn:hover { border-color: #444; color: #aaa; }
  .pick-btn.selected { background: #1a2a1a; border-color: #4a8c4a; color: #7dc87d; }
  .pick-btn.correct { background: #1a2a1a; border-color: #4a8c4a; color: #7dc87d; }
  .pick-btn.wrong { background: #2a1a1a; border-color: #8c4a4a; color: #c87d7d; text-decoration: line-through; }
  .pick-btn.result { background: #1a1a2a; border-color: #4a4a8c; color: #7d7ddc; }
  .rank-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #2a2a2a; }
  .rank-num.top { color: #c9a84c; }
  .sport-pill { display: inline-block; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 12px; }
  .sport-pill.active { background: #1a2a1a; color: #7dc87d; border: 1px solid #2a4a2a; }
  .sport-pill.upcoming { background: #1a1a1a; color: #444; border: 1px solid #222; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 13px; z-index: 999; animation: fadeIn 0.2s ease; }
  .toast.success { background: #1a2a1a; border: 1px solid #2a4a2a; color: #7dc87d; }
  .toast.error { background: #2a1a1a; border: 1px solid #4a2a2a; color: #c87d7d; }
  .toast.info { background: #1a1a2a; border: 1px solid #2a2a4a; color: #7d7ddc; }
  .game-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #1a1a22; }
  .game-row:last-child { border-bottom: none; }
  .vs { font-size: 11px; color: #444; text-align: center; }
  .section-header { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin: 20px 0 10px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
  .form-error { font-size: 12px; color: #c87d7d; margin-top: 6px; }
  .tab-bar { display: flex; border-bottom: 1px solid #1a1a22; margin-bottom: 24px; gap: 0; }
  .tab-btn { background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #555; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 20px; transition: all 0.2s; margin-bottom: -1px; }
  .tab-btn:hover { color: #888; }
  .tab-btn.active { color: #c9a84c; border-bottom-color: #c9a84c; }
  .deadline-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; border-radius: 4px; }
  .deadline-badge.urgent { background: #2a1a1a; color: #c87d7d; border: 1px solid #4a2a2a; }
  .deadline-badge.soon { background: #2a2a1a; color: #c9a84c; border: 1px solid #4a3a1a; }
  .deadline-badge.ok { background: #1a2a1a; color: #7dc87d; border: 1px solid #2a4a2a; }
  @media (max-width: 640px) {
    .grid-2 { grid-template-columns: 1fr !important; }
    .grid-3 { grid-template-columns: 1fr 1fr !important; }
    .hide-mobile { display: none !important; }
  }
`;

// ── Email helpers ──────────────────────────────────────────────────────────
async function sendEmail(to, subject, html) {
  try {
    await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (e) {
    console.error('Email send failed:', e);
  }
}

function pickSheetEmailHtml(playerName, eventName, deadline) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e8e6e0; padding: 40px 32px;">
      <h1 style="font-size: 32px; color: #c9a84c; margin-bottom: 8px;">The Dodecathlon</h1>
      <p style="color: #888; margin-bottom: 32px; font-size: 14px;">Season picks competition</p>
      <h2 style="font-size: 20px; margin-bottom: 12px;">Time to submit your picks, ${playerName}!</h2>
      <p style="color: #aaa; line-height: 1.7; margin-bottom: 24px;">
        The <strong style="color: #e8e6e0;">${eventName}</strong> pick sheet is now open.
        Your picks are due by <strong style="color: #c9a84c;">${deadline}</strong>.
      </p>
      <a href="${window.location.origin}" style="display: inline-block; background: #c9a84c; color: #0a0a0f; text-decoration: none; padding: 12px 28px; border-radius: 3px; font-family: sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">Submit Your Picks</a>
      <p style="color: #444; font-size: 12px; margin-top: 32px;">You're receiving this because you're a Dodecathlon participant.</p>
    </div>
  `;
}

function reminderEmailHtml(playerName, eventName, deadline, hoursLeft) {
  const urgency = hoursLeft <= 24 ? '#c87d7d' : '#c9a84c';
  const label = hoursLeft <= 24 ? `${hoursLeft} hours left!` : '48 hours remaining';
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e8e6e0; padding: 40px 32px;">
      <h1 style="font-size: 32px; color: #c9a84c; margin-bottom: 8px;">The Dodecathlon</h1>
      <p style="color: #888; margin-bottom: 32px; font-size: 14px;">Pick deadline reminder</p>
      <div style="background: #1a1a1a; border-left: 3px solid ${urgency}; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
        <p style="color: ${urgency}; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">${label}</p>
        <p style="color: #aaa; font-size: 14px;">${eventName} picks due: <strong style="color: #e8e6e0;">${deadline}</strong></p>
      </div>
      <p style="color: #aaa; line-height: 1.7; margin-bottom: 24px;">Hey ${playerName} — don't forget to submit your ${eventName} picks before the deadline!</p>
      <a href="${window.location.origin}" style="display: inline-block; background: #c9a84c; color: #0a0a0f; text-decoration: none; padding: 12px 28px; border-radius: 3px; font-family: sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">Submit Now</a>
    </div>
  `;
}

// ── Score computation ──────────────────────────────────────────────────────
function computeScores(allPicks, results, players) {
  const scores = {};
  players.forEach(p => {
    scores[p.username] = { ncaa: 0, total: 0 };
    const pp = allPicks[p.username]?.ncaa || {};
    ALL_GAMES.forEach(game => {
      const pick = pp[game.id];
      const result = results[game.id];
      if (pick && result && pick === result) {
        scores[p.username].ncaa += ROUNDS[game.round].pts;
      }
    });
    scores[p.username].total = scores[p.username].ncaa;
  });
  return scores;
}

// ── Deadline helpers ───────────────────────────────────────────────────────
function getDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) return { label: 'Closed', type: 'urgent', hoursLeft: 0 };
  if (hoursLeft < 24) return { label: `${Math.round(hoursLeft)}h left`, type: 'urgent', hoursLeft: Math.round(hoursLeft) };
  if (hoursLeft < 48) return { label: `${Math.round(hoursLeft)}h left`, type: 'soon', hoursLeft: Math.round(hoursLeft) };
  return { label: deadline.toLocaleDateString(), type: 'ok', hoursLeft: Math.round(hoursLeft) };
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [players, setPlayers] = useState([]);
  const [allPicks, setAllPicks] = useState({});
  const [results, setResults] = useState({});
  const [events, setEvents] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth form state
  const [authTab, setAuthTab] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Commissioner state
  const [commTab, setCommTab] = useState("players");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [newPlayerUsername, setNewPlayerUsername] = useState("");
  const [newPlayerPassword, setNewPlayerPassword] = useState("");
  const [creatingPlayer, setCreatingPlayer] = useState(false);

  // Event management
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function checkSession() {
    const stored = localStorage.getItem('dodeca-user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setIsCommissioner(u.is_commissioner || false);
      setView("home");
    }
    setLoading(false);
  }

  async function loadData() {
    // Load players
    const { data: playersData } = await supabase.from('players').select('*').order('username');
    if (playersData) setPlayers(playersData);

    // Load all picks
    const { data: picksData } = await supabase.from('picks').select('*');
    if (picksData) {
      const pickMap = {};
      picksData.forEach(row => {
        if (!pickMap[row.username]) pickMap[row.username] = {};
        pickMap[row.username][row.sport] = row.picks;
      });
      setAllPicks(pickMap);
    }

    // Load results
    const { data: resultsData } = await supabase.from('results').select('*');
    if (resultsData) {
      const resultMap = {};
      resultsData.forEach(row => { resultMap[row.game_id] = row.winner; });
      setResults(resultMap);
    }

    // Load events
    const { data: eventsData } = await supabase.from('events').select('*').order('deadline');
    if (eventsData) setEvents(eventsData);
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Auth ────────────────────────────────────────────────────────────────
  async function handleLogin() {
    setAuthError(""); setAuthLoading(true);
    const identifier = authEmail.trim();
    const isEmail = identifier.includes('@');

    const query = isEmail
      ? supabase.from('players').select('*').eq('email', identifier).single()
      : supabase.from('players').select('*').eq('username', identifier).single();

    const { data: player, error } = await query;

    if (error || !player) {
      setAuthError("Account not found. Contact the commissioner to get access.");
      setAuthLoading(false); return;
    }

    if (player.password !== authPassword) {
      setAuthError("Incorrect password.");
      setAuthLoading(false); return;
    }

    const userData = { ...player };
    localStorage.setItem('dodeca-user', JSON.stringify(userData));
    setUser(userData);
    setIsCommissioner(player.is_commissioner || false);
    setView("home");
    setAuthLoading(false);
    showToast(`Welcome back, ${player.username}!`);
  }

  async function handleChangePassword() {
    if (!authPassword || authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters."); return;
    }
    const { error } = await supabase.from('players').update({ password: authPassword }).eq('username', user.username);
    if (error) { showToast("Failed to update password", "error"); return; }
    const updated = { ...user, password: authPassword };
    localStorage.setItem('dodeca-user', JSON.stringify(updated));
    setUser(updated);
    showToast("Password updated!");
    setAuthPassword("");
  }

  function handleLogout() {
    localStorage.removeItem('dodeca-user');
    setUser(null); setIsCommissioner(false);
    setView("login"); setAuthEmail(""); setAuthPassword("");
  }

  // ── Commissioner: create player ─────────────────────────────────────────
  async function handleCreatePlayer() {
    if (!newPlayerUsername || !newPlayerPassword || !newPlayerEmail) {
      showToast("Fill in all fields", "error"); return;
    }
    setCreatingPlayer(true);
    const { error } = await supabase.from('players').insert([{
      username: newPlayerUsername.trim(),
      email: newPlayerEmail.trim().toLowerCase(),
      password: newPlayerPassword,
      is_commissioner: false,
    }]);
    if (error) {
      showToast(error.message.includes('duplicate') ? "Username or email already exists" : "Failed to create player", "error");
      setCreatingPlayer(false); return;
    }
    showToast(`Player "${newPlayerUsername}" created!`);
    setNewPlayerUsername(""); setNewPlayerEmail(""); setNewPlayerPassword("");
    loadData();
    setCreatingPlayer(false);
  }

  async function handleDeletePlayer(username) {
    if (!window.confirm(`Remove ${username} from the league?`)) return;
    await supabase.from('players').delete().eq('username', username);
    showToast(`${username} removed`);
    loadData();
  }

  // ── Picks ────────────────────────────────────────────────────────────────
  async function savePick(gameId, winner) {
    if (!user) return;
    const currentPicks = allPicks[user.username]?.ncaa || {};
    const updated = { ...currentPicks, [gameId]: winner };

    const { error } = await supabase.from('picks').upsert({
      username: user.username,
      sport: 'ncaa',
      picks: updated,
    }, { onConflict: 'username,sport' });

    if (!error) {
      setAllPicks(prev => ({ ...prev, [user.username]: { ...prev[user.username], ncaa: updated } }));
    }
  }

  async function saveAllPicks() {
    const currentPicks = allPicks[user.username]?.ncaa || {};
    const { error } = await supabase.from('picks').upsert({
      username: user.username,
      sport: 'ncaa',
      picks: currentPicks,
    }, { onConflict: 'username,sport' });
    if (!error) showToast("All picks saved!");
    else showToast("Save failed", "error");
  }

  // ── Results ──────────────────────────────────────────────────────────────
  async function saveResult(gameId, winner) {
    const newResults = { ...results, [gameId]: results[gameId] === winner ? null : winner };
    const { error } = await supabase.from('results').upsert({ game_id: gameId, winner: newResults[gameId] }, { onConflict: 'game_id' });
    if (!error) setResults(newResults);
    else showToast("Failed to save result", "error");
  }

  // ── Events ───────────────────────────────────────────────────────────────
  async function saveEvent(ev) {
    if (ev.id) {
      await supabase.from('events').update(ev).eq('id', ev.id);
    } else {
      await supabase.from('events').insert([ev]);
    }
    setEditingEvent(null);
    loadData();
    showToast("Event saved!");
  }

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event?")) return;
    await supabase.from('events').delete().eq('id', id);
    loadData();
    showToast("Event deleted");
  }

  // ── Email actions ────────────────────────────────────────────────────────
  async function sendPickSheet(ev) {
    const deadline = new Date(ev.deadline).toLocaleString();
    let sent = 0;
    for (const player of players) {
      if (!player.email) continue;
      await sendEmail(player.email, `📋 ${ev.name} picks are open!`, pickSheetEmailHtml(player.username, ev.name, deadline));
      sent++;
    }
    showToast(`Pick sheet sent to ${sent} players!`);
  }

  async function sendReminder(ev, hoursLeft) {
    const deadline = new Date(ev.deadline).toLocaleString();
    let sent = 0;
    for (const player of players) {
      if (!player.email) continue;
      await sendEmail(player.email, `⏰ Reminder: ${ev.name} picks due soon!`, reminderEmailHtml(player.username, ev.name, deadline, hoursLeft));
      sent++;
    }
    showToast(`Reminder sent to ${sent} players!`);
  }

  // ── Computed ─────────────────────────────────────────────────────────────
  const scores = computeScores(allPicks, results, players);
  const sortedPlayers = [...players].sort((a, b) => (scores[b.username]?.total || 0) - (scores[a.username]?.total || 0));
  const myPicks = allPicks[user?.username]?.ncaa || {};
  const pickCount = Object.keys(myPicks).length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#c9a84c" }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e6e0" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      {user && (
        <div style={{ borderBottom: "1px solid #1a1a24", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, background: "#0a0a0f", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#c9a84c", cursor: "pointer" }} onClick={() => setView("home")}>DODECATHLON</span>
            <span style={{ width: 1, height: 20, background: "#222" }} />
            <nav style={{ display: "flex", gap: 2 }}>
              {[["home", "Home"], ["bracket", "Bracket"], ["standings", "Standings"], ["sports", "Sports"]].map(([v, l]) => (
                <button key={v} className={`nav-btn${view === v ? " active" : ""}`} onClick={() => setView(v)}>{l}</button>
              ))}
              {isCommissioner && <button className={`nav-btn${view === "commissioner" ? " active" : ""}`} onClick={() => setView("commissioner")}>⚙ Commissioner</button>}
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isCommissioner && <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#7dc87d", background: "#1a2a1a", border: "1px solid #2a4a2a", padding: "3px 8px", borderRadius: 12 }}>Commissioner</span>}
            <span style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#888" }}>{user.username}</span>
            <button className="ghost-btn" onClick={() => setView("profile")}>Profile</button>
            <button className="ghost-btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── LOGIN ── */}
        {view === "login" && (
          <div className="fade-in" style={{ maxWidth: 400, margin: "60px auto 0" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#c9a84c", marginBottom: 8 }}>DODECATHLON</h1>
              <p style={{ color: "#555", fontSize: 14 }}>Season-long sports picks competition</p>
            </div>
            <div className="card" style={{ padding: 32 }}>
              <div className="tab-bar" style={{ marginBottom: 24 }}>
                {[["login", "Log in"], ["help", "Need help?"]].map(([t, l]) => (
                  <button key={t} className={`tab-btn${authTab === t ? " active" : ""}`} onClick={() => { setAuthTab(t); setAuthError(""); }}>{l}</button>
                ))}
              </div>

              {authTab === "login" && <>
                <div className="form-group">
                  <label className="form-label">Username or email</label>
                  <input className="input-field" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your username or email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="input-field" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter your password" />
                </div>
                {authError && <p className="form-error" style={{ marginBottom: 12 }}>{authError}</p>}
                <button className="gold-btn" style={{ width: "100%" }} onClick={handleLogin} disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Log in"}
                </button>
              </>}

              {authTab === "help" && (
                <div style={{ color: "#888", fontSize: 14, lineHeight: 1.7 }}>
                  <p style={{ marginBottom: 12 }}>Accounts are created by the commissioner. If you don't have access yet, contact <strong style={{ color: "#e8e6e0" }}>Marcin</strong> to get set up.</p>
                  <p>Once you have your username and password, you can log in and change your password anytime from your profile page.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HOME ── */}
        {view === "home" && user && (
          <div className="fade-in">
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, marginBottom: 6 }}>
                Welcome back, <span style={{ color: "#c9a84c" }}>{user.username}</span>
              </h1>
              <p style={{ color: "#555", fontSize: 14 }}>Season {new Date().getFullYear()} · {players.length} players</p>
            </div>

            {/* Active events */}
            {events.filter(e => e.is_active).length > 0 && (
              <>
                <div className="section-header">Active events</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 32 }} className="grid-2">
                  {events.filter(e => e.is_active).map(ev => {
                    const status = getDeadlineStatus(ev.deadline);
                    return (
                      <div key={ev.id} className="card" style={{ padding: 24, cursor: "pointer" }} onClick={() => setView(ev.sport_id)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, color: "#c9a84c", letterSpacing: "0.06em", textTransform: "uppercase" }}>{ev.name}</div>
                          {status && <span className={`deadline-badge ${status.type}`}>{status.label}</span>}
                        </div>
                        <div style={{ color: "#555", fontSize: 13, marginBottom: 12 }}>{ev.description}</div>
                        {ev.sport_id === "ncaa" && (
                          <div style={{ color: "#7dc87d", fontSize: 12 }}>{pickCount} / 63 picks made</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Quick stats */}
            <div className="section-header">Your standings</div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ fontFamily: "'Playfair Display'", fontSize: 48, fontWeight: 900, color: "#c9a84c" }}>
                  #{sortedPlayers.findIndex(p => p.username === user.username) + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: "#888", marginBottom: 4 }}>Current rank</div>
                  <div style={{ fontFamily: "'Playfair Display'", fontSize: 24, fontWeight: 700 }}>
                    {scores[user.username]?.total || 0} <span style={{ fontSize: 14, color: "#555", fontFamily: "'DM Sans'" }}>pts total</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>NCAA: {scores[user.username]?.ncaa || 0} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BRACKET ── */}
        {view === "bracket" && user && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>NCAA Bracket</h2>
                <p style={{ color: "#555", fontSize: 13 }}>Pick the winner of all 63 games. Points double each round.</p>
              </div>
              <button className="gold-btn" onClick={saveAllPicks}>{pickCount} / 63 saved</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="grid-2">
              {ROUNDS.map((round, ri) => (
                <div key={ri} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 700 }}>{round.name}</span>
                    <span style={{ fontSize: 11, color: "#c9a84c", background: "#1a160a", padding: "3px 8px", borderRadius: 10 }}>{round.pts} pt{round.pts > 1 ? "s" : ""}</span>
                  </div>
                  {ALL_GAMES.filter(g => g.round === ri).map(game => {
                    const myPick = myPicks[game.id];
                    const result = results[game.id];
                    const homeClass = myPick === game.home ? (result ? (result === game.home ? " correct" : " wrong") : " selected") : (result === game.home ? " result" : "");
                    const awayClass = myPick === game.away ? (result ? (result === game.away ? " correct" : " wrong") : " selected") : (result === game.away ? " result" : "");
                    return (
                      <div key={game.id} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
                          {game.region}{ri === 0 ? ` · Game ${game.gameNum}` : ""}
                        </div>
                        <div className="game-row">
                          <button className={`pick-btn${homeClass}`} onClick={() => savePick(game.id, game.home)}>
                            <span style={{ fontSize: 11 }}>{game.home.length > 22 ? game.home.slice(0, 22) + "…" : game.home}</span>
                          </button>
                          <span className="vs">vs</span>
                          <button className={`pick-btn${awayClass}`} onClick={() => savePick(game.id, game.away)}>
                            <span style={{ fontSize: 11 }}>{game.away.length > 22 ? game.away.slice(0, 22) + "…" : game.away}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STANDINGS ── */}
        {view === "standings" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Standings</h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Season leaderboard across all categories</p>
            <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
              {sortedPlayers.map((p, idx) => {
                const s = scores[p.username] || {};
                const isMe = p.username === user?.username;
                return (
                  <div key={p.username} style={{ display: "flex", alignItems: "center", padding: "18px 24px", borderBottom: idx < sortedPlayers.length - 1 ? "1px solid #1a1a22" : "none", background: isMe ? "rgba(201,168,76,0.04)" : "transparent" }}>
                    <div className={`rank-num${idx < 3 ? " top" : ""}`} style={{ width: 48, fontSize: idx === 0 ? 32 : 24 }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 700, color: isMe ? "#c9a84c" : "#e8e6e0", marginBottom: 2 }}>
                        {p.username}{isMe && <span style={{ fontSize: 11, color: "#c9a84c", marginLeft: 8 }}>you</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "#555" }}>NCAA: <span style={{ color: "#888" }}>{s.ncaa || 0}</span></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 22, fontWeight: 700, color: idx === 0 ? "#c9a84c" : "#e8e6e0" }}>{s.total || 0}</div>
                      <div style={{ fontSize: 11, color: "#444" }}>total pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SPORTS ── */}
        {view === "sports" && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>All Categories</h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>The 12 Dodecathlon sport categories</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="grid-3">
              {SPORTS.map((sport, i) => (
                <div key={sport.id} className="card" style={{ padding: 20, opacity: sport.status === "upcoming" ? 0.6 : 1 }}>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Category {i + 1}</div>
                  <div style={{ fontFamily: "'Playfair Display'", fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{sport.name}</div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>{sport.description}</div>
                  <span className={`sport-pill ${sport.status}`}>{sport.status === "active" ? "Active" : "Coming soon"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {view === "profile" && user && (
          <div className="fade-in" style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Profile</h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Manage your account settings</p>
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
              <div className="section-header" style={{ marginTop: 0 }}>Account info</div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>Username: <span style={{ color: "#e8e6e0" }}>{user.username}</span></div>
              <div style={{ fontSize: 14, color: "#888" }}>Email: <span style={{ color: "#e8e6e0" }}>{user.email || "—"}</span></div>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div className="section-header" style={{ marginTop: 0 }}>Change password</div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input className="input-field" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              {authError && <p className="form-error" style={{ marginBottom: 12 }}>{authError}</p>}
              <button className="gold-btn" onClick={handleChangePassword}>Update password</button>
            </div>
          </div>
        )}

        {/* ── COMMISSIONER ── */}
        {view === "commissioner" && isCommissioner && (
          <div className="fade-in">
            <h2 style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Commissioner Panel</h2>
            <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>Manage players, events, results, and notifications</p>

            <div className="tab-bar">
              {[["players", "Players"], ["events", "Events"], ["results", "Results"], ["emails", "Emails"]].map(([t, l]) => (
                <button key={t} className={`tab-btn${commTab === t ? " active" : ""}`} onClick={() => setCommTab(t)}>{l}</button>
              ))}
            </div>

            {/* Players tab */}
            {commTab === "players" && (
              <div>
                <div className="section-header">Create new player</div>
                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "end" }} className="grid-2">
                    <div>
                      <label className="form-label">Username</label>
                      <input className="input-field" value={newPlayerUsername} onChange={e => setNewPlayerUsername(e.target.value)} placeholder="e.g. Marcin" />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input className="input-field" value={newPlayerEmail} onChange={e => setNewPlayerEmail(e.target.value)} placeholder="player@email.com" />
                    </div>
                    <div>
                      <label className="form-label">Password</label>
                      <input className="input-field" value={newPlayerPassword} onChange={e => setNewPlayerPassword(e.target.value)} placeholder="Temporary password" />
                    </div>
                    <button className="gold-btn" onClick={handleCreatePlayer} disabled={creatingPlayer}>
                      {creatingPlayer ? "..." : "Add"}
                    </button>
                  </div>
                </div>

                <div className="section-header">Current players ({players.length})</div>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {players.map((p, i) => (
                    <div key={p.username} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < players.length - 1 ? "1px solid #1a1a22" : "none" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{p.username}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>{p.email || "No email"}{p.is_commissioner ? " · Commissioner" : ""}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "#888", marginRight: 16 }}>{scores[p.username]?.total || 0} pts</div>
                      {!p.is_commissioner && (
                        <button className="danger-btn" onClick={() => handleDeletePlayer(p.username)}>Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events tab */}
            {commTab === "events" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div className="section-header" style={{ margin: 0 }}>Manage events</div>
                  <button className="gold-btn" onClick={() => setEditingEvent({ name: "", sport_id: "ncaa", description: "", deadline: "", is_active: true })}>+ New event</button>
                </div>

                {editingEvent && (
                  <div className="card" style={{ padding: 24, marginBottom: 24, border: "1px solid #c9a84c33" }}>
                    <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                      {editingEvent.id ? "Edit event" : "New event"}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }} className="grid-2">
                      <div>
                        <label className="form-label">Event name</label>
                        <input className="input-field" value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} placeholder="e.g. NCAA Tournament 2025" />
                      </div>
                      <div>
                        <label className="form-label">Sport</label>
                        <select className="input-field" value={editingEvent.sport_id} onChange={e => setEditingEvent({ ...editingEvent, sport_id: e.target.value })}>
                          {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Pick deadline</label>
                        <input className="input-field" type="datetime-local" value={editingEvent.deadline} onChange={e => setEditingEvent({ ...editingEvent, deadline: e.target.value })} />
                      </div>
                      <div>
                        <label className="form-label">Description</label>
                        <input className="input-field" value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Short description" />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <input type="checkbox" id="is-active" checked={editingEvent.is_active} onChange={e => setEditingEvent({ ...editingEvent, is_active: e.target.checked })} />
                      <label htmlFor="is-active" style={{ fontSize: 13, color: "#888", cursor: "pointer" }}>Show on home screen (active)</label>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="gold-btn" onClick={() => saveEvent(editingEvent)}>Save event</button>
                      <button className="ghost-btn" onClick={() => setEditingEvent(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {events.length === 0 && (
                  <div className="card" style={{ padding: 24, textAlign: "center", color: "#555" }}>No events yet. Create your first one above.</div>
                )}

                {events.map(ev => {
                  const status = getDeadlineStatus(ev.deadline);
                  return (
                    <div key={ev.id} className="card" style={{ padding: 20, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 700 }}>{ev.name}</span>
                            {ev.is_active && <span className="sport-pill active">Active</span>}
                            {status && <span className={`deadline-badge ${status.type}`}>{status.label}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "#555" }}>{ev.description} · Deadline: {ev.deadline ? new Date(ev.deadline).toLocaleString() : "Not set"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="ghost-btn" onClick={() => setEditingEvent(ev)}>Edit</button>
                          <button className="danger-btn" onClick={() => deleteEvent(ev.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Results tab */}
            {commTab === "results" && (
              <div>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>Click the winning team for each game. Scores update instantly for all players.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="grid-2">
                  {ROUNDS.map((round, ri) => (
                    <div key={ri} className="card" style={{ padding: 20 }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{round.name}</div>
                      {ALL_GAMES.filter(g => g.round === ri).map(game => {
                        const result = results[game.id];
                        return (
                          <div key={game.id} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{game.region}</div>
                            <div className="game-row">
                              <button className={`pick-btn${result === game.home ? " result" : ""}`} onClick={() => saveResult(game.id, game.home)}>
                                <span style={{ fontSize: 11 }}>{game.home.length > 22 ? game.home.slice(0, 22) + "…" : game.home}</span>
                              </button>
                              <span className="vs">vs</span>
                              <button className={`pick-btn${result === game.away ? " result" : ""}`} onClick={() => saveResult(game.id, game.away)}>
                                <span style={{ fontSize: 11 }}>{game.away.length > 22 ? game.away.slice(0, 22) + "…" : game.away}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emails tab */}
            {commTab === "emails" && (
              <div>
                <p style={{ color: "#555", fontSize: 13, marginBottom: 20 }}>Send pick sheets and reminders to all players. Emails are sent to every player with an email address on file.</p>
                {events.length === 0 && (
                  <div className="card" style={{ padding: 24, textAlign: "center", color: "#555" }}>Create an event first to send emails.</div>
                )}
                {events.map(ev => {
                  const status = getDeadlineStatus(ev.deadline);
                  return (
                    <div key={ev.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                      <div style={{ fontFamily: "'Playfair Display'", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{ev.name}</div>
                      <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
                        Deadline: {ev.deadline ? new Date(ev.deadline).toLocaleString() : "Not set"}
                        {status && <span className={`deadline-badge ${status.type}`} style={{ marginLeft: 10 }}>{status.label}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="gold-btn" onClick={() => sendPickSheet(ev)}>📋 Send pick sheet</button>
                        <button className="ghost-btn" onClick={() => sendReminder(ev, 48)}>⏰ Send 48hr reminder</button>
                        <button className="ghost-btn" onClick={() => sendReminder(ev, 24)}>⏰ Send 24hr reminder</button>
                        <button className="ghost-btn" onClick={() => sendReminder(ev, 12)}>⏰ Send day-of reminder</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
