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
    const [existingPhotos, setExistingPhotos] = useState<GalleryPhoto[]>([]); // Estado para fotos existentes
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotoAltTexts, setNewPhotoAltTexts] = useState<string[]>([]);
    const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);

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

    const clearForm = () => {
        setTitle("");
        setSlug("");
        setExistingPhotos([]);
        setNewPhotos([]);
        setNewPhotoAltTexts([]);
        setEditingGalleryId(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setMessage("");
    };

    const handleEditGallery = (gallery: Gallery) => {
        setEditingGalleryId(gallery.id);
        setTitle(gallery.title);
        setSlug(gallery.slug);
        setExistingPhotos(gallery.photos); // Preenche o estado com as fotos existentes
        setNewPhotos([]);
        setNewPhotoAltTexts([]);
        setMessage("");
    };

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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewPhotos(files);
            setNewPhotoAltTexts(files.map(() => ""));
        }
    };

    const handleAltTextChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const updatedAltTexts = [...newPhotoAltTexts];
        updatedAltTexts[index] = e.target.value;
        setNewPhotoAltTexts(updatedAltTexts);
    };

    // Nova função para remover fotos já existentes
    const handleRemoveExistingPhoto = (idToRemove: string) => {
        setExistingPhotos(existingPhotos.filter(photo => photo.id !== idToRemove));
    };

    // Função original renomeada para remover fotos novas
    const handleRemoveNewPhoto = (indexToRemove: number) => {
        setNewPhotos(newPhotos.filter((_, index) => index !== indexToRemove));
        setNewPhotoAltTexts(newPhotoAltTexts.filter((_, index) => index !== indexToRemove));
    };

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

            // Combina as fotos existentes com as novas fotos
            const allPhotos = [...existingPhotos, ...uploadedPhotos];

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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            {message && (
                <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {message}
                </p>
            )}

            {/* Seção para Adicionar/Editar Galeria */}
            <div className="mb-6 space-y-4 border border-gray-300 dark:border-gray-600 p-4 rounded-md">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {editingGalleryId ? "Editar Galeria Existente" : "Adicionar Nova Galeria"}
                </h3>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Título da Galeria</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Viagem à praia"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Slug da Galeria (URL)</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="ex: viagem-a-praia"
                        required
                    />
                </div>

                {/* Seção para Adicionar/Gerenciar Fotos */}
                <div className="border border-dashed border-gray-400 dark:border-gray-500 p-4 rounded-md">
                    <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4">Fotos</h4>

                    {/* Fotos Atuais */}
                    {existingPhotos.length > 0 && (
                        <div className="mb-4">
                            <h5 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Fotos Atuais</h5>
                            <div className="flex flex-wrap gap-4">
                                {existingPhotos.map((photo) => (
                                    <div key={photo.id} className="relative group w-24 h-24 rounded-md overflow-hidden shadow-sm">
                                        <img src={photo.url} alt={photo.altText || "Foto da galeria"} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingPhoto(photo.id!)}
                                                className="p-1.5 bg-red-500 dark:bg-red-600 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                                                title="Remover foto"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Botão e preview para novas fotos */}
                    <div className="space-y-4">
                        <label htmlFor="file-input" className="block p-4 text-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            Clique para selecionar {editingGalleryId ? "novas fotos" : "as fotos"}
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
                                    <div key={index} className="flex items-center gap-4 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                                            <input
                                                type="text"
                                                value={newPhotoAltTexts[index]}
                                                onChange={(e) => handleAltTextChange(e, index)}
                                                className="w-full p-1 mt-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="Texto alternativo"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewPhoto(index)}
                                            className="p-2 bg-red-500 dark:bg-red-600 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors self-start"
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
                        className="w-full p-3 mt-4 bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-md hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar Edição
                    </button>
                )}
            </div>

            <button
                type="submit"
                className={`w-full p-3 text-white font-bold rounded-md ${loading ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"}`}
                disabled={loading}
            >
                {loading ? "Salvando..." : editingGalleryId ? "Atualizar Galeria" : "Adicionar Galeria"}
            </button>

            {/* Lista de Galerias Atuais */}
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Galerias Atuais</h3>
                <ul className="space-y-4">
                    {galleries.map((gallery) => (
                        <li key={gallery.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{gallery.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Slug: {gallery.slug}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{gallery.photos.length} foto(s)</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditGallery(gallery)}
                                    className="p-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-md hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                                    title="Editar Galeria"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGallery(gallery.id)}
                                    className="p-2 bg-red-500 dark:bg-red-600 text-white rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
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