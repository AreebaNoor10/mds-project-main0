import { Box } from '@mui/material';

export default function AuthLayout({ children }) {
  return (
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
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
            Hello <span role="img" aria-label="wave" style={{ marginLeft: 8 }}>👋</span>
          </h1>
          <p style={{ maxWidth: 400 }}>
            Lorem ipsum dolor sit amet consectetur. Vitae nec tortor leo scelerisque sed urna. Leo faucibus tortor morbi sed consequat adipiscing quis aliquet.
          </p>
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
        {children}
      </Box>
    </Box>
  );
} 