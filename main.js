// main.js - VERSIÓN MEJORADA CON MEJORES MENSAJES
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema de testimonios cargado en Netlify');

  const testimonialsList = document.getElementById('testimonials-list');
  const testimonialForm = document.getElementById('add-testimonial');

  // Cargar testimonios
  function loadTestimonials() {
    console.log('📥 Cargando testimonios...');
    loadFromCache();
  }

  // Guardar testimonio
  async function saveTestimonial(name, text, email = '') {
    console.log('💾 Guardando testimonio...');
    return saveToCache(name, text, email);
  }

  function saveToCache(name, text, email) {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    const newTestimonial = {
      id: Date.now(),
      name: name,
      text: text,
      email: email,
      timestamp: new Date().toISOString(),
      status: 'Aprobado',
      source: 'website'
    };
    
    cached.unshift(newTestimonial);
    localStorage.setItem('testimonials_cache', JSON.stringify(cached));
    
    return { 
      success: true, 
      source: 'cache', 
      message: '✅ ¡Gracias por tu testimonio! Se ha guardado correctamente y aparece en la lista.' 
    };
  }

  function loadFromCache() {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    
    if (cached.length === 0) {
      // Datos de ejemplo más profesionales
      const samples = [
        {
          id: 1,
          name: "María González - TechSolutions Inc.",
          text: "Excelente servicio de soporte bilingüe. Muy profesionales y siempre disponibles cuando los necesitamos.",
          timestamp: new Date('2024-10-10').toISOString(),
          source: 'ejemplo',
          status: 'Aprobado'
        },
        {
          id: 2,
          name: "Carlos Rodríguez - LegalFirm Corp", 
          text: "La comunicación fluida y los resultados excelentes han mejorado nuestra atención al cliente significativamente.",
          timestamp: new Date('2024-10-05').toISOString(),
          source: 'ejemplo',
          status: 'Aprobado'
        }
      ];
      displayTestimonials(samples);
      localStorage.setItem('testimonials_cache', JSON.stringify(samples));
    } else {
      displayTestimonials(cached);
    }
  }

  function displayTestimonials(testimonials) {
    if (!testimonialsList) return;
    
    testimonialsList.innerHTML = '';
    
    if (!testimonials || testimonials.length === 0) {
      testimonialsList.innerHTML = `
        <div class="testimonial-bubble staff">
          <div class="testimonial-author">Sistema</div>
          <div class="testimonial-text">Aún no hay testimonios. ¡Sé el primero en compartir tu experiencia!</div>
          <div class="testimonial-time">Justo ahora</div>
        </div>
      `;
      return;
    }
    
    // Ordenar por fecha (más recientes primero)
    testimonials.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    testimonials.forEach((testimonial, index) => {
      const bubble = document.createElement('div');
      bubble.className = `testimonial-bubble ${index % 2 === 0 ? 'client' : 'staff'}`;
      
      const timeAgo = getTimeAgo(new Date(testimonial.timestamp));
      const isExample = testimonial.source === 'ejemplo';
      
      bubble.innerHTML = `
        <div class="testimonial-author">${testimonial.name || 'Anónimo'}</div>
        <div class="testimonial-text">${testimonial.text || ''}</div>
        <div class="testimonial-time">${timeAgo} ${isExample ? '• Ejemplo' : ''}</div>
      `;
      
      testimonialsList.appendChild(bubble);
    });
    
    console.log('✅', testimonials.length, 'testimonios mostrados');
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.round(diffDays/7)} semanas`;
    return `Hace ${Math.round(diffDays/30)} meses`;
  }

  // Manejar formulario con mejor UX
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = testimonialForm.querySelector('[name="name"]').value.trim();
      const text = testimonialForm.querySelector('[name="text"]').value.trim();
      const emailInput = testimonialForm.querySelector('[name="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      
      if (!name || !text) {
        showMessage('❌ Por favor completa nombre y testimonio', 'error');
        return;
      }
      
      if (text.length < 10) {
        showMessage('❌ El testimonio debe tener al menos 10 caracteres', 'error');
        return;
      }
      
      const submitBtn = testimonialForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;
      
      try {
        const result = await saveTestimonial(name, text, email);
        showMessage(result.message, 'success');
        
        testimonialForm.reset();
        loadTestimonials();
        
      } catch (error) {
        showMessage('❌ Error inesperado al guardar', 'error');
        console.error('Error en submit:', error);
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Función para mostrar mensajes bonitos
  function showMessage(message, type = 'info') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
      <div class="message-content">
        ${message}
      </div>
    `;
    
    // Estilos para el mensaje
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
      messageEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }

  // Inicializar
  if (testimonialsList) {
    loadTestimonials();
  }

  console.log('🎉 Sistema de testimonios listo');
});

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .message {
    font-family: Arial, sans-serif;
    font-size: 14px;
  }
`;
document.head.appendChild(style);