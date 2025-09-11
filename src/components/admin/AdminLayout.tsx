import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  MdDashboard,
  MdMenu,
  MdPhotoLibrary,
  MdViewCarousel,
  MdReviews,
  MdHelpOutline,
  MdLogout,
  MdPalette,
  MdClose,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { useRouter } from "next/router";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();

  useEffect(() => {
    // Carregar preferência de tema do localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (status === "loading") {
    return <p className="text-center mt-8">Verificando autenticação...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Botão de abrir menu - visível apenas no mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-40 p-2 bg-gray-800 text-white rounded-md shadow-md"
      >
        <MdMenu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 z-30 shadow-lg p-6 bg-white dark:bg-gray-800 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Botão fechar no mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <MdClose size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
          Painel Admin
        </h2>

        <nav className="space-y-6">
          {/* Grupo 1: Conteúdo da Landing Page */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conteúdo da LP
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link
                  href="/admin"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdDashboard className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/menu"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdMenu className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Menu</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/banner"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdViewCarousel className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Banner</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/gallery"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdViewCarousel className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Galeria de Fotos</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  href="/admin/homepage"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdPhotoLibrary className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Homepage</span>
                </Link>
              </li> */}
              <li>
                <Link
                  href="/admin/testimonials"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdReviews className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Depoimentos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/faq"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdHelpOutline className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 2: Catálogo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Catálogo
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link
                  href="/admin/pacotes"
                  className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <MdPalette className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Pacotes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 3: Autenticação */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conta
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left flex items-center p-3 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {theme === "light" ? (
                    <MdDarkMode className="mr-3 text-xl" />
                  ) : (
                    <MdLightMode className="mr-3 text-xl" />
                  )}
                  <span className="text-sm font-medium">
                    {theme === "light" ? "Modo Escuro" : "Modo Claro"}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left flex items-center p-3 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                >
                  <MdLogout className="mr-3 text-xl" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 py-8 md:p-2 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto p-6 lg:p-12">
        {children}
        </div>
      </main>
    </div>
  );
}
