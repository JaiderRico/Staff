// main.js - VERSIÓN OPTIMIZADA PARA NETLIFY
document.addEventListener('DOMContentLoaded', function() {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxudhXW5dv0DjaeM11VjfhhmuYtLi58DEKtULVV_O1p0WZLjurCXOfca8YtwSrF48oA60/exec';

  console.log('🚀 Sistema cargado en Netlify');
  console.log('📍 Origen:', window.location.origin);

  const testimonialsList = document.getElementById('testimonials-list');
  const testimonialForm = document.getElementById('add-testimonial');

  // Cargar testimonios desde Google Sheets
  async function loadTestimonials() {
    console.log('📥 Cargando desde Google Sheets...');
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      if (response.ok) {
        const testimonials = await response.json();
        console.log('✅ Google Sheets - testimonios recibidos:', testimonials);
        
        if (testimonials && testimonials.length > 0) {
          displayTestimonials(testimonials);
          localStorage.setItem('testimonials_cache', JSON.stringify(testimonials));
          return;
        } else {
          console.log('📭 Google Sheets vacío');
        }
      } else {
        console.error('❌ HTTP Error:', response.status);
      }
    } catch (error) {
      console.error('💥 Error cargando Google Sheets:', error);
    }
    
    // Fallback a caché local
    console.log('🔄 Usando caché local...');
    loadFromCache();
  }

  // Guardar en Google Sheets
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

      console.log('📤 Payload:', payload);
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎉 Google Sheets - guardado exitoso:', result);
        return { 
          success: true, 
          source: 'google_sheets', 
          message: '✅ Testimonio guardado correctamente' 
        };
      } else {
        console.error('❌ Google Sheets - HTTP error:', response.status);
      }
    } catch (error) {
      console.error('💥 Google Sheets - Error:', error);
    }
    
    // Fallback a localStorage
    console.log('🔄 Guardando en caché local...');
    return saveToCache(name, text, email);
  }

  function saveToCache(name, text, email) {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    const newTestimonial = {
      name: name,
      text: text,
      email: email,
      timestamp: new Date().toISOString(),
      status: 'Aprobado',
      source: 'cached'
    };
    
    cached.unshift(newTestimonial);
    localStorage.setItem('testimonials_cache', JSON.stringify(cached));
    
    return { 
      success: true, 
      source: 'cache', 
      message: '📝 Testimonio guardado localmente' 
    };
  }

  function loadFromCache() {
    const cached = JSON.parse(localStorage.getItem('testimonials_cache') || '[]');
    
    if (cached.length === 0) {
      // Datos de ejemplo
      const samples = [
        {
          name: "Cliente Satisfecho - Empresa",
          text: "Servicio excelente y profesional. Muy recomendado para soporte bilingüe.",
          timestamp: new Date('2024-01-15').toISOString(),
          source: 'ejemplo'
        },
        {
          name: "Ana Martínez - Legal Solutions", 
          text: "Comunicación fluida y resultados excelentes. Nuestros clientes están muy contentos.",
          timestamp: new Date('2024-01-10').toISOString(),
          source: 'ejemplo'
        }
      ];
      displayTestimonials(samples);
    } else {
      displayTestimonials(cached);
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
    
    testimonials.forEach((testimonial, index) => {
      const bubble = document.createElement('div');
      bubble.className = `testimonial-bubble ${index % 2 === 0 ? 'client' : 'staff'}`;
      
      const timeAgo = getTimeAgo(new Date(testimonial.timestamp || testimonial.date));
      
      bubble.innerHTML = `
        <div class="testimonial-author">${testimonial.name || 'Anónimo'}</div>
        <div class="testimonial-text">${testimonial.text || ''}</div>
        <div class="testimonial-time">${timeAgo}</div>
      `;
      
      testimonialsList.appendChild(bubble);
    });
    
    console.log('✅', testimonials.length, 'testimonios mostrados');
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
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
});