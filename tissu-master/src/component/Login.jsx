import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert } from '@mui/material';
import { Client, Account } from 'appwrite';
import appwriteConfig from '../config/appwriteConfig';

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRedirect = async (jwt) => {
        try {
            client.setJWT(jwt);
            const response = await account.get();
            localStorage.setItem('email', response.email);

            if (response.emailVerification) {
                if (response.labels.includes('admin')) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/user';
                }
            } else {
                setError('Veuillez patienter, un admin vérifiera votre mail avant de vous connecter.');
                await account.deleteSession('current');
            }
        } catch (err) {
            console.error('Échec de la vérification du JWT', err);
        }
    };

  const handleLogin = async () => {
    try {
        client.setJWT(""); // Réinitialise toute session Appwrite

        try {
            const sessions = await account.listSessions();
            for (const session of sessions.sessions) {
                await account.deleteSession(session.$id);
            }
        } catch (err) {
            console.warn('⚠️ Aucune session à supprimer ou erreur lors du nettoyage.');
        }

        localStorage.removeItem('jwt');
        localStorage.removeItem('email');

        await account.createEmailPasswordSession(email, password);

        const jwt = await account.createJWT();
        localStorage.setItem('jwt', jwt.jwt);

        handleRedirect(jwt.jwt);
    } catch (err) {
        setError(err.message);
        console.error('Erreur login:', err);
    }
};


    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" gutterBottom>
                Connexion
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Mot de passe"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                sx={{ mt: 2 }}
            >
                Connexion
            </Button>
        </Container>
    );
}

export default Login;
