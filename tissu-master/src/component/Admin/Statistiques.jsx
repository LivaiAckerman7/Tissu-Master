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
  Box,
  Grid,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { BarChart, LineChart } from "@mui/x-charts";
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
  const [stats, setStats] = useState({});
  const [topTissus, setTopTissus] = useState([]);
  const [ventesParJour, setVentesParJour] = useState([]);
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

      // Récupérer les statistiques globales
      fetch(`https://${process.env.REACT_APP_BACK_END_URL}/superadmin/stats`)
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Erreur stats:", err));

      // Récupérer les logs pour les tissus les plus vendus et les ventes par jour
      fetch(`https://${process.env.REACT_APP_BACK_END_URL}/superadmin/logs?from=now-30d&to=now`)
        .then((res) => res.json())
        .then((logs) => {
          // Calculer les top tissus
          const tissuMap = {};
          logs.forEach((log) => {
            const tissuNom = log.tissu_nom;
            const quantity = log.quantity;
            tissuMap[tissuNom] = (tissuMap[tissuNom] || 0) + quantity;
          });
          const topTissusData = Object.entries(tissuMap)
            .map(([nom, total]) => ({ nom, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
          setTopTissus(topTissusData);

          // Calculer les ventes par jour
          const ventesMap = {};
          logs.forEach((log) => {
            const date = new Date(log.date).toISOString().split("T")[0];
            const total = log.quantity * log.price;
            ventesMap[date] = (ventesMap[date] || 0) + total;
          });
          const ventesParJourData = Object.entries(ventesMap)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          setVentesParJour(ventesParJourData);
        })
        .catch((err) => console.error("Erreur logs:", err));
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

        <Grid container spacing={3}>
          {/* Statistiques globales */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">Résumé</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography>Total Boutiques: {stats.total_boutiques || 0}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>Total Tissus: {stats.total_tissus || 0}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>Stock Total: {stats.stock_total || 0}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>Ventes Globales: {stats.ventes_globales || 0} FCFA</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Top 10 tissus vendus */}
          {topTissus.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Top 10 Tissus Vendus</Typography>
                <BarChart
                  xAxis={[{ scaleType: "band", data: topTissus.map((t) => t.nom) }]}
                  series={[{ data: topTissus.map((t) => t.total) }]}
                  width={500}
                  height={300}
                />
              </Paper>
            </Grid>
          )}

          {/* Ventes par jour */}
          {ventesParJour.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6">Ventes par Jour (30 derniers jours)</Typography>
                <LineChart
                  xAxis={[{ data: ventesParJour.map((v) => new Date(v.date)) }]}
                  series={[{ data: ventesParJour.map((v) => v.total) }]}
                  width={500}
                  height={300}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </div>
  );
}

export default StatistiquesAdmin;