import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import { format, parseISO, startOfDay } from 'date-fns';
import { Search, Calendar, MapPin, X } from 'lucide-react';

// Importe seus componentes e tipos
import { Menu } from '../components/Menu'; // Verifique o caminho correto
import { Destino, LinkItem } from '../types';

export default function PaginaBusca() {
  const router = useRouter();
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<{ logoUrl: string; links: LinkItem[] } | null>(null);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestino, setSelectedDestino] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  // 1. Carregar dados da API e do Menu
  useEffect(() => {
    // Busca dados dos pacotes
    fetch('/api/search/availability')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDestinos(data.data);
        setLoading(false);
      });

    // Busca dados do Menu (Assumindo que você tenha essa rota ou possa mockar)
    // Se você já recebe isso via props de algum layout, pode remover este fetch
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuData(data))
      .catch(() => {
        // Fallback corrigido: adicionado a propriedade 'id'
        setMenuData({
          logoUrl: "/images/logo.png",
          links: [
            {
              id: "home-fallback", // Adicione esta linha
              text: "Ir para o site",
              url: "/"
            }
          ]
        });
      });
  }, []);

  // 2. Sincronizar URL para o Estado
  useEffect(() => {
    if (router.isReady) {
      if (router.query.q) setSearchTerm(router.query.q as string);
      if (router.query.destino) setSelectedDestino(router.query.destino as string);
      if (router.query.start && router.query.end) {
        setDateRange([
          parseISO(router.query.start as string),
          parseISO(router.query.end as string)
        ]);
      }
    }
  }, [router.isReady]);

  const updateQueryParams = (newFilters: any) => {
    const query = { ...router.query, ...newFilters };
    Object.keys(query).forEach(key => { if (!query[key]) delete query[key]; });
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const results = useMemo(() => {
    let flatList: any[] = [];
    destinos.forEach(destino => {
      destino.pacotes.forEach(pacote => {
        pacote.dates.forEach(date => {
          const dSaida = new Date(date.saida);
          const matchesText = !searchTerm ||
            pacote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            destino.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesDestino = !selectedDestino || destino.slug === selectedDestino;
          let matchesDate = true;
          if (startDate && endDate) {
            matchesDate = dSaida >= startOfDay(startDate) && dSaida <= startOfDay(endDate);
          } else if (startDate) {
            matchesDate = dSaida >= startOfDay(startDate);
          }

          if (matchesText && matchesDestino && matchesDate) {
            flatList.push({ ...pacote, destinoTitle: destino.title, destinoSlug: destino.slug, currentDate: date });
          }
        });
      });
    });
    return flatList.sort((a, b) => new Date(a.currentDate.saida).getTime() - new Date(b.currentDate.saida).getTime());
  }, [destinos, searchTerm, selectedDestino, startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head>
        <title>Buscar Pacotes | Curva Engenharia</title>
      </Head>

      {/* RENDERIZAÇÃO DO SEU MENU EXISTENTE */}
      <Menu menuData={menuData} />

      {/* Header de Busca com ajuste de Padding para o Menu Fixo */}
      <div className="bg-gray-700 pt-32 pb-12 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center font-serif">
            Encontre sua próxima experiência
          </h1>

          <div className="bg-white p-4 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-t-4 border-orange-500">
            {/* ... (campos de busca permanecem iguais) ... */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">O que você busca?</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); updateQueryParams({ q: e.target.value }); }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Destino</label>
              <select
                className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 ring-orange-500 appearance-none"
                value={selectedDestino}
                onChange={(e) => { setSelectedDestino(e.target.value); updateQueryParams({ destino: e.target.value }); }}
              >
                <option value="">Todos os destinos</option>
                {destinos.map(d => <option key={d.id} value={d.slug}>{d.title}</option>)}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-1 ml-1 uppercase">Quando?</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <DatePicker
                  selectsRange startDate={startDate} endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                    const [s, e] = update;
                    if (s && e) updateQueryParams({ start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] });
                  }}
                  locale={ptBR} dateFormat="dd/MM/yyyy"
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 ring-orange-500"
                />
              </div>
            </div>

            <button
              onClick={() => { setSearchTerm(''); setSelectedDestino(''); setDateRange([null, null]); router.push('/buscar'); }}
              className="py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Resultados */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((item, index) => {
            // Lógica para detectar se o primeiro item da mídia é um vídeo
            const firstMediaUrl = item.fotos[0]?.url || '';
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(firstMediaUrl);

            if (item.destinoTitle !== "Fretamento") {
              return (
                <Link href={`/pacotes/${item.destinoSlug}/${item.slug}`} key={index}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 group">

                    {/* Container de Mídia (Foto ou Vídeo) */}
                    <div className="relative h-48 bg-gray-200">
                      {firstMediaUrl ? (
                        isVideo ? (
                          <video
                            src={firstMediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => e.currentTarget.pause()}
                            poster="/placeholder-video.jpg" // Opcional: uma imagem enquanto não carrega
                          />
                        ) : (
                          <Image
                            src={firstMediaUrl}
                            alt={item.title}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                        )
                      ) : (
                        <Image src="/placeholder.jpg" alt="Sem imagem" layout="fill" objectFit="cover" />
                      )}

                      {/* Badge indicativo para vídeo */}
                      {isVideo && (
                        <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                        {item.destinoTitle}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(item.currentDate.saida), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            };
          })}
        </div>
      </main>
    </div>
  );
}