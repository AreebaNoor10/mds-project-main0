'use client'
import { AppBar, Toolbar, Box, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import { useSidebarContext } from '@/context/SidebarContext';

export default function Header() {
  const { collapsed, setCollapsed, isMobile, toggleMobileSidebar } = useSidebarContext();

  const handleLogoClick = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: '#ffffffff', 
        borderBottom: '1px solid #e0e0e0',
        boxShadow: 'none'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileSidebar}
              sx={{ mr: 1, color: '#333' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box 
            sx={{ position: 'relative', width: '140px', height: '50px', cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            <Image 
              src="/images/logo.png" 
              alt="MTR Logo" 
              fill
              sizes="100px"
              priority
              style={{ objectFit: 'contain' }}
            />
          </Box>
        </Box>
        <Box>
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            sx={{ color: '#333' }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon sx={{ fontSize: '20px' }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 