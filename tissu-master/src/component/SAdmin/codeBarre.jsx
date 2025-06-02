import React, { useEffect, useState, useRef } from 'react';
import JsBarcode from 'jsbarcode';
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
        }));

        setProduits(produitsAvecRefs);
      } catch (error) {
        console.error('Échec de la récupération des tissus', error);
      }
    };

    fetchTissus();
  }, []);

  useEffect(() => {
    produits.forEach(produit => {
      if (produit.ref.current) {
        JsBarcode(produit.ref.current, produit.id.toString(), {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: true,
        });
      }
    });
  }, [produits]);

  const printLabelPage = produit => {
    const barcodeSVG = produit.ref.current.outerHTML;

    const labelContent = `
      <html>
      <head>
        <style>
          body { text-align: center; font-family: Arial; }
          h1 { margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>${produit.nom}</h1>
        ${barcodeSVG}
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
        Génération de codes-barres pour les tissus
      </Typography>
      <List>
        {produits.map((produit, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={produit.nom}
              secondary={`Boutique: ${produit.boutique_nom}`}
            />
            <svg ref={produit.ref}></svg>
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
