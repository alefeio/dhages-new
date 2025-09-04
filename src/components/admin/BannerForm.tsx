// src/components/admin/BannerForm.tsx

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

interface BannerItem {
  id: string;
  url: string;
  title?: string;
  link?: string;
  target?: string;
}

export default function BannerForm() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newTarget, setNewTarget] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
    setBanners(banners.filter((banner) => banner.id !== idToRemove));
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

    const newBannerItem = uploadedUrl ? {
      id: String(Date.now()),
      url: uploadedUrl,
      title: newTitle,
      link: newLink,
      target: newTarget ? '_blank' : '_self',
    } : null;

    const updatedBanners = newBannerItem ? [...banners, newBannerItem] : banners;

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
      setNewFile(null);
      setNewTitle("");
      setNewLink("");
      setNewTarget(false);
      setMessage("Banners salvos com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar os banners.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUploadAndSave}>
      {message && (
        <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-blue-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {/* Seção para Adicionar Novo Banner */}
      <div className="mb-4 space-y-4">
        <h3 className="text-xl text-gray-700 dark:text-gray-400 font-bold">Adicionar Novo Banner</h3>
        <div>
          <label className="block text-gray-700 dark:text-gray-400 font-bold mb-2">Imagem</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-gray-700 dark:text-gray-400 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-400 font-bold mb-2">Título (Opcional)</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-400 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Título do Banner"
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-400 font-bold mb-2">Link (Opcional)</label>
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            className="w-full dark:bg-gray-600 dark:text-gray-200 dark:placeholder-gray-400 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={newTarget}
            onChange={(e) => setNewTarget(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-gray-700 dark:text-gray-400">Abrir em nova aba?</label>
        </div>
      </div>

      {/* Seção de Banners Atuais */}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-400 font-bold mb-2">Banners Atuais</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="relative group">
              <img src={banner.url} alt={banner.title || "Banner"} className="w-full h-auto rounded-md shadow-md" />
              <button
                type="button"
                onClick={() => handleRemoveBanner(banner.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className={`w-full p-3 text-white font-bold rounded-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-600"
          }`}
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar Banners"}
      </button>
    </form>
  );
}