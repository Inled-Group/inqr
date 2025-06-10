// Elements
      const typeTabs = document.querySelectorAll('.type-tab');
      const textForm = document.getElementById('textForm');
      const wifiForm = document.getElementById('wifiForm');
      const barcodeForm = document.getElementById('barcodeForm');
      const textInput = document.getElementById('textInput');
      const wifiSSID = document.getElementById('wifiSSID');
      const wifiPassword = document.getElementById('wifiPassword');
      const wifiSecurity = document.getElementById('wifiSecurity');
      const wifiHidden = document.getElementById('wifiHidden');
      const barcodeText = document.getElementById('barcodeText');
      const barcodeType = document.getElementById('barcodeType');
      const copyBtn = document.getElementById('copyBtn');
      const copyIcon = document.getElementById('copyIcon');
      const checkIcon = document.getElementById('checkIcon');
      const generateBtn = document.getElementById('generateBtn');
      const generateText = document.getElementById('generateText');
      const placeholder = document.getElementById('placeholder');
      const codeResult = document.getElementById('codeResult');
      const codeImage = document.getElementById('codeImage');
      const downloadBtn = document.getElementById('downloadBtn');
      const downloadText = document.getElementById('downloadText');
      const encodedText = document.getElementById('encodedText');
      const resultTitle = document.getElementById('resultTitle');
      const tipsList = document.getElementById('tipsList');
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');

      let currentCodeUrl = '';
      let currentType = 'text';

      // Tips for each type
      const tips = {
        text: [
          '• Puedes usar URLs, texto, números de teléfono',
          '• El código QR se puede descargar como imagen PNG',
          '• Puedes generarlo también pulsando Enter'
        ],
        wifi: [
          '• Los dispositivos podrán conectarse automáticamente',
          '• Asegúrate de que los datos sean correctos',
          '• Funciona con la mayoría de smartphones modernos',
          '• Puedes generarlo también pulsando Enter'
        ],
        barcode: [
          '• Útil para inventarios y productos',
          '• CODE 128 es el más versátil',
          '• Pronto añadiremos más tipos de códigos de barras.',
          '• Puedes generarlo también pulsando Enter'
        ]
      };

      // Show toast
      function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }

      // Update tips
      function updateTips(type) {
        tipsList.innerHTML = tips[type].map(tip => `<li>${tip}</li>`).join('');
      }

      // Handle type tab clicks
      typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs
          typeTabs.forEach(t => t.classList.remove('active'));
          // Add active class to clicked tab
          tab.classList.add('active');
          
          // Hide all forms
          textForm.classList.remove('active');
          wifiForm.classList.remove('active');
          barcodeForm.classList.remove('active');
          
          // Show selected form
          const type = tab.dataset.type;
          currentType = type;
          
          if (type === 'text') {
            textForm.classList.add('active');
            resultTitle.textContent = 'Tu Código QR';
          } else if (type === 'wifi') {
            copyIcon.classList.add('hidden');
            wifiForm.classList.add('active');
            resultTitle.textContent = 'Tu Código QR WiFi';
          } else if (type === 'barcode') {
            copyIcon.classList.add('hidden');
            barcodeForm.classList.add('active');
            resultTitle.textContent = 'Tu Código de Barras';
          }
          
          // Mostrar u ocultar textInput según el tipo
          if (type === 'text') {
            textInput.classList.remove('hidden');
          } else {
            textInput.classList.add('hidden');
          }

          updateTips(type);
          updateGenerateButton();
        });
      });

      // Copy to clipboard
      async function copyToClipboard() {
        try {
          await navigator.clipboard.writeText(textInput.value);
          copyIcon.classList.add('hidden');
          checkIcon.classList.remove('hidden');
          
          setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
          }, 2000);
          
          showToast('Texto copiado al portapapeles');
        } catch (error) {
          showToast('No se pudo copiar el texto', 'error');
        }
      }

      // Generate code based on type
      async function generateCode() {
        let data = '';
        let isBarcode = false;
        
        if (currentType === 'text') {
          data = textInput.value.trim();
          if (!data) {
            showToast('Por favor ingresa un texto para generar el código QR', 'error');
            return;
          }
        } else if (currentType === 'wifi') {
          const ssid = wifiSSID.value.trim();
          const password = wifiPassword.value.trim();
          const security = wifiSecurity.value;
          const hidden = wifiHidden.checked;
          
          if (!ssid) {
            showToast('Por favor ingresa el nombre de la red WiFi', 'error');
            return;
          }
          
          // WiFi QR format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
          data = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
        } else if (currentType === 'barcode') {
          const text = barcodeText.value.trim();
          const type = barcodeType.value;
          
          if (!text) {
            showToast('Por favor ingresa el texto para el código de barras', 'error');
            return;
          }
          
          data = text;
          isBarcode = true;
        }

        // Show loading state
        generateBtn.disabled = true;
        generateText.innerHTML = `
          <div class="spinner"></div>
          <span>Generando...</span>
        `;

        try {
          let codeUrl = '';
          
          if (isBarcode) {
            // Generate barcode using barcode API
            const encodedText = encodeURIComponent(data);
            const type = barcodeType.value;
            codeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodedText}&code=${type.toUpperCase()}&translate-esc=true&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`;
          } else {
            // Generate QR code
            const encodedText = encodeURIComponent(data);
            codeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}&format=png&ecc=M`;
          }
          
          // Test if the image loads
          const img = new Image();
          img.onload = function() {
            currentCodeUrl = codeUrl;
            codeImage.src = codeUrl;
            encodedText.textContent = data;
            
            placeholder.classList.add('hidden');
            codeResult.classList.remove('hidden');
            
            downloadText.textContent = isBarcode ? 'Descargar Código de Barras' : 'Descargar Código QR';
            
            showToast(isBarcode ? '¡Código de barras generado correctamente!' : '¡Código QR generado correctamente!');
          };
          
          img.onerror = function() {
            throw new Error('Failed to load code');
          };
          
          img.src = codeUrl;
          
        } catch (error) {
          showToast('Error al descargar. Haz clic derecho en el código y pulsa en Guardar imagen como...', 'error');
        } finally {
          // Reset button state
          generateBtn.disabled = false;
          generateText.innerHTML = `
            <span>Generar Código</span>
          `;
        }
      }

      // Download code
      async function downloadCode() {
        if (!currentCodeUrl) return;
        
        try {
          const response = await fetch(currentCodeUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          const fileType = currentType === 'barcode' ? 'barcode' : 'qr-code';
          link.download = `${fileType}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          window.URL.revokeObjectURL(url);
          showToast('El código se ha descargado correctamente');
        } catch (error) {
          showToast('Vaya, ha fallado la descarga. Haz clic derecho en el código y pulsa en Guardar imagen como...', 'error');
        }
      }

      // Update generate button state
      function updateGenerateButton() {
        let hasData = false;
        
        if (currentType === 'text') {
          hasData = textInput.value.trim().length > 0;
        } else if (currentType === 'wifi') {
          hasData = wifiSSID.value.trim().length > 0;
        } else if (currentType === 'barcode') {
          hasData = barcodeText.value.trim().length > 0;
        }
        
        generateBtn.disabled = !hasData;
      }

      // Event listeners
      copyBtn.addEventListener('click', copyToClipboard);
      generateBtn.addEventListener('click', generateCode);
      downloadBtn.addEventListener('click', downloadCode);

      // Input event listeners
      textInput.addEventListener('input', updateGenerateButton);
      wifiSSID.addEventListener('input', updateGenerateButton);
      barcodeText.addEventListener('input', updateGenerateButton);

      // Enter key to generate
      [textInput, wifiSSID, wifiPassword, barcodeText].forEach(input => {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            generateCode();
          }
        });
      });

      // Initial state
      updateTips('text');
      updateGenerateButton();