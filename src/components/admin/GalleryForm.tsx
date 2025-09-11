import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// Interfaces para os modelos de dados
interface GalleryPhoto {
  id?: string; // Opcional para fotos novas que ainda não têm um ID
  url: string;
  altText?: string;
}

interface Gallery {
  id: string;
  title: string;
  slug: string;
  photos: GalleryPhoto[];
}

export default function GalleryForm() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoAltTexts, setNewPhotoAltTexts] = useState<string[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Carrega todas as galerias ao iniciar o componente
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await fetch("/api/crud/gallery");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setGalleries(data);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar galerias:", error);
      }
    };
    fetchGalleries();
  }, []);

  // Limpa o formulário, reiniciando os estados
  const clearForm = () => {
    setTitle("");
    setSlug("");
    setNewPhotos([]);
    setNewPhotoAltTexts([]);
    setEditingGalleryId(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setMessage("");
  };

  // Define a galeria a ser editada, preenchendo o formulário
  const handleEditGallery = (gallery: Gallery) => {
    setEditingGalleryId(gallery.id);
    setTitle(gallery.title);
    setSlug(gallery.slug);
    setNewPhotos([]);
    setNewPhotoAltTexts([]);
    setMessage("");
  };

  // Remove uma galeria
  const handleRemoveGallery = async (idToRemove: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/crud/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idToRemove }),
      });
      if (!response.ok) {
        throw new Error("Erro ao remover a galeria.");
      }
      setGalleries(galleries.filter((gallery) => gallery.id !== idToRemove));
      setMessage("Galeria removida com sucesso!");
      if (editingGalleryId === idToRemove) {
        clearForm();
      }
    } catch (error) {
      console.error(error);
      setMessage("Erro ao remover a galeria.");
    } finally {
      setLoading(false);
    }
  };

  // Lida com a seleção de múltiplos arquivos
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPhotos(files);
      // Inicializa os textos alternativos com strings vazias para cada arquivo
      setNewPhotoAltTexts(files.map(() => ""));
    }
  };

  // Lida com a mudança do texto alternativo da foto
  const handleAltTextChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedAltTexts = [...newPhotoAltTexts];
    updatedAltTexts[index] = e.target.value;
    setNewPhotoAltTexts(updatedAltTexts);
  };

  // Remove uma foto da lista de arquivos a serem enviados
  const handleRemovePhoto = (indexToRemove: number) => {
    setNewPhotos(newPhotos.filter((_, index) => index !== indexToRemove));
    setNewPhotoAltTexts(newPhotoAltTexts.filter((_, index) => index !== indexToRemove));
  };

  // Envia o formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!title || !slug) {
      setMessage("O título e o slug são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const currentPhotos: GalleryPhoto[] = [];
      if (editingGalleryId) {
        const existingGallery = galleries.find(g => g.id === editingGalleryId);
        if (existingGallery) {
          currentPhotos.push(...existingGallery.photos);
        }
      }

      // Faz o upload de novas fotos adicionadas no formulário
      const uploadedPhotos: GalleryPhoto[] = await Promise.all(
        newPhotos.map(async (file, index) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Erro no upload do arquivo ${file.name}.`);
          }
          const data = await uploadResponse.json();
          return { url: data.url, altText: newPhotoAltTexts[index] };
        })
      );

      const allPhotos = [...currentPhotos, ...uploadedPhotos];

      if (!editingGalleryId && allPhotos.length === 0) {
        setMessage("Uma nova galeria precisa de pelo menos uma foto.");
        setLoading(false);
        return;
      }

      const requestData = {
        title,
        slug,
        photos: allPhotos,
      };

      let response;
      if (editingGalleryId) {
        response = await fetch("/api/crud/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingGalleryId, ...requestData }),
        });
      } else {
        response = await fetch("/api/crud/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        throw new Error("Erro ao salvar a galeria.");
      }

      const savedGallery = await response.json();
      setMessage(editingGalleryId ? "Galeria atualizada com sucesso!" : "Galeria adicionada com sucesso!");

      if (editingGalleryId) {
        setGalleries(galleries.map(g => g.id === editingGalleryId ? savedGallery : g));
      } else {
        setGalleries([...galleries, savedGallery]);
      }

      clearForm();
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar a galeria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {message && (
        <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {/* Seção para Adicionar/Editar Galeria */}
      <div className="mb-6 space-y-4 border border-gray-300 p-4 rounded-md">
        <h3 className="text-2xl font-bold text-gray-800">
          {editingGalleryId ? "Editar Galeria Existente" : "Adicionar Nova Galeria"}
        </h3>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Título da Galeria</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Viagem à praia"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold mb-2">Slug da Galeria (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="ex: viagem-a-praia"
            required
          />
        </div>

        {/* Seção para Adicionar/Gerenciar Fotos */}
        <div className="border border-dashed border-gray-400 p-4 rounded-md">
          <h4 className="text-lg font-semibold text-gray-600 mb-4">Fotos ({editingGalleryId ? "Novas fotos para adicionar" : "Fotos da galeria"})</h4>
          <div className="space-y-4">
            <label htmlFor="file-input" className="block p-4 text-center text-gray-700 bg-gray-50 rounded-md border-2 border-dashed border-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
              Clique para selecionar as fotos
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              multiple // Permite a seleção de múltiplos arquivos
            />

            {newPhotos.length > 0 && (
              <div className="space-y-4">
                {newPhotos.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 border border-gray-200 rounded-md bg-gray-50">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <input
                        type="text"
                        value={newPhotoAltTexts[index]}
                        onChange={(e) => handleAltTextChange(e, index)}
                        className="w-full p-1 mt-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="Texto alternativo"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors self-start"
                      title="Remover foto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {editingGalleryId && (
          <button
            type="button"
            onClick={clearForm}
            className="w-full p-3 mt-4 bg-gray-400 text-gray-800 font-bold rounded-md hover:bg-gray-500 transition-colors"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <button
        type="submit"
        className={`w-full p-3 text-white font-bold rounded-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        disabled={loading}
      >
        {loading ? "Salvando..." : editingGalleryId ? "Atualizar Galeria" : "Adicionar Galeria"}
      </button>

      {/* Lista de Galerias Atuais */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Galerias Atuais</h3>
        <ul className="space-y-4">
          {galleries.map((gallery) => (
            <li key={gallery.id} className="bg-gray-100 p-4 rounded-md shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{gallery.title}</p>
                <p className="text-sm text-gray-600">Slug: {gallery.slug}</p>
                <p className="text-xs text-gray-500">{gallery.photos.length} foto(s)</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditGallery(gallery)}
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  title="Editar Galeria"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveGallery(gallery.id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  title="Remover Galeria"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
