import React, { useState, useEffect } from "react";
import StatistiquesSatisfaction from "../components/StatistiquesSatisfaction";
import { Box, CircularProgress, Typography } from "@mui/material";
import "../styles/Statistiques.css";

const API_URL = "http://localhost:5000";

const Statistiques = () => {
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

        const [
          communeRes,
          themeRes,
          satisfactionCommuneRes,
          satisfactionStrateRes,
        ] = await Promise.all([
          fetch(`${API_URL}/api/stats/par-commune`, {
            credentials: "include",
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/stats/par-theme`, {
            credentials: "include",
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/stats/satisfaction-commune`, {
            credentials: "include",
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/stats/satisfaction-strate`, {
            credentials: "include",
          }).then((res) => res.json()),
        ]);

        const strateData = satisfactionStrateRes.map((strate) => ({
          strate: strate.strate,
          count: strate.totalDemandes,
        }));

        setStats({
          parCommune: communeRes || [],
          parTheme: themeRes || [],
          satisfactionCommune: satisfactionCommuneRes || [],
          satisfactionStrate: satisfactionStrateRes || [],
          parStrate: strateData,
        });

        setError(null);
      } catch (error) {
        setError("Erreur lors du chargement des statistiques");
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
