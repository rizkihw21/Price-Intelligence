import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // URL SPEEDHOME (contoh structure)
    const url = `https://speedhome.com/rent/${query.toLowerCase().replace(' ', '-')}`;

    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const $ = cheerio.load(response.data);
    const properties: any[] = [];

    // Selector contoh (bisa berubah tergantung update website SPEEDHOME)
    $('.property-card').each((i, el) => {
        const title = $(el).find('.title').text().trim();
        const price = $(el).find('.price').text().trim();
        properties.push({ title, price });
    });

    return NextResponse.json({ query, count: properties.length, properties });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
  }
}
