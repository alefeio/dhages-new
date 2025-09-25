import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "components/admin/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// Tipagem para os dados do pacote no dashboard
interface PacoteDashboardStats {
    id: string;
    caption: string;
    view: number;
    like: number;
    whatsapp: number;
    shared: number;
}

// Tipo de dado para as datas clicadas, agora com o nome do pacote
interface WhatsAppDateStats {
    date: string;
    clicks: number;
    packageName: string;
}

// Tipagem completa para o estado do dashboard
interface DashboardData {
    topViewedPackages: PacoteDashboardStats[];
    topLikedPackages: PacoteDashboardStats[];
    topWhatsAppClickedPackages: PacoteDashboardStats[];
    topSharedPackages: PacoteDashboardStats[];
    topWhatsAppClickedDates: WhatsAppDateStats[];
    totalSubscribers: number;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData>({
        topViewedPackages: [],
        topLikedPackages: [],
        topWhatsAppClickedPackages: [],
        topSharedPackages: [],
        topWhatsAppClickedDates: [],
        totalSubscribers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard/pacotes-stats");
            const json = await res.json();
            if (res.ok && json.success) {
                setData(json.data);
            } else {
                setError(json.message || "Erro ao carregar dados do dashboard.");
            }
        } catch {
            setError("Erro ao conectar com a API.");
        } finally {
            setLoading(false);
        }
    };

    // Funções para preparar os dados para os gráficos
    const prepareBarChartData = (
        dataArray: any[],
        dataKey: "view" | "like" | "whatsapp" | "shared" | "clicks"
    ) => {
        return dataArray.map(item => ({
            // Agora combinamos a data e o nome do pacote no "name"
            name: item.date ? `${item.date} (${item.packageName})` : item.caption,
            [dataKey]: item[dataKey]
        }));
    };

    const viewedData = prepareBarChartData(data.topViewedPackages, "view");
    const likedData = prepareBarChartData(data.topLikedPackages, "like");
    const whatsappData = prepareBarChartData(data.topWhatsAppClickedPackages, "whatsapp");
    const sharedData = prepareBarChartData(data.topSharedPackages, "shared");
    const datesData = prepareBarChartData(data.topWhatsAppClickedDates, "clicks");
    
    return (
        <>
            <Head>
                <title>Admin - Dashboard</title>
            </Head>
            <AdminLayout>
                <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Dashboard</h1>

                {loading ? (
                    <p className="text-gray-600">Carregando...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <>
                        {/* Cards de Indicadores */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                                <h3 className="text-gray-500 mb-2">Inscritos Newsletter</h3>
                                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.totalSubscribers}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                                <h3 className="text-gray-500 mb-2">Pacotes Visualizados</h3>
                                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.topViewedPackages.reduce((sum, pkg) => sum + (pkg.view || 0), 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                                <h3 className="text-gray-500 mb-2">Cliques WhatsApp</h3>
                                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.topWhatsAppClickedPackages.reduce((sum, pkg) => sum + (pkg.whatsapp || 0), 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                                <h3 className="text-gray-500 mb-2">Cliques em Compartilhar</h3>
                                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.topSharedPackages.reduce((sum, pkg) => sum + (pkg.shared || 0), 0)}</p>
                            </div>
                        </div>

                        {/* Seção de Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Gráfico de Pacotes mais visualizados */}
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Pacotes mais visualizados 👀</h2>
                                {viewedData.length === 0 ? (
                                    <p className="text-gray-600">Nenhum pacote visualizado ainda.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={viewedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="view" fill="#8884d8" name="Visualizações" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </section>

                            {/* Gráfico de Pacotes mais curtidos */}
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Pacotes mais curtidos ❤️</h2>
                                {likedData.length === 0 ? (
                                    <p className="text-gray-600">Nenhum pacote curtido ainda.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={likedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="like" fill="#ff69b4" name="Curtidas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </section>

                            {/* Gráfico de Pacotes mais clicados em WhatsApp */}
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Pacotes mais clicados no WhatsApp 📱</h2>
                                {whatsappData.length === 0 ? (
                                    <p className="text-gray-600">Nenhum clique no WhatsApp ainda.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={whatsappData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="whatsapp" fill="#25d366" name="Cliques WhatsApp" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </section>

                            {/* Gráfico de Pacotes mais clicados em Compartilhar */}
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Pacotes mais compartilhados 🔗</h2>
                                {sharedData.length === 0 ? (
                                    <p className="text-gray-600">Nenhum pacote compartilhado ainda.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={sharedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="shared" fill="#1DA1F2" name="Cliques em Compartilhar" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </section>

                            {/* Gráfico de Datas mais clicadas em WhatsApp (mais informações) */}
                            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg col-span-1 lg:col-span-2">
                                <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Datas mais clicadas no WhatsApp 📅</h2>
                                {datesData.length === 0 ? (
                                    <p className="text-gray-600">Nenhuma data clicada ainda.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={datesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="clicks" fill="#25d366" name="Cliques" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </section>
                        </div>
                    </>
                )}
            </AdminLayout>
        </>
    );
}