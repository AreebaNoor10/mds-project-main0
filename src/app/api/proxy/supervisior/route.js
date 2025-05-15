import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('http://20.205.169.17:3002/supervisor_decision', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Supervisor Decision API Response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in supervisor decision API:', error);
    return NextResponse.json(
      { error: 'Failed to process supervisor decision' },
      { status: 500 }
    );
  }
}
