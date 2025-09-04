import { useEffect, useState } from "react";
import type { Pacote, PacoteFoto, PacoteDateInput, PacoteForm } from "types";

export default function PacotesAdmin() {
    const [pacotes, setPacotes] = useState<Pacote[]>([]);
    const [form, setForm] = useState<PacoteForm>({
        id: "",
        title: "",
        subtitle: "",
        description: {} as any,
        destinoId: "",
        slug: "",
        fotos: [],
        dates: [],
    });

    // Buscar pacotes
    useEffect(() => {
        fetch("/api/pacotes")
            .then(res => res.json())
            .then(data => setPacotes(data.pacotes || []));
    }, []);

    // Atualizar campos do form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Atualizar campos das datas
    const handleDateChange = (index: number, field: keyof PacoteDateInput, value: string | number) => {
        setForm(prev => {
            const newDates = [...prev.dates];
            (newDates[index] as any)[field] = value;
            return { ...prev, dates: newDates };
        });
    };

    // Adicionar uma nova data
    const addDate = () => {
        setForm(prev => ({
            ...prev,
            dates: [
                ...prev.dates,
                {
                    id: Math.random().toString(),
                    saida: "",
                    retorno: "",
                    vagas_total: 0,
                    vagas_disponiveis: 0,
                    price: 0,
                    price_card: 0,
                    status: "disponivel",
                    notes: "",
                    pacoteId: prev.id,
                },
            ],
        }));
    };

    // Enviar formulário
    const handleSubmit = async () => {
        // Converte strings para Date antes de enviar ao backend
        const pacoteData: Pacote = {
            ...form,
            dates: form.dates.map(d => ({
                ...d,
                saida: new Date(d.saida),     // converte string para Date
                retorno: new Date(d.retorno), // converte string para Date
                notes: d.notes ?? null,       // garante compatibilidade com o tipo do Prisma
            })),
        };

        await fetch("/api/pacotes", {
            method: form.id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pacoteData),
        });

        // Atualiza lista de pacotes
        const updated = await fetch("/api/pacotes").then(res => res.json());
        setPacotes(updated.pacotes || []);

        // Reset do formulário
        setForm({
            id: "",
            title: "",
            subtitle: "",
            description: {} as any,
            destinoId: "",
            slug: "",
            fotos: [],
            dates: [],
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Gerenciar Pacotes</h1>

            {/* Formulário */}
            <div className="mb-6 border p-4 rounded">
                <input
                    type="text"
                    name="title"
                    placeholder="Título"
                    value={form.title}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2"
                />
                <textarea
                    name="subtitle"
                    placeholder="Subtítulo"
                    value={form.subtitle || ""}
                    onChange={handleChange}
                    className="border p-2 w-full mb-2"
                />

                {/* Datas */}
                <div className="mb-2">
                    <h2 className="font-semibold">Datas</h2>
                    {form.dates.map((d, i) => (
                        <div key={d.id} className="flex gap-2 mb-2">
                            <input
                                type="date"
                                value={d.saida}
                                onChange={e => handleDateChange(i, "saida", e.target.value)}
                                className="border p-2"
                            />
                            <input
                                type="date"
                                value={d.retorno}
                                onChange={e => handleDateChange(i, "retorno", e.target.value)}
                                className="border p-2"
                            />
                            <input
                                type="number"
                                placeholder="Vagas Totais"
                                value={d.vagas_total}
                                onChange={e => handleDateChange(i, "vagas_total", e.target.value)}
                                className="border p-2 w-28"
                            />
                            <input
                                type="number"
                                placeholder="Vagas Disponíveis"
                                value={d.vagas_disponiveis}
                                onChange={e => handleDateChange(i, "vagas_disponiveis", e.target.value)}
                                className="border p-2 w-28"
                            />
                        </div>
                    ))}
                    <button onClick={addDate} className="px-3 py-1 bg-blue-500 text-white rounded">
                        + Adicionar Data
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                >
                    {form.id ? "Atualizar" : "Cadastrar"}
                </button>
            </div>

            {/* Lista de pacotes */}
            <h2 className="text-lg font-semibold">Pacotes Cadastrados</h2>
            <ul className="list-disc pl-6">
                {pacotes.map(p => (
                    <li key={p.id}>{p.title}</li>
                ))}
            </ul>
        </div>
    );
}
