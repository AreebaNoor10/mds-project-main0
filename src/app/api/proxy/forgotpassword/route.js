import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const response = await fetch('http://20.205.169.17:3002/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
      },
      body: `email=${encodeURIComponent(email)}`
    });

    const data = await response.json();
    console.log('Backend response:', data);
    
    if (response.ok && data.reset_token) {
      try {
        // Get the host from the request headers
        const host = request.headers.get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        
        // Generate reset URL
        const resetUrl = `${protocol}://${host}/login?token=${data.reset_token}&email=${encodeURIComponent(email)}`;
        console.log('Reset URL:', resetUrl);
        
        // Create a transporter using the provided credentials
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'noreply@aidiscoverix.com',
            pass: 'ediq gizh ljci limo'
          }
        });

        // Email content
        const mailOptions = {
          from: 'noreply@aidiscoverix.com',
          to: email,
          subject: 'Password Reset Request',
          html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            ">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          `
        };

        console.log('Attempting to send email...');
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        return Response.json({ 
          message: 'Password reset email sent successfully',
          reset_token: data.reset_token 
        }, { status: 200 });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return Response.json({ 
          error: 'Failed to send email',
          details: emailError.message 
        }, { status: 500 });
      }
    }
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Forgot password error details:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}


