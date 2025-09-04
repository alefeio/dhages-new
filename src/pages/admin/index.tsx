import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "components/admin/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import type { PacoteFoto, PacoteDate } from "types";

interface DashboardData {
  topPackages: PacoteFoto[];
  topViewedPackages: PacoteFoto[];
  totalReservations: number;
  totalSubscribers: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    topPackages: [],
    topViewedPackages: [],
    totalReservations: 0,
    totalSubscribers: 0
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
        setData({
          topPackages: json.topPackages,
          topViewedPackages: json.topViewedPackages,
          totalReservations: json.totalReservations,
          totalSubscribers: json.totalSubscribers
        });
      } else {
        setError(json.message || "Erro ao carregar dados do dashboard.");
      }
    } catch {
      setError("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const contarVagasOcupadas = (foto?: PacoteFoto): number => {
    if (!foto?.pacote?.dates) return 0;
    return foto.pacote.dates.reduce((sum: number, d: PacoteDate) => sum + (d.vagas_total - d.vagas_disponiveis), 0);
  };

  const contarVagasTotais = (dates?: PacoteDate[]): number => {
    if (!dates) return 0;
    return dates.reduce((sum: number, d: PacoteDate) => sum + d.vagas_total, 0);
  };

  // Preparar dados para gráficos
  const vendasData = data.topPackages.map(pkg => ({
    name: pkg.caption || "Sem título",
    Vendas: contarVagasOcupadas(pkg)
  }));

  const viewsData = data.topViewedPackages.map(pkg => ({
    name: pkg.caption || "Sem título",
    Views: contarVagasTotais(pkg.pacote?.dates)
  }));

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-gray-500 mb-2">Reservas Totais</h3>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.totalReservations}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-gray-500 mb-2">Inscritos Newsletter</h3>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.totalSubscribers}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-gray-500 mb-2">Top Pacotes Vendidos</h3>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.topPackages.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-gray-500 mb-2">Top Pacotes Visualizados</h3>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{data.topViewedPackages.length}</p>
              </div>
            </div>

            {/* Gráfico de Top Pacotes Vendidos */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Top Pacotes Vendidos 🏆</h2>
              {vendasData.length === 0 ? (
                <p className="text-gray-600">Nenhum pacote vendido ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendasData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Vendas" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>

            {/* Gráfico de Top Pacotes Visualizados */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Top Pacotes Visualizados 👀</h2>
              {viewsData.length === 0 ? (
                <p className="text-gray-600">Nenhum pacote visualizado ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Views" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>
          </>
        )}
      </AdminLayout>
    </>
  );
}
