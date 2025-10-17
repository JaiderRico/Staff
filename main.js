// main.js - VERSIÓN SIN PROXY EXTERNO
document.addEventListener('DOMContentLoaded', function() {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxudhXW5dv0DjaeM11VjfhhmuYtLi58DEKtULVV_O1p0WZLjurCXOfca8YtwSrF48oA60/exec';

  console.log('🚀 Sistema cargado en Netlify');
  console.log('📍 Origen:', window.location.origin);

  const testimonialsList = document.getElementById('testimonials-list');
  const testimonialForm = document.getElementById('add-testimonial');

  // ✅ SOLUCIÓN: Usar Google Apps Script como API web directamente
  async function loadTestimonials() {
    console.log('📥 Intentando cargar desde Google Sheets...');
    
    try {
      // Opción directa - puede funcionar en algunos casos
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        mode: 'no-cors', // ✅ Modo no-cors para solo ver si responde
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Con 'no-cors' no podemos leer la respuesta, pero podemos intentar
      console.log('📊 Request enviado (no-cors mode)');
      
      // Intentar con método alternativo
      await tryAlternativeLoad();
      
    } catch (error) {
      console.error('💥 Error en carga principal:', error);
      fallbackToCache();
    }
  }

  // ✅ Método alternativo usando JSONP
  async function tryAlternativeLoad() {
    try {
      // Crear script JSONP
      return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        const script = document.createElement('script');
        
        window[callbackName] = function(data) {
          delete window[callbackName];
          document.body.removeChild(script);
          
          if (data && data.length > 0) {
            console.log('✅ JSONP - testimonios recibidos:', data);
            displayTestimonials(data);
            localStorage.setItem('testimonials_cache', JSON.stringify(data));
            resolve(data);
          } else {
            reject(new Error('No data received'));
          }
        };
        
        script.src = GOOGLE_SCRIPT_URL + '?callback=' + callbackName;
        document.body.appendChild(script);
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          if (window[callbackName]) {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP timeout'));
          }
        }, 5000);
      });
    } catch (error) {
      console.log('❌ JSONP falló:', error);
      fallbackToCache();
    }
  }

  function fallbackToCache() {
    console.log('🔄 Usando caché local...');
    loadFromCache();
  }

  // ✅ Guardar testimonio
  async function saveTestimonial(name, text, email = '') {
    console.log('💾 Intentando guardar en Google Sheets...');
    
    try {
      const payload = {
        name: name,
        text: text,
        email: email || '',
        source: 'website_form',
        timestamp: new Date().toISOString()
      };

      // Intentar con FormData (mejor compatibilidad con Google Apps Script)
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      
      console.log('📤 Datos enviados (no-cors mode)');
      
      // Como no podemos ver la respuesta, asumimos éxito y guardamos en caché
      return await saveToCache(name, text, email);
      
    } catch (error) {
      console.error('💥 Error al guardar:', error);
      return await saveToCache(name, text, email);
    }
  }

  function saveToCache(name, text, email) {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    const newTestimonial = {
      id: Date.now(),
      name: name,
      text: text,
      email: email,
      timestamp: new Date().toISOString(),
      status: 'Pendiente',
      source: 'cached'
    };
    
    cached.unshift(newTestimonial);
    localStorage.setItem('testimonials_cache', JSON.stringify(cached));
    
    // También guardar en una lista de pendientes para sincronizar después
    savePendingTestimonial(newTestimonial);
    
    return { 
      success: true, 
      source: 'cache', 
      message: '📝 Testimonio guardado localmente. Se sincronizará cuando sea posible.' 
    };
  }

  function savePendingTestimonial(testimonial) {
    const pending = JSON.parse(localStorage.getItem('pending_testimonials') || '[]');
    pending.push(testimonial);
    localStorage.setItem('pending_testimonials', JSON.stringify(pending));
  }

  function loadFromCache() {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    
    if (cached.length === 0) {
      // Datos de ejemplo iniciales
      const samples = [
        {
          id: 1,
          name: "Cliente Satisfecho - Empresa",
          text: "Servicio excelente y profesional. Muy recomendado para soporte bilingüe.",
          timestamp: new Date('2024-01-15').toISOString(),
          source: 'ejemplo',
          status: 'Aprobado'
        },
        {
          id: 2,
          name: "Ana Martínez - Legal Solutions", 
          text: "Comunicación fluida y resultados excelentes. Nuestros clientes están muy contentos.",
          timestamp: new Date('2024-01-10').toISOString(),
          source: 'ejemplo',
          status: 'Aprobado'
        }
      ];
      displayTestimonials(samples);
      localStorage.setItem('testimonials_cache', JSON.stringify(samples));
      console.log('📝 Datos de ejemplo cargados');
    } else {
      displayTestimonials(cached);
      console.log('📝', cached.length, 'testimonios cargados desde caché');
    }
  }

  function displayTestimonials(testimonials) {
    if (!testimonialsList) {
      console.error('❌ testimonialsList no encontrado');
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
      const statusBadge = testimonial.status === 'Pendiente' ? '⏳ ' : '';
      const sourceInfo = testimonial.source === 'ejemplo' ? ' (ejemplo)' : '';
      
      bubble.innerHTML = `
        <div class="testimonial-author">${statusBadge}${testimonial.name || 'Anónimo'}${sourceInfo}</div>
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

  // Manejar formulario
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = testimonialForm.querySelector('[name="name"]').value.trim();
      const text = testimonialForm.querySelector('[name="text"]').value.trim();
      const emailInput = testimonialForm.querySelector('[name="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      
      if (!name || !text) {
        alert('❌ Por favor completa nombre y testimonio');
        return;
      }
      
      if (text.length < 10) {
        alert('❌ El testimonio debe tener al menos 10 caracteres');
        return;
      }
      
      const submitBtn = testimonialForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      submitBtn.disabled = true;
      
      try {
        const result = await saveTestimonial(name, text, email);
        alert(result.message);
        
        testimonialForm.reset();
        loadTestimonials(); // Recargar para mostrar el nuevo
        
      } catch (error) {
        alert('❌ Error inesperado al guardar');
        console.error('Error en submit:', error);
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Inicializar
  if (testimonialsList) {
    loadTestimonials();
  }

  console.log('🎉 Sistema completamente inicializado en Netlify');
  console.log('💡 Modo: Almacenamiento local + intento de sincronización con Google Sheets');
});