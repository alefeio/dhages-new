import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "components/admin/AdminLayout";

interface ColecaoItem {
  id: string;
  productMark: string;
  productModel: string;
  cor: string;
  img: string;
  like: number;
  view: number;
  price?: number;
  price_card?: number;
}

interface DashboardData {
  mostLiked: ColecaoItem[];
  mostViewed: ColecaoItem[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    mostLiked: [],
    mostViewed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/colecoes-stats");
      const json = await res.json();
      if (res.ok && json.success) {
        setData({
          mostLiked: json.mostLiked,
          mostViewed: json.mostViewed
        });
      } else {
        setError(json.message || "Erro ao carregar dados do dashboard.");
      }
    } catch (e) {
      setError("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mais Curtidos */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Mais Curtidos ❤️</h2>
              {data.mostLiked.length === 0 ? (
                <p className="text-gray-600">Nenhum item encontrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.mostLiked.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <img src={item.img} alt={item.productModel} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-400">{item.productMark} - {item.productModel} ({item.cor})</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Likes: {item.like}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Mais Visualizados */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-400">Mais Visualizados 👀</h2>
              {data.mostViewed.length === 0 ? (
                <p className="text-gray-600">Nenhum item encontrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.mostViewed.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                      <img src={item.img} alt={item.productModel} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-400">{item.productMark} - {item.productModel} ({item.cor})</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Views: {item.view}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
