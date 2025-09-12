// src/components/AdminDestinos.tsx

import React, { useState, useEffect, useCallback } from "react";
import { FaCalendar, FaEdit, FaImage, FaPlus, FaTrash } from "react-icons/fa";

// Definições de tipo ajustadas para o estado local
interface PacoteFoto {
    id?: string;
    url: string | File;
    caption: string;
}

interface PacoteDate {
    id?: string;
    saida: string;
    retorno: string;
    vagas_total: number;
    vagas_disponiveis: number;
    price: number;
    price_card: number;
    status: string;
    notes: string;
}

interface Pacote {
    id?: string;
    title: string;
    subtitle: string;
    slug?: string;
    description: string; // Mudado para string para o estado do formulário
    fotos: PacoteFoto[];
    dates: PacoteDate[];
}

interface Destino {
    id: string;
    title: string;
    slug: string;
    subtitle: string;
    description: { html: string };
    image: string;
    order: number;
    pacotes: Pacote[];
}

interface FormState {
    id?: string;
    title: string;
    subtitle: string;
    description: string;
    image: string | File;
    order: number;
    pacotes: {
        id?: string;
        title: string;
        subtitle: string;
        description: string;
        fotos: PacoteFoto[];
        dates: PacoteDate[];
    }[];
}

// Definição do estado do modal de confirmação
interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isSuccess: boolean;
}

// Funções utilitárias
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const d = new Date(dateString);
        return d.toISOString().substring(0, 16);
    } catch {
        return '';
    }
};

const slugify = (text: string): string => {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// Componente RichTextEditor simulado
const RichTextEditor = ({ value, onChange, placeholder }: { value: string, onChange: (value: string) => void, placeholder: string }) => {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg h-48 resize-y"
        />
    );
};

// Componente Modal personalizado para substituição de alert e confirm
const Modal = ({ isOpen, onClose, title, message, onConfirm, isSuccess }: { isOpen: boolean, onClose: () => void, title: string, message: string, onConfirm?: () => void, isSuccess?: boolean }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm mx-4 transition-all duration-300 transform scale-95 opacity-0 ${isOpen ? "scale-100 opacity-100" : ""}`}>
                <h3 className={`text-xl font-bold mb-4 ${isSuccess ? 'text-green-600' : 'text-gray-700 dark:text-gray-400'}`}>{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    {onConfirm && (
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                            Confirmar
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 ${onConfirm ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded-lg font-semibold transition`}
                    >
                        {onConfirm ? 'Cancelar' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente principal
export default function AdminDestinos() {
    const [destinos, setDestinos] = useState<Destino[]>([]);
    const [form, setForm] = useState<FormState>({
        title: "",
        subtitle: "",
        description: "",
        image: "",
        order: 0,
        pacotes: [{
            title: "",
            subtitle: "",
            description: "",
            fotos: [{ url: "", caption: "" }],
            dates: [{
                saida: "",
                retorno: "",
                vagas_total: 50,
                vagas_disponiveis: 50,
                price: 0,
                price_card: 0,
                status: "disponivel",
                notes: ""
            }],
        }],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        isSuccess: false,
    });

    // Funções de manipulação do modal
    const showModal = (title: string, message: string, onConfirm?: () => void, isSuccess: boolean = false) => {
        setModalState({ isOpen: true, title, message, onConfirm: onConfirm || (() => {}), isSuccess });
    };

    const closeModal = () => {
        setModalState({ ...modalState, isOpen: false });
    };

    // Função simulada de busca de dados
    const fetchDestinos = async () => {
        setLoading(true);
        setError("");
        try {
            // Simulação de chamada de API
            const res = await new Promise<any>((resolve) => {
                setTimeout(() => {
                    const mockData = [
                        {
                            id: "1", title: "Paraíso Tropical", slug: "paraiso-tropical", subtitle: "As mais belas praias", description: { html: "<p>Desfrute de praias paradisíacas.</p>" }, image: "https://placehold.co/400x200/cccccc/333333?text=Destino+1", order: 1,
                            pacotes: [
                                { id: "p1", title: "Aventura na Ilha", subtitle: "Uma semana de sol", description: { html: "<p>Explore a natureza da ilha.</p>" }, fotos: [{ url: "https://placehold.co/200x200/aaaaaa/333333?text=Pacote+1+Foto", caption: "Ilha paradisíaca" }], dates: [{ saida: "2024-12-01T10:00", retorno: "2024-12-08T18:00", vagas_total: 50, vagas_disponiveis: 45, price: 1500, price_card: 1650, status: "disponivel", notes: "" }] }
                            ]
                        },
                        {
                            id: "2", title: "Montanhas Gélidas", slug: "montanhas-gelidas", subtitle: "Picos nevados e paisagens de tirar o fôlego", description: { html: "<p>Conquiste o topo do mundo.</p>" }, image: "https://placehold.co/400x200/999999/ffffff?text=Destino+2", order: 2,
                            pacotes: [
                                { id: "p2", title: "Expedição ao Cume", subtitle: "Uma jornada inesquecível", description: { html: "<p>Escalada e trekking para os aventureiros.</p>" }, fotos: [{ url: "https://placehold.co/200x200/777777/ffffff?text=Pacote+2+Foto", caption: "Paisagem de montanha" }], dates: [{ saida: "2025-01-15T08:00", retorno: "2025-01-25T17:00", vagas_total: 30, vagas_disponiveis: 10, price: 2500, price_card: 2750, status: "disponivel", notes: "" }] }
                            ]
                        }
                    ];
                    resolve({ ok: true, json: () => Promise.resolve({ success: true, destinos: mockData }) });
                }, 500);
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const sortedDestinos = data.destinos.sort((a: Destino, b: Destino) => a.order - b.order);
                setDestinos(sortedDestinos);
            } else {
                setError(data.message || "Erro ao carregar destinos.");
            }
        } catch (e) {
            setError("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinos();
    }, []);

    const resetForm = () => {
        setForm({
            title: "",
            subtitle: "",
            description: "",
            image: "",
            order: 0,
            pacotes: [{
                title: "",
                subtitle: "",
                description: "",
                fotos: [{ url: "", caption: "" }],
                dates: [{
                    saida: "",
                    retorno: "",
                    vagas_total: 50,
                    vagas_disponiveis: 50,
                    price: 0,
                    price_card: 0,
                    status: "disponivel",
                    notes: ""
                }],
            }],
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "order") {
            setForm({ ...form, [name]: parseInt(value, 10) || 0 });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleDestinoDescriptionChange = (value: string) => {
        setForm({ ...form, description: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setForm({ ...form, [name]: files[0] });
        }
    }

    const handlePacoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, pacoteIndex: number) => {
        const { name, value } = e.target;
        const newPacotes = [...form.pacotes];
        newPacotes[pacoteIndex] = { ...newPacotes[pacoteIndex], [name]: value };
        setForm({ ...form, pacotes: newPacotes });
    };

    const handlePacoteDescriptionChange = (value: string, pacoteIndex: number) => {
        const newPacotes = [...form.pacotes];
        newPacotes[pacoteIndex] = { ...newPacotes[pacoteIndex], description: value };
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>, pacoteIndex: number, fotoIndex: number) => {
        const { name, value, files } = e.target;
        const newPacotes = [...form.pacotes];
        const newFotos = [...newPacotes[pacoteIndex].fotos];

        if (name === "url" && files && files[0]) {
            newFotos[fotoIndex] = { ...newFotos[fotoIndex], [name]: files[0] };
        } else if (name === "caption") {
            newFotos[fotoIndex] = { ...newFotos[fotoIndex], [name]: value };
        }
        newPacotes[pacoteIndex].fotos = newFotos;
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, pacoteIndex: number, dateIndex: number) => {
        const { name, value } = e.target;
        const newPacotes = [...form.pacotes];
        const newDates = [...newPacotes[pacoteIndex].dates];

        if (name === "price" || name === "price_card" || name === "vagas_total" || name === "vagas_disponiveis") {
            newDates[dateIndex] = { ...newDates[dateIndex], [name]: parseInt(value, 10) || 0 };
        } else {
            newDates[dateIndex] = { ...newDates[dateIndex], [name]: value };
        }
        newPacotes[pacoteIndex].dates = newDates;
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleAddPacote = () => {
        setForm({
            ...form,
            pacotes: [...form.pacotes, {
                title: "",
                subtitle: "",
                description: "",
                fotos: [{ url: "", caption: "" }],
                dates: [{ saida: "", retorno: "", vagas_total: 50, vagas_disponiveis: 50, price: 0, price_card: 0, status: "disponivel", notes: "" }],
            }],
        });
    };

    const handleRemovePacote = (index: number) => {
        const newPacotes = form.pacotes.filter((_, i) => i !== index);
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleAddFoto = (pacoteIndex: number) => {
        const newPacotes = [...form.pacotes];
        newPacotes[pacoteIndex].fotos = [...newPacotes[pacoteIndex].fotos, { url: "", caption: "" }];
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleRemoveFoto = (pacoteIndex: number, fotoIndex: number) => {
        const newPacotes = [...form.pacotes];
        const newFotos = newPacotes[pacoteIndex].fotos.filter((_, i) => i !== fotoIndex);
        newPacotes[pacoteIndex].fotos = newFotos;
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleAddDate = (pacoteIndex: number) => {
        const newPacotes = [...form.pacotes];
        newPacotes[pacoteIndex].dates = [...newPacotes[pacoteIndex].dates, { saida: "", retorno: "", vagas_total: 50, vagas_disponiveis: 50, price: 0, price_card: 0, status: "disponivel", notes: "" }];
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleRemoveDate = (pacoteIndex: number, dateIndex: number) => {
        const newPacotes = [...form.pacotes];
        const newDates = newPacotes[pacoteIndex].dates.filter((_, i) => i !== dateIndex);
        newPacotes[pacoteIndex].dates = newDates;
        setForm({ ...form, pacotes: newPacotes });
    };

    const handleEdit = useCallback((destino: Destino) => {
        setForm({
            id: destino.id,
            title: destino.title,
            subtitle: destino.subtitle || "",
            description: destino.description?.html || "",
            image: destino.image || "",
            order: destino.order || 0,
            pacotes: (destino.pacotes || []).map(pacote => ({
                id: pacote.id,
                title: pacote.title || "",
                subtitle: pacote.subtitle || "",
                description: (pacote as any).description?.html || "",
                fotos: (pacote.fotos || []).map(foto => ({
                    id: foto.id,
                    url: foto.url || "",
                    caption: foto.caption || ""
                })),
                dates: (pacote.dates || []).map(date => ({
                    id: date.id,
                    saida: formatDateForInput(date.saida),
                    retorno: formatDateForInput(date.retorno),
                    vagas_total: date.vagas_total || 50,
                    vagas_disponiveis: date.vagas_disponiveis || 50,
                    price: date.price || 0,
                    price_card: date.price_card || 0,
                    status: date.status || "disponivel",
                    notes: date.notes || ""
                }))
            }))
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Simulação de upload de imagem
            let imageUrl = form.image;
            if (form.image instanceof File) {
                // Lógica de upload simulada
                const uploadRes = await new Promise<any>((resolve) => {
                    setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ success: true, url: URL.createObjectURL(form.image as File) }) }), 500);
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.message || "Erro no upload da imagem do destino.");
                imageUrl = uploadData.url;
            }

            const pacotesWithUrls = await Promise.all(
                form.pacotes.map(async (pacote) => {
                    const fotosWithUrls = await Promise.all(
                        pacote.fotos.map(async (foto) => {
                            if (foto.url instanceof File) {
                                // Lógica de upload simulada
                                const uploadRes = await new Promise<any>((resolve) => {
                                    setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ success: true, url: URL.createObjectURL(foto.url as File) }) }), 500);
                                });
                                const uploadData = await uploadRes.json();
                                if (!uploadRes.ok) throw new Error(uploadData.message || `Erro no upload da foto ${foto.caption || ''}.`);
                                return { ...foto, url: uploadData.url };
                            }
                            return foto;
                        })
                    );
                    return {
                        ...pacote,
                        slug: slugify(pacote.title),
                        fotos: fotosWithUrls,
                        description: { html: pacote.description }
                    };
                })
            );

            // Simulação de chamada de API para salvar
            const method = form.id ? "PUT" : "POST";
            const res = await new Promise<any>((resolve) => {
                setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ success: true }) }), 500);
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showModal("Sucesso", `Destino ${form.id ? 'atualizado' : 'criado'} com sucesso!`, undefined, true);
                resetForm();
                fetchDestinos();
            } else {
                showModal("Erro", data.message || `Erro ao ${form.id ? 'atualizar' : 'criar'} destino.`);
            }
        } catch (e: any) {
            showModal("Erro", e.message || "Erro ao conectar com a API ou no upload da imagem.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, isPacote = false) => {
        const message = `Tem certeza que deseja excluir ${isPacote ? "este pacote" : "este destino"}? Esta ação é irreversível.`;
        showModal("Confirmação de Exclusão", message, async () => {
            try {
                // Simulação de chamada de API
                const res = await new Promise<any>((resolve) => {
                    setTimeout(() => resolve({ ok: true }), 500);
                });
                if (res.ok) {
                    showModal("Sucesso", `${isPacote ? "Pacote" : "Destino"} excluído com sucesso!`, undefined, true);
                    fetchDestinos();
                } else {
                    const data = await res.json();
                    showModal("Erro", data.message || "Erro ao excluir.");
                }
            } catch (e) {
                showModal("Erro", "Erro ao conectar com a API.");
            }
        });
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-800 dark:text-gray-200 text-center md:text-left">Gerenciar Destinos e Pacotes</h1>
            
            {/* Seção do Formulário */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">{form.id ? "Editar Destino" : "Adicionar Novo Destino"}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Campos do Destino */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título do Destino" required className="p-3 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo do Destino" className="p-3 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <label className="block text-gray-700 dark:text-gray-400 font-semibold">Descrição do Destino:</label>
                    <RichTextEditor value={form.description} onChange={handleDestinoDescriptionChange} placeholder="Descrição rica do destino" />
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="text-gray-700 dark:text-gray-400 font-semibold">Imagem Principal:</label>
                        {typeof form.image === 'string' && form.image && (
                            <img src={form.image} alt="Destino" className="w-24 h-24 object-cover rounded-xl shadow-md" />
                        )}
                        <input type="file" name="image" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <label className="block text-gray-700 dark:text-gray-400 font-semibold">Ordem de exibição:</label>
                    <input type="number" name="order" value={form.order} onChange={handleFormChange} required className="p-3 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    
                    <hr className="my-6 border-gray-200 dark:border-gray-700" />

                    {/* Itens de Pacote */}
                    <h3 className="text-2xl font-bold mt-4 text-gray-700 dark:text-gray-400">Pacotes do Destino</h3>
                    {form.pacotes.map((pacote, pacoteIndex) => (
                        <div key={pacote.id || pacoteIndex} className="p-6 border border-dashed border-gray-400 rounded-2xl relative mb-8">
                            <button type="button" onClick={() => handleRemovePacote(pacoteIndex)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-200 rounded-full p-2 bg-red-100">
                                <FaTrash size={16} />
                            </button>
                            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-400 mb-4">Pacote #{pacoteIndex + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input type="text" name="title" value={pacote.title} onChange={(e) => handlePacoteChange(e, pacoteIndex)} placeholder="Título do Pacote" required className="p-3 dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                <input type="text" name="subtitle" value={pacote.subtitle} onChange={(e) => handlePacoteChange(e, pacoteIndex)} placeholder="Subtítulo do Pacote" className="p-3 dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                            </div>
                            <label className="block text-gray-700 dark:text-gray-400 font-semibold">Descrição do Pacote:</label>
                            <RichTextEditor value={pacote.description} onChange={(value) => handlePacoteDescriptionChange(value, pacoteIndex)} placeholder="Descrição rica do pacote" />

                            {/* Seção de Fotos */}
                            <h5 className="text-md font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-400">Fotos</h5>
                            {pacote.fotos.map((foto, fotoIndex) => (
                                <div key={foto.id || fotoIndex} className="flex flex-col md:flex-row gap-4 items-center p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <button type="button" onClick={() => handleRemoveFoto(pacoteIndex, fotoIndex)} className="text-red-500 hover:text-red-700">
                                        <FaTrash size={16} />
                                    </button>
                                    {typeof foto.url === 'string' && foto.url && (
                                        <img src={foto.url} alt="Visualização" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                                    )}
                                    <input type="text" name="caption" value={foto.caption} onChange={(e) => handleFotoChange(e, pacoteIndex, fotoIndex)} placeholder="Legenda da foto" className="flex-1 p-2 dark:bg-gray-800 dark:text-gray-200 border rounded-lg" />
                                    <label htmlFor={`foto-${pacoteIndex}-${fotoIndex}`} className="cursor-pointer text-blue-500 hover:text-blue-700 transition">
                                        <FaImage size={24} />
                                    </label>
                                    <input type="file" name="url" id={`foto-${pacoteIndex}-${fotoIndex}`} onChange={(e) => handleFotoChange(e, pacoteIndex, fotoIndex)} required={!foto.url || foto.url instanceof File} className="hidden" />
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddFoto(pacoteIndex)} className="mt-2 text-blue-500 flex items-center gap-1 font-medium hover:text-blue-700 transition">
                                <FaPlus size={20} /> Adicionar Foto
                            </button>

                            {/* Seção de Datas */}
                            <h5 className="text-md font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-400">Datas de Saída</h5>
                            {pacote.dates.map((date, dateIndex) => (
                                <div key={date.id || dateIndex} className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-300 rounded-xl mb-4 relative">
                                    <button type="button" onClick={() => handleRemoveDate(pacoteIndex, dateIndex)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <FaTrash size={16} />
                                    </button>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Saída:</span>
                                        <input type="datetime-local" name="saida" value={date.saida} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Retorno:</span>
                                        <input type="datetime-local" name="retorno" value={date.retorno} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Vagas Totais:</span>
                                        <input type="number" name="vagas_total" value={date.vagas_total} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Vagas Disponíveis:</span>
                                        <input type="number" name="vagas_disponiveis" value={date.vagas_disponiveis} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Preço à Vista:</span>
                                        <input type="number" name="price" value={date.price} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Preço a Prazo:</span>
                                        <input type="number" name="price_card" value={date.price_card} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                    <label className="flex flex-col">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Status:</span>
                                        <select name="status" value={date.status} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg">
                                            <option value="disponivel">Disponível</option>
                                            <option value="esgotado">Esgotado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                    </label>
                                    <label className="flex flex-col col-span-2 md:col-span-1 lg:col-span-2">
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">Observações:</span>
                                        <input type="text" name="notes" value={date.notes} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} className="p-2 w-full dark:bg-gray-700 dark:text-gray-200 border rounded-lg" />
                                    </label>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddDate(pacoteIndex)} className="mt-2 text-blue-500 flex items-center gap-1 font-medium hover:text-blue-700 transition">
                                <FaCalendar size={20} /> Adicionar Data
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddPacote} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition">
                        <FaPlus size={24} /> Adicionar Novo Pacote
                    </button>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-4 rounded-xl flex-1 font-bold shadow-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {loading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Destino" : "Salvar Destino")}
                        </button>
                        {form.id && (
                            <button type="button" onClick={resetForm} className="bg-red-500 text-white p-4 rounded-xl flex-1 font-bold shadow-md hover:bg-red-600 transition">
                                Cancelar Edição
                            </button>
                        )}
                    </div>
                </form>
                {error && <p className="text-red-500 mt-4 font-medium text-center">{error}</p>}
            </section>

            {/* Lista de Destinos */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Destinos Existentes</h2>
                {loading ? (
                    <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
                ) : destinos.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">Nenhum destino encontrado.</p>
                ) : (
                    <div className="space-y-4">
                        {destinos.map((destino) => (
                            <div key={destino.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-400">{destino.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">{destino.subtitle}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                        <button onClick={() => handleEdit(destino)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-200">
                                            <FaEdit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(destino.id)} className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-200">
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                                {destino.pacotes && destino.pacotes.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="text-lg font-bold mb-2 text-gray-700 dark:text-gray-400">Pacotes:</h4>
                                        {destino.pacotes.map((pacote) => (
                                            <div key={pacote.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-2">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-800 dark:text-gray-400">{pacote.title}</h5>
                                                    <p className="text-sm text-gray-500 dark:text-gray-300">Slug: {pacote.slug}</p>
                                                </div>
                                                <button onClick={() => handleDelete(pacote.id as string, true)} className="bg-red-400 text-white p-2 rounded-lg text-sm font-medium hover:bg-red-500 transition">Excluir Pacote</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal para mensagens e confirmações */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
                isSuccess={modalState.isSuccess}
            />
        </div>
    );
}
