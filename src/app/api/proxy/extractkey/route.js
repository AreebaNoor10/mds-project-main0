export async function POST(request) {
  try {
    const formData = await request.formData();
    const pdf_text_id = formData.get('pdf_text_id');

    const response = await fetch('http://20.205.169.17:3002/extract_keys', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `pdf_text_id=${pdf_text_id}`
    });

    const data = await response.json();
    console.log('Extract Keys API Response:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in extract keys API:', error);
    return Response.json({ error: error.message });
  }
}
