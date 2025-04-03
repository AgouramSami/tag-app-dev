import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const ParametresRGPD = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleToggle = async (field) => {
    try {
      const updatedUser = {
        ...user,
        [field]: !user[field],
      };
      await updateUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/export-data`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export des données");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${user.email}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du compte");
      }

      await logout();
      navigate("/login");
    } catch (error) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Paramètres RGPD
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Vos préférences ont été mises à jour avec succès
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Une erreur est survenue lors de la mise à jour de vos préférences
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Gestion de vos données personnelles
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={user?.accepteMarketing || false}
                onChange={() => handleToggle("accepteMarketing")}
              />
            }
            label="J'accepte de recevoir des communications marketing"
          />

          <FormControlLabel
            control={
              <Switch
                checked={user?.accepteAnalytics || false}
                onChange={() => handleToggle("accepteAnalytics")}
              />
            }
            label="J'accepte l'utilisation de cookies analytiques"
          />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Export de vos données
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportData}
            >
              Exporter mes données
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Suppression de votre compte
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Supprimer mon compte
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est
            irréversible et toutes vos données seront définitivement supprimées.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParametresRGPD;
