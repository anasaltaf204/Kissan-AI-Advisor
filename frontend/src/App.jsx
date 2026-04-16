/**
 * App.jsx — Root component.
 *
 * Layout strategy (fixes the "not fullscreen" bug):
 * - html, body, #root → height:100% overflow:hidden  (done in index.css)
 * - This div → w-screen h-screen (dvh for mobile browsers)
 * - No centered floating card — the app IS the screen on mobile
 * - On desktop (lg+) it still fills the screen but shows a subtle centered panel
 */
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatPane from "./components/ChatPane";

export default function App() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("kissan_lang") || "en"
  );
  const [backendStatus, setBackendStatus] = useState("connecting");

  useEffect(() => {
    localStorage.setItem("kissan_lang", language);
  }, [language]);

  const toggleLang = () =>
    setLanguage((l) => (l === "en" ? "ur" : "en"));

  return (
    /*
     * On mobile:  full screen, no margins
     * On desktop: centered card with max-width, subtle green bg around it
     */
    <div className="flex items-stretch justify-center w-screen bg-forest-950 min-h-screen"
         style={{ height: "100dvh" }}>
      {/* The chat card */}
      <div
        className="flex flex-col w-full bg-white"
        style={{
          maxWidth: "880px",
          height: "100dvh",
          minHeight: "100dvh",
        }}
      >
        <Header
          language={language}
          onToggleLang={toggleLang}
          status={backendStatus}
        />

        {/* ChatPane fills all remaining vertical space */}
        <ChatPane
          language={language}
          onStatusChange={setBackendStatus}
        />
      </div>
    </div>
  );
}
