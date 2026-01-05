use anchor_lang::prelude::*;

// NOTA DE SEGURIDAD: Esta estructura NO debe ser almacenada directamente en la blockchain
// ya que contiene información sensible (API Keys). Se define aquí solo para ilustrar
// la estructura de datos que el servicio Off-Chain (Cloudflare Worker) debe manejar.

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CarrierConfig {
    pub name: String,           // e.g., "DHL", "FedEx", "UPS"
    pub api_url: String,        // URL base de la API de seguimiento
    pub api_key_id: String,     // ID o nombre de la clave (para referencia)
    // NOTA: La clave secreta (API Key) NUNCA debe ir en la blockchain.
    // Se almacena de forma segura en un gestor de secretos (Cloudflare Workers Secrets).
}

#[account]
pub struct OracleRegistry {
    pub owner: Pubkey,          // Autoridad de Match-Auto
    pub carriers: Vec<CarrierConfig>, // Lista de carriers soportados
    pub last_updated: i64,      // Timestamp de la última actualización
}

impl OracleRegistry {
    // Espacio necesario para la cuenta (estimación)
    // Se necesita un espacio dinámico para el vector, pero se estima un máximo razonable.
    pub const MAX_SIZE: usize = 8 + 32 + (4 + 10 * (32 + 100 + 32)) + 8; // ~1.7 KB
}

// Estructura de Datos para el Servicio Off-Chain (Cloudflare Worker)
// Este struct se usaría en el backend TypeScript/Rust que actúa como oráculo.
pub struct LogisticsOracleCredentials {
    pub carrier_name: String,
    pub tracking_api_url: String,
    pub api_key_secret: String, // Se obtiene de Cloudflare Workers Secrets
    pub oracle_wallet_key: String, // Clave privada del wallet del oráculo (para firmar)
}

// NOTA IMPORTANTE SOBRE SEGURIDAD:
// Las claves de autenticación (API Keys) y la clave privada del wallet del oráculo
// NUNCA deben ser almacenadas en la blockchain. Deben ser inyectadas de forma segura
// en el Cloudflare Worker (el servicio off-chain) a través de variables de entorno
// o un gestor de secretos (como Cloudflare Secrets o HashiCorp Vault).
// El contrato en Rust solo necesita la Pubkey del oráculo para verificar la firma.
