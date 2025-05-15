'use client'
import { Box, Button, TextField, Typography, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from './AuthLayout';

export default function LoginForm(){
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    // Check if we have token and email in URL params
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      setResetToken(token);
      setResetEmail(email);
      setResetPasswordOpen(true);
    }
  }, [searchParams]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
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
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoginLoading(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);

        const response = await fetch('/api/proxy/loginform', {
          method: 'POST',
          body: formDataToSend
        });

        const data = await response.json();
        console.log('Login API response:', data);

        if (response.ok) {
          // Store the email in cookies
          document.cookie = `userEmail=${formData.email};`; // 7 days expiry
          
          setNotification({
            open: true,
            message: data.message || 'Login successful',
            severity: 'success'
          });
          
          router.push('/dashboard');
        } else {
          setNotification({
            open: true,
            message: data.message || data.detail || JSON.stringify(data),
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setNotification({
          open: true,
          message: error.message || 'An error occurred',
          severity: 'error'
        });
      } finally {
        setLoginLoading(false);
      }
    }
  };

  const handleForgotPasswordOpen = (e) => {
    e.preventDefault();
    setForgotEmail(formData.email || '');
    setForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotEmailError('');
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail.trim()) {
      setForgotEmailError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotEmailError('Email is invalid');
      return;
    }

    setForgotLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', forgotEmail);
      
      const response = await fetch('/api/proxy/forgotpassword', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Forgot password API response:', data);
      
      if (response.ok) {
        setNotification({
          open: true,
          message: 'Password reset instructions have been sent to your email',
          severity: 'success'
        });
        
        handleForgotPasswordClose();
      } else {
        setNotification({
          open: true,
          message: data.message || data.detail || JSON.stringify(data),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setNotification({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword) {
      setNewPasswordError('New password is required');
      return;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      return;
    }

    setResetLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', resetEmail);
      formData.append('token', resetToken);
      formData.append('new_password', newPassword);

      const response = await fetch('/api/proxy/resetpassword', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Reset password API response:', data);

      setNotification({
        open: true,
        message: data.message || data.detail || JSON.stringify(data),
        severity: response.ok ? 'success' : 'error'
      });

      if (response.ok) {
        setResetPasswordOpen(false);
        router.push('/login');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setNotification({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setResetLoading(false);
    }
  };

  return(
    <AuthLayout>
      <Box sx={{ width: '100%', maxWidth: 400, px: { xs: 2, md: 0 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#222' }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{  mb: 3, textAlign: 'center' }}>
          Don't have an account? <a href="/signup" style={{ color: '#3b82f6', cursor: 'pointer' }}>Create new</a>
        </Typography>
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
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
            disabled={loginLoading}
            sx={{ mt: 3, mb: 2, background: '#3b82f6', textTransform: 'none', fontWeight: 600, fontSize: 16, height: 44, borderRadius: 1.5, boxShadow: 'none' }}
          >
            {loginLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Login'
            )}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
            <a href="/forgot-password" style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'none' }} onClick={handleForgotPasswordOpen}>Forgot Password?</a>
          </Typography>
          <Typography variant="caption" sx={{ color: '#888', textAlign: 'center', display: 'block', mt: 1 }}>
            By creating account, agree to <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Terms and Condition</span> and <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Privacy Policy</span>
          </Typography>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleForgotPasswordClose}
        aria-labelledby="forgot-password-dialog-title"
      >
        <DialogTitle id="forgot-password-dialog-title">Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotEmail}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              setForgotEmailError('');
            }}
            error={!!forgotEmailError}
            helperText={forgotEmailError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotPasswordClose} sx={{ color: '#666' }}>Cancel</Button>
          <Button 
            onClick={handleForgotPasswordSubmit} 
            variant="contained" 
            sx={{ background: '#3b82f6' }}
            disabled={forgotLoading}
          >
            {forgotLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetPasswordOpen} 
        onClose={() => setResetPasswordOpen(false)}
        aria-labelledby="reset-password-dialog-title"
      >
        <DialogTitle id="reset-password-dialog-title">Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your new password.
          </Typography>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setNewPasswordError('');
            }}
            error={!!newPasswordError}
            helperText={newPasswordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
          <Button 
            onClick={handleResetPasswordSubmit} 
            variant="contained" 
            sx={{ background: '#3b82f6' }}
            disabled={resetLoading}
          >
            {resetLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </AuthLayout>
  );
}
