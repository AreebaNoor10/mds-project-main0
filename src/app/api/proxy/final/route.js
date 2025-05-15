import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const mtr_id = formData.get('mtr_id');
    const unified_file = formData.get('unified_file');
    
    const response = await fetch('http://20.205.169.17:3002/get_final_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: `mtr_id=${mtr_id}&unified_file=${unified_file}`,
    });

    const data = await response.json();
    console.log('Get Final Report API Response:', data);
    return Response.json(data);

  } catch (error) {
    console.error('Error in get final report API:', error);
    return Response.json({ error: error.message });
  }
}
