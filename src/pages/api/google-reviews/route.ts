// src/app/api/google-reviews/route.ts

import { NextResponse } from 'next/server';

// Certifique-se de definir esta variável de ambiente em seu arquivo .env.local
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE_ID = 'ChIJ_ZbIZ_2LpJIRUlkW8_wOIAE'; // ID do local da D'Hages Turismo no Google Maps

export async function GET() {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  // Corrigido para usar as variáveis de forma correta e segura
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews&key=${GOOGLE_API_KEY}&language=pt-BR`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.result && data.result.reviews) {
      const reviews = data.result.reviews.map((review: any) => ({
        id: review.author_url,
        name: review.author_name,
        content: review.text,
        starRating: review.rating,
        type: 'text'
      }));
      return NextResponse.json(reviews);
    } else {
      console.error('Erro na resposta da API do Google:', data.status, data.error_message);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}