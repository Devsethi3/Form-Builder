import { NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

export async function GET(request: Request, { params }: { params: { width: string, height: string } }) {
  try {
    const width = Number(params.width);
    const height = Number(params.height);
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#1e293b';
    ctx.font = `${Math.min(width, height) * 0.1}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add Image', width / 2, height / 2);
    
    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('Failed to generate image:', e);
    return new NextResponse('Failed to generate image', { status: 500 });
  }
}
