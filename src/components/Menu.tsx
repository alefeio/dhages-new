// src/components/Menu.tsx

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LinkItem {
  id: string;
  text: string;
  url: string;
  target?: string;
}

interface MenuProps {
  menuData: {
    logoUrl: string;
    links: LinkItem[];
  } | null;
}

export function Menu({ menuData }: MenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!menuData) {
    return null;
  }

  const { logoUrl, links } = menuData;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${isScrolled
          ? "bg-primary-800/95 backdrop-blur-sm py-3 shadow-lg"
          : "bg-primary-800/10 backdrop-blur-sm py-4"
        }`}
    >
      <div className="mx-auto flex items-center justify-between px-4 md:px-8">
        <Link href="/">
          <img
            src={logoUrl || "/images/logo.png"}
            alt="Logomarca My Dress"
            className={`transition-all duration-300 ${isScrolled ? "w-14 md:w-20" : "w-16 md:w-24"
              }`}
          />
        </Link>

        <nav className="hidden md:flex gap-8 font-semibold font-serif text-lg">
          {links.map(({ text, url, target }) => (
            <Link
              key={url}
              href={url}
              className="hover:text-neutral-400 transition-colors"
              onClick={() => setMenuOpen(false)}
              target={target}
            >
              {text}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/admin" className="hover:text-neutral-400 transition-colors">Minha conta</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hover:text-neutral-400 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              className="hover:text-neutral-400 transition-colors"
              onClick={handleSignIn}
            >
              Entrar
            </button>
          )}
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block h-0.5 w-6 bg-primary-700 transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
          />
          <span
            className={`block h-0.5 w-6 bg-primary-700 transition-opacity ${menuOpen ? "opacity-0" : "opacity-100"
              }`}
          />
          <span
            className={`block h-0.5 w-6 bg-primary-700 transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden py-4 flex flex-col gap-4 font-semibold bg-primary-100/95 px-4"
        >
          {links.map(({ text, url, target }) => (
            <Link
              key={url}
              href={url}
              className="hover:text-neutral-400 border-t border-background-200 transition-colors pt-4"
              onClick={() => setMenuOpen(false)}
              target={target}
            >
              {text}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/admin" className="hover:text-neutral-400 transition-colors">Minha conta</Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hover:text-neutral-400 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              className="text-left hover:text-neutral-400 border-t border-background-200 transition-colors pt-4"
              onClick={handleSignIn}
            >
              Entrar
            </button>
          )}
        </nav>
      )}
    </header>
  );
}