import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from "react-icons/md";
import AdminLayout from "components/admin/AdminLayout";
import { Destino, Pacote, PacoteDate, PacoteFoto } from "types";

/**
 * Estado de formulário para criar/editar Pacotes
 */
interface FormState {
    id?: string;
    title: string;
    subtitle: string;
    slug: string;
    description: any; // JSON (editor rich text/tabelas)
    destinoId: string;
    fotos: (PacoteFoto | { url?: string; file?: File })[];
    dates: PacoteDate[];
}

export default function AdminPacotes() {
    const [pacotes, setPacotes] = useState<Pacote[]>([]);
    const [destinos, setDestinos] = useState<Destino[]>([]);
    const [form, setForm] = useState<FormState>({
        title: "",
        subtitle: "",
        slug: "",
        description: "",
        destinoId: "",
        fotos: [],
        dates: [],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPacotes();
        fetchDestinos();
    }, []);

    const fetchPacotes = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/crud/pacotes");
            const data = await res.json();
            if (res.ok && data.success) {
                setPacotes(data.pacotes);
            } else {
                setError(data.message || "Erro ao carregar pacotes.");
            }
        } catch (e) {
            setError("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinos = async () => {
        try {
            const res = await fetch("/api/crud/destinos");
            const data = await res.json();
            if (res.ok && data.success) {
                setDestinos(data.destinos);
            }
        } catch (e) {
            console.error("Erro ao carregar destinos", e);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            subtitle: "",
            slug: "",
            description: "",
            destinoId: "",
            fotos: [],
            dates: [],
        });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleAddFoto = () => {
        setForm({ ...form, fotos: [...form.fotos, { file: undefined }] });
    };

    const handleFotoChange = (index: number, file: File) => {
        const newFotos = [...form.fotos];
        newFotos[index] = { file };
        setForm({ ...form, fotos: newFotos });
    };

    const handleAddDate = () => {
        setForm({
            ...form,
            dates: [
                ...form.dates,
                {
                    id: Math.random().toString(),
                    saida: "",
                    retorno: "",
                    vagas_total: 0,
                    vagas_disponiveis: 0,
                    price: 0,
                    price_card: 0,
                    status: "disponivel",
                    pacoteId: form.id || "",
                },
            ],
        });
    };

    const handleDateChange = (index: number, field: keyof PacoteDate, value: any) => {
        const newDates = [...form.dates];
        (newDates[index] as any)[field] = value;
        setForm({ ...form, dates: newDates });
    };

    const handleEdit = (pacote: Pacote) => {
        setForm({
            id: pacote.id,
            title: pacote.title,
            subtitle: pacote.subtitle || "",  // <- força string
            slug: pacote.slug,
            description: pacote.description,
            destinoId: pacote.destinoId,
            fotos: pacote.fotos,
            dates: pacote.dates,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const fotosUpload = await Promise.all(
                form.fotos.map(async (foto) => {
                    if ("file" in foto && foto.file instanceof File) {
                        const fd = new FormData();
                        fd.append("file", foto.file);
                        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
                        const uploadData = await uploadRes.json();
                        if (!uploadRes.ok) throw new Error(uploadData.message || "Erro no upload da foto.");
                        return { url: uploadData.url, pacoteId: form.id || "" };
                    }
                    return foto;
                })
            );

            const method = form.id ? "PUT" : "POST";
            const body = { ...form, fotos: fotosUpload };

            const res = await fetch("/api/crud/pacotes", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Pacote ${form.id ? "atualizado" : "criado"} com sucesso!`);
                resetForm();
                fetchPacotes();
            } else {
                setError(data.message || "Erro ao salvar pacote.");
            }
        } catch (e: any) {
            setError(e.message || "Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este pacote?")) return;

        try {
            const res = await fetch("/api/crud/pacotes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                alert("Pacote excluído com sucesso!");
                fetchPacotes();
            } else {
                const data = await res.json();
                setError(data.message || "Erro ao excluir.");
            }
        } catch {
            setError("Erro ao conectar com a API.");
        }
    };

    return (
        <>
            <Head>
                <title>Admin - Pacotes</title>
            </Head>
            <AdminLayout>
                <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Pacotes</h1>

                {/* Formulário */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título" required />
                        <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo" />
                        <input type="text" name="slug" value={form.slug} onChange={handleFormChange} placeholder="Slug" required />
                        <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Descrição (JSON)" />
                        <select name="destinoId" value={form.destinoId} onChange={handleFormChange} required>
                            <option value="">Selecione o destino</option>
                            {destinos.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.title}
                                </option>
                            ))}
                        </select>

                        {/* Fotos */}
                        <h3>Fotos</h3>
                        {form.fotos.map((foto, i) => (
                            <div key={i}>
                                {"file" in foto && foto.file ? foto.file.name : (foto as any).url}
                                <input type="file" onChange={(e) => e.target.files && handleFotoChange(i, e.target.files[0])} />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddFoto}>Adicionar Foto</button>

                        {/* Datas */}
                        <h3>Datas</h3>
                        {form.dates.map((date, i) => (
                            <div key={i}>
                                <input type="date" value={date.saida} onChange={(e) => handleDateChange(i, "saida", e.target.value)} />
                                <input type="date" value={date.retorno} onChange={(e) => handleDateChange(i, "retorno", e.target.value)} />
                                <input type="number" value={date.price} onChange={(e) => handleDateChange(i, "price", parseFloat(e.target.value))} />
                                <input type="number" value={date.price_card} onChange={(e) => handleDateChange(i, "price_card", parseFloat(e.target.value))} />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddDate}>Adicionar Data</button>

                        <button type="submit">{loading ? "Salvando..." : "Salvar Pacote"}</button>
                    </form>
                    {error && <p className="text-red-500">{error}</p>}
                </section>

                {/* Listagem */}
                <section>
                    <h2>Pacotes Existentes</h2>
                    {pacotes.map((p) => (
                        <div key={p.id}>
                            <h3>{p.title}</h3>
                            <button onClick={() => handleEdit(p)}><MdEdit /></button>
                            <button onClick={() => handleDelete(p.id)}><MdDelete /></button>
                        </div>
                    ))}
                </section>
            </AdminLayout>
        </>
    );
}
