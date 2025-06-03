// src/component/SAdmin/SuperAdminLayout.jsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { Client, Account } from 'appwrite';
import appwriteConfig from '../../config/appwriteConfig';

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);
const account = new Account(client);

function SuperAdminLayout({ children }) {
  const [username, setUsername] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      navigate('/login');
    } else {
      client.setJWT(jwt);
      account.get().then(res => {
        setUsername(res.name || res.email);
      }).catch(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      localStorage.removeItem('jwt');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SuperAdmin
          </Typography>
          <Typography>{username}</Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List>
          <ListItem button component="a" href="/superadmin">
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText>Tableau de bord</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/superadmin/logs">
            <ListItemIcon><ListAltIcon /></ListItemIcon>
            <ListItemText>Logs</ListItemText>
          </ListItem>
        </List>
      </Drawer>

      <main style={{ padding: 24 }}>
        {children}
      </main>
    </>
  );
}

export default SuperAdminLayout;
