'use client';

import { Box, Button, TextField, Typography, Paper, Avatar, Stack, InputAdornment, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

export default function Setting() {
  const [tabValue, setTabValue] = useState(0); // Set Profile as default
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, maxWidth: 800, bgcolor:'#f8f9fb'}} >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3 
      }}>
        {/* Vertical/Horizontal tabs depending on screen size */}
        <Box sx={{ 
          width: { xs: '100%', md: 180 },
          display: { xs: 'flex', md: 'block' },
          flexDirection: 'row',
          mb: { xs: 2, md: 0 },
          gap: 1,
          overflowX: { xs: 'auto', md: 'visible' },
        }}>
          <Box
            component="button"
            sx={{
              py: 1.5,
              px: 3,
              width: { xs: 'auto', md: '100%' },
              flex: { xs: 1, md: 'auto' },
              mb: { xs: 0, md: 1 },
              borderRadius: '10px',
              border: 'none',
              bgcolor: tabValue === 0 ? '#4285F4' : '#ffffffff',
              color: tabValue === 0 ? 'white' : 'text.primary',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: tabValue === 0 ? '#4285F4' : '#e0e0e0' }
            }}
            onClick={() => setTabValue(0)}
          >
            Profile
          </Box>
          <Box
            component="button"
            sx={{
              py: 1.5,
              px: 3,
              width: { xs: 'auto', md: '100%' },
              flex: { xs: 1, md: 'auto' },
              mb: { xs: 0, md: 1 },
              borderRadius: '10px',
              border: 'none',
              bgcolor: tabValue === 1 ? '#4285F4' : '#ffffffff',
              color: tabValue === 1 ? 'white' : 'text.primary',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: tabValue === 1 ? '#4285F4' : '#e0e0e0' }
            }}
            onClick={() => setTabValue(1)}
          >
            Password
          </Box>
          <Box
            component="button"
            sx={{
              py: 1.5,
              px: 3,
              width: { xs: 'auto', md: '100%' },
              flex: { xs: 1, md: 'auto' },
              borderRadius: '10px',
              border: 'none',
              bgcolor: tabValue === 2 ? '#4285F4' : '#ffffffff',
              color: tabValue === 2 ? 'white' : 'text.primary',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              textAlign: 'left',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: tabValue === 2 ? '#4285F4' : '#e0e0e0' }
            }}
            onClick={() => setTabValue(2)}
          >
            Privacy policy
          </Box>
        </Box>

        {/* Content area */}
        <Box sx={{ flex: 1 }}>
          {tabValue === 0 && (
            <Box>
              {/* Profile avatar with edit button */}
              <Box display="flex" justifyContent="center" mb={4}>
                <Avatar 
                  sx={{ width: 120, height: 120, bgcolor: '#f5f5f5' }}
                />
                <Box 
                  sx={{ 
                    position: 'relative', 
                    top: 80, 
                    right: 30, 
                    bgcolor: '#f44336', 
                    borderRadius: '50%', 
                    p: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    cursor: 'pointer',
                  }}
                >
                  <EditIcon fontSize="small" sx={{ color: 'white' }} />
                </Box>
              </Box>
              
              {/* Profile fields */}
              <Stack spacing={3} maxWidth={450} mx="auto">
                <TextField
                  fullWidth
                  defaultValue=""
                  placeholder="Enter name"
                  variant="outlined"
                  margin="normal"
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <TextField
                  fullWidth
                  defaultValue=""
                  placeholder="Enter email"
                  variant="outlined"
                  margin="normal"
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <TextField
                  fullWidth
                  defaultValue=""
                  placeholder="Enter birthday"
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: '#bdbdbd' }} />
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    bgcolor: '#3b82f6', 
                    '&:hover': { bgcolor: '#2563eb' },
                    height: 44,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: 'none'
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box sx={{ maxWidth: 450, mx: 'auto' }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Old password"
                  variant="outlined"
                  margin="normal"
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <TextField
                  fullWidth
                  type="password"
                  placeholder="New password"
                  variant="outlined"
                  margin="normal"
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Confirm new password"
                  variant="outlined"
                  margin="normal"
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
                    }
                  }}
                  inputProps={{ style: { padding: '14px 0 14px 8px' } }}
                />
                
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    mt: 3, 
                    bgcolor: '#3b82f6', 
                    '&:hover': { bgcolor: '#2563eb' },
                    height: 44,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: 'none'
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body1">
                Privacy policy content goes here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
} 