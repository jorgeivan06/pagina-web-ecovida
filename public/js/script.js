document.addEventListener('DOMContentLoaded', () => {
    // MENÚ MÓVIL
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ESPECIALIDADES - Acordeón
    const serviceCards = document.querySelectorAll('.card-service.clickable');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Cerrar otros si se desea (opcional)
            // serviceCards.forEach(c => { if(c !== card) c.classList.remove('active'); });
            
            card.classList.toggle('active');
        });
    });

    // PORTAL DE RESULTADOS (Simulación)
    const resultsForm = document.getElementById('results-form');
    const portalMessage = document.getElementById('portal-message');

    if (resultsForm) {
        resultsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            portalMessage.innerHTML = `<p style="color: #005073; margin-top: 15px; font-weight: 600;"><i class="fas fa-spinner fa-spin"></i> Buscando resultados en la base de datos...</p>`;
            
            setTimeout(() => {
                portalMessage.innerHTML = `<p style="color: #e74c3c; margin-top: 15px; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> No se encontraron resultados. Por favor, verifique los datos o contacte a soporte.</p>`;
            }, 2000);
        });
    }
});
