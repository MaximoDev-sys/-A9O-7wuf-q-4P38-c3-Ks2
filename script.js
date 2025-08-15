document.addEventListener('DOMContentLoaded', () => {

    const preloaderContainer = document.getElementById('preloader-container');
    const mainContent = document.getElementById('main-content');
    const continueButton = document.getElementById('continue-button');

    // Elementos del verificador
    const verifierItems = [
        { id: 'item-ip', key: 'ip' },
        { id: 'item-browser', key: 'browser' },
        { id: 'item-os', key: 'os' },
        { id: 'item-location', key: 'location' },
        { id: 'item-isp', key: 'isp' }
    ];

    // Cargar assets y API de IP
    const assetsToLoad = [
        './assets/1/1.mp4',
        './assets/2/1.mp3',
        './assets/3/3/3.gif',
        './assets/3/2/12.png',
        // Puedes agregar más assets aquí
    ];

    let loadedAssets = 0;
    let verificationDone = false;
    let assetsLoaded = false;

    // Web Audio API variables
    let audioContext;
    let analyser;
    let dataArray;
    let bufferLength;
    const beatThreshold = 200; // Umbral para detectar un beat (ajustar según la música)
    let isBeat = false;

    // Función para manejar la carga de assets
    function loadAssets() {
        return new Promise((resolve) => {
            let promises = assetsToLoad.map(url => {
                return new Promise(assetResolve => {
                    const assetType = url.split('.').pop();
                    if (assetType === 'mp4' || assetType === 'webm') {
                        const video = document.createElement('video');
                        video.src = url;
                        video.onloadeddata = () => {
                            loadedAssets++;
                            if (loadedAssets === assetsToLoad.length) {
                                assetsLoaded = true;
                                resolve();
                            }
                            assetResolve();
                        };
                        video.onerror = () => {
                            console.error(`Error al cargar el video: ${url}`);
                            assetResolve(); // Continúa incluso si falla
                        };
                    } else if (assetType === 'mp3' || assetType === 'wav') {
                        const audio = new Audio();
                        audio.src = url;
                        audio.oncanplaythrough = () => {
                            loadedAssets++;
                            if (loadedAssets === assetsToLoad.length) {
                                assetsLoaded = true;
                                resolve();
                            }
                            assetResolve();
                        };
                        audio.onerror = () => {
                            console.error(`Error al cargar el audio: ${url}`);
                            assetResolve(); // Continúa incluso si falla
                        };
                    } else { // Imágenes
                        const img = new Image();
                        img.onload = () => {
                            loadedAssets++;
                            if (loadedAssets === assetsToLoad.length) {
                                assetsLoaded = true;
                                resolve();
                            }
                            assetResolve();
                        };
                        img.onerror = () => {
                            console.error(`Error al cargar la imagen: ${url}`);
                            assetResolve(); // Continúa incluso si falla
                        };
                        img.src = url;
                    }
                });
            });
            Promise.all(promises).then(() => {
                assetsLoaded = true;
                checkReady();
            });
        });
    }

    // IP Info API
    function getIPInfo() {
        return new Promise((resolve, reject) => {
            fetch('https://ipinfo.io?token=1c13bfdc2e7c4f')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('ip-address').textContent = data.ip || 'No disponible';
                    document.getElementById('location-info').textContent = `${data.city || 'Desconocida'}, ${data.region || ''}, ${data.country || ''}`;
                    document.getElementById('isp-info').textContent = data.org || 'No disponible';
                    resolve();
                })
                .catch(error => {
                    console.error('Error fetching IP info:', error);
                    document.getElementById('ip-address').textContent = 'Error';
                    document.getElementById('location-info').textContent = 'Error';
                    document.getElementById('isp-info').textContent = 'Error';
                    reject(error);
                });
        });
    }

    // Información de usuario (navegador y SO)
    function getUserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'Desconocido';
        let os = 'Desconocido';

        // Detectar navegador
        if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
        } else if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
        } else if (userAgent.indexOf('Edg') > -1) {
            browser = 'Edge';
        }

        // Detectar sistema operativo
        if (userAgent.indexOf('Win') > -1) {
            os = 'Windows';
        } else if (userAgent.indexOf('Mac') > -1) {
            os = 'macOS';
        } else if (userAgent.indexOf('Linux') > -1) {
            os = 'Linux';
        } else if (userAgent.indexOf('Android') > -1) {
            os = 'Android';
        } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
            os = 'iOS';
        }
        
        document.getElementById('browser-info').textContent = browser;
        document.getElementById('os-info').textContent = os;
    }

    // Simular la verificación y mostrar items progresivamente
    async function startVerification() {
        getUserInfo();
        await getIPInfo();

        for (let i = 0; i < verifierItems.length; i++) {
            const item = document.getElementById(verifierItems[i].id);
            item.classList.remove('hidden');
            await new Promise(resolve => setTimeout(resolve, 500)); // Espera 500ms antes de mostrar el siguiente
            const span = item.querySelector('.loading');
            if (span) {
                span.classList.remove('loading');
                span.textContent = span.textContent.replace('Cargando...', 'Hecho'); // Simula la finalización
            }
        }

        verificationDone = true;
        checkReady();
    }

    // Comprobar si todo está listo para mostrar el botón
    function checkReady() {
        if (verificationDone && assetsLoaded) {
            continueButton.classList.remove('hidden-button');
            continueButton.classList.add('continue-button');
            continueButton.disabled = false;
        }
    }

    // Lógica para el botón "Continuar"
    continueButton.addEventListener('click', () => {
        preloaderContainer.classList.add('fade-out');
        setTimeout(() => {
            mainContent.classList.remove('hidden');
            mainContent.classList.add('show');
            playMedia();
            document.body.style.overflow = 'auto'; // Habilita el scroll si es necesario
            startParticleAnimation();
        }, 1000); // Espera 1s para la transición de fade-out
    });
    
    // Reproducir video y música y configurar el analizador de audio
    function playMedia() {
        const video = document.getElementById('background-video');
        const audio = document.getElementById('background-music');
        
        video.src = './assets/1/1.mp4';
        audio.src = './assets/2/1.mp3';

        video.play().catch(error => {
            console.error('Error al reproducir el video:', error);
        });

        // Configurar el Web Audio API
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        audio.play().catch(error => {
            console.error('Error al reproducir el audio:', error);
        });
    }


    // API de Discord
    const profiles = [
        { id: "837149144476155905", imgId: "img1", usernameId: "username1", decorId: "deco_us1" },
        // Puedes agregar más perfiles aquí si lo deseas
    ];

    profiles.forEach(profile => {
        const apiUrl = `https://discord-lookup-api-alpha.vercel.app/v1/user/${profile.id}`;
        const profilePicture = document.getElementById(profile.imgId);
        const usernameText = document.getElementById(profile.usernameId);
        const avatarFrame = document.getElementById(profile.decorId);

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const avatarUrl = data.avatar ? `${data.avatar.link}?size=1024` : './assets/pfp/default.jpg';
                if (profilePicture) profilePicture.src = avatarUrl;
                
                if (usernameText) {
                    const tag = data.discriminator && data.discriminator !== "0" ? `#${data.discriminator}` : "";
                    usernameText.textContent = `${data.username}${tag}`;
                }

                if (data.avatar_decoration && data.avatar_decoration.asset) {
                    const asset = data.avatar_decoration.asset;
                    const frameUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=1024&passthrough=true`;
                    if (avatarFrame) {
                        avatarFrame.src = frameUrl;
                        avatarFrame.style.display = 'block';
                    }
                } else {
                    if (avatarFrame) avatarFrame.style.display = 'none'; // Oculta si no hay marco
                }
            })
            .catch(error => {
                console.error(`Error fetching user data for ID ${profile.id}:`, error);
                if (profilePicture) profilePicture.src = './assets/pfp/default.jpg';
                if (usernameText) usernameText.textContent = 'Usuario no encontrado';
            });
    });


    // Animación de Partículas
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let hue = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    canvas.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    
    class Particle {
        constructor(x, y, initialSize = null) {
            this.x = x;
            this.y = y;
            this.size = initialSize || Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
            this.color = `hsl(${hue}, 100%, 50%)`;
        }

        update() {
            // Dirección de la partícula hacia el ratón
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const angle = Math.atan2(dy, dx);
                this.speedX = Math.cos(angle) * 2;
                this.speedY = Math.sin(angle) * 2;
            } else {
                this.speedX += (Math.random() - 0.5) * 0.1;
                this.speedY += (Math.random() - 0.5) * 0.1;
                // Limitar la velocidad para que no se dispare
                if (this.speedX > 1.5) this.speedX = 1.5;
                if (this.speedX < -1.5) this.speedX = -1.5;
                if (this.speedY > 1.5) this.speedY = 1.5;
                if (this.speedY < -1.5) this.speedY = -1.5;
            }

            this.x += this.speedX;
            this.y += this.speedY;

            // Reducir el tamaño con el tiempo
            if (this.size > 0.2) this.size -= 0.1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles(count, baseSize) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, baseSize));
        }
    }

    function handleParticles() {
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Eliminar partículas cuando se hacen muy pequeñas
            if (particles[i].size <= 0.2) {
                particles.splice(i, 1);
                i--;
            }
        }
    }
    
    function startParticleAnimation() {
        animate();
    }

    function animate() {
        analyser.getByteFrequencyData(dataArray);

        // Detectar el beat analizando las frecuencias bajas
        let sum = 0;
        for (let i = 0; i < 5; i++) { // Analizar los primeros 5-10 bins para los bajos
            sum += dataArray[i];
        }

        const average = sum / 5;
        if (average > beatThreshold) {
            isBeat = true;
            createParticles(Math.floor(average / 20), average / 25); // Crea más partículas en un beat
            // Agrega un efecto de pulso al perfil
            gsap.to('.profile-container', { duration: 0.1, scale: 1.05, ease: 'power2.out', yoyo: true, repeat: 1 });
        } else {
            isBeat = false;
        }

        ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        hue = (hue + 0.5) % 360;
        requestAnimationFrame(animate);
    }
    
    // Iniciar la carga de assets y la verificación
    loadAssets();
    startVerification();
});