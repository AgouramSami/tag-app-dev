import React, { useState, useEffect } from "react";
import axios from "axios";
import StatistiquesSatisfaction from "../components/StatistiquesSatisfaction";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";
import "../styles/Statistiques.css";

const Statistiques = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    parCommune: [],
    parTheme: [],
    satisfactionCommune: [],
    satisfactionStrate: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Récupérer les statistiques de base
        const [
          communeRes,
          themeRes,
          satisfactionCommuneRes,
          satisfactionStrateRes,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/stats/par-commune", config),
          axios.get("http://localhost:5000/api/stats/par-theme", config),
          axios.get(
            "http://localhost:5000/api/stats/satisfaction-commune",
            config
          ),
          axios.get(
            "http://localhost:5000/api/stats/satisfaction-strate",
            config
          ),
        ]);

        // Calculer les strates à partir des données de satisfaction
        const strateData = satisfactionStrateRes.data.map((strate) => ({
          strate: strate.strate,
          count: strate.totalDemandes,
        }));

        setStats({
          parCommune: communeRes.data || [],
          parTheme: themeRes.data || [],
          satisfactionCommune: satisfactionCommuneRes.data || [],
          satisfactionStrate: satisfactionStrateRes.data || [],
          parStrate: strateData,
        });

        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
        setError("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <StatistiquesSatisfaction
      statsCommune={stats.parCommune}
      statsTheme={stats.parTheme}
      statsStrate={stats.parStrate}
      statsSatisfactionCommune={stats.satisfactionCommune}
      statsSatisfactionStrate={stats.satisfactionStrate}
    />
  );
};

export default Statistiques;
