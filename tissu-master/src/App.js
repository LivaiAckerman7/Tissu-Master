import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './component/LandingPage';
import Login from './component/Login';
import DashboardUser from './component/Utilisateurs/DashboardUser';
import DashboardAdmin from './component/Admin/DashboardAdmin';
import AdminBarcodes from './component/SAdmin/codeBarre';
import Boutiques from "./component/Admin/Boutiques";
import { Client, Account } from 'appwrite';
import appwriteConfig from './config/appwriteConfig';
import DashboardSuperAdmin from './component/SAdmin/DashboardSuperAdmin';
import StatistiquesAdmin from './component/Admin/Statistiques';
import SuperAdminLogs from './component/SAdmin/SuperAdminLogs';


// Définir client et account ici
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)

const account = new Account(client);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Route unique pour le dashboard utilisateur */}
        <Route
          path="/user/:tissuId?"
          element={<DashboardUser account={account} />}
        />
        <Route path="/admin" element={<DashboardAdmin account={account} />} />
        <Route path="/superadmin" element={<DashboardSuperAdmin />} />
        <Route path="/superadmin/logs" element={<SuperAdminLogs />} />
        <Route path="/admin/statistiques" element={<StatistiquesAdmin />} />
        <Route path='/admin/boutiques' element={<Boutiques account={account} />} />
        <Route path="/admin/codeQR" element={<AdminBarcodes />} />
        {/* Supprimer l'ancienne route /dashboard */}
      </Routes>
    </Router>
  );
}

export default App;
