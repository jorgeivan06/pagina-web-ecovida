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
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

app.use(express.json());

const CONFIG_PATH = path.join(__dirname, 'config.json');

function getConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ adminPassword: 'admin123' }));
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// RUTA: Login Administrativo
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const config = getConfig();
    if (password === config.adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

// RUTA: Cambiar Contraseña
app.post('/api/admin/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const config = getConfig();
    
    if (oldPassword === config.adminPassword) {
        config.adminPassword = newPassword;
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } else {
        res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }
});

// RUTA: Subir archivo
app.post('/upload-financiero', upload.single('documento'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }
    res.json({ success: true, message: '¡Documento subido correctamente!', file: req.file.filename });
});

// RUTA: Listar archivos
app.get('/api/documentos', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
    }
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer archivos.');
        }
        const fileInfos = files.map(file => ({
            name: file.split('-').slice(1).join('-'),
            filename: file,
            url: `/uploads/${file}`
        }));
        res.json(fileInfos);
    });
});

// RUTA: Eliminar archivo
app.delete('/api/documentos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error al eliminar el archivo.' });
            }
            res.json({ success: true, message: 'Archivo eliminado correctamente.' });
        });
    } else {
        res.status(404).json({ success: false, message: 'Archivo no encontrado.' });
    }
});

// Archivos estáticos generales
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aplicación Angular en /financiero
const angularPath = path.join(__dirname, 'public', 'financiero-app', 'browser');
app.use('/financiero', express.static(angularPath));

// Fallback para Angular SPA (debe ir DESPUÉS de express.static)
app.get(/\/financiero.*/, (req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`   SERVIDOR ECOVIDA ACTIVO`);
    console.log(`   Puerto: ${PORT}`);
    console.log(`================================================`);
});

module.exports = app;
