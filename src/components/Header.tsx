import { useState } from "react"

const faqs = [
  {
    q: "Nosso Acervo",
    a: [
      "Vestidos modernos, elegantes e sempre atualizados com as últimas tendências",
      "Modelos ideais para madrinhas, formandas e convidadas",
      "Peças selecionadas com foco em conforto, estilo e qualidade",
      "Todos os vestidos são bem conservados e prontos para fazer você se sentir incrível"
    ],
  },
  {
    q: "Atendimento Personalizado",
    a: [
      "Atendemos com horário agendado, garantindo exclusividade e atenção",
      "Recepção acolhedora e dedicada a entender seu gosto e necessidade",
      "Auxiliamos na escolha do vestido ideal com sensibilidade e bom gosto"
    ]
  },
  {
    q: "Experiência My Dress",
    a: [
      "Aqui, vestir bem é mais do que aparência: é cuidar do seu momento",
      "Acolhimento e confiança fazem parte da sua experiência do início ao fim",
      "Queremos que você se sinta confiante, linda e especial"
    ]
  }
]

export default function Header() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <div id="empresa">&nbsp;</div>
      <aside className="my-16 md:max-w-6xl mx-auto">
        <div className="w-full mx-auto">
          <div className="mb-6 text-center md:max-w-4xl mx-auto px-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-16">
              Seja única com a<br />My Dress
            </h2>
            <p className="border-t-2 border-textcolor-200 py-6">
              Na My Dress, você encontra mais do que vestidos — vive uma experiência completa, com estilo, cuidado e o melhor custo-benefício de Belém.
            </p>
          </div>

          <div className="md:flex gap-8 px-4">
            <div className="rounded-xl mx-auto md:mx-0">
              <video
                src="/videos/institucional.mp4"
                muted
                controls
                poster="/videos/institucional_preview.jpg"
                width="100%"
                className="shadow-lg rounded-xl"
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>

            <div className="mx-auto md:mx-0 max-w-2xl">
              <h1 className="rounded-xl font-serif text-2xl md:text-3xl font-bold mb-4 mt-8 md:mt-0 text-background-100 bg-background-500 px-4 py-2">
                Somos especializadas em aluguel de vestidos para madrinhas, formandas e ocasiões especiais, com peças atuais, elegantes e acessíveis.
              </h1>
              <p className="my-8 text-center">
                <strong>Cada detalhe da My Dress é pensado para valorizar sua beleza, seu momento e seu estilo único</strong>, sempre com atendimento acolhedor, qualidade impecável e preços que cabem no seu bolso.
              </p>
              <p className="my-8 text-center">
                <strong>Encontre o vestido perfeito para aluguel</strong>, sem abrir mão do estilo ou do orçamento. Com nosso serviço de aluguel de vestidos de festa, você tem acesso a peças que são a união perfeita de elegância e o melhor custo-benefício da cidade.
              </p>

              {faqs.map((faq, idx) => (
                <div key={idx} className="mb-4 border-b border-background-1000/20 bg-background-100 px-4 rounded-xl">
                  <button
                    id={`faq-button-${idx}`}
                    aria-expanded={open === idx}
                    aria-controls={`faq-panel-${idx}`}
                    className="w-full flex justify-between items-center py-4 text-left font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-background-500 focus:ring-offset-2 rounded"
                    onClick={() => setOpen(open === idx ? null : idx)}
                  >
                    {faq.q}
                    <span aria-hidden="true">{open === idx ? "−" : "+"}</span>
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-button-${idx}`}
                    className={`overflow-hidden transition-all duration-300 ${open === idx ? "max-h-40" : "max-h-0"}`}
                  >
                    {faq.a.map((topic: string, i: number) => (
                      <p key={i} className="px-2">
                        {topic}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              <p className="my-8 text-center">
                Visite-nos em Belém para descobrir por que <strong>somos a escolha ideal para o aluguel de vestidos</strong>. Na My Dress, seu momento especial começa com a confiança de estar vestindo o vestido certo, no lugar certo.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}