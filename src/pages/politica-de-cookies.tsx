import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import InternalLayout from 'components/layouts/InternalLayout'; // Certifique-se de que este caminho está correto
import Head from 'next/head'; // Importe Head aqui para uso direto, se o InternalLayout não passar tudo

// Interfaces para os tipos de dados da API
interface MenuDataItem {
  menu: {
    links: { text: string; url: string; target?: string }[];
  };
  contato: {
    whatsapp: string;
    email: string;
  };
}

interface PoliticaDeCookiesProps {
  menuData: MenuDataItem;
}

// A função getServerSideProps busca os dados da API no servidor
export const getServerSideProps: GetServerSideProps<PoliticaDeCookiesProps> = async (
  context: GetServerSidePropsContext
) => {
  const API_URL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/crud/menu`
    : 'http://localhost:3000/api/crud/menu';

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch menu data: Status ${res.status}`);
    }
    const data = await res.json();
    const menuData: MenuDataItem = data;

    return {
      props: {
        menuData,
      },
    };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return {
      props: {
        menuData: {
          menu: { links: [] },
          contato: { whatsapp: '', email: '' },
        },
      },
    };
  }
};

// O componente agora recebe os dados do menu como uma prop
const PoliticaDeCookies = ({ menuData }: PoliticaDeCookiesProps) => {
  // Dados específicos para SEO desta página
  const pageTitle = "Política de Cookies | D' Hages Turismo";
  const pageDescription = "Conheça a política de cookies da D' Hages Turismo. Entenda como utilizamos cookies para melhorar sua experiência de navegação e proteger seus dados.";
  const pageKeywords = "política de cookies, cookies, privacidade, D' Hages Turismo, dados, navegação, site, LGPD";
  const pageUrl = "https://seusite.com/politica-de-cookies"; // **MUITO IMPORTANTE: Substitua pela URL REAL desta página**
  const ogImage = "https://seusite.com/images/og-image-politica-cookies.jpg"; // **Crie uma imagem específica ou use uma padrão**
  const ogImageAlt = "Ilustração da Política de Cookies da D' Hages Turismo";


  return (
    <InternalLayout title={pageTitle} menuData={menuData}>
      <Head>
        {/* Título da Página */}
        <title>{pageTitle}</title>
        
        {/* Meta Description */}
        <meta name="description" content={pageDescription} />
        
        {/* Meta Keywords */}
        <meta name="keywords" content={pageKeywords} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={pageUrl} />
        
        {/* Robots Meta Tag */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph Tags */}
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="D' Hages Turismo" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" /> {/* Use "article" para páginas de conteúdo */}
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={ogImageAlt} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />

        {/* Schema Markup (opcional, mas recomendado para páginas de políticas) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebPage", // Ou "Article" se o conteúdo for mais extenso
              "name": "${pageTitle}",
              "description": "${pageDescription}",
              "url": "${pageUrl}",
              "publisher": {
                "@type": "Organization",
                "name": "D' Hages Turismo",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://seusite.com/images/logo-dhages.png" // Substitua pela URL do seu logo
                }
              }
            }
          `}
        </script>
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-primary-800">
          Política de Cookies
        </h1>

        <p className="mb-8 text-center text-neutral-600">
          Esta página descreve como a D' Hages Turismo utiliza cookies em nosso site.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary-700">1. O que são Cookies?</h2>
          <p className="mb-4 text-neutral-700">
            Cookies são pequenos arquivos de texto que são armazenados em seu computador ou dispositivo móvel quando você visita um site. Eles permitem que o site "lembre" suas ações e preferências (como login, idioma, tamanho da fonte e outras preferências de exibição) ao longo de um período, para que você não precise redigitá-las sempre que voltar ao site ou navegar de uma página para outra.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary-700">2. Como a D' Hages Turismo Usa os Cookies</h2>
          <p className="mb-4 text-neutral-700">
            Utilizamos cookies para diversas finalidades em nosso site, visando melhorar sua experiência de navegação e entender como nossos serviços são utilizados:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            <li>
              <span className="font-medium">Cookies Essenciais/Necessários:</span> Indispensáveis para o funcionamento básico do site, permitindo a navegação e o uso de funcionalidades essenciais, como acesso a áreas seguras e carrinhos de compra. Sem esses cookies, o site pode não funcionar corretamente.
            </li>
            <li>
              <span className="font-medium">Cookies de Desempenho e Análise:</span> Coletam informações sobre como os visitantes usam nosso site (ex: quais páginas são mais visitadas, se ocorrem erros). Esses dados são anonimizados e nos ajudam a entender e otimizar o desempenho do site.
            </li>
            <li>
              <span className="font-medium">Cookies de Funcionalidade:</span> Permitem que o site lembre suas escolhas (como nome de usuário, idioma ou região) e ofereça funcionalidades aprimoradas e mais personalizadas.
            </li>
            <li>
              <span className="font-medium">Cookies de Publicidade/Marketing:</span> Utilizados para entregar anúncios mais relevantes para você e seus interesses. Eles também limitam o número de vezes que você vê um anúncio e ajudam a medir a eficácia das campanhas publicitárias. Podem ser colocados por nós ou por redes de publicidade de terceiros com a nossa permissão.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary-700">3. Gerenciando suas Preferências de Cookies</h2>
          <p className="mb-4 text-neutral-700">
            Você tem total controle sobre suas preferências de cookies e pode decidir se aceita ou rejeita-os. A maioria dos navegadores web aceita cookies automaticamente, mas você geralmente pode modificar a configuração do seu navegador para recusar cookies, se preferir. No entanto, desabilitar cookies pode afetar a funcionalidade de nosso site e de muitos outros sites que você visita.
          </p>
          <p className="text-neutral-700">
            Para mais informações sobre como controlar e excluir cookies no seu navegador, visite as páginas de ajuda dos navegadores mais populares:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-neutral-700">
            <li><a href="https://support.google.com/chrome/answer/95647?hl=pt" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/pt-BR/kb/cookies-informacoes-que-sites-armazenam-no-seu-computador" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-5791-ad5d1764baec" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary-700">4. Mais Informações</h2>
          <p className="text-neutral-700">
            Esta Política de Cookies pode ser atualizada periodicamente. Recomendamos que você a revise regularmente para se manter informado sobre como estamos utilizando os cookies.
          </p>
          <p className="mt-4 text-neutral-700">
            Se você tiver alguma dúvida sobre nossa Política de Cookies ou sobre nossas práticas de privacidade, por favor, entre em contato conosco através dos canais disponíveis no site.
          </p>
          <p className="mt-4">
            <Link href="/" className="text-secondary-500 hover:underline font-semibold">
              Voltar para a página inicial da D' Hages Turismo
            </Link>
          </p>
        </section>
        
      </div>
    </InternalLayout>
  );
};

export default PoliticaDeCookies;