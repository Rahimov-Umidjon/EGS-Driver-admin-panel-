 import { useEffect, useState } from "react"; 
 
export default function Navbar() { 
  const [isScrolled, setIsScrolled] = useState(false); 

 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`flex items-center justify-between px-6 py-4 border-b shadow-sm transition-all z-50 relative ${isScrolled ? "bg-indigo-100" : "bg-white"
          }`}
      >
        {/*<h1 className="text-lg font-semibold text-indigo-700">Admin Panel</h1>*/}


      </header>
    </>
  );
}
