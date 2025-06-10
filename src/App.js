import React, { useState } from "react";
import * as XLSX from "xlsx";

const App = () => {
  const [clients, setClients] = useState([]);
  const [colonnes, setColonnes] = useState([]);
  const [nouveauClient, setNouveauClient] = useState({});
  const [message, setMessage] = useState("");
  const [nomFichierOriginal, setNomFichierOriginal] = useState("");

  // Lire le fichier Excel et extraire les colonnes
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setNomFichierOriginal(file.name); // Stocke le nom du fichier original

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Clients importés :", jsonData);
      setClients(jsonData);

      if (jsonData.length > 0) {
        const nomsColonnes = Object.keys(jsonData[0]);
        setColonnes(nomsColonnes);
        setNouveauClient(nomsColonnes.reduce((obj, col) => ({ ...obj, [col]: "" }), {}));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Mettre à jour les champs du formulaire
  const handleInputChange = (e) => {
    setNouveauClient({ ...nouveauClient, [e.target.name]: e.target.value });
  };

  // Ajouter un client et vider le formulaire après l'ajout
  const ajouterClient = () => {
    setClients([...clients, nouveauClient]);

    setNouveauClient(colonnes.reduce((obj, col) => ({ ...obj, [col]: "" }), {}));

    setMessage("✅ Client ajouté avec succès !");
    setTimeout(() => setMessage(""), 3000);
  };

  // Enregistrer le fichier sous son **nom d'origine**
  const saveUpdatedFile = () => {
    if (clients.length === 0) {
      alert("⚠️ Aucun client à enregistrer !");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(clients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");

    // Utiliser le **nom du fichier original** pour le téléchargement
    XLSX.writeFile(wb, nomFichierOriginal);

    alert(`✅ Fichier "${nomFichierOriginal}" mis à jour avec succès !`);
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h1 className="text-center text-primary mb-4">Gestion des Clients</h1>

        {/* Importer le fichier Excel */}
        <div className="mb-3">
          <input type="file" accept=".xlsx" onChange={handleFileUpload} className="form-control" />
        </div>

        {message && <p className="alert alert-success text-center">{message}</p>}

        {/* Formulaire dynamique en fonction des colonnes */}
        <h2 className="text-secondary">Ajouter un nouveau client :</h2>
        {colonnes.map((col, index) => (
          <input
            key={index}
            type="text"
            name={col}
            placeholder={col}
            value={nouveauClient[col] || ""}
            onChange={handleInputChange}
            className="form-control mb-2"
          />
        ))}

        <button className="btn btn-success w-100 mb-3" onClick={ajouterClient}>
          ➕ Ajouter ce Client
        </button>

        <button className="btn btn-primary w-100" onClick={saveUpdatedFile}>
          📥 Télécharger `{nomFichierOriginal}`
        </button>

        {/* Affichage des clients importés */}
        <div className="mt-4">
          <h2 className="text-secondary text-center">Clients importés :</h2>
          {clients.length > 0 ? (
            <ul className="list-group">
              {clients.map((client, index) => (
                <li key={index} className="list-group-item">
                  {Object.values(client).join(" - ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-danger text-center">Aucun client importé. Vérifie le fichier Excel.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
