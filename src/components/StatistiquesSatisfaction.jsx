import React from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupsIcon from "@mui/icons-material/Groups";
import CategoryIcon from "@mui/icons-material/Category";

const StatistiquesSatisfaction = ({
  statsCommune = [],
  statsTheme = [],
  statsStrate = [],
  statsSatisfactionCommune = [],
  statsSatisfactionStrate = [],
}) => {
  const theme = useTheme();

  // Fusionner les données de satisfaction avec les données de base des communes
  const communesData = statsCommune.map((commune) => {
    const satisfaction = statsSatisfactionCommune.find(
      (s) => s.commune === commune.commune
    );
    return {
      ...commune,
      noteMoyenne: satisfaction ? satisfaction.noteMoyenne : 0,
    };
  });

  // Style personnalisé pour les tableaux
  const tableStyles = {
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "4px",
      overflow: "hidden",
    },
    headerCell: {
      backgroundColor: "#f8f9fa",
      color: "#495057",
      fontWeight: 600,
      borderBottom: "2px solid #dee2e6",
    },
    row: {
      "&:nth-of-type(odd)": {
        backgroundColor: "#f8f9fa",
      },
      "&:hover": {
        backgroundColor: "#e9ecef",
      },
    },
    cell: {
      borderBottom: "1px solid #dee2e6",
      color: "#212529",
    },
  };

  // Style pour les cartes
  const cardStyles = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  };

  // Vérifier si les données sont chargées
  if (!statsCommune.length && !statsTheme.length && !statsStrate.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ flexGrow: 1, p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 4,
          color: "#212529",
          fontWeight: 600,
          textAlign: "left",
        }}
      >
        Tableau de bord statistique
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Tableau 1: Statistiques par strate */}
        <Box>
          <Card sx={cardStyles}>
            <CardHeader
              avatar={<AssessmentIcon sx={{ color: "#0d6efd" }} />}
              title={
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#212529" }}
                >
                  Statistiques par strate de commune
                </Typography>
              }
            />
            <Divider sx={{ borderColor: "#dee2e6" }} />
            <CardContent>
              <TableContainer sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableStyles.headerCell}>Strate</TableCell>
                      <TableCell align="right" sx={tableStyles.headerCell}>
                        Nombre de questions
                      </TableCell>
                      <TableCell align="right" sx={tableStyles.headerCell}>
                        Note moyenne
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsSatisfactionStrate.map((strate) => (
                      <TableRow key={strate.strate} sx={tableStyles.row}>
                        <TableCell sx={tableStyles.cell}>
                          {strate.strate}
                        </TableCell>
                        <TableCell align="right" sx={tableStyles.cell}>
                          {strate.totalDemandes}
                        </TableCell>
                        <TableCell align="right" sx={tableStyles.cell}>
                          {strate.noteMoyenne ? (
                            <Box
                              sx={{
                                color:
                                  strate.noteMoyenne >= 4
                                    ? "#198754"
                                    : strate.noteMoyenne >= 3
                                    ? "#ffc107"
                                    : "#dc3545",
                                fontWeight: 600,
                              }}
                            >
                              {strate.noteMoyenne.toFixed(2)} / 5
                            </Box>
                          ) : (
                            "0.00 / 5"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Tableau 2: Questions par thème */}
        <Box>
          <Card sx={cardStyles}>
            <CardHeader
              avatar={<CategoryIcon sx={{ color: "#0d6efd" }} />}
              title={
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#212529" }}
                >
                  Questions par thème
                </Typography>
              }
            />
            <Divider sx={{ borderColor: "#dee2e6" }} />
            <CardContent>
              <TableContainer sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableStyles.headerCell}>Thème</TableCell>
                      <TableCell align="right" sx={tableStyles.headerCell}>
                        Nombre de questions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statsTheme.map((theme) => (
                      <TableRow key={theme.theme} sx={tableStyles.row}>
                        <TableCell sx={tableStyles.cell}>
                          {theme.theme}
                        </TableCell>
                        <TableCell align="right" sx={tableStyles.cell}>
                          {theme.count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Tableau 3: Statistiques par commune */}
        <Box>
          <Card sx={cardStyles}>
            <CardHeader
              avatar={<GroupsIcon sx={{ color: "#0d6efd" }} />}
              title={
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#212529" }}
                >
                  Statistiques par commune
                </Typography>
              }
            />
            <Divider sx={{ borderColor: "#dee2e6" }} />
            <CardContent>
              <TableContainer sx={tableStyles.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableStyles.headerCell}>Commune</TableCell>
                      <TableCell align="right" sx={tableStyles.headerCell}>
                        Nombre de questions
                      </TableCell>
                      <TableCell align="right" sx={tableStyles.headerCell}>
                        Taux de satisfaction
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {communesData.map((commune) => (
                      <TableRow key={commune.commune} sx={tableStyles.row}>
                        <TableCell sx={tableStyles.cell}>
                          {commune.commune}
                        </TableCell>
                        <TableCell align="right" sx={tableStyles.cell}>
                          {commune.count}
                        </TableCell>
                        <TableCell align="right" sx={tableStyles.cell}>
                          <Box
                            sx={{
                              color:
                                commune.noteMoyenne >= 4
                                  ? "#198754"
                                  : commune.noteMoyenne >= 3
                                  ? "#ffc107"
                                  : "#dc3545",
                              fontWeight: 600,
                            }}
                          >
                            {commune.noteMoyenne
                              ? commune.noteMoyenne.toFixed(2)
                              : "0.00"}{" "}
                            / 5
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default StatistiquesSatisfaction;
