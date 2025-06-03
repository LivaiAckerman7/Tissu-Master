import React, { useState, useEffect, useCallback } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import { Client, Account, ID } from "appwrite";
import appwriteConfig from "../../config/appwriteConfig";

function Boutique() {
  const [boutiques, setBoutiques] = useState([]);
  const [selectedBoutique, setSelectedBoutique] = useState("");
  const [tissus, setTissus] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [openBoutiqueDialog, setOpenBoutiqueDialog] = useState(false);
  const [openTissuDialog, setOpenTissuDialog] = useState(false);
  const [openEditTissuDialog, setOpenEditTissuDialog] = useState(false);
  const [openDeleteTissuDialog, setOpenDeleteTissuDialog] = useState(false);
  const [newBoutique, setNewBoutique] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    proprio: "",
    password: "",
  });
  const [newTissu, setNewTissu] = useState({
    nom: "",
    stock: "",
    unite: "",
    boutique_id: "",
  });
  const [editTissu, setEditTissu] = useState({
    id: "",
    nom: "",
    stock: "",
    unite: "",
  });
  const [tissuToDelete, setTissuToDelete] = useState(null);
  const [errors, setErrors] = useState({});
  const [tissuErrors, setTissuErrors] = useState({});

  const navigate = useNavigate();

  const fetchTissus = useCallback(async (boutiqueId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/boutiques/${boutiqueId}/tissus`
      );
      const data = await response.json();

      setTissus(data);
    } catch (error) {
      console.error("Échec de la récupération des tissus", error);
    }
  }, []);

  const fetchBoutiques = useCallback(
    async (email) => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(
          `http://localhost:5000/boutiques/email/${encodedEmail}`
        );
        const data = await response.json();
        setBoutiques(data);
        if (data.length > 0) {
          setSelectedBoutique(data[0].id);
          fetchTissus(data[0].id);
        }
      } catch (error) {
        console.error("Échec de la récupération des boutiques", error);
      }
    },
    [fetchTissus]
  );

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const storedEmail = localStorage.getItem("email");
    if (!jwt || !storedEmail) {
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
          setEmail(storedEmail);
          fetchBoutiques(storedEmail);
        })
        .catch((error) => {
          console.error(
            "Échec de la récupération des données utilisateur",
            error
          );
          navigate("/login");
        });
    }
  }, [navigate, fetchBoutiques]);

  const handleBoutiqueSelectChange = (event) => {
    const boutiqueId = event.target.value;
    setSelectedBoutique(boutiqueId);
    fetchTissus(boutiqueId);
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

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenBoutiqueDialog = () => {
    setOpenBoutiqueDialog(true);
  };

  const handleCloseBoutiqueDialog = () => {
    setOpenBoutiqueDialog(false);
  };

  const handleNewBoutiqueChange = (e) => {
    const { name, value } = e.target;
    setNewBoutique((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateBoutique = () => {
    let tempErrors = {};
    if (!newBoutique.nom) tempErrors.nom = "Le nom est requis";
    if (!newBoutique.adresse) tempErrors.adresse = "L'adresse est requise";
    if (!newBoutique.telephone)
      tempErrors.telephone = "Le téléphone est requis";
    if (!newBoutique.email) tempErrors.email = "L'email est requis";
    if (!newBoutique.password)
      tempErrors.password = "Le mot de passe est requis";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateTissu = () => {
    let tempErrors = {};
    if (!newTissu.nom) tempErrors.nom = "Le nom est requis";
    if (!newTissu.stock) tempErrors.stock = "Le stock est requis";
    if (!newTissu.unite) tempErrors.unite = "L'unité est requise";
    setTissuErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateEditTissu = () => {
    let tempErrors = {};
    if (!editTissu.nom) tempErrors.nom = "Le nom est requis";
    if (!editTissu.stock) tempErrors.stock = "Le stock est requis";
    if (!editTissu.unite) tempErrors.unite = "L'unité est requise";
    setTissuErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBoutiqueSubmit = async () => {
    if (!validateBoutique()) return;

    const client = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);
    const account = new Account(client);

    try {
      // 1. Tenter de créer l'utilisateur Appwrite
      await account.create(
        ID.unique(),
        newBoutique.email,
        newBoutique.password
      );
      console.log("✅ Utilisateur Appwrite créé avec succès");
    } catch (error) {
      if (error.code === 409) {
        console.warn(
          "⚠️ Utilisateur Appwrite déjà existant, on continue avec l'ajout MySQL"
        );
      } else {
        console.error("❌ Échec Appwrite:", error);
        setErrors({
          email:
            "Impossible de créer l'utilisateur Appwrite : " + error.message,
        });
        return;
      }
    }

    try {
      // 2. Ensuite, créer la boutique dans MySQL via l'API backend
      const response = await fetch("/api/boutiques", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newBoutique,
          proprio: email, // utilisateur connecté (admin ou propriétaire)
        }),
      });

      if (response.ok) {
        console.log("✅ Boutique enregistrée dans la base MySQL");

        fetchBoutiques(email); // actualiser
        handleCloseBoutiqueDialog(); // fermer le modal
        setNewBoutique({
          nom: "",
          adresse: "",
          telephone: "",
          email: "",
          proprio: "",
          password: "",
        });
        setErrors({});
      } else {
        const text = await response.text();
        console.error("❌ Erreur API MySQL:", text);
        setErrors({
          nom: "Erreur serveur lors de l'enregistrement de la boutique.",
        });
      }
    } catch (error) {
      console.error("❌ Problème réseau ou serveur:", error);
      setErrors({ nom: "Impossible de communiquer avec le serveur backend." });
    }
  };

  const handleOpenTissuDialog = () => {
    setOpenTissuDialog(true);
  };

  const handleCloseTissuDialog = () => {
    setOpenTissuDialog(false);
  };

  const handleNewTissuChange = (e) => {
    const { name, value } = e.target;
    setNewTissu((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTissuSubmit = async () => {
    if (!validateTissu()) return;

    try {
      const response = await fetch("http://localhost:5000/tissus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newTissu, boutique_id: selectedBoutique }),
      });

      if (response.ok) {
        fetchTissus(selectedBoutique); // Rafraîchir la liste des tissus
        handleCloseTissuDialog(); // Fermer la boîte de dialogue
        setNewTissu({
          nom: "",
          stock: "",
          unite: "",
          boutique_id: "",
        }); // Réinitialiser le formulaire
        setTissuErrors({});
      } else {
        console.error("Échec de l'ajout du tissu");
      }
    } catch (error) {
      console.error("Échec de l'ajout du tissu", error);
    }
  };

  const handleOpenEditTissuDialog = (tissu) => {
    setEditTissu(tissu);
    setOpenEditTissuDialog(true);
  };

  const handleCloseEditTissuDialog = () => {
    setOpenEditTissuDialog(false);
    setTissuErrors({});
  };

  const handleEditTissuChange = (e) => {
    const { name, value } = e.target;
    setEditTissu((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditTissuSubmit = async () => {
    if (!validateEditTissu()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/tissus/${editTissu.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editTissu),
        }
      );

      if (response.ok) {
        fetchTissus(selectedBoutique); // Rafraîchir la liste des tissus
        handleCloseEditTissuDialog(); // Fermer la boîte de dialogue
      } else {
        console.error("Échec de la mise à jour du tissu");
      }
    } catch (error) {
      console.error("Échec de la mise à jour du tissu", error);
    }
  };

  const handleOpenDeleteTissuDialog = (tissu) => {
    setTissuToDelete(tissu);
    setOpenDeleteTissuDialog(true);
  };

  const handleCloseDeleteTissuDialog = () => {
    setOpenDeleteTissuDialog(false);
    setTissuToDelete(null);
  };

  const handleDeleteTissuSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/tissus/${tissuToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchTissus(selectedBoutique); // Rafraîchir la liste des tissus
        handleCloseDeleteTissuDialog(); // Fermer la boîte de dialogue
      } else {
        console.error("Échec de la suppression du tissu");
      }
    } catch (error) {
      console.error("Échec de la suppression du tissu", error);
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
      <Container>
        <FormControl fullWidth margin="normal">
          <InputLabel id="boutique-select-label">
            Sélectionner une boutique
          </InputLabel>
          <Select
            labelId="boutique-select-label"
            value={selectedBoutique}
            label="Sélectionner une boutique"
            onChange={handleBoutiqueSelectChange}
          >
            {boutiques.map((boutique) => (
              <MenuItem key={boutique.id} value={boutique.id}>
                {boutique.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenBoutiqueDialog}
          sx={{ mt: 2 }}
        >
          Ajouter une boutique
        </Button>
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Tissus dans la boutique sélectionnée
        </Typography>
        <List>
          {tissus.length > 0 ? (
            tissus.map((tissu) => (
              <ListItem key={tissu.id} divider>
                <ListItemText
                  primary={tissu.nom}
                  secondary={`Stock: ${tissu.stock} ${tissu.unite}`}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenEditTissuDialog(tissu)}
                  sx={{ ml: 2 }}
                >
                  Éditer
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleOpenDeleteTissuDialog(tissu)}
                  sx={{ ml: 2 }}
                >
                  Supprimer
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Aucun tissu disponible" />
            </ListItem>
          )}
        </List>
        {selectedBoutique && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenTissuDialog}
            sx={{ mt: 2 }}
          >
            Ajouter un tissu
          </Button>
        )}
      </Container>
      <Dialog open={openBoutiqueDialog} onClose={handleCloseBoutiqueDialog}>
        <DialogTitle>Ajouter une nouvelle boutique</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez remplir le formulaire ci-dessous pour ajouter une nouvelle
            boutique.
          </DialogContentText>
          {Object.values(errors).map((error, index) => (
            <Alert key={index} severity="error">
              {error}
            </Alert>
          ))}
          <TextField
            autoFocus
            margin="dense"
            name="nom"
            label="Nom de la boutique"
            type="text"
            fullWidth
            value={newBoutique.nom}
            onChange={handleNewBoutiqueChange}
            error={!!errors.nom}
            helperText={errors.nom}
          />
          <TextField
            margin="dense"
            name="adresse"
            label="Adresse"
            type="text"
            fullWidth
            value={newBoutique.adresse}
            onChange={handleNewBoutiqueChange}
            error={!!errors.adresse}
            helperText={errors.adresse}
          />
          <TextField
            margin="dense"
            name="telephone"
            label="Numéro de téléphone"
            type="text"
            fullWidth
            value={newBoutique.telephone}
            onChange={handleNewBoutiqueChange}
            error={!!errors.telephone}
            helperText={errors.telephone}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={newBoutique.email}
            onChange={handleNewBoutiqueChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="dense"
            name="password"
            label="Mot de passe"
            type="password"
            fullWidth
            value={newBoutique.password}
            onChange={handleNewBoutiqueChange}
            error={!!errors.password}
            helperText={errors.password}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBoutiqueDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleBoutiqueSubmit} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openTissuDialog} onClose={handleCloseTissuDialog}>
        <DialogTitle>Ajouter un nouveau tissu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez remplir le formulaire ci-dessous pour ajouter un nouveau
            tissu.
          </DialogContentText>
          {Object.values(tissuErrors).map((error, index) => (
            <Alert key={index} severity="error">
              {error}
            </Alert>
          ))}
          <TextField
            autoFocus
            margin="dense"
            name="nom"
            label="Nom du tissu"
            type="text"
            fullWidth
            value={newTissu.nom}
            onChange={handleNewTissuChange}
            error={!!tissuErrors.nom}
            helperText={tissuErrors.nom}
          />
          <TextField
            margin="dense"
            name="stock"
            label="Stock"
            type="number"
            fullWidth
            value={newTissu.stock}
            onChange={handleNewTissuChange}
            error={!!tissuErrors.stock}
            helperText={tissuErrors.stock}
          />
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="unit-select-label">Unité</InputLabel>
              <Select
                labelId="unit-select-label"
                name="unite"
                value={newTissu.unite}
                label="Unité"
                onChange={handleNewTissuChange}
                error={!!tissuErrors.unite}
              >
                <MenuItem value="yard">Yard</MenuItem>
                <MenuItem value="mètre">Mètre</MenuItem>
              </Select>
              {tissuErrors.unite && (
                <Typography color="error">{tissuErrors.unite}</Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTissuDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleTissuSubmit} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openEditTissuDialog} onClose={handleCloseEditTissuDialog}>
        <DialogTitle>Éditer le tissu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez modifier les détails du tissu ci-dessous.
          </DialogContentText>
          {Object.values(tissuErrors).map((error, index) => (
            <Alert key={index} severity="error">
              {error}
            </Alert>
          ))}
          <TextField
            autoFocus
            margin="dense"
            name="nom"
            label="Nom du tissu"
            type="text"
            fullWidth
            value={editTissu.nom}
            onChange={handleEditTissuChange}
            error={!!tissuErrors.nom}
            helperText={tissuErrors.nom}
          />
          <TextField
            margin="dense"
            name="stock"
            label="Stock"
            type="number"
            fullWidth
            value={editTissu.stock}
            onChange={handleEditTissuChange}
            error={!!tissuErrors.stock}
            helperText={tissuErrors.stock}
          />
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="unit-edit-select-label">Unité</InputLabel>
              <Select
                labelId="unit-edit-select-label"
                name="unite"
                value={editTissu.unite}
                label="Unité"
                onChange={handleEditTissuChange}
                error={!!tissuErrors.unite}
              >
                <MenuItem value="yard">Yard</MenuItem>
                <MenuItem value="mètre">Mètre</MenuItem>
              </Select>
              {tissuErrors.unite && (
                <Typography color="error">{tissuErrors.unite}</Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditTissuDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleEditTissuSubmit} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteTissuDialog}
        onClose={handleCloseDeleteTissuDialog}
      >
        <DialogTitle>Supprimer le tissu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce tissu ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteTissuDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteTissuSubmit} color="secondary">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Boutique;
