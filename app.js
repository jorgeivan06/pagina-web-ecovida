const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@vercel/kv');

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

// --- LÓGICA DE DETECCIÓN DINÁMICA DE VERCEL KV ---
let kvClient = null;

function getKVClient() {
    if (kvClient) return kvClient;
    const env = process.env;
    const urlKey = Object.keys(env).find(k => k.endsWith('_REST_API_URL'));
    const tokenKey = Object.keys(env).find(k => k.endsWith('_REST_API_TOKEN'));

    if (urlKey && tokenKey) {
        kvClient = createClient({
            url: env[urlKey],
            token: env[tokenKey],
        });
        return kvClient;
    }
    return null;
}

async function getAdminPassword() {
    const kv = getKVClient();
    if (kv) {
        try {
            const kvPassword = await kv.get('adminPassword');
            if (kvPassword) return kvPassword;
        } catch (e) {}
    }

    if (process.env.ADMIN_PASSWORD) {
        return process.env.ADMIN_PASSWORD;
    }
    
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            return config.adminPassword;
        }
    } catch (e) {}

    return 'admin123';
}

// RUTA: Login Administrativo
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    const adminPassword = await getAdminPassword();
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
});

// RUTA: Cambiar Contraseña
app.post('/api/admin/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminPassword = await getAdminPassword();
    
    if (oldPassword === adminPassword) {
        const kv = getKVClient();
        if (kv) {
            try {
                await kv.set('adminPassword', newPassword);
                return res.json({ success: true, message: 'Contraseña actualizada en la Nube' });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Error en KV: ' + e.message });
            }
        } else {
            try {
                fs.writeFileSync(CONFIG_PATH, JSON.stringify({ adminPassword: newPassword }, null, 2));
                return res.json({ success: true, message: 'Contraseña actualizada localmente' });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'No se pudo guardar la contraseña' });
            }
        }
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

// En local servimos los estáticos para pruebas
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    const angularPath = path.join(__dirname, 'public', 'financiero', 'browser');
    app.use('/financiero', express.static(angularPath));
    app.get(/\/financiero.*/, (req, res) => {
        res.sendFile(path.join(angularPath, 'index.html'));
    });
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// Para Vercel: Solo las rutas de API son necesarias aquí, 
// ya que vercel.json maneja el resto.
// Pero dejamos el fallback por si acaso.

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

module.exports = app;
