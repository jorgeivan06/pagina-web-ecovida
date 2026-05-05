const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@vercel/kv');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// --- LÓGICA DE DETECCIÓN DINÁMICA DE SUPABASE ---
let supabase = null;
function getSupabase() {
    if (supabase) return supabase;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
        supabase = createSupabaseClient(url, key);
        return supabase;
    }
    return null;
}

// Configuración de almacenamiento para Multer
const isVercel = process.env.VERCEL === '1';
const UPLOADS_DIR = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
        console.error('Error al crear el directorio de uploads:', err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR)
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
    
    // Vercel KV env vars
    const url = env.KV_REST_API_URL || env.VERCEL_KV_REST_API_URL;
    const token = env.KV_REST_API_TOKEN || env.VERCEL_KV_REST_API_TOKEN;

    if (url && token) {
        kvClient = createClient({
            url: url,
            token: token,
        });
        return kvClient;
    }
    return null;
}

async function getAdminPassword() {
    // 1. Intentar con Supabase
    const sb = getSupabase();
    if (sb) {
        try {
            const { data, error } = await sb
                .from('config')
                .select('value')
                .eq('key', 'adminPassword')
                .single();
            if (data && data.value) return data.value;
        } catch (e) {
            console.error('Error al leer de Supabase:', e);
        }
    }

    // 2. Intentar con KV
    const kv = getKVClient();
    if (kv) {
        try {
            const kvPassword = await kv.get('adminPassword');
            if (kvPassword) return kvPassword;
        } catch (e) {
            console.error('Error al leer de KV:', e);
        }
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
    try {
        const { password } = req.body;
        const adminPassword = await getAdminPassword();
        if (password === adminPassword) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno: ' + err.message });
    }
});

// RUTA: Cambiar Contraseña
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const adminPassword = await getAdminPassword();
        
        if (oldPassword === adminPassword) {
            // 1. Guardar en Supabase
            const sb = getSupabase();
            if (sb) {
                try {
                    const { error } = await sb
                        .from('config')
                        .upsert({ key: 'adminPassword', value: newPassword });
                    if (!error) return res.json({ success: true, message: 'Contraseña actualizada en Supabase' });
                } catch (e) {
                    console.error('Error en Supabase:', e);
                }
            }

            // 2. Guardar en KV
            const kv = getKVClient();
            if (kv) {
                try {
                    await kv.set('adminPassword', newPassword);
                    return res.json({ success: true, message: 'Contraseña actualizada en la Nube (KV)' });
                } catch (e) {
                    return res.status(500).json({ success: false, message: 'Error en KV: ' + e.message });
                }
            } else {
                if (isVercel) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'No se puede guardar localmente en Vercel. Configura Supabase o KV.' 
                    });
                }
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
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno: ' + err.message });
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
    if (!fs.existsSync(UPLOADS_DIR)) {
        return res.json([]);
    }
    fs.readdir(UPLOADS_DIR, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer archivos.');
        }
        const fileInfos = files.map(file => ({
            name: file.split('-').slice(1).join('-'),
            filename: file,
            url: `/api/uploads/${file}`
        }));
        res.json(fileInfos);
    });
});

// RUTA: Servir archivos de upload (necesario en Vercel para /tmp)
app.get('/api/uploads/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

// RUTA: Eliminar archivo
app.delete('/api/documentos/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);

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
if (process.env.NODE_ENV !== 'production' && !isVercel) {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/uploads', express.static(UPLOADS_DIR));
    
    const angularPath = path.join(__dirname, 'public', 'financiero', 'browser');
    
    // Servir la App de Angular en /financiero
    app.use('/financiero', express.static(angularPath));
    
    // Fallback para Angular (SPA Routing)
    app.get(/^\/financiero($|\/.*)/, (req, res) => {
        const indexPath = path.join(angularPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).send('Angular build not found in /public/financiero/browser. Run npm run build.');
        }
    });

    // Servir el index.html principal de la landing page
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
