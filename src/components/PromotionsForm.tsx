// src/components/PromotionsForm.tsx

import React, { useState, ChangeEvent } from 'react';

// Função para aplicar a máscara no número de telefone
const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength <= 2) {
        return phoneNumber;
    }

    if (phoneNumberLength <= 7) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }

    if (phoneNumberLength <= 11) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    }

    // Retorna o formato completo de 11 dígitos para o Brasil
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

const PromotionsForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/promotions-subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setPhone('');
            } else {
                setStatus('error');
                console.error('Erro na resposta da API:', data.message);
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    return (
        <section className="bg-primary-100 py-16 px-4 sm:px-6 lg:px-8">
            <div id="fique-por-dentro" className="mb-8">&nbsp;</div>
            <div className="max-w-5xl mx-auto text-center">
                {/* Título e Parágrafo otimizados para SEO e persuasão */}
                <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-primary-900 drop-shadow-md">
                    Ofertas de Viagem Exclusivas, Direto no seu WhatsApp
                </h3>
                <p className="text-lg text-neutral-700 max-w-2xl mx-auto mb-8 px-4">
                    Quer conhecer os destinos mais incríveis do Pará e do Brasil? Cadastre-se e receba promoções relâmpago, roteiros de excursão e descontos secretos que só a nossa comunidade tem acesso. Sua próxima aventura com a D'Hages Turismo está a um clique de distância!
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row items-center justify-center gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome"
                        required
                        className="w-full xl:w-1/4 px-4 py-3 border bg-white border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full xl:w-1/4 px-4 py-3 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="WhatsApp"
                        required
                        className="w-full xl:w-1/4 px-4 py-3 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    />
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="mt-4 xl:mt-0 w-full xl:w-1/4 px-6 py-3 bg-secondary-400 hover:bg-secondary-500 text-primary-950 font-semibold rounded-md transition-colors duration-200 shadow-md"
                    >
                        {status === 'submitting' ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>

                {status === 'success' && (
                    <p className="mt-4 text-green-600 font-medium">
                        Cadastro realizado com sucesso!
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 text-red-600 font-medium">
                        Ocorreu um erro no cadastro. Por favor, tente novamente.
                    </p>
                )}
            </div>
        </section>
    );
};

export default PromotionsForm;