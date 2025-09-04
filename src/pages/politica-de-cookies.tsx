import Link from 'next/link';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import InternalLayout from 'components/layouts/InternalLayout';

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
  // Use a mesma lógica de URL que você já tem funcionando
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
    // Em caso de erro, retorne um objeto vazio para evitar o erro,
    // ou uma página 404 se a funcionalidade do menu for essencial.
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
  return (
    <InternalLayout title="Política de Cookies | My Dress Belém" menuData={menuData}>
      {/* Todo o conteúdo da sua política de cookies */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900">
        Política de Cookies
      </h1>

      <p className="mb-8 text-center text-gray-600">
        Esta página descreve como utilizamos cookies em nosso site.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. O que são Cookies?</h2>
        <p className="mb-4">
          Cookies são pequenos arquivos de texto que são armazenados em seu computador ou dispositivo móvel quando você visita um site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Como Usamos os Cookies</h2>
        <p className="mb-4">
          Utilizamos cookies para diversas finalidades em nosso site, incluindo:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <span className="font-medium">Cookies Necessários:</span> Essenciais para o funcionamento básico do site.
          </li>
          <li>
            <span className="font-medium">Cookies de Análise e Desempenho:</span> Para entender como os visitantes interagem com o site.
          </li>
          <li>
            <span className="font-medium">Cookies de Marketing e Publicidade:</span> Para otimizar campanhas de marketing.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Gerenciando suas Preferências de Cookies</h2>
        <p className="mb-4">
          Você tem o direito de decidir se aceita ou rejeita cookies. A maioria dos navegadores web aceita cookies automaticamente.
        </p>
        <p>
          Para mais informações sobre como controlar cookies no seu navegador, visite as páginas de ajuda dos navegadores mais populares:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2">
          <li>Google Chrome</li>
          <li>Mozilla Firefox</li>
          <li>Microsoft Edge</li>
          <li>Safari</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Mais Informações</h2>
        <p>
          Se você tiver alguma dúvida sobre nossa Política de Cookies, por favor, entre em contato conosco.
        </p>
        <p className="mt-4">
          <Link href="/" className="text-orange-600 hover:underline">
            Voltar para a página inicial
          </Link>
        </p>
      </section>
      
    </InternalLayout>
  );
};

export default PoliticaDeCookies;