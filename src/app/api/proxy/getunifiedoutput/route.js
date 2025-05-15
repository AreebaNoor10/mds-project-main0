import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const mtr_id = formData.get('mtr_id');
    const mds_name = formData.get('mds_name');
    const grade_label = formData.get('grade_label');


    // Make the request to the external API
    const response = await fetch('http://20.205.169.17:3002/get_unified_output', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `mtr_id=${mtr_id}&mds_name=${mds_name}&grade_label=${grade_label}`,
    });

    const data = await response.json();
    console.log('Get Unified Output API Response:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in get unified output API:', error);
    return Response.json({ error: error.message });
  }
}
