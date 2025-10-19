// main.js - SISTEMA COMPLETO DE CHAT, TESTIMONIOS Y FORMULARIOS
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Sistema cargado - Chat, testimonios y formularios');

  // ========== SISTEMA DE CHAT ==========
  function initializeChat() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatBubble || !chatWindow) {
      console.log('❌ Elementos del chat no encontrados');
      return;
    }

    // Abrir/cerrar chat
    chatBubble.addEventListener('click', () => {
      chatWindow.style.display = 'block';
      chatBubble.style.display = 'none';
      chatInput.focus();
    });

    chatClose.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      chatBubble.style.display = 'flex';
    });

    // Enviar mensaje
    function sendMessage() {
      const message = chatInput.value.trim();
      if (!message) return;

      // Mensaje del usuario
      const userMessage = document.createElement('div');
      userMessage.className = 'message user-message';
      userMessage.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">Justo ahora</div>
      `;
      chatMessages.appendChild(userMessage);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Respuesta automática
      setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        let response = 'Gracias por tu mensaje. Para una atención más personalizada, completa el formulario de contacto o escríbenos por WhatsApp.';

        const lower = message.toLowerCase();
        if (lower.includes('precio') || lower.includes('costo'))
          response = 'Los precios varían según el servicio. Escríbenos y te enviamos una cotización sin compromiso.';
        else if (lower.includes('servicio') || lower.includes('ofrecen'))
          response = 'Ofrecemos staff remoto bilingüe para soporte legal, seguros inmobiliarios y asistencia administrativa.';
        else if (lower.includes('hola') || lower.includes('buenas'))
          response = '¡Hola! ¿En qué puedo ayudarte con nuestros servicios de staff remoto bilingüe?';
        else if (lower.includes('tiempo') || lower.includes('disponible'))
          response = 'Nuestro staff trabaja en horario EST, ofreciendo soporte full-time o part-time.';

        botMessage.innerHTML = `
          <div class="message-content">${response}</div>
          <div class="message-time">Justo ahora</div>
        `;
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e => e.key === 'Enter' && sendMessage());

    console.log('✅ Chat inicializado');
  }

  // ========== SISTEMA DE TESTIMONIOS ==========
  function initializeTestimonials() {
    const testimonialsList = document.getElementById('testimonials-list');
    const testimonialForm = document.getElementById('add-testimonial');
    if (!testimonialsList) return;

    // 🔗 URL de tu Web App de Google Apps Script
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxudhXWSdvQDjaeM11VjfhhmuYtLi58DEKtULVV_OlpQW2LjurCXQfca8YtwSrF48oA6Q/exec';

    // Cargar testimonios
    async function loadTestimonials() {
      console.log('📥 Cargando testimonios...');
      try {
        const response = await fetch(WEB_APP_URL + '?t=' + new Date().getTime());
        const testimonialsFromSheets = await response.json();

        if (Array.isArray(testimonialsFromSheets) && testimonialsFromSheets.length > 0) {
          console.log('📊 Testimonios cargados:', testimonialsFromSheets.length);
          displayTestimonials(testimonialsFromSheets);
          localStorage.setItem('testimonials_cache', JSON.stringify(testimonialsFromSheets));
        } else {
          throw new Error('No hay testimonios');
        }
      } catch (error) {
        console.log('❌ Error cargando desde Sheets:', error);
        const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
        console.log('📝 Usando caché local:', cached.length);
        displayTestimonials(cached);
      }
    }

    // Guardar testimonio
    async function saveTestimonial(name, text, email = '') {
      console.log('💾 Guardando testimonio...');
      const testimonialData = { name, text, email, source: 'website' };

      try {
        const response = await fetch(WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData)
        });

        const result = await response.json();
        console.log('📥 Respuesta Sheets:', result);

        if (result.status === 'success' || result.status === 'ignored') {
          const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
          const newTestimonial = {
            id: Date.now(),
            name,
            text,
            email,
            timestamp: new Date().toISOString(),
            status: 'Aprobado',
            source: 'website'
          };
          cached.unshift(newTestimonial);
          localStorage.setItem('testimonials_cache', JSON.stringify(cached));

          return { success: true, message: '✅ ¡Gracias por tu testimonio!' };
        } else {
          throw new Error(result.message || 'Error desconocido');
        }
      } catch (error) {
        console.error('❌ Error guardando:', error);
        return { success: false, message: '❌ Error al guardar testimonio' };
      }
    }

    // Mostrar testimonios
function displayTestimonials(testimonials) {
  testimonialsList.innerHTML = '';

  // Si no hay testimonios válidos → mostrar mensaje vacío
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    testimonialsList.innerHTML = `
      <div class="testimonial-empty">
        <p>No hay testimonios disponibles por ahora.</p>
      </div>
    `;
    return;
  }

  // Filtrar solo testimonios válidos
  const approved = testimonials.filter(t => 
    (t.status === 'Aprobado' || !t.status) && t.name && t.text
  );

  if (approved.length === 0) {
    testimonialsList.innerHTML = `
      <div class="testimonial-empty">
        <p>No hay testimonios aprobados disponibles.</p>
      </div>
    `;
    return;
  }

  // Ordenar más recientes primero
  approved.sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1);

  approved.forEach((t, index) => {
    const bubble = document.createElement('div');
    bubble.className = `testimonial-bubble ${index % 2 === 0 ? 'client' : 'staff'}`;
    const dateStr = formatDate(t.timestamp);

    bubble.innerHTML = `
      <div class="testimonial-author">${t.name || 'Anónimo'}</div>
      <div class="testimonial-text">${t.text || ''}</div>
      <div class="testimonial-time">${dateStr}</div>
    `;
    testimonialsList.appendChild(bubble);
  });
}

// Función auxiliar para mostrar fecha válida
function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (isNaN(date)) return ''; // Evita “Invalid Date”
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}


    // Envío del formulario
    if (testimonialForm) {
      testimonialForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = testimonialForm.querySelector('[name="name"]').value.trim();
        const text = testimonialForm.querySelector('[name="text"]').value.trim();
        const email = testimonialForm.querySelector('[name="email"]').value.trim();

        if (!name || !text) return showMessage('❌ Completa nombre y testimonio', 'error');
        if (text.length < 10) return showMessage('❌ El testimonio es muy corto', 'error');
        if (text.length > 500) return showMessage('❌ Máximo 500 caracteres', 'error');

        const submitBtn = testimonialForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;

        const result = await saveTestimonial(name, text, email);
        showMessage(result.message, result.success ? 'success' : 'error');
        testimonialForm.reset();
        setTimeout(() => loadTestimonials(), 1000);

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }

    loadTestimonials();
    console.log('✅ Sistema de testimonios inicializado');
  }

  // ========== FORMULARIO DE CONTACTO ==========
  function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('#submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showMessage('✅ ¡Mensaje enviado correctamente!', 'success');
        contactForm.reset();
      }, 2000);
    });

    console.log('✅ Formulario de contacto inicializado');
  }

  // ========== NOTIFICACIONES ==========
  function showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };
    notification.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i><span>${message}</span>`;

    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    container.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ========== INICIALIZAR TODO ==========
  initializeChat();
  initializeTestimonials();
  initializeContactForm();
  console.log('🎉 Todos los sistemas inicializados correctamente');
});
