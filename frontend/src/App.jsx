import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-yellow-400 selection:text-black">
      {/* Sección Hero / Center */}
      <section className="flex flex-col items-center justify-center pt-20 pb-16 px-4 text-center">
        <div className="relative mb-8 flex justify-center items-center">
          {/* Imagen Base (Hero) */}
          <img
            src={heroImg}
            className="relative z-10 drop-shadow-2xl animate-pulse"
            width="170"
            height="179"
            alt="Centella Hero"
          />
          {/* Logos flotantes con animaciones de Tailwind */}
          <img
            src={reactLogo}
            className="absolute -top-4 -right-8 w-12 h-12 animate-[spin_10s_linear_infinite]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute -bottom-4 -left-8 w-12 h-12 hover:scale-110 transition-transform"
            alt="Vite logo"
          />
        </div>

        <div className="max-w-2xl">
          <h1 className="text-5xl font-black tracking-tighter mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Get started
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Edit{" "}
            <code className="bg-gray-800 px-2 py-1 rounded text-yellow-500">
              src/App.jsx
            </code>{" "}
            and save to test <code className="text-blue-400">HMR</code>
          </p>
        </div>

        <button
          className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-400/20"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      {/* Divisor / Ticks */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-4"></div>

      {/* Pasos Siguientes */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 p-8">
        {/* Documentación */}
        <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Documentation</h2>
          </div>
          <p className="text-gray-400 mb-6">Your questions, answered</p>
          <ul className="space-y-3">
            <li>
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] hover:bg-gray-800 transition-colors"
              >
                <img className="w-5 h-5" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a
                href="https://react.dev/"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] hover:bg-gray-800 transition-colors"
              >
                <img className="w-5 h-5" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>

        {/* Redes Sociales */}
        <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors">
          <h2 className="text-2xl font-bold mb-2">Connect with us</h2>
          <p className="text-gray-400 mb-6">Join the Vite community</p>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { label: "GitHub", url: "https://github.com/vitejs/vite" },
              { label: "Discord", url: "https://chat.vite.dev/" },
              { label: "X.com", url: "https://x.com/vite_js" },
              { label: "Bluesky", url: "https://bsky.app/profile/vite.dev" },
            ].map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  className="block text-center p-3 rounded-lg bg-[#1a1a1a] hover:bg-gray-800 transition-colors border border-gray-800"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="h-24"></section>
    </div>
  );
}

export default App;
