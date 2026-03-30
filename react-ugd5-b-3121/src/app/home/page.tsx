'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Game1 from "@/app/components/game1";
import Game2 from "@/app/components/game2";
import { FaPowerOff } from "react-icons/fa";

type Screen = "menu" | "game1" | "game2";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("menu");

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/auth/not-authorized");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ color: "white", fontSize: "20px" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    router.push("/auth/login");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      minWidth: "100vw",
      padding: "30px 20px",
      gap: "16px",
    }}>
      {/* Header */}
      <h1 style={{
        fontSize: "36px",
        fontWeight: 800,
        color: "white",
        margin: 0,
        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}>
        Selamat Datang!
      </h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f44336, #c62828)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(244,67,54,0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
          color: "white",
          fontSize: "18px",
        }}
        title="Logout"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(244,67,54,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(244,67,54,0.4)";
        }}
      >
        <FaPowerOff />
      </button>

      {/* Dark Container */}
      <div style={{
        width: "100%",
        maxWidth: "700px",
        minHeight: "500px",
        background: "#0d1117",
        borderRadius: "24px",
        padding: "30px 24px",
        boxShadow: "0 10px 50px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: screen === "menu" ? "center" : "flex-start",
        gap: "20px",
      }}>
        {/* MENU SCREEN */}
        {screen === "menu" && (
          <>
            <h2 style={{
              color: "white",
              fontSize: "32px",
              fontWeight: 800,
              margin: 0,
            }}>
              Choose Your Game
            </h2>

            <div style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {/* Game EEK Button */}
              <button
                onClick={() => setScreen("game1")}
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  background: "linear-gradient(135deg, #ff8f00, #e65100)",
                  boxShadow: "0 4px 15px rgba(230,81,0,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(230,81,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(230,81,0,0.4)";
                }}
              >
                Game EEK 💩
              </button>

              {/* Poop Survivors Button */}
              <button
                onClick={() => setScreen("game2")}
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  background: "linear-gradient(135deg, #4caf50, #2e7d32)",
                  boxShadow: "0 4px 15px rgba(46,125,50,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(46,125,50,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(46,125,50,0.4)";
                }}
              >
                Poop Survivors 🎮
              </button>
            </div>

            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              margin: 0,
              fontStyle: "italic",
            }}>
              Pick one to start playing and reduce lag!
            </p>
          </>
        )}

        {/* GAME SCREEN */}
        {screen !== "menu" && (
          <>
            {/* Back Button */}
            <button
              onClick={() => setScreen("menu")}
              style={{
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "8px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              ← Kembali
            </button>

            {/* Game Component */}
            {screen === "game1" ? <Game1 /> : <Game2 />}
          </>
        )}
      </div>
    </div>
  );
}
