// main.js - SISTEMA COMPLETO DE CHAT Y FORMULARIOS
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema cargado - Chat, testimonios y formularios');

  // ========== SISTEMA DE CHAT CENTRALIZADO ==========
  function initializeChat() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatBubble || !chatWindow) {
      console.log('❌ Elementos del chat no encontrados en esta página');
      return;
    }

    // Abrir/cerrar chat
    chatBubble.addEventListener('click', function() {
      chatWindow.style.display = 'block';
      chatBubble.style.display = 'none';
      chatInput.focus();
    });

    chatClose.addEventListener('click', function() {
      chatWindow.style.display = 'none';
      chatBubble.style.display = 'flex';
    });

    // Enviar mensaje
    function sendMessage() {
      const message = chatInput.value.trim();
      if (message) {
        // Agregar mensaje del usuario
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `
          <div class="message-content">${message}</div>
          <div class="message-time">Justo ahora</div>
        `;
        chatMessages.appendChild(userMessage);

        // Limpiar input
        chatInput.value = '';

        // Scroll hacia abajo
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simular respuesta del bot después de un breve retraso
        setTimeout(function() {
          const botMessage = document.createElement('div');
          botMessage.className = 'message bot-message';
          
          // Respuestas inteligentes basadas en el mensaje
          let response = 'Gracias por tu mensaje. Para una atención más personalizada, te recomendamos completar el formulario de contacto o escribirnos directamente por WhatsApp.';
          
          if (message.toLowerCase().includes('precio') || message.toLowerCase().includes('costo')) {
            response = 'Los precios varían según el servicio y tiempo requerido. Te invitamos a contactarnos para una cotización personalizada sin compromiso.';
          } else if (message.toLowerCase().includes('servicio') || message.toLowerCase().includes('qué ofrecen')) {
            response = 'Ofrecemos staff remoto bilingüe para: soporte legal (personal injury), seguros de bienes raíces, y asistencia administrativa. ¿Te interesa algún área específica?';
          } else if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('buenas')) {
            response = '¡Hola! ¿En qué puedo ayudarte con nuestros servicios de staff remoto bilingüe?';
          } else if (message.toLowerCase().includes('tiempo') || message.toLowerCase().includes('disponible')) {
            response = 'Nuestro staff trabaja en horario EST para perfecta alineación con empresas estadounidenses. Ofrecemos soporte full-time y part-time.';
          }

          botMessage.innerHTML = `
            <div class="message-content">${response}</div>
            <div class="message-time">Justo ahora</div>
          `;
          chatMessages.appendChild(botMessage);

          // Scroll hacia abajo
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
      }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    console.log('✅ Chat inicializado correctamente');
  }

// ========== SISTEMA DE TESTIMONIOS ==========
function initializeTestimonials() {
  const testimonialsList = document.getElementById('testimonials-list');
  const testimonialForm = document.getElementById('add-testimonial');

  if (!testimonialsList) return;

  // URL de tu Google Apps Script Web App (REEMPLAZA ESTA URL)
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxudhXWSdvQDjaeM11VjfhhmuYtLi58DEKtULVV_OlpQW2LjurCXQfca8YtwSrF48oA6Q/exec';

  // ✅ Cargar testimonios desde Google Sheets Y caché local
  async function loadTestimonials() {
    console.log('📥 Cargando testimonios...');
    
    try {
      // Intentar cargar desde Google Sheets
      const response = await fetch(WEB_APP_URL);
      const testimonialsFromSheets = await response.json();
      
      if (Array.isArray(testimonialsFromSheets) && testimonialsFromSheets.length > 0) {
        console.log('📊 Testimonios cargados desde Google Sheets:', testimonialsFromSheets.length);
        displayTestimonials(testimonialsFromSheets);
        
        // Actualizar caché local
        localStorage.setItem('testimonials_cache', JSON.stringify(testimonialsFromSheets));
        return;
      }
    } catch (error) {
      console.log('❌ Error cargando desde Google Sheets, usando caché local:', error);
    }
    
    // Fallback a caché local
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    console.log('📝 Usando testimonios de caché local:', cached.length);
    displayTestimonials(cached);
  }

  // ✅ Guardar testimonio en Google Sheets Y caché local
  async function saveTestimonial(name, text, email = '') {
    console.log('💾 Guardando testimonio...');
    
    const testimonialData = {
      name: name,
      text: text,
      email: email,
      source: 'website'
    };
    
    try {
      // Enviar a Google Sheets
      console.log('📤 Enviando a Google Sheets...');
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData)
      });
      
      const result = await response.json();
      console.log('📥 Respuesta de Google Sheets:', result);
      
      if (result.status === 'success') {
        // También guardar en caché local
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
          message: '✅ ¡Gracias por tu testimonio! Se ha guardado correctamente.' 
        };
      } else {
        throw new Error(result.message || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('❌ Error guardando en Google Sheets:', error);
      
      // Fallback: guardar solo en caché local
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
        message: '✅ ¡Gracias por tu testimonio! Se ha guardado localmente (error temporal con el servidor).' 
      };
    }
  }

  function displayTestimonials(testimonials) {
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
    
    // Filtrar solo testimonios aprobados y ordenar por fecha (más recientes primero)
    const approvedTestimonials = testimonials.filter(t => 
      t.status === 'Aprobado' || !t.status // Incluir los que no tienen status definido
    );
    
    approvedTestimonials.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    approvedTestimonials.forEach((testimonial, index) => {
      const bubble = document.createElement('div');
      bubble.className = `testimonial-bubble ${index % 2 === 0 ? 'client' : 'staff'}`;
      
      const timeAgo = getTimeAgo(new Date(testimonial.timestamp));
      
      bubble.innerHTML = `
        <div class="testimonial-author">${testimonial.name || 'Anónimo'}</div>
        <div class="testimonial-text">${testimonial.text || ''}</div>
        <div class="testimonial-time">${timeAgo}</div>
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

  // Manejar formulario de testimonios
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
        setTimeout(() => {
          loadTestimonials();
        }, 1000);
        
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

  // Inicializar testimonios
  loadTestimonials();
  console.log('✅ Sistema de testimonios inicializado');
}
  // ========== SISTEMA DE FORMULARIO DE CONTACTO ==========
  function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('#submit-btn');
      const originalText = submitBtn.innerHTML;
      
      // Mostrar estado de carga
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
      
      // Obtener datos del formulario
      const formData = {
        from_name: contactForm.querySelector('[name="from_name"]').value,
        from_company: contactForm.querySelector('[name="from_company"]').value,
        from_email: contactForm.querySelector('[name="from_email"]').value,
        from_phone: contactForm.querySelector('[name="from_phone"]').value,
        message: contactForm.querySelector('[name="message"]').value,
        service: contactForm.querySelector('[name="service"]').value
      };
      
      // Simular envío (reemplazar con tu servicio real)
      setTimeout(() => {
        // Restaurar botón
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Mostrar mensaje de éxito
        showMessage('✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        
        // Limpiar formulario
        contactForm.reset();
      }, 2000);
    });
    
    console.log('✅ Formulario de contacto inicializado');
  }

  // ========== SISTEMA DE NOTIFICACIONES ==========
  function showMessage(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icono según tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    notification.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;
    
    // Agregar al contenedor de notificaciones
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  // ========== INICIALIZAR TODOS LOS SISTEMAS ==========
  initializeChat();
  initializeTestimonials();
  initializeContactForm();
  
  console.log('🎉 Todos los sistemas inicializados correctamente');
});