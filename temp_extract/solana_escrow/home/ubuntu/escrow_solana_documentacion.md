# Documentación Técnica: Contrato Inteligente de Escrow (Solana/Rust)

## 1. Código Fuente Generado

El código fuente completo del contrato inteligente de Escrow se encuentra en `/home/ubuntu/escrow_program/src/lib.rs`.

### Funcionalidades Clave Implementadas:
*   **Inicialización PDA**: La cuenta de Escrow (`EscrowAccount`) y la cuenta de depósito de tokens (`vault_token_account`) se inicializan como PDAs, garantizando que el programa tenga autoridad sobre los fondos.
*   **Transferencia de Fondos**: Los fondos del comprador se transfieren inmediatamente a la `vault_token_account` durante la inicialización.
*   **Manejo de Estados**: El estado de la transacción se gestiona mediante el enum `EscrowStatus` (AwaitingShipment, Delivered, etc.).
*   **Oráculo Autorizado**: La instrucción `confirm_delivery` solo puede ser ejecutada por la `oracle_pubkey` definida en la inicialización, asegurando la integridad del proceso de entrega.
*   **Timelock**: Implementación de un `timelock_expiry` para permitir la cancelación automática por parte del comprador si el tiempo de entrega excede el límite.
*   **Cierre de Cuentas**: Las cuentas de Escrow y Vault se cierran al finalizar la transacción para recuperar el SOL de renta.

## 2. Estructura de Datos para Oráculos de Logística

La estructura de datos para la configuración de los carriers se detalla en `/home/ubuntu/escrow_program/src/oracle_config.rs`.

### ⚠️ Nota Crítica de Seguridad: Almacenamiento de Credenciales

Es fundamental entender que las claves de autenticación (API Keys) de los carriers y la clave privada del wallet del oráculo **NO DEBEN** almacenarse en la blockchain.

| Tipo de Dato | Ubicación de Almacenamiento | Propósito |
| :--- | :--- | :--- |
| **`oracle: Pubkey`** | Blockchain (dentro de `EscrowAccount`) | Identificador público para que el contrato verifique la firma. |
| **`api_key_secret`** | Cloudflare Workers Secrets (Off-Chain) | Credencial secreta para autenticarse con las APIs de DHL/FedEx. |
| **`oracle_wallet_key`** | Cloudflare Workers Secrets (Off-Chain) | Clave privada para firmar la transacción de `confirm_delivery`. |

El código Rust solo necesita la `Pubkey` del oráculo para la verificación. El servicio de backend (Cloudflare Worker) es el responsable de gestionar las credenciales secretas para realizar la consulta de seguimiento y firmar la transacción on-chain.
