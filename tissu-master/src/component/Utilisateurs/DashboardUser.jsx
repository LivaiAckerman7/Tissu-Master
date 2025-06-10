// src/pages/DashboardUser.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Client, Account } from "appwrite";
import appwriteConfig from "../../config/appwriteConfig";

// ─── Appwrite Client ────────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);

// ─── Dashboard Component ────────────────────────────────────────────────────────
function DashboardUser() {
  // ——————————————————— Local state
  const [username, setUsername] = useState("");
  const [, setEmail] = useState("");
  const [boutiqueId, setBoutiqueId] = useState(null);

  const [tissus, setTissus] = useState([]);
  const [logs, setLogs] = useState([]);

  const [selectedTissu, setSelectedTissu] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [openSellDialog, setOpenSellDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();
  const { tissuId } = useParams(); // paramètre URL optionnel

  // ─── API helpers ──────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`http://192.168.1.85:5101/logs/boutique/${id}`);
      const data = await res.json();
      setLogs(data);
    } catch (e) {
      console.error("Failed to fetch logs", e);
    }
  }, []);

  const fetchTissus = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`http://192.168.1.85:5101/boutiques/${id}/tissus`);
      const data = await res.json();
      setTissus(data);
    } catch (e) {
      console.error("Failed to fetch tissus", e);
    }
  }, []);

  const fetchBoutiqueId = useCallback(
    async (email) => {
      try {
        const encoded = encodeURIComponent(email);
        const res = await fetch(
          `http://192.168.1.85:5101/boutique/email/${encoded}`
        );
        const data = await res.json();
        setBoutiqueId(data.id);
        // Ces appels chargeront d'abord les tissus/logs,
        // le deuxième useEffect gèrera l'ouverture du dialog si besoin
        fetchLogs(data.id);
        fetchTissus(data.id);
      } catch (e) {
        console.error("Failed to fetch boutique ID", e);
      }
    },
    [fetchLogs, fetchTissus]
  );

  // ─── Auth + données initiales ─────────────────────────────────────────────────
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
      return;
    }

    client.setJWT(jwt);
    account
      .get()
      .then((res) => {
        setUsername(res.name);
        setEmail(res.email);
        fetchBoutiqueId(res.email);
      })
      .catch((err) => {
        console.error("Failed to get user data", err);
        navigate("/login");
      });
  }, [navigate, fetchBoutiqueId]);

  // ─── Ouvre la modale si un id est présent une fois les tissus chargés ─────────
  useEffect(() => {
    if (tissuId && tissus.length > 0) {
      const tissuToSell = tissus.find((t) => t.id.toString() === tissuId);
      if (tissuToSell) {
        handleOpenSellDialog(tissuToSell /* pushUrl = false */);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tissuId, tissus]); // dépend des tissus chargés

  // ─── Actions utilisateur ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      localStorage.removeItem("jwt");
      navigate("/login");
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  /**
   * @param {Object} tissu    - objet tissu sélectionné
   * @param {boolean} pushUrl - true par défaut : pousse /user/:id ; false si déjà dans l'URL
   */
  const handleOpenSellDialog = (tissu, pushUrl = true) => {
    setSelectedTissu(tissu);
    setSellQuantity("");
    setUnitPrice("");
    setOpenSellDialog(true);
    if (pushUrl) navigate(`/user/${tissu.id}`); // met l'id dans l'URL
  };

  const handleCloseSellDialog = () => {
    setOpenSellDialog(false);
    setError(null);
    setSuccessMessage(null);
    navigate("/user"); // nettoie l'URL
  };

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
    setOpenSellDialog(false);
  };
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    navigate("/user");
  };

  // ─── Form handlers ───────────────────────────────────────────────────────────
  const handleSellQuantityChange = (e) => setSellQuantity(e.target.value);
  const handleUnitPriceChange = (e) => setUnitPrice(e.target.value);
  const handleSearchChange = (e) => setSearchValue(e.target.value);

  const handleSellSubmit = async () => {
    if (!selectedTissu) return;
    const totalPrice = parseFloat(unitPrice) * parseFloat(sellQuantity);
    try {
      const res = await fetch(
        `http://192.168.1.85:5101/tissus/${selectedTissu.id}/sell`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: sellQuantity, price: totalPrice }),
        }
      );

      if (res.ok) {
        setSuccessMessage("Vente réussie");
        fetchLogs(boutiqueId);
        fetchTissus(boutiqueId);
        handleCloseConfirmDialog();
      } else {
        setError("Échec de la vente du tissu");
      }
    } catch (err) {
      console.error("Échec de la vente du tissu", err);
      setError("Échec de la vente du tissu");
    }
  };

  // ─── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ---------- Barre d'application ---------- */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
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

      {/* ---------- Corps ---------- */}
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        {/* Recherche */}
        <TextField
          label="Rechercher un tissu par ID"
          type="number"
          fullWidth
          value={searchValue}
          onChange={handleSearchChange}
          sx={{ my: 4 }}
        />

        {/* Messages */}
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {/* Tableau Inventaire */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Inventaire des Tissus
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom du Tissu</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Unité</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tissus
                .filter((t) => t.id.toString().includes(searchValue))
                .map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.nom}</TableCell>
                    <TableCell align="right">{t.stock}</TableCell>
                    <TableCell align="right">{t.unite}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        onClick={() => handleOpenSellDialog(t)}
                      >
                        Vendre
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog Vente */}
        <Dialog open={openSellDialog} onClose={handleCloseSellDialog}>
          <DialogTitle>Vendre du Tissu</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Veuillez entrer la quantité de <b>{selectedTissu?.nom || ""}</b> à
              vendre et le prix unitaire en Franc CFA.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Quantité"
              type="number"
              fullWidth
              value={sellQuantity}
              onChange={handleSellQuantityChange}
            />
            <TextField
              margin="dense"
              label="Prix unitaire (Franc CFA)"
              type="number"
              fullWidth
              value={unitPrice}
              onChange={handleUnitPriceChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSellDialog}>Annuler</Button>
            <Button onClick={handleOpenConfirmDialog}>Confirmer</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Confirmation */}
        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle>Confirmer la Vente</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Vous allez vendre{" "}
              <b>
                {sellQuantity} {selectedTissu?.unite || ""}
              </b>{" "}
              de <b>{selectedTissu?.nom || ""}</b> au prix unitaire de{" "}
              <b>{unitPrice} Franc CFA</b>.
              <br />
              Prix total :{" "}
              <b>
                {selectedTissu
                  ? parseFloat(unitPrice || 0) * parseFloat(sellQuantity || 0)
                  : 0}{" "}
                Franc CFA
              </b>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog}>Annuler</Button>
            <Button onClick={handleSellSubmit}>Vendre</Button>
          </DialogActions>
        </Dialog>

        {/* Tableau Logs */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Logs de vente
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2, mb: 6 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom du Tissu</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell align="right">Unité</TableCell>
                <TableCell align="right">Prix Total (CFA)</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.tissu_nom}</TableCell>
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

export default DashboardUser;
