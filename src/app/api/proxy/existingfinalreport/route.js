import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const mtr_id = formData.get('mtr_id');

    const response = await fetch('http://20.205.169.17:3002/get_existing_final_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: `mtr_id=${mtr_id}`,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.errorMessage || data.errorType || 'Failed to fetch existing final report');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Existing Final Report API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
