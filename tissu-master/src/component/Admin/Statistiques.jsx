import React, { useEffect, useState } from "react";
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
  Container,
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { useNavigate } from "react-router-dom";
import { Client, Account } from "appwrite";
import appwriteConfig from "../../config/appwriteConfig";

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);

function StatistiquesAdmin() {
  const [username, setUsername] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
    } else {
      client.setJWT(jwt);
      account
        .get()
        .then((res) => {
          setUsername(res.name);
        })
        .catch((err) => {
          console.error("Erreur Appwrite:", err);
          navigate("/login");
        });
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      localStorage.removeItem("jwt");
      navigate("/login");
    } catch (err) {
      console.error("Erreur logout:", err);
    }
  };

  const handleReload = () => {
    navigate("/admin");
  };

  return (
    <div>
      {/* Barre d’en-tête */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Statistiques
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

      {/* Menu latéral */}
      <Drawer anchor="left" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List>
          <ListItem button onClick={handleReload}>
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText>Tableau de bord</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/boutiques">
            <ListItemIcon><StorefrontIcon /></ListItemIcon>
            <ListItemText>Boutiques</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/statistiques">
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText>Statistiques</ListItemText>
          </ListItem>
        </List>
      </Drawer>

      {/* Contenu principal */}
      <Container maxWidth="xl" sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Statistiques des ventes
        </Typography>

        <Box sx={{ mt: 4 }}>
          <iframe
            src="http://192.168.1.85:3001/d/e8eb0032-664f-4bc3-9756-793b7e8bfc1d/top-20-tissus-vendus?orgId=1&from=now-6h&to=now&timezone=browser"
            width="100%"
            height="800"
            frameBorder="0"
            title="Top Tissus"
            style={{ borderRadius: 8 }}
          ></iframe>
        </Box>
      </Container>
    </div>
  );
}

export default StatistiquesAdmin;
