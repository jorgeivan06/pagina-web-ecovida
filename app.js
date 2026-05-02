const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Guardar con el nombre original y fecha para evitar duplicados
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Servir archivos estáticos
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

// RUTA: Subir archivo
app.post('/upload-financiero', upload.single('documento'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo.');
    }
    res.redirect('/financiero?success=true');
});

// RUTA: Listar archivos (para el frontend)
app.get('/api/documentos', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer archivos.');
        }
        const fileInfos = files.map(file => ({
            name: file.split('-').slice(1).join('-'), // Quitar el timestamp del nombre visible
            url: `/uploads/${file}`
        }));
        res.json(fileInfos);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/financiero', (req, res) => {
    res.sendFile(path.join(__dirname, 'financiero.html'));
});

app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`   SERVIDOR ECOVIDA ACTIVO`);
    console.log(`   Puerto: ${PORT}`);
    console.log(`================================================`);
});
