import React, { useState } from "react";
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
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupsIcon from "@mui/icons-material/Groups";
import CategoryIcon from "@mui/icons-material/Category";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const StatistiquesSatisfaction = ({
  statsCommune = [],
  statsTheme = [],
  statsStrate = [],
  statsSatisfactionCommune = [],
  statsSatisfactionStrate = [],
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    // Préparer les données pour l'export
    const strateData = statsSatisfactionStrate.map(
      (strate) =>
        `${strate.strate},${strate.totalDemandes},${strate.noteMoyenne || 0}`
    );

    const themeData = statsTheme.map(
      (theme) => `${theme.theme},${theme.count}`
    );

    const communeData = communesData.map(
      (commune) =>
        `${commune.commune},${commune.count},${commune.noteMoyenne || 0}`
    );

    // Créer le contenu CSV avec BOM pour Excel
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        "Statistiques par strate",
        "Strate,Nombre de questions,Note moyenne",
        ...strateData,
        "",
        "Statistiques par thème",
        "Thème,Nombre de questions",
        ...themeData,
        "",
        "Statistiques par commune",
        "Commune,Nombre de questions,Note moyenne",
        ...communeData,
      ].join("\n");

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "statistiques_tag.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Titre
    doc.setFontSize(20);
    doc.text("Tableau de bord statistique", margin, margin + 10);

    // Statistiques par strate
    doc.setFontSize(16);
    doc.text("Statistiques par strate", margin, margin + 30);
    autoTable(doc, {
      startY: margin + 35,
      head: [["Strate", "Nombre de questions", "Note moyenne"]],
      body: statsSatisfactionStrate.map((strate) => [
        strate.strate,
        strate.totalDemandes.toString(),
        strate.noteMoyenne
          ? strate.noteMoyenne.toFixed(2) + " / 5"
          : "0.00 / 5",
      ]),
      theme: "grid",
      headStyles: { fillColor: [13, 49, 84] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.4 },
        1: { cellWidth: contentWidth * 0.3 },
        2: { cellWidth: contentWidth * 0.3 },
      },
      didDrawPage: function (data) {
        // Ajouter la date d'export sur chaque page
        const date = new Date().toLocaleDateString("fr-FR");
        doc.setFontSize(8);
        doc.text(
          `Exporté le ${date}`,
          margin,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Statistiques par thème
    doc.setFontSize(16);
    doc.text("Statistiques par thème", margin, doc.lastAutoTable.finalY + 20);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Thème", "Nombre de questions"]],
      body: statsTheme.map((theme) => [theme.theme, theme.count.toString()]),
      theme: "grid",
      headStyles: { fillColor: [13, 49, 84] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.6 },
        1: { cellWidth: contentWidth * 0.4 },
      },
      didDrawPage: function (data) {
        // Ajouter la date d'export sur chaque page
        const date = new Date().toLocaleDateString("fr-FR");
        doc.setFontSize(8);
        doc.text(
          `Exporté le ${date}`,
          margin,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Statistiques par commune
    doc.setFontSize(16);
    doc.text("Statistiques par commune", margin, doc.lastAutoTable.finalY + 20);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Commune", "Nombre de questions", "Note moyenne"]],
      body: communesData.map((commune) => [
        commune.commune,
        commune.count.toString(),
        commune.noteMoyenne
          ? commune.noteMoyenne.toFixed(2) + " / 5"
          : "0.00 / 5",
      ]),
      theme: "grid",
      headStyles: { fillColor: [13, 49, 84] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.4 },
        1: { cellWidth: contentWidth * 0.3 },
        2: { cellWidth: contentWidth * 0.3 },
      },
      didDrawPage: function (data) {
        // Ajouter la date d'export sur chaque page
        const date = new Date().toLocaleDateString("fr-FR");
        doc.setFontSize(8);
        doc.text(
          `Exporté le ${date}`,
          margin,
          doc.internal.pageSize.height - 10
        );
      },
    });

    try {
      doc.save("statistiques_tag.pdf");
      handleExportClose();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert(
        "Une erreur est survenue lors de la génération du PDF. Veuillez réessayer."
      );
    }
  };

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "#212529",
            fontWeight: 600,
            textAlign: "left",
            mb: 0,
          }}
        >
          Tableau de bord statistique
        </Typography>
        <div>
          <Button
            variant="contained"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleExportClick}
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
          >
            Exporter
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={exportToCSV}>
              <ListItemIcon>
                <TableChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exporter en CSV</ListItemText>
            </MenuItem>
            <MenuItem onClick={exportToPDF}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Exporter en PDF</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      </Box>

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
