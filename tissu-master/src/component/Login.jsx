import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { Client, Account } from "appwrite";
import appwriteConfig from "../config/appwriteConfig";

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 🔁

  const handleRedirect = async (jwt) => {
    try {
      client.setJWT(jwt);
      const response = await account.get();
      localStorage.setItem("email", response.email);

      if (response.emailVerification) {
        if (response.labels.includes("superadmin")) {
          window.location.href = "/superadmin";
        } else if (response.labels.includes("admin")) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/user";
        }
      } else {
        setError(
          "Veuillez patienter, un admin vérifiera votre mail avant de vous connecter."
        );
        await account.deleteSession("current");
        setLoading(false);
      }
    } catch (err) {
      console.error("Échec de la vérification du JWT", err);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true); // ▶️ Début du chargement
    try {
      client.setJWT("");

      try {
        const sessions = await account.listSessions();
        for (const session of sessions.sessions) {
          await account.deleteSession(session.$id);
        }
      } catch (err) {
        console.warn("⚠️ Aucune session à supprimer.");
      }

      localStorage.removeItem("jwt");
      localStorage.removeItem("email");

      await account.createEmailPasswordSession(email, password);

      const jwt = await account.createJWT();
      localStorage.setItem("jwt", jwt.jwt);

      handleRedirect(jwt.jwt);
    } catch (err) {
      setError(err.message);
      console.error("Erreur login:", err);
      setLoading(false); // ❌ Arrêt si erreur
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
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
        disabled={loading}
      />
      <TextField
        label="Mot de passe"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      <Box sx={{ position: "relative", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Connexion en cours..." : "Connexion"}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: "primary.main",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>
    </Container>
  );
}

export default Login;
