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
        <>
            <div id="fique-por-dentro">&nbsp;</div>
            <div className="bg-background-200 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <h3 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
                        Fique por dentro das nossas promoções
                    </h3>
                    <p className="text-lg text-textcolor-600 mb-8">
                        Cadastre-se para receber novidades sobre nossos lançamentos e descontos exclusivos.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row items-center justify-center gap-4">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome"
                            required
                            className="w-full sm:w-1/3 px-4 py-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-A9876D-500"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full sm:w-1/3 px-4 py-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-A9876D-500"
                        />
                        <input
                            type="text" // Alterado para 'text' conforme solicitado
                            value={phone}
                            onChange={handlePhoneChange} // Usando a nova função para aplicar a máscara
                            placeholder="WhatsApp"
                            className="w-full sm:w-1/3 px-4 py-3 border border-background-300 rounded-md focus:outline-none focus:ring-2 focus:ring-A9876D-500"
                        />
                    </form>
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="mt-4 w-full sm:w-auto px-6 py-3 bg-[#A9876D] hover:bg-background-700 text-white font-semibold rounded-md transition-colors duration-200"
                    >
                        {status === 'submitting' ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
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
            </div>
        </>
    );
};

export default PromotionsForm;