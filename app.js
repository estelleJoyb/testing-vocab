const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const xlsx = require("xlsx");
const path = require("path");

app.use(cors());
app.use(express.json());

const excelFilePath = path.join(__dirname, "vocabulaire.xlsx");

app.use(express.static(path.join(__dirname, "public")));

function loadWordsFromExcel() {
  const workbook = xlsx.readFile(excelFilePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  return data.map((row) => ({
    word: row.word,
    traduction: row.traduction,
  }));
}

const words = loadWordsFromExcel();

app.get("/words", (req, res) => {
  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex];
  res.json({ word: word.word });
});

app.post("/check", (req, res) => {
  const { word, userTraduction } = req.body;
  const correctWord = words.find((w) => w.word === word);

  if (correctWord) {
    const normalizedTraduction = correctWord.traduction.toLowerCase().trim();
    const normalizedUserTraduction = userTraduction.toLowerCase().trim();

    if (normalizedTraduction.includes(normalizedUserTraduction)) {
      return res.json({
        correct: true,
        correctTraduction: correctWord.traduction,
      });
    } else {
      return res.json({
        correct: false,
        correctTraduction: correctWord.traduction,
      });
    }
  } else {
    res.json({ correct: false, message: "Mot non trouvé." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
