"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface Upgrades {
  clickMultiplier: number;
  autoClickLevel: number;
  doublePointsLevel: number;
  x5PointsLevel: number;
}

export default function GameEek() {
  const [score, setScore] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [level, setLevel] = useState(1);
  const [upgrades, setUpgrades] = useState<Upgrades>({
    clickMultiplier: 1,
    autoClickLevel: 0,
    doublePointsLevel: 0,
    x5PointsLevel: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const floatRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPointsPerClick = useCallback(() => {
    let points = upgrades.clickMultiplier;
    points *= Math.pow(2, upgrades.doublePointsLevel);
    points *= Math.pow(5, upgrades.x5PointsLevel);
    return points;
  }, [upgrades]);

  useEffect(() => {
    const newLevel = Math.floor(totalClicks / 50) + 1;
    if (newLevel !== level) setLevel(newLevel);
  }, [totalClicks, level]);

  useEffect(() => {
    if (upgrades.autoClickLevel <= 0) return;
    const interval = setInterval(() => {
      const pts = getPointsPerClick() * upgrades.autoClickLevel;
      setScore((p) => p + pts);
      setTotalClicks((p) => p + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [upgrades.autoClickLevel, getPointsPerClick]);

  useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const points = getPointsPerClick();
    setScore((p) => p + points);
    setTotalClicks((p) => p + 1);
    setIsAnimating(true);
    if (animRef.current) clearTimeout(animRef.current);
    animRef.current = setTimeout(() => setIsAnimating(false), 150);

    if (floatRef.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const span = document.createElement("span");
      span.textContent = `+${points}`;
      span.style.cssText = `position:absolute;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;color:#fff;font-weight:800;font-size:22px;pointer-events:none;animation:eekFloat 0.9s ease-out forwards;text-shadow:0 2px 8px rgba(0,0,0,0.5);z-index:10;`;
      floatRef.current.appendChild(span);
      setTimeout(() => span.remove(), 900);
    }
  }, [getPointsPerClick]);

  const buyUpgrade = useCallback((type: string, cost: number) => {
    setScore((prev) => {
      if (prev < cost) return prev;
      setUpgrades((u) => {
        switch (type) {
          case "click": return { ...u, clickMultiplier: u.clickMultiplier + 1 };
          case "auto": return { ...u, autoClickLevel: u.autoClickLevel + 1 };
          case "double": return { ...u, doublePointsLevel: u.doublePointsLevel + 1 };
          case "x5": return { ...u, x5PointsLevel: u.x5PointsLevel + 1 };
          default: return u;
        }
      });
      return prev - cost;
    });
  }, []);

  const nextLevelClicks = level * 50;
  const currentLevelClicks = (level - 1) * 50;
  const progressPercent = Math.min(((totalClicks - currentLevelClicks) / (nextLevelClicks - currentLevelClicks)) * 100, 100);

  const upgradeItems = [
    { type: "click", label: "Upgrade Klik", cost: 10, icon: "➕" },
    { type: "auto", label: "Auto Klik", cost: 20, icon: "🆙" },
    { type: "double", label: "Double Poin", cost: 50, icon: "➕" },
    { type: "x5", label: "x5 Poin", cost: 100, icon: "➕" },
  ];

  return (
    <div style={{
      width: "100%",
      maxWidth: "480px",
      margin: "0 auto",
      background: "linear-gradient(180deg, #e65100, #ff8f00, #ffa726)",
      borderRadius: "24px",
      padding: "28px 24px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "18px",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{
          fontSize: "32px",
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          textShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}>
          Game EEK 💩
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "14px",
          margin: "4px 0 0 0",
          fontStyle: "italic",
        }}>
          Sentuh untuk Eek 💩 sebanyak mungkin!
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.3)" }} />

      {/* Score & Level Bar */}
      <div style={{
        width: "100%",
        background: "rgba(0,0,0,0.25)",
        borderRadius: "16px",
        padding: "14px 18px",
        border: "2px solid rgba(255,193,7,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "10px" }}>
          <span style={{ color: "white", fontSize: "18px", fontWeight: 700 }}>
            Skor: <span style={{ color: "#ffeb3b" }}>{score.toLocaleString()}</span>
          </span>
          <span style={{ color: "white", fontSize: "18px", fontWeight: 700 }}>
            Level: <span style={{ color: "#ffeb3b" }}>{level}</span>
          </span>
        </div>
        {/* Progress Bar */}
        <div style={{
          width: "100%",
          height: "14px",
          background: "rgba(0,0,0,0.4)",
          borderRadius: "7px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #ffc107, #ff9800)",
            borderRadius: "7px",
            transition: "width 0.3s ease",
            boxShadow: "0 0 8px rgba(255,193,7,0.6)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>+{getPointsPerClick()}/klik</span>
          {upgrades.autoClickLevel > 0 && (
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
              🤖 +{(getPointsPerClick() * upgrades.autoClickLevel).toLocaleString()}/detik
            </span>
          )}
        </div>
      </div>

      {/* EEK Click Button */}
      <div ref={floatRef} style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}>
        <button
          onClick={handleClick}
          style={{
            width: "100%",
            maxWidth: "360px",
            height: "130px",
            borderRadius: "65px",
            background: "linear-gradient(180deg, #ffb300, #ff8f00)",
            border: "3px solid rgba(255,193,7,0.7)",
            cursor: "pointer",
            fontSize: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isAnimating
              ? "inset 0 4px 12px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)"
              : "0 6px 20px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(0,0,0,0.15)",
            transform: isAnimating ? "scale(0.95)" : "scale(1)",
            transition: "transform 0.1s, box-shadow 0.1s",
            userSelect: "none",
          }}
        >
          💩
        </button>
      </div>

      {/* Upgrade Buttons - 2x2 Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        width: "100%",
      }}>
        {upgradeItems.map((u) => {
          const canBuy = score >= u.cost;
          return (
            <button
              key={u.type}
              onClick={() => buyUpgrade(u.type, u.cost)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 12px",
                borderRadius: "14px",
                border: "2px solid rgba(255,193,7,0.5)",
                cursor: canBuy ? "pointer" : "not-allowed",
                background: canBuy
                  ? "linear-gradient(180deg, #ffb300, #e65100)"
                  : "rgba(0,0,0,0.2)",
                color: "white",
                fontSize: "14px",
                fontWeight: 700,
                opacity: canBuy ? 1 : 0.5,
                transition: "all 0.2s",
                boxShadow: canBuy ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ fontSize: "16px" }}>{u.icon}</span>
              {u.label} ( 💩 {u.cost})
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes eekFloat { 0%{opacity:1;transform:translateY(0) scale(1)}50%{opacity:1}100%{opacity:0;transform:translateY(-60px) scale(1.2)} }
      `}</style>
    </div>
  );
}
