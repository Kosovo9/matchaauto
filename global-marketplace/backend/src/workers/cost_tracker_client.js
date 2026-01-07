/**
 * MATCH-AUTO: COST TRACKER CLIENT (REAL-TIME)
 * Este script se conecta al Cloudflare Worker y actualiza la UI del Super Panel.
 */

const CONFIG = {
    WORKER_URL: "https://cost-tracker.tu-subdominio.workers.dev",
    ADMIN_SECRET: "tu_admin_secret_aqui", // Debe coincidir con el secreto del Worker
    REFRESH_INTERVAL: 30000 // 30 segundos
};

async function fetchCostData() {
    try {
        const response = await fetch(CONFIG.WORKER_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${CONFIG.ADMIN_SECRET}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            updateCostUI(data);
        }
    } catch (error) {
        console.error("Error fetching cost data:", error);
        addLogEntry("Error de conexión con el servidor de costos", "ERROR");
    }
}

function updateCostUI(data) {
    // Actualizar valores principales
    document.getElementById('current-cost').innerText = `$${data.costs.infrastructure_total.toFixed(2)}`;
    document.getElementById('savings').innerText = `+$${data.costs.savings_vs_aws.toFixed(2)}`;
    document.getElementById('projected-cost').innerText = `$${data.costs.projected_monthly.toFixed(2)}`;

    // Actualizar barras de uso
    document.getElementById('usage-workers').innerText = data.current_usage.workers_requests.toLocaleString();
    document.getElementById('usage-storage').innerText = `${data.current_usage.r2_storage_gb} GB`;
    document.getElementById('usage-images').innerText = data.current_usage.images_transformed.toLocaleString();

    // Actualizar timestamp
    document.getElementById('last-update').innerText = `Última actualización: ${new Date(data.timestamp).toLocaleTimeString()}`;

    addLogEntry("Métricas de infraestructura sincronizadas", "SUCCESS");
}

function addLogEntry(message, type) {
    const logs = document.getElementById('logs');
    const logEntry = document.createElement('div');
    const colorClass = type === "ERROR" ? "text-red-400" : "text-gray-400";
    
    logEntry.className = `flex justify-between ${colorClass} border-b border-white/5 pb-2 animate-fade-in`;
    logEntry.innerHTML = `<span>${message}</span><span>${new Date().toLocaleTimeString()}</span>`;
    
    logs.prepend(logEntry);

    // Mantener solo los últimos 10 logs
    if (logs.children.length > 10) {
        logs.removeChild(logs.lastChild);
    }
}

// Iniciar el ciclo de actualización
fetchCostData();
setInterval(fetchCostData, CONFIG.REFRESH_INTERVAL);
