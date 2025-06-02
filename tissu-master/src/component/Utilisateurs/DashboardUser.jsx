import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Client, Account } from "appwrite";
import appwriteConfig from '../../config/appwriteConfig';

const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

const account = new Account(client);

function DashboardUser() {
    const [username, setUsername] = useState('');
    const [, setEmail] = useState('');
    const [boutiqueId, setBoutiqueId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [tissus, setTissus] = useState([]);
    const [selectedTissu, setSelectedTissu] = useState(null);
    const [sellQuantity, setSellQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [openSellDialog, setOpenSellDialog] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const navigate = useNavigate();

    const fetchLogs = useCallback(async (boutiqueId) => {
        try {
            const response = await fetch(`http://localhost:5000/logs/boutique/${boutiqueId}`);
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    }, []);

    const fetchTissus = useCallback(async (boutiqueId) => {
        try {
            const response = await fetch(`http://localhost:5000/boutiques/${boutiqueId}/tissus`);
            const data = await response.json();
            setTissus(data);
        } catch (error) {
            console.error('Failed to fetch tissus', error);
        }
    }, []);

    const fetchBoutiqueId = useCallback(async (email) => {
        try {
            const encodedEmail = encodeURIComponent(email);
            const response = await fetch(`http://localhost:5000/boutique/email/${encodedEmail}`);
            const data = await response.json();
            setBoutiqueId(data.id);
            fetchLogs(data.id);
            fetchTissus(data.id);
        } catch (error) {
            console.error('Failed to fetch boutique ID', error);
        }
    }, [fetchLogs, fetchTissus]);

    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
            navigate('/login');
        } else {
            client.setJWT(jwt);
            account.get().then(response => {
                setUsername(response.name);
                setEmail(response.email);
                fetchBoutiqueId(response.email);
            }).catch(error => {
                console.error('Failed to get user data', error);
                navigate('/login');
            });
        }
    }, [navigate, fetchBoutiqueId]);

    const handleLogout = async () => {
        try {
            await account.deleteSession('current');
            localStorage.removeItem('jwt');
            navigate('/login');
        } catch (err) {
            console.error('Failed to logout', err);
        }
    };

    const handleOpenSellDialog = (tissu) => {
        setSelectedTissu(tissu);
        setSellQuantity('');
        setUnitPrice('');
        setOpenSellDialog(true);
    };

    const handleCloseSellDialog = () => {
        setOpenSellDialog(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleOpenConfirmDialog = () => {
        setOpenConfirmDialog(true);
        setOpenSellDialog(false);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
    };

    const handleSellQuantityChange = (e) => {
        setSellQuantity(e.target.value);
    };

    const handleUnitPriceChange = (e) => {
        setUnitPrice(e.target.value);
    };

    const handleSellSubmit = async () => {
        const totalPrice = parseFloat(unitPrice) * parseFloat(sellQuantity);

        try {
            const response = await fetch(`http://localhost:5000/tissus/${selectedTissu.id}/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: sellQuantity, price: totalPrice })
            });

            if (response.ok) {
                setSuccessMessage('Vente réussie');
                fetchLogs(boutiqueId);
                fetchTissus(boutiqueId);
                handleCloseConfirmDialog();
            } else {
                setError('Échec de la vente du tissu');
            }
        } catch (error) {
            console.error('Échec de la vente du tissu', error);
            setError('Échec de la vente du tissu');
        }
    };

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tableau de bord
                    </Typography>
                    <Typography>
                        {username}
                    </Typography>
                    <IconButton color="inherit">
                        <AccountCircleIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
                <TextField
                    label="Rechercher un tissu par ID"
                    type="number"
                    fullWidth
                    value={searchValue}
                    onChange={handleSearchChange}
                    sx={{ mt: 4, mb: 4 }}
                />
                <Typography variant="h6" sx={{ mt: 4 }}>Inventaire des Tissus et Logs de vente</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom du Tissu</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="right">Unité</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tissus.filter(tissu => tissu.id.toString().includes(searchValue)).map((tissu) => (
                                <TableRow key={tissu.id}>
                                    <TableCell component="th" scope="row">
                                        {tissu.nom}
                                    </TableCell>
                                    <TableCell align="right">{tissu.stock}</TableCell>
                                    <TableCell align="right">{tissu.unite}</TableCell>
                                    <TableCell align="right">
                                        <Button variant="contained" color="primary" onClick={() => handleOpenSellDialog(tissu)}>
                                            Vendre
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Dialog open={openSellDialog} onClose={handleCloseSellDialog}>
                    <DialogTitle>Vendre du Tissu</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Veuillez entrer la quantité de {selectedTissu ? selectedTissu.nom : ''} à vendre et le prix unitaire en Franc CFA.
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
                        <Button onClick={handleCloseSellDialog} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={handleOpenConfirmDialog} color="primary">
                            Confirmer
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
                    <DialogTitle>Confirmer la Vente</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Vous allez vendre <b>{sellQuantity} {selectedTissu ? selectedTissu.unite : ''}</b> de <b>{selectedTissu ? selectedTissu.nom : ''}</b> au prix unitaire de <b>{unitPrice} Franc CFA</b>.<br/>
                            Le prix total est <b>{selectedTissu ? parseFloat(unitPrice) * parseFloat(sellQuantity) : 0} Franc CFA</b>.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDialog} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={handleSellSubmit} color="primary">
                            Vendre
                        </Button>
                    </DialogActions>
                </Dialog>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom du Tissu</TableCell>
                                <TableCell align="right">Quantité</TableCell>
                                <TableCell align="right">Unité</TableCell>
                                <TableCell align="right">Prix Total&nbsp;(CFA)</TableCell>
                                <TableCell align="right">Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell component="th" scope="row">
                                        {log.tissu_nom}
                                    </TableCell>
                                    <TableCell align="right">{log.quantity}</TableCell>
                                    <TableCell align="right">{log.unite}</TableCell>
                                    <TableCell align="right">{log.price}</TableCell>
                                    <TableCell align="right">{new Date(log.date).toLocaleString()}</TableCell>
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
