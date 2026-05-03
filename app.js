const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { kv } = require('@vercel/kv');

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

// Función mejorada para detectar si KV está configurado realmente
function isKVEnabled() {
    // Vercel KV inyecta KV_REST_API_URL o similares
    return !!(process.env.KV_REST_API_URL || process.env.KV_URL);
}

async function getAdminPassword() {
    // 1. Intentar Vercel KV si está disponible
    if (isKVEnabled()) {
        try {
            const kvPassword = await kv.get('adminPassword');
            if (kvPassword) return kvPassword;
        } catch (e) {
            console.error("Error al leer de KV:", e.message);
        }
    }

    // 2. Variable de entorno manual
    if (process.env.ADMIN_PASSWORD) {
        return process.env.ADMIN_PASSWORD;
    }
    
    // 3. Archivo local (Desarrollo)
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            return config.adminPassword;
        }
    } catch (e) {}

    // 4. Clave maestra inicial
    return 'admin123';
}

// RUTA DIAGNÓSTICA: Para verificar conexión a base de datos
app.get('/api/admin/debug-kv', async (req, res) => {
    res.json({
        kvConfigured: isKVEnabled(),
        envKeysFound: Object.keys(process.env).filter(k => k.includes('KV')),
        timestamp: new Date().toISOString()
    });
});

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
        if (isKVEnabled()) {
            try {
                await kv.set('adminPassword', newPassword);
                return res.json({ success: true, message: 'Contraseña actualizada en la Nube (KV)' });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Error en KV: ' + e.message });
            }
        } else {
            // Si no hay KV, intentamos local (solo funciona en tu PC)
            try {
                fs.writeFileSync(CONFIG_PATH, JSON.stringify({ adminPassword: newPassword }, null, 2));
                return res.json({ success: true, message: 'Contraseña actualizada localmente' });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'No hay base de datos conectada en Vercel. Use variables de entorno.' });
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

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aplicación Angular
const angularPath = path.join(__dirname, 'public', 'financiero-app', 'browser');
app.use('/financiero', express.static(angularPath));

app.get(/\/financiero.*/, (req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`SERVIDOR ECOVIDA ACTIVO en puerto ${PORT}`);
});

module.exports = app;
