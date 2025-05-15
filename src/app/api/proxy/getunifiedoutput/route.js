import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const mtr_id = formData.get('mtr_id');
    const mds_name = formData.get('mds_name');
    const grade_label = formData.get('grade_label');

    // Validate required fields
    if (!mds_name || !grade_label) {
      return NextResponse.json(
        { error: 'MDS name and grade label are required' },
        { status: 400 }
      );
    }

    console.log('Unified Output API Request:', {
      mtr_id,
      mds_name,
      grade_label
    });

    // Make the request to the external API with properly encoded parameters
    const response = await fetch('http://20.205.169.17:3002/get_unified_output', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `mtr_id=${encodeURIComponent(mtr_id || '')}&mds_name=${encodeURIComponent(mds_name)}&grade_label=${encodeURIComponent(grade_label)}`,
    });

    console.log('Unified Output API Response Status:', response.status);
    console.log('Unified Output API Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Get Unified Output API Response:', data);
    
    if (!response.ok) {
      console.error('Unified Output API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return NextResponse.json(
        { error: data.error || data.errorMessage || data.errorType || 'Failed to get unified output' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get unified output API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
