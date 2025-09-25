import React from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* Informações de contato */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">D' Hages Turismo</h3>
            <p className="text-sm text-gray-400">
              Av. Senador Lemos, 3153, lojas 30/31 - 1º piso, It Center - Sacramenta - Belém/PA
            </p>
          </div>

          {/* Links e redes sociais */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="https://www.instagram.com/dhages_turismo" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
            </a>
            <a href="https://wa.me/5591981149800" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Direitos autorais */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {currentYear} D' Hages Turismo. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;