import React from 'react';
import { Container, Typography, Box } from '@mui/material';

function StatistiquesAdmin() {
    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Statistiques des ventes</Typography>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">📊 Tissus les plus vendus</Typography>
                <iframe
                    src="http://localhost:3001/d/e8eb0032-664f-4bc3-9756-793b7e8bfc1d/top-20-tissus-vendus?orgId=1&from=now-6h&to=now&timezone=browser"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title="Top Tissus"
                ></iframe>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">📉 Tissus les moins vendus</Typography>
                <iframe
                    src="http://localhost:3001/d/0b26dd2c-0f33-42c2-a849-bcb1077e588f/top-20-tissus-les-moins-vendus?orgId=1&from=now-6h&to=now&timezone=browser&shareView=public_dashboard"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title="Bottom Tissus"
                ></iframe>
            </Box>

          {/*   <Box sx={{ mt: 4 }}>
                <Typography variant="h6">📆 Évolution chiffre d'affaires</Typography>
                <iframe
                    src="http://localhost:3001/d/zzzzzz/evolution-ca?orgId=1&kiosk"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title="Évolution CA"
                ></iframe>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">🏪 Chiffre d’affaires par boutique</Typography>
                <iframe
                    src="http://localhost:3001/d/aaaaaa/ca-boutique?orgId=1&kiosk"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    title="CA Boutique"
                ></iframe> 
            </Box>*/}
        </Container>
    );
}

export default StatistiquesAdmin;
