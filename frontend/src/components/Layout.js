import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  useMediaQuery,
  useTheme,
  Avatar,
  Container,
  Tooltip,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import CompareIcon from '@mui/icons-material/Compare';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate, useLocation } from 'react-router-dom';

// Çekmece genişliği
const drawerWidth = 240;

// Layout bileşeni
const Layout = ({ loadingContext }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Menü öğeleri
  const menuItems = [
    { text: 'Ana Sayfa', icon: <DashboardIcon />, path: '/' },
    { text: 'Android Analizi', icon: <AndroidIcon />, path: '/android' },
    { text: 'iOS Analizi', icon: <AppleIcon />, path: '/ios' },
    { text: 'Karşılaştırma', icon: <CompareIcon />, path: '/comparison' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Çekmece içeriği
  const drawer = (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 2, 
          bgcolor: 'primary.main', 
          color: 'white' 
        }}
      >
        <Avatar 
          src="/logo192.png" 
          alt="Garanti BBVA Logo" 
          sx={{ width: 80, height: 80, mb: 1, bgcolor: 'white' }}
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Garanti BBVA
        </Typography>
        <Typography variant="body2">
          Kripto Yorum Analizi
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigateTo(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Mini Geliştirici İmzası */}
      <Box 
        sx={{ 
          mt: 'auto',
          pt: 1,
          pb: 1,
          px: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
        }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
          Developed by Erhan Karaarslan
        </Typography>
        <Box sx={{ display: 'flex', ml: 1 }}>
          <Tooltip title="E-mail" arrow>
            <Link 
              href="mailto:erhannkaraarslan@gmail.com"
              sx={{ 
                color: 'text.secondary', 
                display: 'flex',
                mx: 0.3,
                '&:hover': { color: 'text.primary' }
              }}
            >
              <EmailIcon sx={{ fontSize: 14 }} />
            </Link>
          </Tooltip>
          <Tooltip title="LinkedIn" arrow>
            <Link 
              href="https://www.linkedin.com/in/erhankaraarslan/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: '#0077b5', 
                display: 'flex',
                mx: 0.3,
                '&:hover': { color: '#005e8d' }
              }}
            >
              <LinkedInIcon sx={{ fontSize: 14 }} />
            </Link>
          </Tooltip>
        </Box>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => item.path === location.pathname)?.text || 'Garanti BBVA Kripto Yorum Analizi'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Gezinme çekmecesi */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobil çekmece */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mobil performansı için daha iyi
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Masaüstü çekmece */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Ana içerik */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;