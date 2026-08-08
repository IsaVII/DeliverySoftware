import H1 from "./subcomponents/H1.jsx";
import Login from "./Login.jsx";
import NavButton from "./subcomponents/NavButton.jsx";

const VERSION = "1.1.13";

export default function Header({
  theme,
  toggleTheme,
  isLoggedIn,
  onLogin,
  onLogout,
  className,
}) {
  return (
    <header
      className={`bg-[var(--bg-header)] py-2 md:py-4 shadow-md ${className || ""}`}
    >
      <div className="max-w-5xl mx-auto px-3 md:px-5 flex justify-between items-center">
        <div className="flex justify-start items-center gap-2 md:gap-3 flex-1 min-w-0">
          <img
            src="/Shop_Logo.png"
            alt="Shop Logo"
            className="h-8 w-8 md:h-12 md:w-12 flex-shrink-0"
          />
          <div>
            <H1>Shop</H1>
            <span className="text-xs text-[var(--text-muted)] ml-1">
              v{VERSION}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-[var(--bg-panel)] transition-colors"
            title={`Byt till ${theme === "light" ? "mörkt" : "ljust"} läge`}
            aria-label="Växla mörkt läge"
          >
            {theme === "light" ? (
              <span className="text-xl">🌙</span>
            ) : (
              <span className="text-xl">☀️</span>
            )}
          </button>
          <Login
            isLoggedIn={isLoggedIn}
            onLogin={onLogin}
            onLogout={onLogout}
          />
        </div>
        {/* <nav className="flex gap-20">
          <NavButton name="Home" id="home" />
          <NavButton name="About" id="about" />
          <NavButton name="Contact" id="contact" />
        </nav> */}
      </div>
    </header>
  );
}
