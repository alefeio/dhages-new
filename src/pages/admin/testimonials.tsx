import AdminLayout from 'components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import useSWR from 'swr';
import { Testimonial } from 'types';

// Use um fetcher mais robusto
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('Erro ao buscar dados.');
        throw error;
    }
    return res.json();
};

export default function Testimonials() {
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [form, setForm] = useState({ name: '', type: 'texto', content: '' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { data: testimonials, error, mutate } = useSWR('/api/crud/testimonials', fetcher);

    useEffect(() => {
        if (editing) {
            setForm({
                name: editing.name,
                type: editing.type as 'texto' | 'foto' | 'video',
                content: editing.content,
            });
            // Limpa o input de arquivo quando entra em modo de edição
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } else {
            setForm({ name: '', type: 'texto', content: '' });
        }
    }, [editing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Falha ao fazer upload do arquivo.');
        }
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        let finalContent = form.content;
        try {
            if (file && (form.type === 'foto' || form.type === 'video')) {
                finalContent = await uploadFile(file);
            } else if (editing && (editing.type === 'foto' || editing.type === 'video') && !file) {
                finalContent = editing.content;
            }
        } catch (uploadError: any) {
            setMessage('Erro ao fazer upload do arquivo: ' + uploadError.message);
            setLoading(false);
            return;
        }

        const url = '/api/crud/testimonials';
        const method = editing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, content: finalContent, id: editing?.id }),
            });

            if (res.ok) {
                mutate();
                setEditing(null);
                setForm({ name: '', type: 'texto', content: '' });
                setFile(null);
                setMessage(`Depoimento ${editing ? 'atualizado' : 'adicionado'} com sucesso!`);
            } else {
                const data = await res.json();
                setMessage('Erro ao salvar depoimento: ' + data.message);
            }
        } catch (apiError) {
            setMessage('Erro ao conectar com a API de depoimentos.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este depoimento?')) {
            try {
                const res = await fetch(`/api/crud/testimonials?id=${id}`, { method: 'DELETE' });

                if (res.ok) {
                    mutate();
                    setMessage('Depoimento excluído com sucesso.');
                } else {
                    const data = await res.json();
                    setMessage('Erro ao excluir depoimento: ' + data.message);
                }
            } catch (e) {
                setMessage('Erro ao conectar com a API.');
            }
        }
    };


    if (error) return <AdminLayout>Falha ao carregar depoimentos.</AdminLayout>;
    if (!testimonials) return <AdminLayout>Carregando...</AdminLayout>;

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Gerenciar Depoimentos</h1>
            
            {message && (
                <div className={`mb-4 p-4 rounded-md ${message.includes('sucesso') ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'}`}>
                    {message}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {editing ? 'Editar Depoimento' : 'Adicionar Novo Depoimento'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Cliente</label>
                        <input
                            type="text"
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Depoimento</label>
                        <select
                            id="type"
                            value={form.type}
                            onChange={(e) => {
                                setForm({ ...form, type: e.target.value as 'texto' | 'foto' | 'video', content: '' });
                                setFile(null);
                            }}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                        >
                            <option value="texto">Texto</option>
                            <option value="foto">Foto</option>
                            <option value="video">Vídeo</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {form.type === 'texto' ? 'Conteúdo do Depoimento' : 'Arquivo'}
                        </label>
                        {form.type === 'texto' ? (
                            <textarea
                                id="content"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                                required
                            ></textarea>
                        ) : (
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-gray-700 dark:text-gray-300"
                                required={!editing || (editing && !file && !editing.content)}
                            />
                        )}
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`py-2 px-4 rounded-md font-semibold transition ${loading ? 'bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-not-allowed' : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'}`}
                        >
                            {loading ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Adicionar Depoimento')}
                        </button>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => { setEditing(null); setFile(null); }}
                                className="bg-gray-400 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-500 transition font-semibold"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Depoimentos Existentes</h2>
                <div className="space-y-4">
                    {testimonials.map((testimonial: Testimonial) => (
                        <div key={testimonial.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{testimonial.name}</h3>
                                {testimonial.type === 'texto' ? (
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{testimonial.content}</p>
                                ) : (
                                    <a href={testimonial.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-1">
                                        Visualizar {testimonial.type}
                                    </a>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditing(testimonial)}
                                    className="bg-blue-600 dark:bg-blue-700 text-white p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                                    title="Editar"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial.id)}
                                    className="bg-red-500 dark:bg-red-600 text-white p-2 rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition"
                                    title="Excluir"
                                >
                                    <FaTrash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
