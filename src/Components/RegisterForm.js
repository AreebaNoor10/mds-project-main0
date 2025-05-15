'use client'
import { Box, Button, TextField, Typography, InputAdornment, Snackbar, Alert, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);

        const response = await fetch('/api/proxy/registerform', {
          method: 'POST',
          body: formDataToSend
        });

        const data = await response.json();
        console.log('Register API response:', data);

        setNotification({
          open: true,
          message: data.message || data.detail || JSON.stringify(data),
          severity: response.ok ? 'success' : 'error'
        });

        if (response.ok) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Register error:', error);
        setNotification({
          open: true,
          message: error.message || 'An error occurred',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          background: '#fff',
        }}
      >
        {/* Left Side with background image */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            px: { xs: 3, md: 8 },
            py: { xs: 6, md: 0 },
            minHeight: { xs: 250, md: '100vh' },
            background: 'url(/images/img.png) no-repeat center center',

            backgroundSize: { md: 'cover' },
            color: '#fff',
            position: 'relative',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 0, md: -10 }, textAlign:'left' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              Hello <span role="img" aria-label="wave" style={{ marginLeft: 8 }}>👋</span>
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 400 }}>
              Lorem ipsum dolor sit amet consectetur. Vitae nec tortor leo scelerisque sed urna. Leo faucibus tortor morbi sed consequat adipiscing quis aliquet.
            </Typography>
          </Box>
        </Box>

        {/* Right Side (Form) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafbfc',
            width: '100%',
            py: { xs: 2, md: 0 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, px: { xs: 2, md: 0 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#222' }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{  mb: 3, textAlign: 'center' }}>
              Enter basic details to create account.
            </Typography>
            <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                margin="normal"
                name="name"
                placeholder="Enter name"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#bdbdbd' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: '#fff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e5e7eb',
                    },
                    fontSize: 15,
                    height: 48,
                  },
                }}
                inputProps={{ style: { padding: '14px 0 14px 8px' } }}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                name="email"
                placeholder="Enter email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#bdbdbd' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: '#fff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e5e7eb',
                    },
                    fontSize: 15,
                    height: 48,
                  },
                }}
                inputProps={{ style: { padding: '14px 0 14px 8px' } }}
              />
              <TextField
                fullWidth
                required
                margin="normal"
                name="password"
                placeholder="Password"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#bdbdbd' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: '#fff',
                    borderRadius: 1.5,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e5e7eb',
                    },
                    fontSize: 15,
                    height: 48,
                  },
                }}
                inputProps={{ style: { padding: '14px 0 14px 8px' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, background: '#3b82f6', textTransform: 'none', fontWeight: 600, fontSize: 16, height: 44, borderRadius: 1.5, boxShadow: 'none' }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign Up'
                )}
              </Button>
              <Typography variant="caption" sx={{ color: '#888', textAlign: 'center', display: 'block', mt: 1 }}>
                By creating account, agree to <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Terms and Condition</span> and <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Privacy Policy</span>
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
