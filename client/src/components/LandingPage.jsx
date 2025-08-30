// src/homepage/Homepage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "/Homepage-Blur-Background-Image.png";
import avatarImage from "/Avatar-Image.png";
import bgMusic from "/CodeToFortune.mp3";

function getRandomPosition(w, h, ew, eh) {
  const pad = 40;
  return {
    x: Math.random() * (w - ew - pad * 2) + pad,
    y: Math.random() * (h - eh - pad * 2) + pad,
  };
}

export default function Landing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro"); // hidden, peek, jumping, center, message1, options1, circleMove, message2, options2, guestMsg, memberCTA, membership
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 40, y: -100 });
  const [messageSide, setMessageSide] = useState("right");
  const [fadeMessage, setFadeMessage] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [spinDeg, setSpinDeg] = useState(0);

  const jumpInterval = useRef(null);
  const circleAnim = useRef(null);
  const spinAnim = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const timers = [];
    audioRef.current = new Audio(bgMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0;

    const introDuration = 3000; // 3 seconds intro before avatar starts

    const startPhases = () => {
      audioRef.current
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));

      setTimeout(() => {
        const fade = setInterval(() => {
          if (!audioRef.current) return clearInterval(fade);
          const v = Math.min(audioRef.current.volume + 0.02, 0.5);
          audioRef.current.volume = v;
          if (v >= 0.5) clearInterval(fade);
        }, 100);
      }, 500);

      setPhase("hidden"); // move from "intro" to normal sequence

      timers.push(setTimeout(() => setPhase("peek"), 2000));
      timers.push(
        setTimeout(() => {
          setPhase("jumping");
          jumpInterval.current = setInterval(() => {
            setPos(
              getRandomPosition(window.innerWidth, window.innerHeight, 80, 80)
            );
          }, 300);
        }, 2700)
      );
      timers.push(
        setTimeout(() => {
          clearInterval(jumpInterval.current);
          setPhase("center");
          setPos({
            x: window.innerWidth / 2 - 40,
            y: window.innerHeight / 2 - 40,
          });
        }, 6000)
      );
      timers.push(
        setTimeout(() => {
          setPhase("message1");
          setFadeMessage(true);
        }, 6500)
      );
      timers.push(setTimeout(() => setPhase("options1"), 7500));
    };

    // Delay everything by intro duration
    timers.push(setTimeout(startPhases, introDuration));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(jumpInterval.current);
      cancelAnimationFrame(circleAnim.current);
      cancelAnimationFrame(spinAnim.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "m" && audioRef.current) {
        musicPlaying ? audioRef.current.pause() : audioRef.current.play();
        setMusicPlaying((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [musicPlaying]);

  const startCircleAnimation = () => {
    const cx = window.innerWidth / 2 - 40;
    const cy = window.innerHeight / 2 - 40;
    const R = 300;
    const duration = 1400;
    const start = performance.now();
    const animate = (t) => {
      const d = Math.min((t - start) / duration, 1);
      const a = d * 2 * Math.PI;
      setPos({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      if (d < 1) circleAnim.current = requestAnimationFrame(animate);
      else {
        setPos({ x: cx, y: cy });
        setPhase("message2");
        setFadeMessage(true);
        setTimeout(() => setPhase("options2"), 1000);
      }
    };
    circleAnim.current = requestAnimationFrame(animate);
  };

  const spinAvatar = (rotations, duration, done) => {
    const start = performance.now();
    const total = rotations * 360;
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setSpinDeg(total * p);
      if (p < 1) spinAnim.current = requestAnimationFrame(step);
      else {
        setSpinDeg(0);
        done && done();
      }
    };
    spinAnim.current = requestAnimationFrame(step);
  };

  const handleFirstOption = (opt) => {
    if (opt === "not want")
      return (window.location.href = "https://www.google.com");
    setFadeMessage(false);
    setTimeout(() => {
      setPhase("circleMove");
      setMessageSide((s) => (s === "right" ? "left" : "right"));
      startCircleAnimation();
    }, 350);
  };

  const handleGuest = () => {
    // Start avatar spin
    spinAvatar(2, 900, () => {
      // 1. Fade out any visible message
      setFadeMessage(false);

      // 2. Wait for fade-out animation (420ms), then move avatar
      setTimeout(() => {
        const pad = 24;
        const cornerPos = {
          x: window.innerWidth - 80 - pad,
          y: pad,
        };

        // Move avatar to top-right corner
        setPos(cornerPos);

        // 3. Wait for avatar to reach corner (transition is 0.5s)
        // Then show the guest message
        setTimeout(() => {
          setMessageSide("left");
          setPhase("guestMsg");
          setFadeMessage(true);
        }, 520); // wait slightly more than avatar transition
      }, 420); // wait for fade-out to complete first
    });
  };

  const handleMember = () => {
    spinAvatar(4, 900, () => {
      // show CTA before final membership screen
      setFadeMessage(false);
      setTimeout(() => {
        setPhase("memberCTA");
        setFadeMessage(true);
      }, 200);
    });
  };

  const goMembership = () => navigate("/membership", { replace: true });

  // Styles
  const avatarStyle = {
    position: "fixed",
    width: 80,
    height: 80,
    borderRadius: 15,
    zIndex: 20,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    left: pos.x,
    top: pos.y,
    transition:
      "left .5s cubic-bezier(.22,.61,.36,1), top .5s cubic-bezier(.22,.61,.36,1)",
    transform: `rotate(${spinDeg}deg)`,
  };

  const leftOffset = messageSide === "right" ? pos.x + 100 : pos.x - 340;
  const msgBoxStyle = {
    position: "fixed",
    top: pos.y,
    left: leftOffset,
    width: 320,
    background: "rgba(20,20,30,0.9)",
    borderRadius: 14,
    boxShadow: "0 8px 30px rgba(43,124,255,0.6)",
    padding: 24,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#ddeeff",
    zIndex: 21,
    userSelect: "none",
    display: "flex",
    flexDirection: "column",
    minHeight: 140,
    gap: 12,
    opacity: fadeMessage ? 1 : 0,
    transform: `translateY(${fadeMessage ? 0 : 6}px)`,
    transition: "opacity 420ms ease, transform 420ms ease",
  };

  const row = {
    display: "flex",
    flexWrap: "nowrap",
    gap: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  }; // single line [MDN flex-wrap nowrap]
  const title = { fontSize: 18, fontWeight: 700, color: "#7ecbff" };
  const text = { fontSize: 14.5, color: "#aac8ff", lineHeight: 1.45 };
  const primary = {
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
    background: "#2b7cff",
    color: "#fff",
    border: "none",
    boxShadow: "0 3px 10px #7ecbff",
  };
  const ghost = {
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 700,
    cursor: "pointer",
    background: "#222538",
    color: "#8a9bb9",
    border: "1px solid #3a4a7a",
  };

  // Membership screen
  if (phase === "membership") {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(16px) brightness(0.7)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            placeItems: "center",
            height: "100vh",
          }}
        >
          <div
            style={{
              background: "rgba(20,20,30,0.9)",
              color: "#eaf2ff",
              padding: 28,
              borderRadius: 14,
              boxShadow: "0 12px 40px rgba(0,0,0,.35)",
              textAlign: "center",
              width: 360,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
                color: "#7ecbff",
              }}
            >
              Welcome
            </div>
            <div style={{ fontSize: 15.5, color: "#cfe0ff" }}>
              Thanks for choosing Streamify Member access. Sign in flow goes
              here.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CTA bounce keyframes injected once
  const bounceKeyframes = `
    @keyframes upDownBounce { 
      0%,100% { transform: translateY(0); } 
      50% { transform: translateY(-8px); } 
    }
  `;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{bounceKeyframes}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(16px) brightness(0.7)",
          zIndex: 1,
        }}
      />
      {phase === "intro" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#eaf2ff",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            padding: 40,
            background: "rgba(10, 10, 20, 0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div>
            <div>✨ Enjoy our journey until you reach your destination ✨</div>
            <div style={{ marginTop: 16, fontSize: 16, fontWeight: 500 }}>
              Click <span style={{ color: "#7ecbff" }}>M</span> to play or pause
              the music.
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2 }}>
        {phase !== "hidden" && (
          <div style={avatarStyle}>
            <img
              src={avatarImage}
              alt="Mini Avatar"
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(60,180,250,0.2), 0 0 0 8px #e3f0ff",
                transform: "perspective(100px) rotateY(10deg)",
              }}
              draggable={false}
            />
          </div>
        )}

        {(phase === "message1" || phase === "options1") && (
          <div style={msgBoxStyle}>
            <div style={title}>Hi, I’m Devingle</div>
            <div style={text}>
              Your AI guide to this creative streaming space. Ready for a quick
              tour?
            </div>
            {phase === "options1" && (
              <div style={row}>
                <button
                  style={primary}
                  onClick={() => handleFirstOption("want")}
                >
                  I want
                </button>
                <button
                  style={ghost}
                  onClick={() => handleFirstOption("not want")}
                >
                  Not interested
                </button>
              </div>
            )}
          </div>
        )}

        {(phase === "message2" || phase === "options2") && (
          <div style={msgBoxStyle}>
            <div style={title}>Choose your path</div>
            <div style={text}>
              Surf as a guest or unlock member perks like playlists, follows,
              and AI creator tools.
            </div>
            {phase === "options2" && (
              <div style={row}>
                <button style={primary} onClick={handleGuest}>
                  Join as Guest
                </button>
                <button
                  style={{
                    ...ghost,
                    background: "#ff3366",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={handleMember}
                >
                  Become Member
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "guestMsg" && (
          <div style={msgBoxStyle}>
            <div style={title}>Guest guidelines</div>
            <div style={text}>
              As a guest, enjoy browsing AI reels and community-made images.
              Saving, commenting, and posting are member-only features.
            </div>
            <button
              style={{
                ...primary,
                alignSelf: "flex-start",
                background: "linear-gradient(90deg,#ffd055,#ff7bd4,#7ecbff)",
                color: "#1b2136",
                boxShadow: "0 6px 18px rgba(255,219,128,.35)",
                fontWeight: 800,
              }}
              onClick={() => alert("Happy Creative Day!")}
            >
              ✨ Happy Creative Day — Enjoy!
            </button>
          </div>
        )}

        {phase === "memberCTA" && (
          <div style={msgBoxStyle}>
            <div style={title}>Excellent choice!</div>
            <div style={text}>
              Step into StreamifyAi’s full experience with creator tools,
              playlists, and community features.
            </div>
            <div style={row}>
              <button
                onClick={goMembership}
                style={{
                  ...primary,
                  background: "linear-gradient(180deg,#6ec1ff,#2b7cff)",
                  animation: "upDownBounce 1.1s ease-in-out infinite", // bounce CTA
                  fontWeight: 800,
                }}
              >
                Enter this StreamifyAi World
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
