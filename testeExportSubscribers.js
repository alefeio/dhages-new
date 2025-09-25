// Use o módulo nativo 'http' para requisições
const http = require('http');
// Use o módulo nativo 'fs' para operações de arquivo
const fs = require('fs');
// Use o 'path' para garantir que o arquivo seja salvo corretamente
const path = require('path');

// ===============================================================
// 1. CONFIGURAÇÃO (Verifique se o seu Next.js está rodando nesta porta)
// ===============================================================
const API_HOST = 'localhost';
const API_PORT = 3000; // Porta padrão do Next.js em modo de desenvolvimento
const API_PATH = '/api/export-subscribers';
const OUTPUT_FILE = path.join(__dirname, 'subscribers_export_test.csv'); // Salva na mesma pasta do script

const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: API_PATH,
    method: 'GET',
    // Opcional, mas útil para simular o que um browser faria
    headers: {
        'Accept': 'text/csv'
    }
};

console.log(`\n--- Teste de Exportação CSV ---`);
console.log(`=> Tentando acessar a API: http://${API_HOST}:${API_PORT}${API_PATH}`);
console.log(`=> O arquivo será salvo em: ${OUTPUT_FILE}`);

const req = http.request(options, (res) => {
    // 2. Verificação de Status
    if (res.statusCode !== 200) {
        console.error(`\n[ERRO] A API retornou o status: ${res.statusCode}.`);
        console.error(`=> Verifique se o servidor Next.js está rodando ou se o caminho da API está correto.`);
        res.resume(); // Consome o corpo da resposta
        return;
    }
    
    // 3. Processamento do Stream
    const fileStream = fs.createWriteStream(OUTPUT_FILE);

    // Canaliza os dados recebidos (CSV) diretamente para o arquivo local
    res.pipe(fileStream);

    fileStream.on('finish', () => {
        fileStream.close();
        console.log(`\n[SUCESSO] O arquivo CSV foi gerado e salvo com sucesso!`);
        console.log(`=> Você pode inspecionar o conteúdo em: ${OUTPUT_FILE}`);
        console.log('--- Teste Concluído ---\n');
    });

    fileStream.on('error', (err) => {
        console.error(`\n[ERRO] Falha ao escrever o arquivo: ${err.message}`);
    });
});

// 4. Tratamento de Erro de Conexão
req.on('error', (e) => {
    console.error(`\n[ERRO FATAL] Não foi possível conectar ao servidor.`);
    console.error(`=> Certifique-se de que o servidor Next.js está executando em http://${API_HOST}:${API_PORT}`);
    console.error(`Detalhes do erro: ${e.message}`);
});

// Envia a requisição GET
req.end();