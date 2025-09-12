import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { v4 as uuidv4 } from 'uuid';
import { FaEdit, FaTrash } from "react-icons/fa";

interface BannerItem {
    id: string;
    url: string;
    title?: string;
    subtitle?: string;
    link?: string;
    target?: string;
    buttonText?: string;
    buttonColor?: string;
}

export default function BannerForm() {
    const [banners, setBanners] = useState<BannerItem[]>([]);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newSubtitle, setNewSubtitle] = useState("");
    const [newLink, setNewLink] = useState("");
    const [newTarget, setNewTarget] = useState(false);
    const [newButtonText, setNewButtonText] = useState("");
    const [newButtonColor, setNewButtonColor] = useState("");
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("/api/crud/banner");
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.banners) {
                        setBanners(data.banners);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar dados do banner:", error);
            }
        };
        fetchBanners();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleRemoveBanner = (idToRemove: string) => {
        const updatedBanners = banners.filter((banner) => banner.id !== idToRemove);
        setBanners(updatedBanners);
        saveBannersToDatabase(updatedBanners, "Banner removido com sucesso!");
        if (editingBannerId === idToRemove) {
            clearForm();
        }
    };

    const clearForm = () => {
        setNewFile(null);
        setNewTitle("");
        setNewSubtitle("");
        setNewLink("");
        setNewTarget(false);
        setNewButtonText("");
        setNewButtonColor("");
        setEditingBannerId(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleEditBanner = (banner: BannerItem) => {
        setEditingBannerId(banner.id);
        setNewTitle(banner.title || "");
        setNewSubtitle(banner.subtitle || "");
        setNewLink(banner.link || "");
        setNewTarget(banner.target === '_blank');
        setNewButtonText(banner.buttonText || "");
        setNewButtonColor(banner.buttonColor || "");
        setMessage("");
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const saveBannersToDatabase = async (updatedBanners: BannerItem[], successMessage: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/crud/banner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ banners: updatedBanners }),
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar os banners.");
            }

            const data = await response.json();
            setBanners(data.banners);
            setMessage(successMessage);
        } catch (error) {
            console.error(error);
            setMessage("Erro ao salvar os banners.");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadAndSave = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        let uploadedUrl: string | null = null;
        if (newFile) {
            const formData = new FormData();
            formData.append("file", newFile);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

            try {
                const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Erro no upload do banner.");
                }

                const data = await uploadResponse.json();
                uploadedUrl = data.url;
            } catch (error) {
                console.error(error);
                setMessage("Erro ao fazer upload da imagem.");
                setLoading(false);
                return;
            }
        }

        let updatedBanners: BannerItem[];

        if (editingBannerId) {
            updatedBanners = banners.map((banner) =>
                banner.id === editingBannerId
                    ? {
                        ...banner,
                        url: uploadedUrl || banner.url,
                        title: newTitle,
                        subtitle: newSubtitle,
                        link: newLink,
                        target: newTarget ? '_blank' : '_self',
                        buttonText: newButtonText,
                        buttonColor: newButtonColor,
                    }
                    : banner
            );
        } else {
            if (!uploadedUrl) {
                setMessage("Por favor, selecione uma imagem para o novo banner.");
                setLoading(false);
                return;
            }
            const newBannerItem: BannerItem = {
                id: uuidv4(),
                url: uploadedUrl,
                title: newTitle,
                subtitle: newSubtitle,
                link: newLink,
                target: newTarget ? '_blank' : '_self',
                buttonText: newButtonText,
                buttonColor: newButtonColor,
            };
            updatedBanners = [...banners, newBannerItem];
        }

        await saveBannersToDatabase(updatedBanners, editingBannerId ? "Banner atualizado com sucesso!" : "Banner adicionado com sucesso!");
        clearForm();
    };

    return (
        <form onSubmit={handleUploadAndSave} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
            {message && (
                <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {message}
                </p>
            )}

            {/* Seção para Adicionar/Editar Banner */}
            <div className="mb-6 space-y-4 border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {editingBannerId ? "Editar Banner Existente" : "Adicionar Novo Banner"}
                </h3>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Imagem {editingBannerId && "(Deixe em branco para manter a atual)"}</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Título (Opcional)</label>
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Título do Banner"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Subtítulo (Opcional)</label>
                    <input
                        type="text"
                        value={newSubtitle}
                        onChange={(e) => setNewSubtitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Subtítulo do Banner"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Link do Botão (Opcional)</label>
                    <input
                        type="text"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="https://..."
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Texto do Botão (Opcional)</label>
                    <input
                        type="text"
                        value={newButtonText}
                        onChange={(e) => setNewButtonText(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Ex: Saiba Mais"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Cor do Botão (Classe Tailwind. Ex: bg-blue-600)</label>
                    <input
                        type="text"
                        value={newButtonColor}
                        onChange={(e) => setNewButtonColor(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Ex: bg-blue-600 ou bg-green-500"
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={newTarget}
                        onChange={(e) => setNewTarget(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-blue-500"
                    />
                    <label className="text-gray-700 dark:text-gray-300">Abrir em nova aba?</label>
                </div>
                {editingBannerId && (
                    <button
                        type="button"
                        onClick={clearForm}
                        className="w-full p-3 mt-4 bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar Edição
                    </button>
                )}
            </div>

            {/* Seção de Banners Atuais */}
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Banners Atuais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banners.map((banner) => (
                        <div key={banner.id} className="relative group overflow-hidden rounded-md shadow-md bg-gray-50 dark:bg-gray-700 p-2">
                            <img src={banner.url} alt={banner.title || "Banner"} className="w-full h-auto rounded-md" />
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <button
                                    type="button"
                                    onClick={() => handleEditBanner(banner)}
                                    className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                                    title="Editar Banner"
                                    aria-label="Editar Banner"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveBanner(banner.id)}
                                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                                    title="Remover Banner"
                                    aria-label="Remover Banner"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            <div className="mt-2 text-gray-800 dark:text-gray-200">
                                {banner.title && <p className="font-semibold">{banner.title}</p>}
                                {banner.subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{banner.subtitle}</p>}
                                {banner.buttonText && <p className="text-xs text-gray-500 dark:text-gray-400">Botão: {banner.buttonText}</p>}
                                {banner.link && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Link: {banner.link}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className={`w-full p-3 text-white font-bold rounded-md ${loading ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700"}`}
                disabled={loading}
            >
                {loading ? "Salvando..." : editingBannerId ? "Atualizar Banner" : "Adicionar Banner"}
            </button>
        </form>
    );
}
