'use client';

import { usePathname } from 'next/navigation';
import Header from "@/Components/Header";
import Sidebar from "@/Components/Sidebar";
import { Box } from '@mui/material';
import { SidebarProvider, useSidebarContext } from '@/context/SidebarContext';

export default function HeaderWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  if (isAuthPage) {
    return children;
  }

  // Wrap the dashboard layout with SidebarProvider
  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  );
}

// Separate component to use the context safely
function LayoutWithSidebar({ children }) {
  const { isMobile, mobileOpen } = useSidebarContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Box 
          sx={{ 
            width: '100%', 
            overflow: 'auto',
            marginLeft: isMobile ? 0 : undefined,
            transition: 'margin 0.2s ease-in-out'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
} 