import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";
import { Destino, PacoteForm, PacoteFoto, PacoteDateInput } from "types";
import { v4 as uuidv4 } from "uuid";

interface DestinoForm {
  id?: string;
  title: string;
  subtitle?: string | null;
  description: any;
  image: string | File;
  order: number;
  pacotes: PacoteForm[];
}

export default function AdminDestinos() {
  const emptyPacote = (): PacoteForm => ({
    id: uuidv4(),
    destinoId: "",
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    fotos: [],
    dates: [],
  });

  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [form, setForm] = useState<DestinoForm>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    order: 0,
    pacotes: [emptyPacote()],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchDestinos(); }, []);

  const fetchDestinos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crud/destinos");
      const data = await res.json();
      if (res.ok && data.success) {
        setDestinos(data.destinos.sort((a: Destino, b: Destino) => a.order - b.order));
      } else setError(data.message || "Erro ao carregar destinos.");
    } catch {
      setError("Erro ao conectar com a API.");
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      order: 0,
      pacotes: [emptyPacote()],
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "order") setForm({ ...form, [name]: parseInt(value, 10) || 0 });
    else setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) setForm({ ...form, image: target.files[0] });
  };

  const handlePacoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;
    const newPacotes = [...form.pacotes];

    if (name === "fotos" && files) {
      newPacotes[index].fotos = Array.from(files) as unknown as PacoteFoto[]; 
      // Tipagem temporária, será convertida após upload
    } else if (name === "title" || name === "subtitle" || name === "description") {
      newPacotes[index][name] = value;
    }

    setForm({ ...form, pacotes: newPacotes });
  };

  const handleAddPacote = () => {
    setForm({
      ...form,
      pacotes: [...form.pacotes, emptyPacote()],
    });
  };

  const handleRemovePacote = (index: number) => {
    setForm({ ...form, pacotes: form.pacotes.filter((_, i) => i !== index) });
  };

  const handleEdit = (destino: Destino) => {
    setForm({
      id: destino.id,
      title: destino.title,
      subtitle: destino.subtitle || "",
      description: destino.description || "",
      image: destino.image || "",
      order: destino.order || 0,
      pacotes: destino.pacotes.map(p => ({
        id: p.id,
        destinoId: p.destinoId,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle || "",
        description: p.description || "",
        fotos: p.fotos || [],
        dates: p.dates.map(d => ({
          id: d.id,
          saida: d.saida.toString(),
          retorno: d.retorno.toString(),
          vagas_total: d.vagas_total,
          vagas_disponiveis: d.vagas_disponiveis,
          price: d.price,
          price_card: d.price_card,
          status: d.status,
          notes: d.notes || null,
          pacoteId: p.id,
        })) as PacoteDateInput[],
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const pacotesComUrls = await Promise.all(form.pacotes.map(async pacote => {
        const fotos = await Promise.all(pacote.fotos.map(async foto => {
          if (foto instanceof File) {
            const formData = new FormData();
            formData.append("file", foto);
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || "Erro no upload da imagem.");
            return {
              id: uuidv4(),
              pacoteId: pacote.id,
              url: uploadData.url,
              like: 0,
              view: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as PacoteFoto;
          }
          return foto as PacoteFoto;
        }));

        return { ...pacote, fotos };
      }));

      const method = form.id ? "PUT" : "POST";
      const body = { ...form, pacotes: pacotesComUrls };
      const res = await fetch("/api/crud/destinos", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Destino ${form.id ? 'atualizado' : 'criado'} com sucesso!`);
        resetForm();
        fetchDestinos();
      } else setError(data.message || "Erro ao salvar destino.");
    } catch (e: any) { setError(e.message || "Erro na API ou no upload da imagem."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string, isPacote = false) => {
    if (!confirm(`Tem certeza que deseja excluir ${isPacote ? "este pacote" : "este destino"}?`)) return;
    try {
      const res = await fetch("/api/crud/destinos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPacote }) });
      const data = await res.json();
      if (res.ok && data.success) fetchDestinos();
      else setError(data.message || "Erro ao excluir.");
    } catch { setError("Erro ao conectar com a API."); }
  };

  return (
    <>
      <Head><title>Admin - Destinos</title></Head>
      <AdminLayout>
        <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Destinos</h1>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">{form.id ? "Editar Destino" : "Adicionar Novo Destino"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título" required className="p-3 border rounded-lg" />
            <input type="text" name="subtitle" value={form.subtitle || ''} onChange={handleFormChange} placeholder="Subtítulo" className="p-3 border rounded-lg" />
            <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Descrição" className="p-3 border rounded-lg" />
            <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer">
              {form.image instanceof File ? form.image.name : "Escolher imagem principal"}
              <input type="file" onChange={handleImageChange} className="hidden" />
            </label>
            <input type="number" name="order" value={form.order} onChange={handleFormChange} placeholder="Ordem" className="p-3 border rounded-lg" />

            <h3 className="text-xl font-bold mt-6">Pacotes do Destino</h3>
            {form.pacotes.map((pacote, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed rounded-lg relative">
                <button type="button" onClick={() => handleRemovePacote(index)} className="absolute top-2 right-2 text-red-500"><MdDelete size={24} /></button>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="title" value={pacote.title} onChange={e => handlePacoteChange(e, index)} placeholder="Título do Pacote" className="p-3 border rounded-lg" />
                  <input type="text" name="subtitle" value={pacote.subtitle || ''} onChange={e => handlePacoteChange(e, index)} placeholder="Subtítulo" className="p-3 border rounded-lg" />
                  <textarea name="description" value={pacote.description} onChange={e => handlePacoteChange(e, index)} placeholder="Descrição" className="p-3 border rounded-lg" />
                  <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer">
                    {pacote.fotos.length > 0 ? `${pacote.fotos.length} fotos selecionadas` : "Escolher fotos"}
                    <input type="file" name="fotos" multiple onChange={e => handlePacoteChange(e, index)} className="hidden" />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={handleAddPacote} className="bg-gray-200 p-3 rounded-lg">Adicionar Pacote</button>

            <div className="flex gap-4 mt-6">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white p-4 rounded-lg flex-1">{form.id ? "Atualizar Destino" : "Salvar Destino"}</button>
              {form.id && <button type="button" onClick={resetForm} className="bg-red-500 text-white p-4 rounded-lg flex-1">Cancelar Edição</button>}
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Destinos Existentes</h2>
          {loading ? <p>Carregando...</p> : destinos.length === 0 ? <p>Nenhum destino encontrado.</p> : destinos.map(d => (
            <div key={d.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-sm mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{d.title}</h3>
                  <p className="text-sm">{d.subtitle}</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(d)} className="bg-blue-600 text-white p-2 rounded-lg"><MdEdit size={20} /></button>
                  <button onClick={() => handleDelete(d.id)} className="bg-red-600 text-white p-2 rounded-lg"><MdDelete size={20} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {d.pacotes.map(p => (
                  <div key={p.id} className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <img src={p.fotos[0]?.url || ''} alt={p.title} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{p.title} ({p.subtitle || ''})</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </AdminLayout>
    </>
  );
}
