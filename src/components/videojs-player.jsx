import React, { useRef, useState } from "react";
import VideoJS from "./videojs";

/* ─── inline styles ─────────────────────────────────────────────────────── */
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "24px 16px",
    boxSizing: "border-box",
    backgroundColor: "#0a0a0a",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  title: {
    color: "#e5e5e5",
    marginBottom: "18px",
    fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
    fontWeight: 600,
    letterSpacing: "0.4px",
    textAlign: "center",
  },
  playerWrapper: {
    width: "100%",
    maxWidth: "900px",
  },
  qualityBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  qualityLabel: {
    color: "#888",
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginRight: "4px",
    whiteSpace: "nowrap",
  },
  qualityBtn: (isActive) => ({
    padding: "5px 14px",
    borderRadius: "999px",
    border: isActive ? "none" : "1px solid #333",
    background: isActive
      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
      : "#1a1a1a",
    color: isActive ? "#fff" : "#aaa",
    fontSize: "13px",
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.18s ease",
    boxShadow: isActive ? "0 0 10px rgba(99,102,241,0.4)" : "none",
    outline: "none",
  }),
};

/* ─── component ─────────────────────────────────────────────────────────── */
const VideoJSPlayer = () => {
  const playerRef = useRef(null);
  const qualityLevelsRef = useRef(null);
  const [qualityList, setQualityList] = useState([]); // [{index, height}]
  const [selectedQuality, setSelectedQuality] = useState("auto");

  const videoJsOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    aspectRatio: "16:9",
    autoplay: false,
    muted: true,
    playbackRates: [0.25, 0.5, 1, 1.5, 2],
    sources: [
      {
        src: "https://ik.imagekit.io/dlio4udcx/YT%20Video/Reel36.mp4/ik-master.m3u8?tr=sr-240_360_480_720_1080",
        type: "application/x-mpegURL",
      },
    ],
    poster:
      "https://ik.imagekit.io/dlio4udcx/YT%20Video/Reel36.mp4/ik-thumbnail.jpg?tr=w-1200,h-680,so-2",
    tracks: [],
  };

  /* ── player ready ── */
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => console.log("Player is waiting"));
    player.on("dispose", () => console.log("Player disposed"));

    // Listen for quality levels added by HLS
    const ql = player.qualityLevels();
    qualityLevelsRef.current = ql;

    const refreshLevels = () => {
      const seen = new Set();
      const levels = [];
      for (let i = 0; i < ql.length; i++) {
        const h = ql[i].height;
        if (h && !seen.has(h)) {
          seen.add(h);
          levels.push({ index: i, height: h });
        }
      }
      levels.sort((a, b) => b.height - a.height); // highest first
      setQualityList(levels);
    };

    ql.on("addqualitylevel", refreshLevels);
  };

  /* ── quality switch ── */
  const switchQuality = (qualityHeight) => {
    const ql = qualityLevelsRef.current;
    if (!ql) return;

    setSelectedQuality(qualityHeight);

    for (let i = 0; i < ql.length; i++) {
      ql[i].enabled =
        qualityHeight === "auto" ? true : ql[i].height === qualityHeight;
    }
  };

  /* ── render ── */
  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Video Player</h2>

      <div style={styles.playerWrapper}>
        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />

        {/* Quality Selector */}
        {qualityList.length > 0 && (
          <div style={styles.qualityBar}>
            <span style={styles.qualityLabel}>Quality</span>

            {/* Auto button */}
            <button
              style={styles.qualityBtn(selectedQuality === "auto")}
              onClick={() => switchQuality("auto")}
            >
              Auto
            </button>

            {/* Per-resolution buttons */}
            {qualityList.map((level) => (
              <button
                key={level.height}
                style={styles.qualityBtn(selectedQuality === level.height)}
                onClick={() => switchQuality(level.height)}
              >
                {level.height}p
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoJSPlayer;
