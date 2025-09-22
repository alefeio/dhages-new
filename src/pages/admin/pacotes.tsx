// src/components/AdminDestinos.tsx



import { useState, useEffect, useCallback } from "react";

import Head from "next/head";

import { MdAdd, MdAddPhotoAlternate, MdDelete, MdEdit, MdCalendarMonth } from 'react-icons/md';

// Importe as novas tags de collapse

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import AdminLayout from "components/admin/AdminLayout";

import { slugify } from "utils/slugify";

import dynamic from "next/dynamic";



const RichTextEditor = dynamic(

    () => import("components/RichTextEditor"),

    { ssr: false }

);



// Definições de tipo ajustadas

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

    // Descrição do Pacote é um objeto { html: string } na API, mas string no form state

    description: { html: string };

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



// O estado do formulário armazena a string HTML para compatibilidade com o editor

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



const formatDateForInput = (dateString: string) => {

    if (!dateString) return '';

    try {

        const d = new Date(dateString);

        return d.toISOString().substring(0, 16);

    } catch {

        return '';

    }

};



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

                vagas_total: 50, // VALOR PADRÃO

                vagas_disponiveis: 50, // VALOR PADRÃO

                price: 0,

                price_card: 0,

                status: "disponivel",

                notes: ""

            }],

        }],

    });

    // NOVO ESTADO: para controlar qual pacote está aberto no formulário

    const [openPacotes, setOpenPacotes] = useState<Record<string, boolean>>({});

    // NOVO ESTADO: para controlar qual destino está aberto na lista de destinos

    const [openDestinos, setOpenDestinos] = useState<Record<string, boolean>>({});



    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");



    useEffect(() => {

        fetchDestinos();

    }, []);



    const fetchDestinos = async () => {

        setLoading(true);

        try {

            const res = await fetch("/api/crud/destinos", { method: "GET" });

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

                    vagas_total: 50, // VALOR RESETADO

                    vagas_disponiveis: 50, // VALOR RESETADO

                    price: 0,

                    price_card: 0,

                    status: "disponivel",

                    notes: ""

                }],

            }],

        });

        // Resetar o estado de collapse ao limpar o formulário

        setOpenPacotes({});

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



        if (name === "url" && files) {

            newFotos[fotoIndex] = { ...newFotos[fotoIndex], [name]: files[0] };

        } else {

            newFotos[fotoIndex] = { ...newFotos[fotoIndex], [name]: value };

        }

        newPacotes[pacoteIndex].fotos = newFotos;

        setForm({ ...form, pacotes: newPacotes });

    };



    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, pacoteIndex: number, dateIndex: number) => {

        const { name, value } = e.target;

        const newPacotes = [...form.pacotes];

        const newDates = [...newPacotes[pacoteIndex].dates];



        if (name === "price" || name === "price_card") {

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

                description: pacote.description?.html || "",

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

            let imageUrl = form.image;

            if (form.image instanceof File) {

                const formData = new FormData();

                formData.append("file", form.image);

                const uploadRes = await fetch("/api/upload", {

                    method: "POST",

                    body: formData,

                });

                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) {

                    throw new Error(uploadData.message || "Erro no upload da imagem do destino.");

                }

                imageUrl = uploadData.url;

            }



            const pacotesWithUrls = await Promise.all(

                form.pacotes.map(async (pacote) => {

                    const fotosWithUrls = await Promise.all(

                        pacote.fotos.map(async (foto) => {

                            if (foto.url instanceof File) {

                                const formData = new FormData();

                                formData.append("file", foto.url);

                                const uploadRes = await fetch("/api/upload", {

                                    method: "POST",

                                    body: formData,

                                });

                                const uploadData = await uploadRes.json();

                                if (!uploadRes.ok) {

                                    throw new Error(uploadData.message || `Erro no upload da foto ${foto.caption || ''}.`);

                                }

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



            const method = form.id ? "PUT" : "POST";

            const body = {

                ...form,

                slug: slugify(form.title),

                image: imageUrl,

                description: { html: form.description },

                pacotes: pacotesWithUrls

            };



            const res = await fetch("/api/crud/destinos", {

                method,

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify(body),

            });



            const data = await res.json();

            if (res.ok && data.success) {

                alert(`Destino ${form.id ? 'atualizado' : 'criado'} com sucesso!`);

                resetForm();

                fetchDestinos();

            } else {

                setError(data.message || `Erro ao ${form.id ? 'atualizar' : 'criar'} destino.`);

            }

        } catch (e: any) {

            setError(e.message || "Erro ao conectar com a API ou no upload da imagem.");

        } finally {

            setLoading(false);

        }

    };



    const handleDelete = async (id: string, isPacote = false) => {

        if (!confirm(`Tem certeza que deseja excluir ${isPacote ? "este pacote" : "este destino"}?`)) return;



        try {

            const endpoint = isPacote ? "/api/crud/pacotes" : "/api/crud/destinos";

            const res = await fetch(endpoint, {

                method: "DELETE",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ id }),

            });

            if (res.ok) {

                alert(`${isPacote ? "Pacote" : "Destino"} excluído com sucesso!`);

                fetchDestinos();

            } else {

                const data = await res.json();

                setError(data.message || "Erro ao excluir.");

            }

        } catch (e) {

            setError("Erro ao conectar com a API.");

        }

    };



    // NOVO: Função para alternar o estado de collapse de um pacote

    const togglePacote = (index: number) => {

        setOpenPacotes(prev => ({

            ...prev,

            [index]: !prev[index]

        }));

    };



    // NOVO: Função para alternar o estado de collapse de um destino

    const toggleDestino = (id: string) => {

        setOpenDestinos(prev => ({

            ...prev,

            [id]: !prev[id]

        }));

    };



    return (

        <>

            <Head>

                <title>Admin - Destinos</title>

            </Head>

            <AdminLayout>

                <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Destinos e Pacotes</h1>

                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-10">

                    <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">{form.id ? "Editar Destino" : "Adicionar Novo Destino"}</h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        {/* Campos do Destino */}

                        <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título do Destino" required className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                        <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo do Destino" className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                        <label className="block text-gray-700 dark:text-gray-400 font-semibold mt-4">Descrição do Destino:</label>

                        <RichTextEditor value={form.description} onChange={handleDestinoDescriptionChange} placeholder="Descrição rica do destino" />

                        <div className="flex items-center gap-4">

                            <label className="block text-gray-700 dark:text-gray-400">Imagem do Destino</label>

                            {typeof form.image === 'string' && form.image && (

                                <img src={form.image} alt="Destino" className="w-24 h-24 object-cover rounded-lg" />

                            )}

                            <input type="file" name="image" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

                        </div>

                        <label className="block text-gray-700 dark:text-gray-400">Ordem de exibição:</label>

                        <input type="number" name="order" value={form.order} onChange={handleFormChange} required className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                        <hr className="my-6" />



                        {/* Itens de Pacote */}

                        <h3 className="text-xl font-bold mt-6 text-gray-700 dark:text-gray-400">Pacotes do Destino</h3>

                        {form.pacotes.map((pacote, pacoteIndex) => (

                            <div key={pacote.id || pacoteIndex} className="p-6 border border-dashed border-gray-400 rounded-xl relative mb-8">

                                {/* NOVO: Botão para abrir/fechar e título do pacote */}

                                <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => togglePacote(pacoteIndex)}>

                                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-400">Pacote #{pacoteIndex + 1}: {pacote.title || "Novo Pacote"}</h4>

                                    <div className="flex items-center gap-2">

                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemovePacote(pacoteIndex); }} className="text-red-500 hover:text-red-700 transition duration-200">

                                            <MdDelete size={24} />

                                        </button>

                                        {openPacotes[pacoteIndex] ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}

                                    </div>

                                </div>



                                {/* NOVO: Conteúdo do pacote em collapse */}

                                {openPacotes[pacoteIndex] && (

                                    <>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <input type="text" name="title" value={pacote.title} onChange={(e) => handlePacoteChange(e, pacoteIndex)} placeholder="Título do Pacote" required className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                            <input type="text" name="subtitle" value={pacote.subtitle} onChange={(e) => handlePacoteChange(e, pacoteIndex)} placeholder="Subtítulo do Pacote" className="p-3 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                            <label className="block text-gray-700 dark:text-gray-400 font-semibold mt-4 col-span-2">Descrição do Pacote:</label>

                                        </div>

                                        <RichTextEditor value={pacote.description} onChange={(value) => handlePacoteDescriptionChange(value, pacoteIndex)} placeholder="Descrição rica do pacote" />



                                        {/* Seção de Fotos */}

                                        <h5 className="text-md font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-400">Fotos</h5>

                                        {pacote.fotos.map((foto, fotoIndex) => (

                                            <div key={foto.id || fotoIndex} className="flex gap-4 items-center mb-2">

                                                <button type="button" onClick={() => handleRemoveFoto(pacoteIndex, fotoIndex)} className="text-red-500 hover:text-red-700">

                                                    <MdDelete size={20} />

                                                </button>

                                                {typeof foto.url === 'string' && foto.url && (

                                                    <img src={foto.url} alt="Visualização" className="w-16 h-16 object-cover rounded-lg" />

                                                )}

                                                <input type="text" name="caption" value={foto.caption} onChange={(e) => handleFotoChange(e, pacoteIndex, fotoIndex)} placeholder="Legenda da foto" className="flex-1 p-2 dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                <label htmlFor={`foto-${pacoteIndex}-${fotoIndex}`} className="cursor-pointer text-blue-500 hover:text-blue-700">

                                                    <MdAddPhotoAlternate size={24} />

                                                </label>

                                                <input type="file" name="url" id={`foto-${pacoteIndex}-${fotoIndex}`} onChange={(e) => handleFotoChange(e, pacoteIndex, fotoIndex)} required={!foto.url || foto.url instanceof File} className="hidden" />

                                            </div>

                                        ))}

                                        <button type="button" onClick={() => handleAddFoto(pacoteIndex)} className="mt-2 text-blue-500 flex items-center gap-1 hover:text-blue-700">

                                            <MdAdd size={20} /> Adicionar Foto

                                        </button>



                                        {/* Seção de Datas */}

                                        <h5 className="text-md font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-400">Datas de Saída</h5>

                                        {pacote.dates.map((date, dateIndex) => (

                                            <div key={date.id || dateIndex} className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-300 rounded-lg mb-2 relative">

                                                <button type="button" onClick={() => handleRemoveDate(pacoteIndex, dateIndex)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">

                                                    <MdDelete size={20} />

                                                </button>

                                                <label className="col-span-1">

                                                    Saída:

                                                    <input type="datetime-local" name="saida" value={date.saida} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                </label>

                                                <label className="col-span-1">

                                                    Retorno:

                                                    <input type="datetime-local" name="retorno" value={date.retorno} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                </label>

                                                <label className="col-span-1">

                                                    Preço à Vista:

                                                    <input type="number" name="price" value={date.price} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                </label>

                                                <label className="col-span-1">

                                                    Preço a Prazo:

                                                    <input type="number" name="price_card" value={date.price_card} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} required className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                </label>

                                                <label className="col-span-1">

                                                    Status:

                                                    <select name="status" value={date.status} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg">

                                                        <option value="disponivel">Disponível</option>

                                                        <option value="esgotado">Esgotado</option>

                                                        <option value="cancelado">Cancelado</option>

                                                    </select>

                                                </label>

                                                <label className="col-span-2">

                                                    Observações:

                                                    <input type="text" name="notes" value={date.notes} onChange={(e) => handleDateChange(e, pacoteIndex, dateIndex)} className="mt-1 p-2 w-full dark:bg-gray-600 dark:text-gray-200 border rounded-lg" />

                                                </label>

                                            </div>

                                        ))}

                                        <button type="button" onClick={() => handleAddDate(pacoteIndex)} className="mt-2 text-blue-500 flex items-center gap-1 hover:text-blue-700">

                                            <MdCalendarMonth size={20} /> Adicionar Data

                                        </button>

                                    </>

                                )}

                            </div>

                        ))}

                        <button type="button" onClick={handleAddPacote} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">

                            <MdAdd size={24} /> Adicionar Novo Pacote

                        </button>



                        <div className="flex flex-col sm:flex-row gap-4 mt-6">

                            <button type="submit" disabled={loading} className="bg-blue-600 text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400">

                                {loading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Destino" : "Salvar Destino")}

                            </button>

                            {form.id && (

                                <button type="button" onClick={resetForm} className="bg-red-500 text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-red-600 transition duration-200">

                                    Cancelar Edição

                                </button>

                            )}

                        </div>

                    </form>

                    {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}

                </section>



                {/* Lista de Destinos */}

                <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-10">

                    <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Destinos Existentes</h2>

                    {loading ? (

                        <p className="text-gray-600">Carregando...</p>

                    ) : destinos.length === 0 ? (

                        <p className="text-gray-600">Nenhum destino encontrado.</p>

                    ) : (

                        destinos.map((destino) => (

                            <div key={destino.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-sm mb-4">

                                {/* NOVO: Cabeçalho do Destino com botão de collapse */}

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 cursor-pointer" onClick={() => toggleDestino(destino.id)}>

                                    <div className="flex-1">

                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-400">{destino.title}</h3>

                                        <p className="text-sm text-gray-500">{destino.subtitle}</p>

                                    </div>

                                    <div className="flex gap-2 mt-4 md:mt-0">

                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(destino); }} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200">

                                            <MdEdit size={20} className="text-white" />

                                        </button>

                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(destino.id); }} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200">

                                            <MdDelete size={20} className="text-white" />

                                        </button>

                                        <div className="p-2">

                                            {openDestinos[destino.id] ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}

                                        </div>

                                    </div>

                                </div>

                                {/* NOVO: Conteúdo dos pacotes em collapse */}

                                {openDestinos[destino.id] && destino.pacotes.length > 0 && (

                                    <div className="mt-4 border-t border-gray-200 pt-4">

                                        <h4 className="text-lg font-bold mb-2 text-gray-700 dark:text-gray-400">Pacotes:</h4>

                                        {destino.pacotes.map((pacote) => (

                                            <div key={pacote.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center mb-2">

                                                <div className="flex-1">

                                                    <h5 className="font-semibold text-gray-800 dark:text-gray-400">{pacote.title}</h5>

                                                </div>

                                                <button onClick={() => handleDelete(pacote.id as string, true)} className="bg-red-400 text-white p-2 rounded-lg text-sm hover:bg-red-500 transition duration-200">Excluir Pacote</button>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        ))

                    )}
                </section>
            </AdminLayout>
        </>
    );
}