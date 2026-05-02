// --- NAVEGACIÓN SUAVE (SMOOTH SCROLL) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 90, // Ajuste por la altura del navbar
                behavior: 'smooth'
            });
        }
    });
});

// --- INTERACTIVIDAD DE ESPECIALIDADES ---
document.querySelectorAll('.card-service.clickable').forEach(card => {
    item.addEventListener('click', () => {
        // Cerrar otras tarjetas abiertas
        document.querySelectorAll('.card-service.clickable').forEach(other => {
            if (other !== card) other.classList.remove('active');
        });
        // Alternar estado de la tarjeta actual
        card.classList.toggle('active');
    });
});

// --- REINICIO AL CLIC EN EL LOGO ---
document.querySelector('.logo a').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// --- PORTAL DE RESULTADOS (SIMULACIÓN) ---
const resultsForm = document.getElementById('results-form');
const portalMessage = document.getElementById('portal-message');

if (resultsForm) {
    resultsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        portalMessage.style.color = 'var(--text-dark)';
        portalMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando resultados en el sistema...';

        setTimeout(() => {
            portalMessage.style.color = '#d32f2f'; // Rojo error
            portalMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se encontraron resultados con los datos proporcionados. Por favor, verifique e intente de nuevo.';
        }, 2000);
    });
}
