
        // --- VARIABLES GLOBALES DEL SISTEMA ---
        window.transactions = [];
        window.user = null;
        window.isLocalMode = true; 
        window.chartInstance = null;
        window.activeFormType = 'gasto'; // 'gasto' o 'ingreso'

        // Estructura de Catálogos (Fase 3 - 5: Totalmente Personalizable y Dinámica por Cuenta)
        window.catalogs = {
            categorias: ["Comidas", "Bebidas", "Mercado", "Aseo", "Tecnología", "Maquillaje", "Ropa", "Medicamentos", "Papelería", "Hogar", "Mascotas", "Transporte", "Educación", "Entretenimiento", "Servicios", "Otros"],
            categorias_ingreso: ["Sueldo", "Honorarios", "Ventas", "Otros"], // FASE 4: Categorías de ingreso dinámicas y editables por usuario
            unidades: ["Paquete", "Unidad", "Caja", "Kg", "Litros", "ml"],
            metodos: ["Nequi", "Efectivo", "Daviplata", "Débito", "Crédito", "Transferencia", "Otro"],
            establecimientos: ["Tienda de la esquina", "Éxito", "SENA", "Jumbo", "D1", "Ara", "ANKAMA", "Otros"]
        };
        window.activeCatalogTab = 'categorias';

        // --- SISTEMA DE CONTROL DE CREADOR DE CUENTAS / ACCESO ---
        window.currentAuthTab = 'login';
        window.usersDB = {}; // Base de usuarios local simulada en localStorage

        // --- VARIABLES DEL CANVAS FÍSICO ---
        window.canvas = null;
        window.ctx = null;
        window.nodes = [];
        window.dragNode = null;
        window.mouse = { x: 0, y: 0 };
        window.offset = { x: 0, y: 0 };
        window.animationFrameId = null;

        // -------------------------------------------------------------
        // NOTIFICACIONES TOAST FLOTANTES
        // -------------------------------------------------------------
        function showAlert(title, message, isError = false) {
            const toast = document.getElementById('custom-toast');
            if(!toast) return;
            const toastTitle = document.getElementById('toast-title');
            const toastMessage = document.getElementById('toast-message');
            const toastIcon = document.getElementById('toast-icon');
            
            toastTitle.innerText = title;
            toastMessage.innerText = message;
            
            if(isError) {
                toast.classList.remove('border-emerald-500/30', 'bg-emerald-950/90');
                toast.classList.add('border-rose-500/30', 'bg-rose-950/90');
                toastIcon.className = "fa-solid fa-circle-xmark text-rose-400 text-lg";
            } else {
                toast.classList.remove('border-rose-500/30', 'bg-rose-950/90');
                toast.classList.add('border-emerald-500/30', 'bg-emerald-950/90');
                toastIcon.className = "fa-solid fa-circle-check text-emerald-400 text-lg";
            }
            
            toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            toast.classList.add('opacity-100', 'translate-y-0');
            
            setTimeout(() => {
                toast.classList.remove('opacity-100', 'translate-y-0');
                toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            }, 4000);
        }

        function toggleSettingsModal() {
            editMonthlyBudget();
        }

        // -------------------------------------------------------------
        // CONTROL DE ACCESO (AUTENTICACIÓN Y ROLES)
        // -------------------------------------------------------------
        function switchAuthTab(tab) {
            window.currentAuthTab = tab;
            const tabLogin = document.getElementById('tab-login');
            const tabRegister = document.getElementById('tab-register');
            const btnSubmit = document.getElementById('auth-btn-submit');
            const alertBox = document.getElementById('auth-alert');
            
            alertBox.classList.add('hidden');

            if (tab === 'login') {
                tabLogin.className = "flex-1 pb-3 text-center text-emerald-400 font-bold border-b-2 border-emerald-400 transition";
                tabRegister.className = "flex-1 pb-3 text-center text-slate-400 hover:text-slate-200 font-medium transition";
                btnSubmit.innerText = "Entrar al Sistema";
            } else {
                tabRegister.className = "flex-1 pb-3 text-center text-emerald-400 font-bold border-b-2 border-emerald-400 transition";
                tabLogin.className = "flex-1 pb-3 text-center text-slate-400 hover:text-slate-200 font-medium transition";
                btnSubmit.innerText = "Crear Cuenta de Usuario";
            }
        }

        function handleAuthSubmit(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('auth-username').value.trim().toLowerCase();
            const passwordInput = document.getElementById('auth-password').value;
            const alertBox = document.getElementById('auth-alert');

            if (!usernameInput || !passwordInput) return;

            // Cargar usuarios desde localStorage
            const storedUsers = localStorage.getItem('smart_inv_users');
            if (storedUsers) {
                window.usersDB = JSON.parse(storedUsers);
            }

            // Asegurar cuenta administradora por defecto
            if (!window.usersDB['admin']) {
                window.usersDB['admin'] = { username: 'admin', password: '123', role: 'admin' };
            }

            if (window.currentAuthTab === 'login') {
                // Validación de Login
                const userObj = window.usersDB[usernameInput];
                if (userObj && userObj.password === passwordInput) {
                    loginUser(userObj);
                } else {
                    alertBox.innerText = "Usuario o contraseña incorrectos.";
                    alertBox.classList.remove('hidden');
                }
            } else {
                // Proceso de Registro
                if (window.usersDB[usernameInput]) {
                    alertBox.innerText = "El nombre de usuario ya existe.";
                    alertBox.classList.remove('hidden');
                } else {
                    const newUserObj = {
                        username: usernameInput,
                        password: passwordInput,
                        role: 'estandar'
                    };
                    window.usersDB[usernameInput] = newUserObj;
                    localStorage.setItem('smart_inv_users', JSON.stringify(window.usersDB));
                    loginUser(newUserObj);
                    showAlert("Cuenta Creada", `¡Bienvenido ${usernameInput}! Tu cuenta está lista.`);
                }
            }
        }

        function loginUser(userObj) {
            window.user = userObj;
            localStorage.setItem('smart_inv_logged_session', JSON.stringify(userObj));

            // Ajustar visualización del dashboard
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('dashboard-layout').classList.remove('hidden');

            // Formatear nombre para mostrar
            let displayName = userObj.username;
            if (userObj.username.toLowerCase() === 'carol hernandez' || userObj.username.toLowerCase() === 'carolhernandez') {
                displayName = 'Carol Hernandez';
            } else if (userObj.username.toLowerCase() === 'stiven hernandez' || userObj.username.toLowerCase() === 'stivenhernandez') {
                displayName = 'Stiven Hernandez';
            } else {
                displayName = userObj.username.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            }

            // Configurar perfil dinámico (Calcula las iniciales y el popup)
            const profileDiv = document.getElementById('header-user-profile');
            const popoverDiv = document.getElementById('header-user-popover');
            if (profileDiv && popoverDiv) {
                const parts = displayName.trim().split(/\s+/);
                let initials = '';
                if (parts.length >= 2) {
                    initials = (parts[0][0] + parts[1][0]).toUpperCase();
                } else if (parts[0]) {
                    initials = parts[0].substring(0, 2).toUpperCase();
                } else {
                    initials = 'US';
                }
                profileDiv.innerText = initials;
                popoverDiv.innerText = displayName;
            }

            // Inicializar datos y vistas
            loadDatabaseData();
            initBrainSimulation();
        }

        function logout() {
            localStorage.removeItem('smart_inv_logged_session');
            window.user = null;
            document.getElementById('dashboard-layout').classList.add('hidden');
            document.getElementById('auth-screen').classList.remove('hidden');
            document.getElementById('auth-form').reset();
        }

        // --- SISTEMA DE AUDITORÍA DE USUARIOS PARA ADMIN (Fase 3 - Modificado: Auditando Privacidad) ---
        function renderUserHistory() {
            const container = document.getElementById('admin-user-history-section');
            if (!container) return;

            if (window.user && window.user.role === 'admin') {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
                return;
            }

            const tbody = document.getElementById('users-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            const users = JSON.parse(localStorage.getItem('smart_inv_users') || '{}');
            
            // Asegurar que admin esté allí
            if (!users['admin']) {
                users['admin'] = { username: 'admin', role: 'admin' };
            }

            const totalUsersCount = Object.keys(users).length;
            const subtitle = container.querySelector('p');
            if (subtitle) {
                subtitle.innerHTML = `Como administrador y dueño del sistema, puedes auditar todas las cuentas creadas. Actualmente hay <strong class="text-emerald-400 font-bold">${totalUsersCount} usuarios</strong> registrados. <span class="text-rose-400 font-semibold italic"><i class="fa-solid fa-shield-halved mr-1"></i> Por privacidad de datos, la información transaccional de otros usuarios no es accesible.</span>`;
            }

            Object.keys(users).forEach(username => {
                const u = users[username];
                const isCurrentAdmin = username === 'admin';
                
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-800/20 transition duration-150";
                
                const roleBadge = u.role === 'admin' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-slate-500/10 text-slate-300 border-slate-800';

                tr.innerHTML = `
                    <td class="p-4 font-bold text-white capitalize">${u.username}</td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${roleBadge}">
                            ${String(u.role || 'estandar').toUpperCase()}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        ${isCurrentAdmin ? '<span class="text-slate-500 italic">Propietario / Dueño</span>' : `
                            <button onclick="deleteUserAccount('${username}')" class="text-[#ff0000] hover:text-[#cc0000] hover:bg-[#ff0000]/10 px-3 py-1 rounded-xl transition duration-150 font-bold border-2 border-[#ff0000]">
                                <i class="fa-regular fa-trash-can mr-1"></i> Eliminar Usuario
                            </button>
                        `}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function deleteUserAccount(username) {
            if (username === 'admin') return;
            
            const users = JSON.parse(localStorage.getItem('smart_inv_users') || '{}');
            if (users[username]) {
                delete users[username];
                localStorage.setItem('smart_inv_users', JSON.stringify(users));
                
                // Limpiar transacciones asociadas a la cuenta eliminada
                window.transactions = window.transactions.filter(t => t.userId !== username);
                localStorage.setItem('smart_inv_transactions_v3', JSON.stringify(window.transactions));
                
                applyFilters();
                renderUserHistory();
                showAlert("Usuario Eliminado", `La cuenta de "${username}" y sus registros han sido borrados de forma permanente.`);
            }
        }

        // -------------------------------------------------------------
        // ADMINISTRACIÓN DE DATOS Y AUTO-SANACIÓN (FASE 4 - 5)
        // -------------------------------------------------------------
        function loadDatabaseData() {
            const defaultCatalogs = {
                categorias: ["Comidas", "Bebidas", "Mercado", "Aseo", "Tecnología", "Maquillaje", "Ropa", "Medicamentos", "Papelería", "Hogar", "Mascotas", "Transporte", "Educación", "Entretenimiento", "Servicios", "Otros"],
                categorias_ingreso: ["Sueldo", "Honorarios", "Ventas", "Otros"], // FASE 4: Categorías de ingreso dinámicas y editables por usuario
                unidades: ["Paquete", "Unidad", "Caja", "Kg", "Litros", "ml"],
                metodos: ["Nequi", "Efectivo", "Daviplata", "Débito", "Crédito", "Transferencia", "Otro"],
                establecimientos: ["Tienda de la esquina", "Éxito", "SENA", "Jumbo", "D1", "Ara", "ANKAMA", "Otros"]
            };

            // FASE 4: Cargar Catálogos Personalizados aislados en su totalidad por cada usuario individual
            const catalogKey = 'smart_inv_catalogs_' + window.user.username;
            const savedCatalogs = localStorage.getItem(catalogKey);
            if (savedCatalogs) {
                try {
                    const parsed = JSON.parse(savedCatalogs);
                    window.catalogs = {
                        categorias: parsed.categorias || defaultCatalogs.categorias,
                        categorias_ingreso: parsed.categorias_ingreso || defaultCatalogs.categorias_ingreso,
                        unidades: parsed.unidades || defaultCatalogs.unidades,
                        metodos: parsed.metodos || defaultCatalogs.metodos,
                        establecimientos: parsed.establecimientos || defaultCatalogs.establecimientos
                    };
                } catch (e) {
                    window.catalogs = defaultCatalogs;
                }
            } else {
                window.catalogs = defaultCatalogs;
                localStorage.setItem(catalogKey, JSON.stringify(window.catalogs));
            }

            // AUTO-SANACIÓN DE CATEGORÍAS ANÓMALAS (Fase 4 Parche - Evita heredar SENA/ANKAMA para usuarios nuevos)
            if (window.user.username !== 'admin') {
                const containsAdminOnlyCategories = window.catalogs.categorias_ingreso.includes("SENA") || window.catalogs.categorias_ingreso.includes("ANKAMA");
                if (containsAdminOnlyCategories) {
                    window.catalogs.categorias_ingreso = ["Sueldo", "Honorarios", "Ventas", "Otros"];
                    localStorage.setItem(catalogKey, JSON.stringify(window.catalogs));
                }
            }

            // FASE 4: Cargar presupuesto mensual aislado por usuario individual de forma nativa
            const budgetKey = 'smart_inv_budget_value_' + window.user.username;
            const savedBudget = localStorage.getItem(budgetKey);
            if (!savedBudget) {
                localStorage.setItem(budgetKey, "500000");
            }
            document.getElementById('kpi-budget-amount').innerText = `$${parseFloat(localStorage.getItem(budgetKey)).toLocaleString()}`;

            // Actualizar opciones de los formularios al instante
            populateFormOptions();

            // Cargar Transacciones del Storage unificado y autosanar IDs secuenciales por usuario
            const savedTxs = localStorage.getItem('smart_inv_transactions_v3');
            if (savedTxs) {
                window.transactions = JSON.parse(savedTxs);
                
                // SANAR IDs SECUENCIALES POR USUARIO: Evita desfases globales con respecto a la hoja de cálculo individual
                const userCounts = {};
                window.transactions.forEach((t) => {
                    if (!userCounts[t.userId]) {
                        userCounts[t.userId] = 0;
                    }
                    userCounts[t.userId]++;
                    t.id = userCounts[t.userId];
                });
                localStorage.setItem('smart_inv_transactions_v3', JSON.stringify(window.transactions));
            } else {
                // FASE 4: El administrador admin inicia con sus datos semilla históricos,
                // mientras que cualquier otro usuario que entre aparecerá desde cero ($0) de forma privada
                window.transactions = [
                    { id: 1, fecha: "2026-07-08", producto: "Chistris", categoria: "Comidas", cantidad: 2, unidad: "Paquete", precio: 2000, total: 4000, lugar: "Tienda de la esquina", metodo: "Nequi", observaciones: "Semilla de inicio", tipo: "gasto", userId: "admin" },
                    { id: 2, fecha: "2026-07-08", producto: "Cheetos", categoria: "Comidas", cantidad: 2, unidad: "Paquete", precio: 2000, total: 4000, lugar: "Tienda de la esquina", metodo: "Nequi", observaciones: "Ninguna", tipo: "gasto", userId: "admin" },
                    { id: 3, fecha: "2026-07-08", producto: "Chocolate", categoria: "Bebidas", cantidad: 1, unidad: "Paquete", precio: 1800, total: 1800, lugar: "SENA", metodo: "Nequi", observaciones: "Semilla de inicio", tipo: "gasto", userId: "admin" },
                    { id: 4, fecha: "2026-07-10", producto: "Nómina Julio", categoria: "SENA", cantidad: 1, unidad: "Unidad", precio: 600000, total: 600000, lugar: "SENA", metodo: "Transferencia", observaciones: "Beca de formación", tipo: "ingreso", userId: "admin" }
                ];
                window.transactions.forEach((t, i) => {
                    t.id = i + 1;
                    t.docId = 'seed_' + i + '_' + Math.random().toString(36).substr(2, 5);
                });
                localStorage.setItem('smart_inv_transactions_v3', JSON.stringify(window.transactions));
            }

            applyFilters();
            renderUserHistory(); // Carga de auditoría de usuarios
        }

        // --- RENDER DE OPCIONES FORMULARIO ---
        function populateFormOptions() {
            const categorySelect = document.getElementById('form-categoria');
            if (!categorySelect) return;
            categorySelect.innerHTML = '';
            
            if (window.activeFormType === 'gasto') {
                window.catalogs.categorias.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.innerText = cat;
                    categorySelect.appendChild(opt);
                });
            } else {
                // FASE 4: Carga las categorías personalizadas de ingresos de cada usuario
                window.catalogs.categorias_ingreso.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.innerText = cat;
                    categorySelect.appendChild(opt);
                });
            }

            // Unidades de medida
            const unitSelect = document.getElementById('form-unidad');
            if (unitSelect) {
                unitSelect.innerHTML = '';
                window.catalogs.unidades.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u;
                    opt.innerText = u;
                    unitSelect.appendChild(opt);
                });
            }

            // Métodos de pago
            const methodSelect = document.getElementById('form-metodo');
            if (methodSelect) {
                methodSelect.innerHTML = '';
                window.catalogs.metodos.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m;
                    opt.innerText = m;
                    methodSelect.appendChild(opt);
                });
            }

            // Establecimientos (Datalist inteligente de autocompletado)
            const datalist = document.getElementById('datalist-lugares');
            if (datalist) {
                datalist.innerHTML = '';
                window.catalogs.establecimientos.forEach(est => {
                    const opt = document.createElement('option');
                    opt.value = est;
                    datalist.appendChild(opt);
                });
            }
        }

        function setFormType(type) {
            window.activeFormType = type;
            const btnGasto = document.getElementById('btn-flow-gasto');
            const btnIngreso = document.getElementById('btn-flow-ingreso');
            const labelProd = document.getElementById('label-producto');
            const containerUnidad = document.getElementById('container-unidad');
            const inputUnidad = document.getElementById('form-unidad');
            const wrapperCantidad = document.getElementById('wrapper-cantidad');
            const labelPrecio = document.getElementById('label-precio');
            const inputPrecio = document.getElementById('form-precio');
            const inputCantidad = document.getElementById('form-cantidad');
            const formIcon = document.getElementById('form-icon');
            const formTitle = document.getElementById('form-title');
            const submitBtn = document.getElementById('form-submit-btn');

            populateFormOptions();

            // MANTENEMOS la estructura de cuadrícula estática sin modificaciones ni saltos visuales de estiramiento
            if (type === 'gasto') {
                btnGasto.className = "py-2.5 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 transition duration-200";
                btnIngreso.className = "py-2.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition duration-200";
                labelProd.innerText = "Nombre del Producto *";
                
                inputUnidad.disabled = false;
                containerUnidad.style.opacity = "1";
                containerUnidad.style.pointerEvents = "auto";
                
                inputCantidad.disabled = false;
                inputCantidad.value = "";
                wrapperCantidad.style.opacity = "1";
                wrapperCantidad.style.pointerEvents = "auto";
                
                labelPrecio.innerText = "Precio Unitario ($) *";
                inputPrecio.placeholder = "Valor unitario";
                
                formIcon.className = "fa-solid fa-cart-shopping text-rose-500";
                formTitle.innerText = "Registrar Egreso";
                submitBtn.className = "w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 shadow-lg shadow-rose-600/10 btn-shimmer";
            } else {
                btnIngreso.className = "py-2.5 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition duration-200";
                btnGasto.className = "py-2.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition duration-200";
                labelProd.innerText = "Concepto de Ingreso *";
                
                inputUnidad.disabled = true;
                inputUnidad.value = "Unidad";
                containerUnidad.style.opacity = "0.4";
                containerUnidad.style.pointerEvents = "none";
                
                inputCantidad.disabled = true;
                inputCantidad.value = 1;
                wrapperCantidad.style.opacity = "0.4";
                wrapperCantidad.style.pointerEvents = "none";
                
                labelPrecio.innerText = "Monto del Ingreso ($) *";
                inputPrecio.placeholder = "Ej. 200000";
                
                formIcon.className = "fa-solid fa-wallet text-cyan-400";
                formTitle.innerText = "Registrar Ingreso";
                submitBtn.className = "w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 shadow-lg shadow-cyan-600/10 btn-shimmer";
            }
            updateTotalPreview();
        }

        // -------------------------------------------------------------
        // PANEL FILTRADOR DE FECHAS / MESES (Novedad Fase 3)
        // -------------------------------------------------------------
        function toggleFilterInputs() {
            const filterType = document.getElementById('filter-type').value;
            const monthContainer = document.getElementById('filter-container-month');
            const rangeContainer = document.getElementById('filter-container-range');

            monthContainer.classList.add('hidden');
            rangeContainer.classList.add('hidden');

            if (filterType === 'month') {
                monthContainer.classList.remove('hidden');
                const now = new Date();
                document.getElementById('filter-month').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            } else if (filterType === 'range') {
                rangeContainer.classList.remove('hidden');
            }

            applyFilters();
        }

        function getFilteredTransactions() {
            let txs = [...window.transactions];

            // 1. Filtrado por Usuario Strict (Cada usuario, incluso el admin, solo ve sus propias transacciones de forma privada)
            txs = txs.filter(t => t.userId === window.user.username);

            // 2. Filtrado Temporal (Fase 3)
            const filterType = document.getElementById('filter-type').value;
            if (filterType === 'month') {
                const selectedMonth = document.getElementById('filter-month').value; // Formato: YYYY-MM
                if (selectedMonth) {
                    txs = txs.filter(t => t.fecha.startsWith(selectedMonth));
                }
            } else if (filterType === 'range') {
                const startDate = document.getElementById('filter-start-date').value;
                const endDate = document.getElementById('filter-end-date').value;
                if (startDate) {
                    txs = txs.filter(t => t.fecha >= startDate);
                }
                if (endDate) {
                    txs = txs.filter(t => t.fecha <= endDate);
                }
            }

            return txs;
        }

        function applyFilters() {
            const filteredTxs = getFilteredTransactions();
            renderTable(filteredTxs);
            updateMetrics(filteredTxs);
            syncBrainData(filteredTxs);
        }

        // -------------------------------------------------------------
        // GESTIÓN DEL FORMULARIO Y CONTROLADOR DE REGISTROS
        // -------------------------------------------------------------
        function updateTotalPreview() {
            if (window.activeFormType === 'gasto') {
                const qty = parseFloat(document.getElementById('form-cantidad').value) || 0;
                const price = parseFloat(document.getElementById('form-precio').value) || 0;
                document.getElementById('form-total-preview').innerText = `$${(qty * price).toLocaleString()}`;
            } else {
                const price = parseFloat(document.getElementById('form-precio').value) || 0;
                document.getElementById('form-total-preview').innerText = `$${price.toLocaleString()}`;
            }
        }

        async function handleFormSubmit(e) {
            e.preventDefault();

            const prodName = document.getElementById('form-producto').value.trim();
            const category = document.getElementById('form-categoria').value;
            const place = document.getElementById('form-lugar').value.trim();
            const date = document.getElementById('form-fecha').value;
            const payment = document.getElementById('form-metodo').value;
            const obs = document.getElementById('form-observaciones').value.trim() || "Ninguna";

            let qty = 1;
            let unit = "Unidad";
            let unitPrice = 0;
            let total = 0;

            if (window.activeFormType === 'gasto') {
                qty = parseInt(document.getElementById('form-cantidad').value);
                unit = document.getElementById('form-unidad').value;
                unitPrice = parseFloat(document.getElementById('form-precio').value);
                total = qty * unitPrice;

                if (qty <= 0 || unitPrice <= 0) {
                    showAlert("Fallo", "La cantidad y el precio unitario deben ser mayores a cero.", true);
                    return;
                }
            } else {
                unitPrice = parseFloat(document.getElementById('form-precio').value);
                total = unitPrice;

                if (unitPrice <= 0) {
                    showAlert("Fallo", "El monto de ingreso debe ser mayor a cero.", true);
                    return;
                }
            }

            if (place && !window.catalogs.establecimientos.includes(place)) {
                window.catalogs.establecimientos.push(place);
                const catalogKey = 'smart_inv_catalogs_' + window.user.username;
                localStorage.setItem(catalogKey, JSON.stringify(window.catalogs));
                populateFormOptions();
            }

            // El ID numérico se asigna estrictamente en orden secuencial por usuario para evitar huecos desalineados
            const userTxs = window.transactions.filter(t => t.userId === window.user.username);
            const nextNumericId = userTxs.length + 1;

            const newTx = {
                id: nextNumericId,
                fecha: date,
                producto: prodName,
                categoria: category,
                cantidad: qty,
                placeholder_unidad: unit, // Para compatibilidad
                unidad: unit,
                precio: unitPrice,
                total: total,
                lugar: place,
                metodo: payment,
                observaciones: obs,
                tipo: window.activeFormType,
                userId: window.user.username,
                docId: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
            };

            dispatchToGoogleSheets(newTx);

            window.transactions.push(newTx);
            localStorage.setItem('smart_inv_transactions_v3', JSON.stringify(window.transactions));
            
            applyFilters();
            renderUserHistory(); // Actualizar estadísticas generales en la consola de auditoría

            document.getElementById('expense-form').reset();
            document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
            document.getElementById('form-total-preview').innerText = "$0";

            showAlert("Éxito", `Movimiento "${prodName}" registrado exitosamente.`);
        }

        function deleteRow(docId) {
            window.transactions = window.transactions.filter(t => t.docId !== docId);
            
            // AUTO-REORDENACIÓN DE IDS SECUENCIALES POR USUARIO: Recalcula de inmediato todos los índices de forma privada
            const userCounts = {};
            window.transactions.forEach((t) => {
                if (!userCounts[t.userId]) {
                    userCounts[t.userId] = 0;
                }
                userCounts[t.userId]++;
                t.id = userCounts[t.userId];
            });
            
            localStorage.setItem('smart_inv_transactions_v3', JSON.stringify(window.transactions));
            applyFilters();
            renderUserHistory();
            showAlert("Fila eliminada", "La transacción fue removida al instante.");
        }

        // -------------------------------------------------------------
        // RENDERIZADO VISUAL DE TABLAS Y MÉTRICAS
        // -------------------------------------------------------------
        function renderTable(txs) {
            const tableBody = document.getElementById('table-body');
            if (!tableBody) return;
            tableBody.innerHTML = '';

            if (txs.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="12" class="p-8 text-center text-slate-500">
                            No se encontraron transacciones en este período.
                        </td>
                    </tr>
                `;
                document.getElementById('table-count').innerText = "0";
                return;
            }

            txs.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-800/20 transition duration-150";

                const isGasto = item.tipo === 'gasto';
                const tagColor = isGasto 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';

                // Código de color dinámico para la columna de ID según requerimiento: Gasto (ROJO VIVO) / Ingreso (AZUL CIAN)
                const idColorClass = isGasto ? 'text-[#ff0000] font-bold' : 'text-cyan-400 font-bold';

                // Solid vibrant red for deletion icons (image_783404.png)
                tr.innerHTML = `
                    <td class="p-4 font-mono ${idColorClass}">#${String(item.id).padStart(3, '0')}</td>
                    <td class="p-4 whitespace-nowrap">${formatDate(item.fecha)}</td>
                    <td class="p-4"><span class="font-bold text-slate-300 capitalize">${item.userId}</span></td>
                    <td class="p-4 font-semibold text-white">${item.producto}</td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${tagColor}">${item.tipo.toUpperCase()}</span></td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/60 text-slate-300 border border-slate-800">${item.categoria}</span></td>
                    <td class="p-4">${isGasto ? item.cantidad : '-'}</td>
                    <td class="p-4 text-slate-500">${isGasto ? item.unidad : '-'}</td>
                    <td class="p-4">$${item.precio.toLocaleString()}</td>
                    <td class="p-4 font-bold text-white">$${item.total.toLocaleString()}</td>
                    <td class="p-4 truncate max-w-[120px]" title="${item.lugar}">${item.lugar}</td>
                    <td class="p-4 text-center">
                        <button onclick="deleteRow('${item.docId}')" class="text-[#ff0000] hover:text-[#cc0000] hover:bg-[#ff0000]/10 p-2 rounded-xl transition duration-150 font-bold border-2 border-[#ff0000]">
                            <i class="fa-regular fa-trash-can text-sm"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.getElementById('table-count').innerText = txs.length;
        }

        function updateMetrics(txs) {
            const budgetKey = 'smart_inv_budget_value_' + window.user.username;
            const totalBudget = parseFloat(localStorage.getItem(budgetKey)) || 500000;
            
            const totalSpent = txs.filter(t => t.tipo === 'gasto').reduce((acc, curr) => acc + curr.total, 0);
            const totalEarned = txs.filter(t => t.tipo === 'ingreso').reduce((acc, curr) => acc + curr.total, 0);
            const balanceReal = totalEarned - totalSpent;

            const spentCount = txs.filter(t => t.tipo === 'gasto').length;
            const earnedCount = txs.filter(t => t.tipo === 'ingreso').length;

            document.getElementById('kpi-total-gastos').innerText = `$${totalSpent.toLocaleString()}`;
            document.getElementById('kpi-total-ingresos').innerText = `$${totalEarned.toLocaleString()}`;
            document.getElementById('kpi-balance-real').innerText = `$${balanceReal.toLocaleString()}`;
            
            document.getElementById('kpi-gastos-count').innerText = `${spentCount} compras registradas`;
            document.getElementById('kpi-ingresos-count').innerText = `${earnedCount} depósitos registrados`;

            const balanceKpi = document.getElementById('kpi-balance-real');
            if (balanceReal < 0) {
                balanceKpi.className = "text-2xl font-bold mt-2 text-[#ff0000]";
            } else if (balanceReal < 100000) {
                balanceKpi.className = "text-2xl font-bold mt-2 text-amber-500";
            } else {
                balanceKpi.className = "text-2xl font-bold mt-2 text-emerald-400";
            }

            // --- ALERTA DE PRESUPUESTO SUPERADO ---
            const overBudgetPanel = document.getElementById('over-budget-panel');
            const kpiCardBudget = document.getElementById('kpi-card-budget');
            const kpiCardEgresos = document.getElementById('kpi-card-egresos');

            if (totalSpent > totalBudget) {
                overBudgetPanel.classList.remove('hidden');
                kpiCardBudget.classList.add('over-budget-flash');
                kpiCardEgresos.classList.add('over-budget-flash');

                const excess = totalSpent - totalBudget;
                document.getElementById('alert-excess-amount').innerText = `Exceso: $${excess.toLocaleString()}`;
                
                const catExpenses = {};
                txs.filter(t => t.tipo === 'gasto').forEach(t => {
                    catExpenses[t.categoria] = (catExpenses[t.categoria] || 0) + t.total;
                });
                let highestCat = "Ninguno";
                let highestVal = 0;
                Object.keys(catExpenses).forEach(cat => {
                    if (catExpenses[cat] > highestVal) {
                        highestVal = catExpenses[cat];
                        highestCat = cat;
                    }
                });
                document.getElementById('alert-highest-category').innerText = `Mayor foco de gasto: ${highestCat} ($${highestVal.toLocaleString()})`;
            } else {
                overBudgetPanel.classList.add('hidden');
                kpiCardBudget.classList.remove('over-budget-flash');
                kpiCardEgresos.classList.remove('over-budget-flash');
            }

            const percentUsed = Math.min((totalSpent / totalBudget) * 100, 100);
            document.getElementById('budget-progress-percent').innerText = `${percentUsed.toFixed(1)}%`;
            document.getElementById('budget-progress-bar').style.width = `${percentUsed}%`;

            renderCategoryChart(txs);
        }

        function renderCategoryChart(txs) {
            const categorySums = {};
            txs.filter(t => t.tipo === 'gasto').forEach(t => {
                categorySums[t.categoria] = (categorySums[t.categoria] || 0) + t.total;
            });

            const labels = Object.keys(categorySums);
            const data = Object.values(categorySums);

            if (window.chartInstance) {
                window.chartInstance.destroy();
            }

            const canvasChart = document.getElementById('category-chart');
            const fallbackMsg = document.getElementById('chart-fallback');

            if (labels.length === 0) {
                if (canvasChart) canvasChart.classList.add('hidden');
                if (fallbackMsg) fallbackMsg.classList.remove('hidden');
                return;
            } else {
                if (canvasChart) canvasChart.classList.remove('hidden');
                if (fallbackMsg) fallbackMsg.classList.add('hidden');
            }

            const ctxChart = canvasChart.getContext('2d');
            
            // FASE 5: Solid vibrant red as primary segment (image_7834c4.png)
            const themeColors = [
                '#ff0000', // Solid vibrant red
                '#f43f5e', 
                '#be123c', 
                '#e11d48', 
                '#9f1239', 
                '#fb7185', 
                '#fda4af', 
                '#fecdd3', 
                '#881337', 
                '#ffe4e6', 
                '#991b1b', 
                '#7f1d1d'  
            ];

            window.chartInstance = new Chart(ctxChart, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: themeColors.slice(0, labels.length),
                        borderColor: document.body.classList.contains('light-mode') ? '#ffffff' : '#020617',
                        borderWidth: 2,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: document.body.classList.contains('light-mode') ? '#000000' : '#94a3b8',
                                font: { family: 'Plus Jakarta Sans', size: 10, weight: 700 },
                                boxWidth: 10,
                                padding: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw || 0;
                                    return ` $${value.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }

        // -------------------------------------------------------------
        // DISPARADOR DE DATOS DE INTEGRACIÓN GOOGLE SHEETS
        // -------------------------------------------------------------
        function dispatchToGoogleSheets(transactionData) {
            const webhookUrl = localStorage.getItem('google_sheets_webhook_' + window.user.username);
            if (!webhookUrl || webhookUrl.trim() === "") return;

            const dateParts = transactionData.fecha.split('-');
            const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : transactionData.fecha;

            const payload = {
                id: transactionData.id,
                fecha: formattedDate,
                producto: transactionData.producto,
                categoria: transactionData.categoria,
                cantidad: transactionData.cantidad,
                unidad: transactionData.unidad,
                precio: transactionData.precio,
                total: transactionData.total,
                lugar: transactionData.lugar,
                metodo: transactionData.metodo,
                observaciones: transactionData.observaciones,
                tipo: transactionData.tipo,
                usuario: transactionData.userId
            };

            fetch(webhookUrl, {
                method: "POST",
                mode: "no-cors", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(err => console.error("Error Sheets background:", err));
        }

        // -------------------------------------------------------------
        // EXPORTACIÓN A EXCEL ADAPTADA
        // -------------------------------------------------------------
        function exportToExcel() {
            const txs = getFilteredTransactions();
            if (txs.length === 0) {
                showAlert("Sin datos", "No tienes registros filtrados para exportar en este momento.", true);
                return;
            }

            let excelContent = "\uFEFF"; 
            excelContent += "sep=;\r\n"; 

            excelContent += "ID;Fecha;Usuario;Concepto / Producto;Tipo;Categoría;Cantidad;Unidad;Precio Unitario ($);Precio Total ($);Procedencia / Establecimiento;Método;Observaciones\r\n";

            txs.forEach(item => {
                const row = [
                    `#${String(item.id).padStart(3, '0')}`,
                    formatDate(item.fecha),
                    item.userId,
                    item.producto.replace(/;/g, ","),
                    item.tipo.toUpperCase(),
                    item.categoria,
                    item.tipo === 'gasto' ? item.cantidad : '-',
                    item.tipo === 'gasto' ? item.unidad : '-',
                    item.precio,
                    item.total,
                    item.lugar.replace(/;/g, ","),
                    item.metodo,
                    (item.observaciones || "Ninguna").replace(/;/g, ",")
                ].join(";");
                excelContent += row + "\r\n";
            });

            const totalSpent = txs.filter(t => t.tipo === 'gasto').reduce((acc, curr) => acc + curr.total, 0);
            const totalEarned = txs.filter(t => t.tipo === 'ingreso').reduce((acc, curr) => acc + curr.total, 0);
            excelContent += `\r\n;;;;;;;TOTAL INGRESADO:;${totalEarned};;;\r\n`;
            excelContent += `;;;;;;;TOTAL EGRESADO:;${totalSpent};;;\r\n`;

            const blob = new Blob([excelContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const todayStr = new Date().toISOString().split('T')[0];
            
            const downloadUrl = URL.createObjectURL(blob);
            link.href = downloadUrl;
            link.setAttribute("download", `Mi_Inventario_Fase5_${todayStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 150);

            showAlert("Excel Exportado", "Se descargó tu reporte de compras y flujos.");
        }

        // -------------------------------------------------------------
        // CONTROL DE MODALES: PRESUPUESTO EDITABLE
        // -------------------------------------------------------------
        function editMonthlyBudget() {
            toggleBudgetModal();
            const budgetKey = 'smart_inv_budget_value_' + window.user.username;
            const val = localStorage.getItem(budgetKey) || "500000";
            document.getElementById('input-budget-value').value = val;
        }

        function toggleBudgetModal() {
            document.getElementById('budget-settings-modal').classList.toggle('hidden');
        }

        function saveBudget() {
            const inputVal = document.getElementById('input-budget-value').value;
            if (!inputVal || parseFloat(inputVal) <= 0) {
                showAlert("Error", "Ingresa un tope válido mayor a cero.", true);
                return;
            }

            const budgetKey = 'smart_inv_budget_value_' + window.user.username;
            localStorage.setItem(budgetKey, inputVal);
            document.getElementById('kpi-budget-amount').innerText = `$${parseFloat(inputVal).toLocaleString()}`;
            toggleBudgetModal();
            applyFilters();
            showAlert("Presupuesto Actualizado", "Tu límite mensual se guardó con éxito.");
        }

        // -------------------------------------------------------------
        // CONTROLADOR DEL MODAL DE CATÁLOGOS DINÁMICOS (FASE 3 - 5)
        // -------------------------------------------------------------
        function openCatalogModal() {
            toggleCatalogModal();
            switchCatalogTab('sheets');
        }

        function toggleCatalogModal() {
            document.getElementById('catalog-modal').classList.toggle('hidden');
        }

        function switchCatalogTab(tab) {
            window.activeCatalogTab = tab;
            
            const tabs = ['sheets', 'categorias', 'categorias_ingreso', 'establecimientos', 'unidades', 'metodos'];
            tabs.forEach(t => {
                const btn = document.getElementById(`modal-tab-${t}`);
                if (btn) {
                    if (t === tab) {
                        btn.className = "pb-3 px-4 text-emerald-400 font-bold border-b-2 border-emerald-400 inline-block";
                    } else {
                        btn.className = "pb-3 px-4 text-slate-400 hover:text-slate-200 inline-block";
                    }
                }
            });

            const sheetsPanel = document.getElementById('modal-panel-sheets');
            const catalogPanel = document.getElementById('modal-panel-catalog');

            if (tab === 'sheets') {
                sheetsPanel.classList.remove('hidden');
                catalogPanel.classList.add('hidden');
                const savedWebhook = localStorage.getItem('google_sheets_webhook_' + window.user.username) || "";
                document.getElementById('sheet-webhook-url').value = savedWebhook;
            } else {
                sheetsPanel.classList.add('hidden');
                catalogPanel.classList.remove('hidden');
                renderCatalogList();
            }
        }

        function renderCatalogList() {
            const listContainer = document.getElementById('catalog-items-list');
            listContainer.innerHTML = '';
            
            const listData = window.catalogs[window.activeCatalogTab];

            if (!listData || listData.length === 0) {
                listContainer.innerHTML = `<li class="text-slate-500 italic">No hay ítems registrados en esta lista.</li>`;
                return;
            }

            listData.forEach((item, index) => {
                const li = document.createElement('li');
                li.className = "flex items-center justify-between py-1.5 border-b border-slate-800/40";
                // Color formatting for deletion actions in settings/catalog modal (image_783404.png / Solid Vibrant Red)
                li.innerHTML = `
                    <span class="text-white">${item}</span>
                    <button onclick="removeCatalogItem(${index})" class="text-[#ff0000] hover:text-[#d60000] p-1.5 transition duration-150 rounded-lg hover:bg-[#ff0000]/10">
                        <i class="fa-regular fa-trash-can text-sm"></i>
                    </button>
                `;
                listContainer.appendChild(li);
            });
        }

        function addCatalogItem() {
            const input = document.getElementById('catalog-new-item');
            const val = input.value.trim();
            if (!val) return;

            if (!window.catalogs) {
                window.catalogs = { categorias: [], categorias_ingreso: [], establecimientos: [], unidades: [], metodos: [] };
            }

            let listData = window.catalogs[window.activeCatalogTab];
            if (!listData) {
                window.catalogs[window.activeCatalogTab] = [];
                listData = window.catalogs[window.activeCatalogTab];
            }

            if (listData.includes(val)) {
                showAlert("Duplicado", "Este elemento ya está en la lista.", true);
                return;
            }

            listData.push(val);
            const catalogKey = 'smart_inv_catalogs_' + window.user.username;
            localStorage.setItem(catalogKey, JSON.stringify(window.catalogs));
            input.value = '';
            renderCatalogList();
            populateFormOptions();
            buildNodes(); // Reconstruir cerebro
            showAlert("Elemento añadido", `"${val}" se agregó a la lista de forma segura.`);
        }

        function removeCatalogItem(index) {
            let listData = window.catalogs[window.activeCatalogTab];
            if (!listData) return;

            const removedVal = listData[index];
            listData.splice(index, 1);
            const catalogKey = 'smart_inv_catalogs_' + window.user.username;
            localStorage.setItem(catalogKey, JSON.stringify(window.catalogs));
            renderCatalogList();
            populateFormOptions();
            buildNodes(); // Reconstruir cerebro
            showAlert("Elemento eliminado", `"${removedVal}" fue removido de la lista.`);
        }

        function saveCatalogSettings() {
            const webhookUrl = document.getElementById('sheet-webhook-url').value;
            if (webhookUrl && webhookUrl.trim() !== "" && !webhookUrl.startsWith('https://script.google.com/')) {
                showAlert("URL Inválida", "La URL debe comenzar con https://script.google.com/", true);
                return;
            }
            localStorage.setItem('google_sheets_webhook_' + window.user.username, webhookUrl);
            checkSheetsBannerStatus();

            toggleCatalogModal();
            showAlert("Ajustes Guardados", "Toda la configuración del sistema fue actualizada.");
        }

        function checkSheetsBannerStatus() {
            const banner = document.getElementById('sheets-alert-banner');
            if (!banner) return;
            const url = localStorage.getItem('google_sheets_webhook_' + window.user.username);
            if (url && url.trim() !== "") {
                banner.classList.remove('hidden');
            } else {
                banner.classList.add('hidden');
            }
        }

        function toggleTheme() {
            const body = document.body;
            body.classList.toggle('light-mode');
            const icon = document.getElementById('theme-icon');

            if (body.classList.contains('light-mode')) {
                icon.className = "fa-solid fa-sun text-amber-500";
                localStorage.setItem('smart_inv_theme_mode', 'light');
            } else {
                icon.className = "fa-solid fa-moon text-amber-400";
                localStorage.setItem('smart_inv_theme_mode', 'dark');
            }
            
            applyFilters();
        }

        function formatDate(dateStr) {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateStr;
        }

        function toggleEmbeddedGuide() {
            const guide = document.getElementById('embedded-guide');
            if (!guide) return;
            guide.classList.toggle('hidden');
        }

        function openHelpGuideDirectly() {
            openCatalogModal();
            switchCatalogTab('sheets');
            const guide = document.getElementById('embedded-guide');
            if (guide) {
                guide.classList.remove('hidden');
            }
        }

        function copyAppsScriptToClipboard() {
            const codeString = `/**
 * Google Apps Script - Sincronización de Inventario Individual y Privada (Fase 3 - Auto-ordenado y Colores de Fila)
 * Este script debe pegarse en el editor de Apps Script de la hoja de cálculo de CADA usuario.
 */

function inicializar() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("El script no está vinculado a ninguna hoja de cálculo activa.");
    }
    Logger.log("¡Conexión exitosa! La hoja de cálculo se llama: " + ss.getName());
  } catch (error) {
    Logger.log("Error al inicializar: " + error.toString());
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "No se encontró la hoja."}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = ss.getSheets()[0]; 
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Sin datos recibidos."}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID", "Fecha", "Usuario", "Concepto / Producto", "Tipo de Flujo", 
        "Categoría", "Cantidad", "Unidad", "Precio Unitario ($)", 
        "Precio Total ($)", "Procedencia / Establecimiento", "Método de Pago", "Observaciones"
      ]);
      
      sheet.getRange("A1:M1")
           .setFontWeight("bold")
           .setBackground("#1e293b")
           .setFontColor("#ffffff")
           .setHorizontalAlignment("center")
           .setVerticalAlignment("middle");
    }
    
    var formulaId = '="#"&TEXT(ROW()-1,"000")';
    var flowType = String(data.tipo).toUpperCase();
    
    sheet.appendRow([
      formulaId,
      data.fecha,
      String(data.usuario).toUpperCase(),
      data.producto,
      flowType,
      data.categoria,
      data.tipo === 'gasto' ? data.cantidad : '-',
      data.tipo === 'gasto' ? data.unidad : '-',
      data.precio,
      data.total,
      data.lugar,
      data.metodo,
      data.observaciones
    ]);
    
    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, 13);
    var idCell = sheet.getRange(lastRow, 1);
    var flowCell = sheet.getRange(lastRow, 5);
    
    if (data.tipo === 'gasto') {
      rowRange.setBackground("#fde8e8");
      idCell.setFontColor("#b91c1c").setFontWeight("bold").setHorizontalAlignment("center");
      flowCell.setFontColor("#b91c1c").setFontWeight("bold");
    } else {
      rowRange.setBackground("#ecfeff");
      idCell.setFontColor("#0891b2").setFontWeight("bold").setHorizontalAlignment("center");
      flowCell.setFontColor("#0891b2").setFontWeight("bold");
    }
    
    for (var col = 1; col <= 13; col++) {
      sheet.autoResizeColumn(col);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

            const textarea = document.createElement("textarea");
            textarea.value = codeString;
            textarea.style.position = "fixed"; 
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showAlert("Copiado con Éxito", "El script de Google Apps Script se copió a tu portapapeles. ¡Pégalo en Apps Script!");
            } catch (err) {
                console.error("No se pudo copiar el código:", err);
            }
            document.body.removeChild(textarea);
        }

        // -------------------------------------------------------------
        // MOTOR FÍSICO INTERACTIVO DEL LIENZO DEL CEREBRO DUAL
        // -------------------------------------------------------------
        function initBrainSimulation() {
            window.canvas = document.getElementById('brain-canvas');
            if (!window.canvas) return;
            window.ctx = window.canvas.getContext('2d');

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            window.canvas.addEventListener('mousedown', onMouseDown);
            window.canvas.addEventListener('mousemove', onMouseMove);
            window.canvas.addEventListener('mouseup', onMouseUp);

            window.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
            window.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
            window.canvas.addEventListener('touchend', onTouchEnd);

            buildNodes();

            if (window.animationFrameId) {
                cancelAnimationFrame(window.animationFrameId);
            }
            animate();
        }

        function resizeCanvas() {
            if (!window.canvas) return;
            const rect = window.canvas.parentNode.getBoundingClientRect();
            window.canvas.width = rect.width;
            window.canvas.height = rect.height;
            
            if (window.nodes && window.nodes.length > 0) {
                const centerNode = window.nodes.find(n => n.isCenter);
                if (centerNode) {
                    centerNode.x = window.canvas.width / 2;
                    centerNode.y = window.canvas.height / 2;
                }
            }
        }

        function buildNodes() {
            window.nodes = [];
            if (!window.canvas) return;

            const width = window.canvas.width;
            const height = window.canvas.height;

            // Nodo Core Central del Presupuesto
            window.nodes.push({
                id: 'brain-core',
                label: 'Cerebro Central',
                x: width / 2,
                y: height / 2,
                vx: 0,
                vy: 0,
                radius: 38,
                isCenter: true,
                spent: 0,
                color: '#10b981'
            });

            const radiusOffset = 150;
            // FASE 4: Combina dinámicamente las categorías personalizadas de Gastos e Ingresos para mapearlas en el cerebro
            const combinedCategories = [...window.catalogs.categorias, ...window.catalogs.categorias_ingreso];
            
            combinedCategories.forEach((cat, index) => {
                const angle = (index / combinedCategories.length) * Math.PI * 2;
                const isIncomeNode = window.catalogs.categorias_ingreso.includes(cat);

                window.nodes.push({
                    id: `cat-${cat}`,
                    label: cat,
                    x: (width / 2) + Math.cos(angle) * radiusOffset,
                    y: (height / 2) + Math.sin(angle) * radiusOffset,
                    vx: 0,
                    vy: 0,
                    radius: 20,
                    isCenter: false,
                    spent: 0,
                    isIncome: isIncomeNode,
                    color: '#475569',
                    pulseProgress: Math.random()
                });
            });

            syncBrainData(getFilteredTransactions());
        }

        function syncBrainData(txs) {
            if (!window.nodes || window.nodes.length === 0) return;

            const categorySums = {};
            let maxVal = 1;

            txs.forEach(t => {
                categorySums[t.categoria] = (categorySums[t.categoria] || 0) + t.total;
                if (categorySums[t.categoria] > maxVal) {
                    maxVal = categorySums[t.categoria];
                }
            });

            const totalSpent = txs.filter(t => t.tipo === 'gasto').reduce((acc, curr) => acc + curr.total, 0);
            const totalEarned = txs.filter(t => t.tipo === 'ingreso').reduce((acc, curr) => acc + curr.total, 0);

            window.nodes.forEach(node => {
                if (node.isCenter) {
                    node.spent = totalSpent;
                    node.earned = totalEarned;
                    return;
                }

                const value = categorySums[node.label] || 0;
                node.spent = value;

                if (value > 0) {
                    const percentage = value / maxVal;
                    node.radius = 20 + (percentage * 14);
                    
                    if (node.isIncome) {
                        node.color = '#06b6d4'; // Cian
                    } else {
                        if (value > 150000) node.color = '#ff0000'; // Pure Red
                        else if (value > 50000) node.color = '#f59e0b'; // Naranja
                        else node.color = '#10b981'; // Verde
                    }
                } else {
                    node.radius = 16;
                    node.color = document.body.classList.contains('light-mode') ? '#e2e8f0' : '#1e293b'; 
                }
            });
        }

        function drawBrainCore(x, y, size, isOverBudget) {
            window.ctx.save();
            window.ctx.translate(x, y);
            window.ctx.scale(size / 80, size / 80);
            
            if (isOverBudget) {
                window.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
                window.ctx.shadowColor = "#ff0000";
            } else {
                window.ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
                window.ctx.shadowColor = "#10b981";
            }
            
            window.ctx.lineWidth = 2.5;
            window.ctx.shadowBlur = 18;
            
            window.ctx.beginPath();
            window.ctx.arc(-10, -10, 18, Math.PI, Math.PI * 1.5);
            window.ctx.arc(4, -22, 12, Math.PI * 1.5, 0);
            window.ctx.arc(12, -10, 12, Math.PI * 1.7, Math.PI * 0.5);
            window.ctx.arc(0, 12, 18, Math.PI * 0.2, Math.PI);
            window.ctx.arc(-18, 4, 12, Math.PI * 0.8, Math.PI * 1.5);
            window.ctx.closePath();
            window.ctx.stroke();
            
            window.ctx.beginPath();
            window.ctx.arc(10, -10, 18, Math.PI * 1.5, 0);
            window.ctx.arc(-4, -22, 12, Math.PI, Math.PI * 1.5);
            window.ctx.arc(-12, -10, 12, Math.PI * 0.5, Math.PI * 1.3);
            window.ctx.arc(0, 12, 18, Math.PI, Math.PI * 1.8);
            window.ctx.arc(18, 4, 12, Math.PI * 1.5, Math.PI * 0.2);
            window.ctx.closePath();
            window.ctx.stroke();

            window.ctx.fillStyle = isOverBudget ? "rgba(255, 0, 0, 0.8)" : "rgba(16, 185, 129, 0.8)";
            window.ctx.beginPath();
            window.ctx.arc(0, -4, 10, 0, Math.PI * 2);
            window.ctx.fill();
            
            window.ctx.restore();
        }

        function animate() {
            if (!window.canvas || !window.ctx) return;

            const isLight = document.body.classList.contains('light-mode');
            window.ctx.fillStyle = isLight ? '#f1f5f9' : '#020617';
            window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);

            const centerNode = window.nodes.find(n => n.isCenter);
            const center = { x: window.canvas.width / 2, y: window.canvas.height / 2 };

            if (centerNode && window.dragNode !== centerNode) {
                centerNode.x += (center.x - centerNode.x) * 0.15;
                centerNode.y += (center.y - centerNode.y) * 0.15;
            }

            const budgetKey = 'smart_inv_budget_value_' + window.user.username;
            const totalBudget = parseFloat(localStorage.getItem(budgetKey)) || 500000;
            const isOverBudget = centerNode && centerNode.spent > totalBudget;

            for (let i = 0; i < window.nodes.length; i++) {
                const n1 = window.nodes[i];
                if (n1 === window.dragNode) continue;

                if (!n1.isCenter && centerNode) {
                    const dx = centerNode.x - n1.x;
                    const dy = centerNode.y - n1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    
                    const targetDistance = 150 + (n1.spent > 0 ? 10 : 0);
                    const kSpring = 0.015;
                    const force = (dist - targetDistance) * kSpring;

                    n1.vx += (dx / dist) * force;
                    n1.vy += (dy / dist) * force;
                }

                for (let j = i + 1; j < window.nodes.length; j++) {
                    const n2 = window.nodes[j];
                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const minDist = n1.radius + n2.radius + 30;

                    if (dist < minDist) {
                        const pushForce = (minDist - dist) * 0.08;
                        const fx = (dx / dist) * pushForce;
                        const fy = (dy / dist) * pushForce;

                        if (!n1.isCenter) { n1.vx -= fx; n1.vy -= fy; }
                        if (!n2.isCenter) { n2.vx += fx; n2.vy += fy; }
                    }
                }

                n1.vx *= 0.82;
                n1.vy *= 0.82;
                n1.x += n1.vx;
                n1.y += n1.vy;

                n1.x = Math.max(n1.radius + 10, Math.min(window.canvas.width - n1.radius - 10, n1.x));
                n1.y = Math.max(n1.radius + 10, Math.min(window.canvas.height - n1.radius - 10, n1.y));
            }

            if (centerNode) {
                window.nodes.forEach(node => {
                    if (node.isCenter) return;

                    const hasSpent = node.spent > 0;
                    
                    window.ctx.beginPath();
                    window.ctx.moveTo(node.x, node.y);
                    window.ctx.lineTo(centerNode.x, centerNode.y);
                    
                    if (hasSpent) {
                        window.ctx.lineWidth = Math.min(2 + (node.spent * 0.0001), 6);
                        window.ctx.strokeStyle = node.color + "50";
                        window.ctx.shadowBlur = 10;
                        window.ctx.shadowColor = node.color;
                    } else {
                        window.ctx.lineWidth = 1;
                        window.ctx.strokeStyle = isLight ? "rgba(30, 41, 59, 0.15)" : "rgba(71, 85, 105, 0.15)";
                        window.ctx.shadowBlur = 0;
                    }
                    window.ctx.stroke();

                    if (hasSpent) {
                        const speed = 0.005 + Math.min(node.spent * 0.0000005, 0.02);
                        
                        if (node.isIncome) {
                            node.pulseProgress -= speed;
                            if (node.pulseProgress < 0) node.pulseProgress = 1;
                        } else {
                            node.pulseProgress += speed;
                            if (node.pulseProgress > 1) node.pulseProgress = 0;
                        }

                        const px = node.x + (centerNode.x - node.x) * node.pulseProgress;
                        const py = node.y + (centerNode.y - node.y) * node.pulseProgress;

                        window.ctx.beginPath();
                        window.ctx.arc(px, py, 4 + Math.min(node.spent * 0.00001, 4), 0, Math.PI * 2);
                        window.ctx.fillStyle = node.color;
                        window.ctx.shadowBlur = 12;
                        window.ctx.shadowColor = node.color;
                        window.ctx.fill();
                    }
                });
            }

            window.ctx.shadowBlur = 0;

            window.nodes.forEach(node => {
                if (node.isCenter) {
                    const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.05;
                    drawBrainCore(node.x, node.y, node.radius * pulseScale, isOverBudget);
                    
                    window.ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
                    window.ctx.font = 'bold 11px Plus Jakarta Sans';
                    window.ctx.textAlign = 'center';
                    window.ctx.fillText('FINANZAS CORE', node.x, node.y + 40);
                    return;
                }

                const isActive = node.spent > 0;

                window.ctx.beginPath();
                window.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                window.ctx.fillStyle = node.color;
                if (isActive) {
                    window.ctx.shadowBlur = 15;
                    window.ctx.shadowColor = node.color;
                }
                window.ctx.fill();
                window.ctx.shadowBlur = 0;

                window.ctx.beginPath();
                window.ctx.arc(node.x, node.y, node.radius - (isActive ? 3 : 2), 0, Math.PI * 2);
                window.ctx.fillStyle = isLight ? '#ffffff' : '#020617';
                window.ctx.fill();

                window.ctx.fillStyle = isActive ? (isLight ? '#0f172a' : '#ffffff') : '#475569';
                window.ctx.font = `bold ${node.radius * 0.45}px Plus Jakarta Sans`;
                window.ctx.textAlign = 'center';
                window.ctx.textBaseline = 'middle';
                
                const acronym = node.label.substring(0, 3).toUpperCase();
                window.ctx.fillText(acronym, node.x, node.y);

                if (isActive) {
                    window.ctx.font = '500 9px Plus Jakarta Sans';
                    window.ctx.fillStyle = isLight ? '#1e293b' : '#94a3b8';
                    window.ctx.fillText(node.label, node.x, node.y - node.radius - 12);
                    
                    window.ctx.font = 'bold 10px Plus Jakarta Sans';
                    window.ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
                    window.ctx.fillText(`$${node.spent.toLocaleString()}`, node.x, node.y - node.radius - 2);
                }
            });

            window.animationFrameId = requestAnimationFrame(animate);
        }

        function onMouseDown(e) {
            const rect = window.canvas.getBoundingClientRect();
            window.mouse.x = e.clientX - rect.left;
            window.mouse.y = e.clientY - rect.top;
            checkDragSelection();
        }

        function onMouseMove(e) {
            const rect = window.canvas.getBoundingClientRect();
            window.mouse.x = e.clientX - rect.left;
            window.mouse.y = e.clientY - rect.top;

            if (window.dragNode) {
                window.dragNode.x = window.mouse.x + window.offset.x;
                window.dragNode.y = window.mouse.y + window.offset.y;
            }
        }

        function onMouseUp() {
            window.dragNode = null;
        }

        function onTouchStart(e) {
            if (e.touches.length === 0) return;
            const rect = window.canvas.getBoundingClientRect();
            window.mouse.x = e.touches[0].clientX - rect.left;
            window.mouse.y = e.touches[0].clientY - rect.top;

            if (checkDragSelection()) {
                e.preventDefault();
            }
        }

        function onTouchMove(e) {
            if (e.touches.length === 0 || !window.dragNode) return;
            const rect = window.canvas.getBoundingClientRect();
            window.mouse.x = e.touches[0].clientX - rect.left;
            window.mouse.y = e.touches[0].clientY - rect.top;

            window.dragNode.x = window.mouse.x + window.offset.x;
            window.dragNode.y = window.mouse.y + window.offset.y;
            e.preventDefault();
        }

        function onTouchEnd() {
            window.dragNode = null;
        }

        function checkDragSelection() {
            for (let i = 0; i < window.nodes.length; i++) {
                const node = window.nodes[i];
                const dx = node.x - window.mouse.x;
                const dy = node.y - window.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < node.radius) {
                    window.dragNode = node;
                    window.offset.x = node.x - window.mouse.x;
                    window.offset.y = node.y - window.mouse.y;
                    return true;
                }
            }
            return false;
        }

        // --- SISTEMA DE CONTROL DE SESIÓN AL INICIAR ---
        window.addEventListener('load', () => {
            const activeSession = localStorage.getItem('smart_inv_logged_session');
            if (activeSession) {
                loginUser(JSON.parse(activeSession));
            } else {
                document.getElementById('auth-screen').classList.remove('hidden');
            }

            const savedTheme = localStorage.getItem('smart_inv_theme_mode');
            if (savedTheme === 'light') {
                document.body.classList.add('light-mode');
                document.getElementById('theme-icon').className = "fa-solid fa-sun text-amber-500";
            }

            document.getElementById('form-fecha').value = new Date().toISOString().split('T')[0];
            checkSheetsBannerStatus();
        });

        // Vinculación segura de variables al ámbito global
        window.switchAuthTab = switchAuthTab;
        window.handleAuthSubmit = handleAuthSubmit;
        window.logout = logout;
        window.deleteRow = deleteRow;
        window.handleFormSubmit = handleFormSubmit;
        window.updateTotalPreview = updateTotalPreview;
        window.exportToExcel = exportToExcel;
        window.toggleTheme = toggleTheme;
        window.setFormType = setFormType;
        window.toggleFilterInputs = toggleFilterInputs;
        window.applyFilters = applyFilters;
        window.editMonthlyBudget = editMonthlyBudget;
        window.toggleBudgetModal = toggleBudgetModal;
        window.saveBudget = saveBudget;
        window.openCatalogModal = openCatalogModal;
        window.toggleCatalogModal = toggleCatalogModal;
        window.switchCatalogTab = switchCatalogTab;
        window.addCatalogItem = addCatalogItem;
        window.removeCatalogItem = removeCatalogItem;
        window.saveCatalogSettings = saveCatalogSettings;
        window.deleteUserAccount = deleteUserAccount;
        window.toggleEmbeddedGuide = toggleEmbeddedGuide;
        window.openHelpGuideDirectly = openHelpGuideDirectly;
        window.copyAppsScriptToClipboard = copyAppsScriptToClipboard;


