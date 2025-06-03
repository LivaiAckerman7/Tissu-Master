import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import SuperAdminLayout from './SuperAdminLayout';

function SuperAdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    boutique: '',
    admin: ''
  });

  const fetchLogs = async () => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/superadmin/logs?${params.toString()}`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <SuperAdminLayout>
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>📅 Logs de vente - SuperAdmin</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">🔍 Filtres</Typography>
        <TextField
          label="Date début"
          type="date"
          name="start"
          value={filters.start}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Date fin"
          type="date"
          name="end"
          value={filters.end}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Nom boutique"
          name="boutique"
          value={filters.boutique}
          onChange={handleChange}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Email admin"
          name="admin"
          value={filters.admin}
          onChange={handleChange}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={fetchLogs}>Rechercher</Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Boutique</TableCell>
              <TableCell>Tissu</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Unité</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.boutique_nom}</TableCell>
                <TableCell>{log.tissu_nom}</TableCell>
                <TableCell>{log.quantity}</TableCell>
                <TableCell>{log.unite}</TableCell>
                <TableCell>{log.price}</TableCell>
                <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                <TableCell>{log.proprio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
    </SuperAdminLayout>
  );
}

export default SuperAdminLogs;
