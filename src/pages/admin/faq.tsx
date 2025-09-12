import AdminLayout from 'components/admin/AdminLayout';
import { useState, useEffect, FormEvent } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import useSWR from 'swr';

interface FAQ {
    id: string;
    pergunta: string;
    resposta: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Erro ao buscar dados.');
    }
    return res.json();
};

const FaqPage = () => {
    const [pergunta, setPergunta] = useState('');
    const [resposta, setResposta] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { data: faqs, error, mutate } = useSWR('/api/crud/faqs', fetcher);

    useEffect(() => {
        if (editId) {
            const faqToEdit = faqs?.find((faq: FAQ) => faq.id === editId);
            if (faqToEdit) {
                setPergunta(faqToEdit.pergunta);
                setResposta(faqToEdit.resposta);
            }
        } else {
            setPergunta('');
            setResposta('');
        }
    }, [editId, faqs]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const method = editId ? 'PUT' : 'POST';
        const url = '/api/crud/faqs';
        const body = JSON.stringify({
            id: editId,
            pergunta,
            resposta,
        });

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (response.ok) {
                await mutate();
                setPergunta('');
                setResposta('');
                setEditId(null);
                setMessage(`FAQ ${editId ? 'atualizada' : 'adicionada'} com sucesso!`);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Erro ao salvar a FAQ.');
            }
        } catch (err) {
            setMessage('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta FAQ?')) {
            setLoading(true);
            setMessage('');
            try {
                const response = await fetch('/api/crud/faqs', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
                if (response.ok) {
                    await mutate();
                    setMessage('FAQ excluída com sucesso.');
                } else {
                    const errorData = await response.json();
                    setMessage(errorData.message || 'Erro ao excluir a FAQ.');
                }
            } catch (err) {
                setMessage('Erro de conexão com o servidor.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (faq: FAQ) => {
        setEditId(faq.id);
    };

    if (error) return <AdminLayout>Falha ao carregar FAQs.</AdminLayout>;
    if (!faqs) return <AdminLayout>Carregando...</AdminLayout>;

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Gerenciar Perguntas Frequentes</h1>
            
            {message && (
                <div className={`mb-4 p-4 rounded-md ${message.includes('sucesso') ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'}`}>
                    {message}
                </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {editId ? 'Editar FAQ' : 'Adicionar Nova FAQ'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="pergunta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pergunta</label>
                        <input
                            type="text"
                            id="pergunta"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                            value={pergunta}
                            onChange={(e) => setPergunta(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="resposta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resposta</label>
                        <textarea
                            id="resposta"
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-500"
                            value={resposta}
                            onChange={(e) => setResposta(e.target.value)}
                            rows={4}
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className={`py-2 px-4 rounded-md font-semibold transition ${loading ? 'bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-not-allowed' : 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'}`}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Adicionar FAQ'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => { setEditId(null); }}
                                className="bg-gray-400 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-500 transition font-semibold"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">FAQs Existentes</h2>
                <div className="space-y-4">
                    {faqs.map((faq: FAQ) => (
                        <div key={faq.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{faq.pergunta}</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{faq.resposta}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={() => handleEditClick(faq)}
                                    className="bg-blue-600 dark:bg-blue-700 text-white p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                                    title="Editar"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(faq.id)}
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
};

export default FaqPage;
