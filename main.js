// main.js - VERSIÓN ESTABLE SOLO LOCALSTORAGE
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema de testimonios cargado en Netlify');

  const testimonialsList = document.getElementById('testimonials-list');
  const testimonialForm = document.getElementById('add-testimonial');

  // ✅ Cargar testimonios solo desde caché local
  function loadTestimonials() {
    console.log('📥 Cargando desde almacenamiento local...');
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    
    if (cached.length === 0) {
      // Datos de ejemplo iniciales
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
        },
        {
          id: 3,
          name: "Roberto Silva - Consultoría Empresarial",
          text: "Soporte excepcional en inglés y español. Han sido clave para nuestro expansion internacional.",
          timestamp: new Date('2024-09-28').toISOString(),
          source: 'ejemplo', 
          status: 'Aprobado'
        }
      ];
      displayTestimonials(samples);
      localStorage.setItem('testimonials_cache', JSON.stringify(samples));
      console.log('📝 3 testimonios de ejemplo cargados');
    } else {
      displayTestimonials(cached);
      console.log('📝', cached.length, 'testimonios cargados desde almacenamiento local');
    }
  }

  // ✅ Guardar testimonio solo en caché local
  async function saveTestimonial(name, text, email = '') {
    console.log('💾 Guardando en almacenamiento local...');
    
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
      message: '✅ ¡Gracias por tu testimonio! Se ha guardado correctamente y ya está visible en la lista.' 
    };
  }

  function displayTestimonials(testimonials) {
    if (!testimonialsList) {
      console.error('❌ Elemento testimonials-list no encontrado');
      return;
    }
    
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
        <div class="testimonial-time">${timeAgo} ${isExample ? '• Ejemplo' : '• Reciente'}</div>
      `;
      
      testimonialsList.appendChild(bubble);
    });
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

  // Manejar formulario
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = testimonialForm.querySelector('[name="name"]').value.trim();
      const text = testimonialForm.querySelector('[name="text"]').value.trim();
      const emailInput = testimonialForm.querySelector('[name="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      
      // Validaciones
      if (!name || !text) {
        showMessage('❌ Por favor completa nombre y testimonio', 'error');
        return;
      }
      
      if (text.length < 10) {
        showMessage('❌ El testimonio debe tener al menos 10 caracteres', 'error');
        return;
      }
      
      if (text.length > 500) {
        showMessage('❌ El testimonio es demasiado largo (máximo 500 caracteres)', 'error');
        return;
      }
      
      // Deshabilitar botón durante envío
      const submitBtn = testimonialForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      submitBtn.disabled = true;
      
      try {
        const result = await saveTestimonial(name, text, email);
        showMessage(result.message, 'success');
        
        // Limpiar formulario
        testimonialForm.reset();
        
        // Recargar testimonios para mostrar el nuevo
        loadTestimonials();
        
      } catch (error) {
        showMessage('❌ Error inesperado al guardar', 'error');
        console.error('Error en submit:', error);
      } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Función para mostrar mensajes bonitos
  function showMessage(message, type = 'info') {
    // Eliminar mensajes existentes
    const existingMessages = document.querySelectorAll('.custom-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `custom-message ${type}`;
    messageEl.innerHTML = `
      <div class="message-content">
        ${message}
      </div>
    `;
    
    // Estilos
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
      animation: slideInRight 0.3s ease;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
      messageEl.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }

  // Inicializar sistema
  if (testimonialsList) {
    loadTestimonials();
  }

  console.log('🎉 Sistema de testimonios completamente inicializado');
  console.log('💡 Modo: Almacenamiento local (estable y confiable)');
});

// Agregar estilos CSS para animaciones
if (!document.querySelector('#custom-message-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-message-styles';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}