import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const mtr_id = formData.get('mtr_id');
    const unified_file = formData.get('unified_file');
    
    // Validate required fields
    if (!mtr_id || !unified_file) {
      return NextResponse.json(
        { error: 'MTR ID and unified file are required' },
        { status: 400 }
      );
    }

    console.log('Final Report API Request:', {
      mtr_id,
      unified_file
    });

    const response = await fetch('http://20.205.169.17:3002/get_final_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: `mtr_id=${encodeURIComponent(mtr_id)}&unified_file=${encodeURIComponent(unified_file)}`,
    });

    console.log('Final Report API Response Status:', response.status);
    console.log('Final Report API Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Get Final Report API Response:', data);

    if (!response.ok) {
      console.error('Final Report API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      return NextResponse.json(
        { error: data.error || data.errorMessage || data.errorType || 'Failed to get final report' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get final report API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
