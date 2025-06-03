import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const AdminBarcodes = () => {
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    const fetchTissus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tissus');
        const data = await response.json();

        const produitsAvecRefs = data.map(p => ({
          ...p,
          ref: React.createRef(),
          qrCodeUrl: `${window.location.origin}/user/${p.id}` // URL complète
        }));

        setProduits(produitsAvecRefs);
      } catch (error) {
        console.error('Échec de la récupération des tissus', error);
      }
    };

    fetchTissus();
  }, []);

  useEffect(() => {
    const generateQRCodes = async () => {
      for (const produit of produits) {
        if (produit.ref.current) {
          try {
            await QRCode.toCanvas(
              produit.ref.current,
              produit.qrCodeUrl,
              {
                width: 150,
                margin: 1,
                color: {
                  dark: '#000000',
                  light: '#ffffff'
                }
              }
            );
          } catch (err) {
            console.error('Erreur génération QR code', err);
          }
        }
      }
    };

    generateQRCodes();
  }, [produits]);

  const printLabelPage = produit => {
    const qrCodeCanvas = produit.ref.current;
    const qrCodeImage = qrCodeCanvas.toDataURL('image/png');

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

    const printWindow = window.open('', '_blank');
    printWindow.document.write(labelContent);
    printWindow.document.close();
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Génération de codes QR pour les tissus
      </Typography>
      <List>
        {produits.map((produit, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={produit.nom}
              secondary={`Boutique: ${produit.boutique_nom}`}
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
    </Container>
  );
};

export default AdminBarcodes;