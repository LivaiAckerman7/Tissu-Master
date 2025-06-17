import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  ListItemIcon,
  Box,
} from "@mui/material";
import QrCodeIcon from "@mui/icons-material/QrCode";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import { Client, Account } from "appwrite";
import appwriteConfig from "../../config/appwriteConfig";

const AdminBarcodes = () => {
  const [groupedProduits, setGroupedProduits] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const fetchTissus = useCallback(async () => {
    try {
      const response = await fetch("http://192.168.1.85:5000/api/tissus");
      const data = await response.json();

      // Ajout des refs et urls QR pour chaque produit
      const produitsAvecRefs = data.map((p) => ({
        ...p,
        ref: React.createRef(),
        qrCodeUrl: `${window.location.origin}/user/${p.id}`,
      }));

      // Groupement par boutique_nom
      const groupes = {};
      for (const produit of produitsAvecRefs) {
        if (!groupes[produit.boutique_nom]) {
          groupes[produit.boutique_nom] = [];
        }
        groupes[produit.boutique_nom].push(produit);
      }

      setGroupedProduits(groupes);
    } catch (error) {
      console.error("Échec de la récupération des tissus", error);
    }
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
    } else {
      const client = new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
      const account = new Account(client);

      client.setJWT(jwt);
      account
        .get()
        .then((response) => {
          setUsername(response.name);
          fetchTissus();
        })
        .catch((error) => {
          console.error(
            "Échec de la récupération des données utilisateur",
            error
          );
          navigate("/login");
        });
    }
  }, [navigate, fetchTissus]);

  useEffect(() => {
    const generateQRCodes = async () => {
      for (const boutique in groupedProduits) {
        for (const produit of groupedProduits[boutique]) {
          if (produit.ref.current) {
            try {
              await QRCode.toCanvas(produit.ref.current, produit.qrCodeUrl, {
                width: 150,
                margin: 1,
                color: {
                  dark: "#000000",
                  light: "#ffffff",
                },
              });
            } catch (err) {
              console.error("Erreur génération QR code", err);
            }
          }
        }
      }
    };

    generateQRCodes();
  }, [groupedProduits]);

  const printLabelPage = (produit) => {
    const qrCodeCanvas = produit.ref.current;
    const qrCodeImage = qrCodeCanvas.toDataURL("image/png");

    const labelContent = `
      <html>
      <head>
        <style>
          body { 
            text-align: center; 
            font-family: Arial; 
            padding: 20px;
          }
          h1 { 
            margin: 10px 0;
            font-size: 18px;
          }
          .label-container {
            border: 1px dashed #ccc;
            padding: 15px;
            display: inline-block;
            margin: 10px;
          }
          .product-info {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="product-info">
            <h1>${produit.nom}</h1>
            <p>Boutique: ${produit.boutique_nom}</p>
          </div>
          <img src="${qrCodeImage}" alt="QR Code"/>
          <p>Scanner pour vendre</p>
        </div>
        <script>window.print()</script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(labelContent);
    printWindow.document.close();
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      const client = new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
      const account = new Account(client);

      await account.deleteSession("current");
      localStorage.removeItem("jwt");
      localStorage.removeItem("email");
      navigate("/login");
    } catch (err) {
      console.error("Échec de la déconnexion", err);
    }
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Boutique
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

      <Drawer anchor="left" open={isDrawerOpen} onClose={handleDrawerClose}>
        <List>
          <ListItem button component="a" href="/admin">
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText>Tableau de bord</ListItemText>
          </ListItem>
          <ListItem button component="a" href="/admin/boutiques">
            <ListItemIcon>
              <StorefrontIcon />
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

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: 3,
            py: 2,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: "center", mb: 4 }}
          >
            Codes QR par boutique
          </Typography>

          {Object.entries(groupedProduits).map(([boutique, produits]) => (
            <Box key={boutique} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  textAlign: "center",
                  mt: 4,
                  mb: 3,
                  p: 2,
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  borderRadius: 1,
                }}
              >
                Boutique : {boutique}
              </Typography>
              <List
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                {produits.map((produit, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "auto",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 3,
                      m: 1,
                    }}
                  >
                    <ListItemText
                      primary={produit.nom}
                      secondary={`ID: ${produit.id}`}
                      sx={{ textAlign: "center", mb: 2 }}
                    />
                    <canvas ref={produit.ref}></canvas>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => printLabelPage(produit)}
                      sx={{ mt: 2 }}
                    >
                      Imprimer Étiquette
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      </Container>
    </div>
  );
};

export default AdminBarcodes;
