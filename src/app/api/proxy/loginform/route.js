export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return Response.json({ detail: 'Email and password are required' }, { status: 400 });
    }

    const response = await fetch('http://20.205.169.17:3002/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ detail: error.message }, { status: 500 });
  }
}
