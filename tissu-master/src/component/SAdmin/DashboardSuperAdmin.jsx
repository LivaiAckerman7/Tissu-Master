import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

function DashboardSuperAdmin() {
    const [admins, setAdmins] = useState([]);

  useEffect(() => {
 fetch('/api/superadmin/admins')
  .then(res => {
    console.log('✅ Reponse brute:', res);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('✅ Data reçue:', data);
    setAdmins(data);
  })
  .catch(err => console.error('Erreur chargement admins:', err));

}, []);


    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Dashboard SuperAdmin</Typography>
            <Paper sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email Admin</TableCell>
                            <TableCell>Boutiques créées</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {admins.map((admin, index) => (
                            <TableRow key={index}>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>
                                    {admin.boutiques.map(b => b.nom).join(', ') || 'Aucune'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
}

export default DashboardSuperAdmin;
