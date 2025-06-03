import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const AdminBarcodes = () => {
  const [groupedProduits, setGroupedProduits] = useState({});

  useEffect(() => {
    const fetchTissus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tissus");
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
    };

    fetchTissus();
  }, []);

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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Codes QR par boutique
      </Typography>

      {Object.entries(groupedProduits).map(([boutique, produits]) => (
        <div key={boutique}>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Boutique : {boutique}
          </Typography>
          <List>
            {produits.map((produit, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={produit.nom}
                  secondary={`ID: ${produit.id}`}
                />
                <canvas ref={produit.ref}></canvas>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => printLabelPage(produit)}
                  sx={{ ml: 2 }}
                >
                  Imprimer Étiquette
                </Button>
              </ListItem>
            ))}
          </List>
          <Divider />
        </div>
      ))}
    </Container>
  );
};

export default AdminBarcodes;
