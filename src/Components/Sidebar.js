'use client'
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Tooltip, Drawer, IconButton } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSidebarContext } from '@/context/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, isMobile, mobileOpen, toggleMobileSidebar } = useSidebarContext();
  
  const handleLogout = () => {
    // Clear cookies
    document.cookie = 'userEmail=;';
    // Redirect to login
    router.push('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <GridViewIcon />, path: '/dashboard' },
    { text: 'History', icon: <CalendarMonthOutlinedIcon />, path: '/history' },
    // { text: 'Setting', icon: <SettingsOutlinedIcon />, path: '/setting' },
  ];

  // Content to be rendered for both desktop and mobile
  const sidebarContent = (
    <>
      <List sx={{ flexGrow: 0 }}>
        {menuItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.text} 
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={isMobile ? toggleMobileSidebar : undefined}
          >
            <Tooltip title={collapsed && !isMobile ? item.text : ""} placement="right" arrow>
              <ListItem 
                sx={{ 
                  py: 1.5,
                  bgcolor: pathname === item.path ? '#f0f7ff' : 'transparent',
                  color: pathname === item.path ? '#1976d2' : 'inherit',
                  '&:hover': { bgcolor: '#f5f5f5' },
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  color: pathname === item.path ? '#1976d2' : 'inherit',
                }}>
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: 14,
                      fontWeight: pathname === item.path ? 500 : 400 
                    }} 
                  />
                )}
              </ListItem>
            </Tooltip>
          </Link>
        ))}

        <Divider sx={{ my: 2 }} />

        <Tooltip title={collapsed && !isMobile ? "Logout" : ""} placement="right" arrow>
          <ListItem 
            onClick={handleLogout}
            sx={{ 
              py: 1.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' },
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: collapsed && !isMobile ? 0 : 40,
              color: '#666',
            }}>
              <LogoutIcon />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  color: '#666',
                }} 
              />
            )}
          </ListItem>
        </Tooltip>
      </List>

      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start', 
      }}>
        <Avatar 
          src="/images/avatar.png"
          alt="User Avatar"
          sx={{ width: 30, height: 30, mr: collapsed && !isMobile ? 0 : 1 }}
        />
        {(!collapsed || isMobile) && (
          <Box>
            <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
              Josh Smith
            </Box>
          </Box>
        )}
      </Box>
    </>
  );

  // For mobile: use Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileSidebar}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 240,
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#fff',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '100%' 
        }}>
          {sidebarContent}
        </Box>
      </Drawer>
    );
  }

  // For desktop: use regular sidebar
  return (
    <Box
      sx={{
        width: collapsed ? 60 : 200,
        minHeight: 'calc(100vh - 48px)',
        borderRight: '1px solid #e0e0e0',
        display: { xs: 'none', sm: 'none', md: 'flex' }, // Hide on mobile and show on desktop
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        overflow: 'visible',
        transition: 'width 0.2s ease-in-out',
      }}
    >
      {sidebarContent}
    </Box>
  );
} 