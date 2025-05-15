export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const token = formData.get('token');
    const new_password = formData.get('new_password');

    if (!email || !token || !new_password) {
      return Response.json({ detail: 'All fields are required' }, { status: 400 });
    }

    const response = await fetch('http://20.205.169.17:3002/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body: `email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(new_password)}`
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ detail: error.message }, { status: 500 });
  }
}
