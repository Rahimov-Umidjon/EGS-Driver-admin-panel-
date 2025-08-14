import { Search, LogOut, Loader2 } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LanguageOption {
  value: string;
  label: string;
}

export default function Navbar() {
  const languageOptions: LanguageOption[] = [
    { value: "UZ", label: "O'zbekcha" },
    { value: "RU", label: "Русский" },
  ];
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languageOptions[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const onSelect = (option: LanguageOption) => {
    setSelectedLang(option);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 border-b shadow-sm transition-all
      ${isScrolled ? "bg-indigo-100" : "bg-white"} text-black`}
    >
      {/* Search */}
      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-300 px-4 py-2 rounded-lg w-full max-w-md">
        <Search size={20} className="text-indigo-600" />
        <input
          type="text"
          placeholder="Qidiruv..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-transparent focus:outline-none text-sm"
        />
      </div>

      {/* Language and Profile */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="border border-indigo-300 text-indigo-700 rounded-lg px-4 py-2 text-sm font-medium bg-white hover:bg-indigo-100"
          >
            {selectedLang.label}
          </button>

          {isOpen && (
            <ul className="absolute right-0 mt-2 w-36 bg-white border border-indigo-200 rounded-lg shadow z-10">
              {languageOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => onSelect(option)}
                  className={`px-4 py-2 cursor-pointer hover:bg-indigo-100 text-sm ${
                    selectedLang.value === option.value ? "bg-indigo-50 font-semibold" : ""
                  }`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setProfileDropdown((prev) => !prev)}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-200" />
            <div className="text-sm text-indigo-800 font-medium">Admin</div>
          </div>

          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-indigo-200 rounded-lg shadow z-10">
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
