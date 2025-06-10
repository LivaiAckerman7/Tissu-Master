import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SuperAdminLayout from './SuperAdminLayout';

function DashboardSuperAdmin() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/superadmin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch((err) => console.error("Erreur chargement stats globales:", err));
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = () => {
    fetch("http://192.168.1.85:5101/superadmin/admins")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setAdmins)
      .catch((err) => console.error("Erreur chargement admins:", err));
  };

  const handleDeleteBoutique = async (id) => {
    if (!window.confirm("Supprimer cette boutique ?")) return;
    try {
      const res = await fetch(`http://192.168.1.85:5101/superadmin/delete-boutique/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAdmins();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (err) {
      console.error("Erreur suppression boutique", err);
    }
  };

  const openBoutiqueDialog = (admin) => {
    setSelectedAdmin(admin);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedAdmin(null);
  };

  return (
    <SuperAdminLayout>
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard SuperAdmin
      </Typography>

      {/* ✅ Statistiques globales déplacées ici */}
      {stats && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            📊 Statistiques Globales
          </Typography>
          <Typography>Total de boutiques : {stats.total_boutiques}</Typography>
          <Typography>Total de tissus : {stats.total_tissus}</Typography>
          <Typography>Quantité totale en stock : {stats.stock_total}</Typography>
          <Typography>
            Ventes globales : {stats.ventes_globales} FCFA
          </Typography>
        </Paper>
      )}

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email Admin</TableCell>
              <TableCell align="right">Nombre de Boutiques</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((admin, index) => (
              <TableRow key={index}>
                <TableCell>{admin.email}</TableCell>
                <TableCell align="right">{admin.boutiques.length}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openBoutiqueDialog(admin)}
                  >
                    Gérer les boutiques
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 💬 Dialog pour voir les boutiques et les supprimer */}
      <Dialog open={openDialog} onClose={closeDialog} fullWidth>
        <DialogTitle>Boutiques de {selectedAdmin?.email}</DialogTitle>
        <DialogContent>
          {!selectedAdmin ? (
            <Typography>Chargement...</Typography>
          ) : selectedAdmin.boutiques.length === 0 ? (
            <Typography>Aucune boutique.</Typography>
          ) : (
            <List>
              {selectedAdmin.boutiques.map((b, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteBoutique(b.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={b.nom} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
    </SuperAdminLayout>
  );
}

export default DashboardSuperAdmin;
