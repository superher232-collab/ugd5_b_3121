"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Position { x: number; y: number; }
interface Enemy { id: number; x: number; y: number; health: number; maxHealth: number; }
interface Bullet { id: number; x: number; y: number; dx: number; dy: number; }

const ARENA_W = 560;
const ARENA_H = 380;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 28;
const BULLET_SIZE = 8;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 7;
const SHOOT_INTERVAL = 500;
const ENEMY_SPEED = 1.5;

interface GameData {
  player: Position;
  enemies: Enemy[];
  bullets: Bullet[];
  health: number;
  xp: number;
  level: number;
  wave: number;
  score: number;
  kills: number;
  running: boolean;
}

export default function Game2() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [display, setDisplay] = useState({
    player: { x: ARENA_W / 2, y: ARENA_H / 2 } as Position,
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    health: 100, xp: 0, level: 1, wave: 1, score: 0, kills: 0,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const gameRef = useRef<GameData>({
    player: { x: ARENA_W / 2, y: ARENA_H / 2 },
    enemies: [], bullets: [],
    health: 100, xp: 0, level: 1, wave: 1, score: 0, kills: 0, running: false,
  });
  const loopRef = useRef<number | null>(null);
  const shootRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCount = useRef(0);

  const xpToLevel = useCallback((lvl: number) => lvl * 30, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const spawn = () => {
      const g = gameRef.current;
      const count = g.wave * 2 + 2;
      for (let i = 0; i < count; i++) {
        const side = Math.floor(Math.random() * 4);
        const hp = 1 + Math.floor(g.wave / 3);
        let x = 0, y = 0;
        switch (side) {
          case 0: x = Math.random() * ARENA_W; y = -ENEMY_SIZE; break;
          case 1: x = ARENA_W + ENEMY_SIZE; y = Math.random() * ARENA_H; break;
          case 2: x = Math.random() * ARENA_W; y = ARENA_H + ENEMY_SIZE; break;
          case 3: x = -ENEMY_SIZE; y = Math.random() * ARENA_H; break;
        }
        g.enemies.push({ id: Date.now() + i + Math.random(), x, y, health: hp, maxHealth: hp });
      }
    };
    spawn();
    spawnRef.current = setInterval(() => {
      gameRef.current.wave++;
      spawn();
    }, 8000);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;
    shootRef.current = setInterval(() => {
      const g = gameRef.current;
      if (g.enemies.length === 0) return;
      let nearest = g.enemies[0];
      let minDist = Infinity;
      for (const e of g.enemies) {
        const d = Math.hypot(e.x - g.player.x, e.y - g.player.y);
        if (d < minDist) { minDist = d; nearest = e; }
      }
      const angle = Math.atan2(nearest.y - g.player.y, nearest.x - g.player.x);
      g.bullets.push({
        id: Date.now() + Math.random(),
        x: g.player.x, y: g.player.y,
        dx: Math.cos(angle) * BULLET_SPEED,
        dy: Math.sin(angle) * BULLET_SPEED,
      });
    }, SHOOT_INTERVAL);
    return () => { if (shootRef.current) clearInterval(shootRef.current); };
  }, [gameState]);

  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;
    const keys = keysRef.current;

    if (keys.has("w") || keys.has("arrowup")) g.player.y = Math.max(PLAYER_SIZE / 2, g.player.y - PLAYER_SPEED);
    if (keys.has("s") || keys.has("arrowdown")) g.player.y = Math.min(ARENA_H - PLAYER_SIZE / 2, g.player.y + PLAYER_SPEED);
    if (keys.has("a") || keys.has("arrowleft")) g.player.x = Math.max(PLAYER_SIZE / 2, g.player.x - PLAYER_SPEED);
    if (keys.has("d") || keys.has("arrowright")) g.player.x = Math.min(ARENA_W - PLAYER_SIZE / 2, g.player.x + PLAYER_SPEED);

    for (let i = g.bullets.length - 1; i >= 0; i--) {
      const b = g.bullets[i];
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < -10 || b.x > ARENA_W + 10 || b.y < -10 || b.y > ARENA_H + 10) {
        g.bullets.splice(i, 1);
      }
    }

    for (let i = g.enemies.length - 1; i >= 0; i--) {
      const e = g.enemies[i];
      const angle = Math.atan2(g.player.y - e.y, g.player.x - e.x);
      e.x += Math.cos(angle) * ENEMY_SPEED;
      e.y += Math.sin(angle) * ENEMY_SPEED;

      for (let j = g.bullets.length - 1; j >= 0; j--) {
        if (Math.hypot(g.bullets[j].x - e.x, g.bullets[j].y - e.y) < (ENEMY_SIZE + BULLET_SIZE) / 2) {
          e.health--;
          g.bullets.splice(j, 1);
          break;
        }
      }

      if (e.health <= 0) {
        g.enemies.splice(i, 1);
        g.score += 10;
        g.xp += 5;
        g.kills++;

        if (g.xp >= xpToLevel(g.level)) {
          g.xp = 0;
          g.level++;
          g.health = Math.min(g.health + 20, 100);
        }
        continue;
      }

      if (Math.hypot(g.player.x - e.x, g.player.y - e.y) < (PLAYER_SIZE + ENEMY_SIZE) / 2) {
        g.health -= 5;
        if (g.health <= 0) {
          g.health = 0;
          g.running = false;
          setDisplay({
            player: { ...g.player }, enemies: [...g.enemies], bullets: [...g.bullets],
            health: 0, xp: g.xp, level: g.level, wave: g.wave, score: g.score, kills: g.kills,
          });
          setGameState("gameover");
          return;
        }
      }
    }

    frameCount.current++;
    if (frameCount.current % 3 === 0) {
      setDisplay({
        player: { ...g.player },
        enemies: g.enemies.map((e) => ({ ...e })),
        bullets: g.bullets.map((b) => ({ ...b })),
        health: g.health, xp: g.xp, level: g.level, wave: g.wave, score: g.score, kills: g.kills,
      });
    }

    loopRef.current = requestAnimationFrame(gameLoop);
  }, [xpToLevel]);

  useEffect(() => {
    if (gameState !== "playing") {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return;
    }
    gameRef.current.running = true;
    loopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      gameRef.current.running = false;
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameState, gameLoop]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.player = { x: ARENA_W / 2, y: ARENA_H / 2 };
    g.health = 100; g.xp = 0; g.level = 1; g.wave = 1;
    g.enemies = []; g.bullets = []; g.score = 0; g.kills = 0;
    frameCount.current = 0;
    keysRef.current.clear();
    setDisplay({ player: { ...g.player }, enemies: [], bullets: [], health: 100, xp: 0, level: 1, wave: 1, score: 0, kills: 0 });
    setGameState("playing");
  }, []);

  const { player, enemies, bullets, health, xp, level, wave, score, kills } = display;
  const xpNeeded = xpToLevel(level);
  const healthColor = health > 60 ? "#4caf50" : health > 30 ? "#ff9800" : "#f44336";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "white", margin: 0, textShadow: "0 0 20px rgba(156,39,176,0.4)" }}>💩 Poop Survivors</h2>

      {/* Stats */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "SCORE", value: score, bg: "linear-gradient(135deg, #667eea, #764ba2)" },
          { label: "LEVEL", value: level, bg: "linear-gradient(135deg, #f093fb, #f5576c)" },
          { label: "WAVE", value: wave, bg: "linear-gradient(135deg, #fa709a, #fee140)" },
          { label: "KILLS", value: kills, bg: "linear-gradient(135deg, #a18cd1, #fbc2eb)" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, padding: "6px 14px", borderRadius: "12px", textAlign: "center", minWidth: "70px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "1px" }}>{s.label}</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ width: ARENA_W, display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>❤️</span>
          <div style={{ flex: 1, height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${health}%`, background: `linear-gradient(90deg, ${healthColor}, ${healthColor}cc)`, borderRadius: "5px", transition: "width 0.15s", boxShadow: `0 0 8px ${healthColor}60` }} />
          </div>
          <span style={{ fontSize: "12px", color: healthColor, fontWeight: 700, minWidth: "30px" }}>{health}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>⭐</span>
          <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(xp / xpNeeded) * 100}%`, background: "linear-gradient(90deg, #667eea, #f093fb)", borderRadius: "3px", transition: "width 0.15s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 600, minWidth: "50px" }}>{xp}/{xpNeeded}</span>
        </div>
      </div>

      {/* Arena */}
      <div style={{
        width: ARENA_W, height: ARENA_H,
        background: "radial-gradient(ellipse at center, #1a1a3e 0%, #0d0d1f 100%)",
        borderRadius: "20px", position: "relative", overflow: "hidden",
        boxShadow: "0 0 40px rgba(0,0,0,0.5), inset 0 0 80px rgba(0,0,0,0.4)",
        border: "2px solid rgba(255,255,255,0.08)",
      }} tabIndex={0}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        {/* Idle */}
        {gameState === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "radial-gradient(ellipse at center, rgba(102,126,234,0.15), rgba(0,0,0,0.7))", zIndex: 10 }}>
            <div style={{ fontSize: "56px", animation: "bounce 1.5s ease-in-out infinite" }}>💩</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0, textAlign: "center" }}>WASD / Arrow Keys untuk bergerak<br />Auto-shoot ke musuh terdekat!</p>
            <button onClick={startGame} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "14px 36px", borderRadius: "14px", fontSize: "16px", cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 20px rgba(102,126,234,0.4)", transition: "transform 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px) scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}>
              ▶ Start Survival
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameState === "gameover" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "radial-gradient(ellipse at center, rgba(244,67,54,0.15), rgba(0,0,0,0.85))", zIndex: 10 }}>
            <div style={{ fontSize: "48px" }}>💀</div>
            <h2 style={{ color: "#f44336", fontSize: "28px", fontWeight: 800, margin: 0, textShadow: "0 0 20px rgba(244,67,54,0.5)" }}>GAME OVER</h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              {[{ l: "Score", v: score }, { l: "Level", v: level }, { l: "Wave", v: wave }, { l: "Kills", v: kills }].map((s) => (
                <div key={s.l} style={{ background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontSize: "18px", color: "white", fontWeight: 800 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <button onClick={startGame} style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", padding: "10px 28px", borderRadius: "12px", fontSize: "15px", cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 20px rgba(102,126,234,0.4)" }}>
              🔄 Retry
            </button>
          </div>
        )}

        {/* Player */}
        <div style={{ position: "absolute", left: player.x - PLAYER_SIZE / 2, top: player.y - PLAYER_SIZE / 2, width: PLAYER_SIZE, height: PLAYER_SIZE, fontSize: PLAYER_SIZE - 4, lineHeight: `${PLAYER_SIZE}px`, textAlign: "center", zIndex: 5, filter: "drop-shadow(0 0 10px rgba(100,200,255,0.7))" }}>😎</div>

        {/* Enemies */}
        {enemies.map((e) => (
          <div key={e.id} style={{ position: "absolute", left: e.x - ENEMY_SIZE / 2, top: e.y - ENEMY_SIZE / 2, width: ENEMY_SIZE, height: ENEMY_SIZE, textAlign: "center" }}>
            <span style={{ fontSize: ENEMY_SIZE - 6, filter: "drop-shadow(0 0 4px rgba(139,69,19,0.6))" }}>💩</span>
            {e.maxHealth > 1 && (
              <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: "20px", height: "3px", background: "rgba(0,0,0,0.5)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: `${(e.health / e.maxHealth) * 100}%`, background: "#f44336", borderRadius: "2px" }} />
              </div>
            )}
          </div>
        ))}

        {/* Bullets */}
        {bullets.map((b) => (
          <div key={b.id} style={{ position: "absolute", left: b.x - BULLET_SIZE / 2, top: b.y - BULLET_SIZE / 2, width: BULLET_SIZE, height: BULLET_SIZE, borderRadius: "50%", background: "radial-gradient(circle, #fff, #ffeb3b, #ff9800)", boxShadow: "0 0 10px rgba(255,235,59,0.9)" }} />
        ))}
      </div>

      {/* Controls hint */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {["W", "A", "S", "D"].map((k) => (
          <div key={k} style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 700 }}>{k}</div>
        ))}
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginLeft: "6px" }}>atau Arrow Keys</span>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );
}
