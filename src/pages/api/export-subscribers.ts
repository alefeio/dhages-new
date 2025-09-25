import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função utilitária para tentar separar o nome completo em Primeiro e Último Nome
const splitName = (fullName: string): { firstName: string, lastName: string } => {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }

    // O primeiro nome é o primeiro elemento, o resto é o sobrenome.
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    return { firstName, lastName };
};

// Função utilitária para garantir a formatação E.164 (exigido para hash) e remover caracteres extras
const formatPhoneForExport = (phone: string | null): string => {
    if (!phone) return '';
    
    // Remove tudo que não for dígito, exceto o '+' inicial (para código de país)
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Garante que o número tenha pelo menos um código de país, caso não tenha sido coletado corretamente
    if (!cleaned.startsWith('+') && !cleaned.startsWith('55')) {
        // Se for um número de celular brasileiro (11 dígitos, ex: 988887777, ou com DDD: 91988887777), prefixamos com o código do país
        if (cleaned.length >= 8 && cleaned.length <= 11) {
             // Exemplo: 91988887777 (sem DDD) ou 988887777 (com DDD implícito)
            cleaned = `+55${cleaned}`;
        }
    }
    
    // IMPORTANTE: Para o Customer Match, o telefone DEVE estar no formato E.164 (+[código do país][número]).
    return cleaned;
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método não permitido. Use GET para exportar.' });
    }

    try {
        const subscribers = await prisma.subscriber.findMany({
            select: {
                email: true,
                name: true,
                phone: true,
            },
        });

        const headers = [
            'Email',
            'First Name',
            'Last Name',
            'Country',
            'Zip',
            'Phone' 
        ].join(',');
        
        // VAMOS DEFINIR OS VALORES PADRÕES CONFORME SOLICITADO
        const defaultCountry = 'BR'; // Definido como Brasil
        const defaultZip = '66120-000'; // Definido como CEP genérico de Belém
        // FIM DA DEFINIÇÃO DE VALORES PADRÕES

        const csvData = subscribers.map(s => {
            const { firstName, lastName } = splitName(s.name);
            const phone = formatPhoneForExport(s.phone);

            // A ordem das colunas DEVE seguir a ordem dos headers.
            return [
                s.email.toLowerCase().trim(), // Google Ads: Lowercase e remove espaços para Email
                firstName.toLowerCase().trim(), // Google Ads: Lowercase e remove espaços para Nome
                lastName.toLowerCase().trim(),   // Google Ads: Lowercase e remove espaços para Sobrenome
                defaultCountry,
                defaultZip,
                phone,
            ].map(field => `"${field}"`).join(','); // Envolve cada campo em aspas para tratar vírgulas internas
        });

        const csv = [headers, ...csvData].join('\n');

        // Configura os cabeçalhos para download do arquivo CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="google-ads-customer-match-subscribers-${Date.now()}.csv"`);

        return res.status(200).send(csv);

    } catch (error) {
        console.error('Erro ao gerar CSV de subscribers:', error);
        return res.status(500).json({ message: 'Erro interno ao processar a exportação.', error: (error as Error).message });
    } finally {
        await prisma.$disconnect();
    }
}