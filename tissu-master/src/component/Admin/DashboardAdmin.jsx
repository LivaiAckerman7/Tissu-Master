import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QrCodeIcon from "@mui/icons-material/QrCode";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import Storefront from "@mui/icons-material/Storefront";
import { Client, Account } from "appwrite";
import appwriteConfig from "../../config/appwriteConfig";

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);

function DashboardAdmin() {
  const [username, setUsername] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
    } else {
      client.setJWT(jwt);
      account
        .get()
        .then((response) => {
          setUsername(response.name);
          fetchLogs();
        })
        .catch((error) => {
          console.error("Failed to get user data", error);
          navigate("/login");
        });
    }
  }, [navigate]);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      localStorage.removeItem("jwt");
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  const handleReload = () => {
    navigate("/admin");
  };

  return (
    <div>
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
            Tableau de bord
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
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <List>
          <ListItem button onClick={handleReload}>
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText>Tableau de bord</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/boutiques">
            <ListItemIcon>
              <Storefront />
            </ListItemIcon>
            <ListItemText>Boutiques</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/statistiques">
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText>Statistiques</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/codeQR">
            <ListItemIcon>
              <QrCodeIcon />
            </ListItemIcon>
            <ListItemText>Codes QR</ListItemText>
          </ListItem>
        </List>
      </Drawer>
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Logs de Vente
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nom du Tissu</TableCell>
                <TableCell>Nom de la Boutique</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell align="right">Unité</TableCell>
                <TableCell align="right">Prix (CFA)</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell component="th" scope="row">
                    {log.tissu_nom}
                  </TableCell>
                  <TableCell>{log.boutique_nom}</TableCell>
                  <TableCell align="right">{log.quantity}</TableCell>
                  <TableCell align="right">{log.unite}</TableCell>
                  <TableCell align="right">{log.price}</TableCell>
                  <TableCell align="right">
                    {new Date(log.date).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
}

export default DashboardAdmin;
