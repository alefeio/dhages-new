import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useSession } from "next-auth/react";

// Interface para os links do menu
interface MenuLink {
    id: string;
    text: string;
    url: string;
    target?: string;
}

export default function MenuForm() {
    const { data: session, status } = useSession();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [links, setLinks] = useState<MenuLink[]>([]);
    const [newLinkText, setNewLinkText] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [newLinkTarget, setNewLinkTarget] = useState(false);
    const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            if (session?.user?.role !== "ADMIN") return;

            try {
                const response = await fetch("/api/crud/menu");
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setLogoUrl(data.logoUrl || "");
                        setLinks(data.links || []);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar dados do menu:", error);
            }
        };
        fetchMenu();
    }, [session, status]);

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleLinkSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newLinkText && newLinkUrl) {
            const newLink = {
                id: editingLinkId || String(Date.now()),
                text: newLinkText,
                url: newLinkUrl,
                target: newLinkTarget ? "_blank" : "_self",
            };

            if (editingLinkId) {
                // Se estiver editando, atualiza o link existente
                setLinks((prevLinks) => prevLinks.map((link) => (link.id === editingLinkId ? newLink : link)));
            } else {
                // Se não estiver editando, adiciona um novo link
                setLinks((prevLinks) => [...prevLinks, newLink]);
            }
            
            // Limpa o formulário
            setNewLinkText("");
            setNewLinkUrl("");
            setNewLinkTarget(false);
            setEditingLinkId(null);
        }
    };

    const handleEditLink = (link: MenuLink) => {
        setEditingLinkId(link.id);
        setNewLinkText(link.text);
        setNewLinkUrl(link.url);
        setNewLinkTarget(link.target === "_blank");
    };

    const handleCancelEdit = () => {
        setEditingLinkId(null);
        setNewLinkText("");
        setNewLinkUrl("");
        setNewLinkTarget(false);
    };

    const handleLinkRemove = (idToRemove: string) => {
        setLinks((prevLinks) => prevLinks.filter((link) => link.id !== idToRemove));
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        let uploadedLogoUrl = logoUrl;
        if (logoFile) {
            const formData = new FormData();
            formData.append("file", logoFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

            try {
                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Erro no upload da logomarca.");
                }

                const data = await response.json();
                uploadedLogoUrl = data.url;
            } catch (error) {
                console.error(error);
                setMessage("Erro ao fazer upload da logomarca.");
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetch("/api/crud/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ logoUrl: uploadedLogoUrl, links }),
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar o menu.");
            }

            setMessage("Menu salvo com sucesso!");
        } catch (error) {
            console.error(error);
            setMessage("Erro ao salvar o menu.");
        } finally {
            setLoading(false);
        }
    };
    
    const isButtonDisabled = !session || session.user?.role !== "ADMIN" || loading;
    if (status === 'loading') return <p className="text-gray-700 dark:text-gray-300">Carregando...</p>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
            {message && (
                <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {message}
                </p>
            )}

            {/* Seção da Logomarca */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Logomarca</h3>
                <label className="block font-bold mb-2 text-gray-700 dark:text-gray-300">
                    Imagem da Logomarca
                </label>
                <input
                    type="file"
                    onChange={handleLogoChange}
                    className="w-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                />
                {logoUrl && (
                    <div className="mt-4">
                        <p className="text-gray-600 dark:text-gray-400">Logomarca atual:</p>
                        <img src={logoUrl} alt="Logomarca atual" className="h-16 w-auto mt-2 rounded-md" />
                    </div>
                )}
            </div>

            {/* Seção de Links do Menu */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Links do Menu</h3>
                <div className="space-y-4 mb-4">
                    <form onSubmit={handleLinkSubmit} className="p-4 border border-gray-300 dark:border-gray-600 rounded-md">
                        <div className="mb-2">
                            <label htmlFor="link-text" className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                                Texto do Link
                            </label>
                            <input
                                id="link-text"
                                type="text"
                                value={newLinkText}
                                onChange={(e) => setNewLinkText(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Ex: Sobre Nós"
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="link-url" className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                                URL do Link
                            </label>
                            <input
                                id="link-url"
                                type="text"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Ex: /#sobre"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center text-gray-700 dark:text-gray-300 font-bold">
                                <input
                                    type="checkbox"
                                    checked={newLinkTarget}
                                    onChange={(e) => setNewLinkTarget(e.target.checked)}
                                    className="mr-2 rounded-sm text-blue-600 focus:ring-blue-500"
                                />
                                Abrir em nova aba?
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 dark:bg-blue-700 text-white p-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            {editingLinkId ? "Atualizar Link" : "Adicionar Link"}
                        </button>
                        {editingLinkId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full mt-2 bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancelar Edição
                            </button>
                        )}
                    </form>
                </div>

                {links.length > 0 && (
                    <ul className="space-y-2">
                        {links.map((link) => (
                            <li
                                key={link.id}
                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{link.text}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{link.url}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Abre em: {link.target === "_blank" ? "Nova aba" : "Mesma aba"}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEditLink(link)}
                                        className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-colors"
                                        aria-label={`Editar link ${link.text}`}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLinkRemove(link.id)}
                                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                                        aria-label={`Remover link ${link.text}`}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                type="button"
                onClick={handleSave}
                className={`w-full p-3 text-white font-bold rounded-md ${isButtonDisabled ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700"}`}
                disabled={isButtonDisabled}
            >
                {loading ? "Salvando..." : "Salvar Menu"}
            </button>
        </div>
    );
}
