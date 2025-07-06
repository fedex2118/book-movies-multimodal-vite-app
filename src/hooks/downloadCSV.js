function downloadCSV(filename = "hand_data.csv") {
    // Trasforma header e righe in stringhe CSV
    const lines = [
        header.join(","),             // prima riga: le intestazioni
        ...collectedRows.current.map(r => r.join(","))
    ];
    const csvContent = lines.join("\n");

    // Crea un Blob e forza il download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default downloadCSV;