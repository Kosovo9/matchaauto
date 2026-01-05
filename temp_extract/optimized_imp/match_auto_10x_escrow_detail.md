# 🛡️ Implementación: Escrow Criptográfico Transfronterizo (Solana)

**Ubicación de Archivos:**
1. `/packages/solana-service/src/escrow/program.ts` (Lógica del Smart Contract/Anchor)
2. `/packages/solana-service/src/escrow/client.ts` (Cliente para interactuar con el contrato)
3. `/packages/solana-service/src/escrow/types.ts` (Definiciones de tipos y estados)

### Lógica Principal:
1. **Inicialización (Deposit)**: El comprador deposita USDC en una cuenta de depósito (PDA - Program Derived Address). El estado del Escrow se establece en `AwaitingDelivery`.
2. **Oráculo de Logística**: Un servicio de backend (Oráculo) monitorea el tracking internacional. Cuando el carrier confirma la entrega, el Oráculo firma una transacción que actualiza el estado a `Delivered`.
3. **Liberación (Release)**: Una vez en estado `Delivered`, el vendedor puede reclamar los fondos. Si hay una disputa, los fondos se bloquean hasta que un mediador (o lógica de gobernanza) resuelva.
4. **Seguridad**: Uso de `Token Program` de Solana para manejo seguro de SPL-Tokens y `SystemProgram` para rent management.

### Prompt para DeepSeek (Lógica de Cliente):
> "Genera el cliente de TypeScript en `client.ts` para interactuar con un programa de Escrow en Solana usando Anchor. Debe incluir funciones para `initializeEscrow`, `confirmDelivery` (firmado por oráculo) y `withdrawFunds`. Maneja errores de RPC y reintentos con backoff exponencial."
