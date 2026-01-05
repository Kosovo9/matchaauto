use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYsv4pqHkGqYwA"); // Placeholder ID

#[program]
pub mod match_auto_escrow {
    use super::*;

    // 1. Inicialización del Escrow (Deposit)
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        amount: u64,
        tracking_id: String,
        timelock_seconds: i64,
    ) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.buyer = *ctx.accounts.buyer.key;
        escrow_account.seller = *ctx.accounts.seller.key;
        escrow_account.oracle = *ctx.accounts.oracle.key;
        escrow_account.amount = amount;
        escrow_account.tracking_id = tracking_id;
        escrow_account.status = EscrowStatus::AwaitingShipment;
        escrow_account.timelock_expiry = Clock::get()?.unix_timestamp + timelock_seconds;

        // Transferir los tokens del comprador a la cuenta de depósito (PDA)
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    // 2. Confirmación de Entrega (Solo el Oráculo puede llamar)
    pub fn confirm_delivery(ctx: Context<ConfirmDelivery>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        // Verificación de que el llamador es el oráculo designado
        if escrow_account.oracle != *ctx.accounts.oracle.key {
            return Err(ErrorCode::UnauthorizedOracle.into());
        }

        // Cambiar el estado a Entregado
        escrow_account.status = EscrowStatus::Delivered;
        Ok(())
    }

    // 3. Liberación de Fondos (Solo el Vendedor puede llamar tras Delivered)
    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow_account = &ctx.accounts.escrow_account;

        // Verificación de estado
        if escrow_account.status != EscrowStatus::Delivered {
            return Err(ErrorCode::NotYetDelivered.into());
        }

        // Generar el seed para la PDA (vault_token_account)
        let (vault_authority_key, vault_authority_bump) =
            Pubkey::find_program_address(&[b"vault", escrow_account.to_account_info().key.as_ref()], ctx.program_id);
        
        if vault_authority_key != *ctx.accounts.vault_authority.key {
            return Err(ErrorCode::InvalidVaultAuthority.into());
        }

        let authority_seeds = &[
            b"vault".as_ref(),
            escrow_account.to_account_info().key.as_ref(),
            &[vault_authority_bump],
        ];

        // Transferir los fondos al vendedor
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &[authority_seeds]);
        token::transfer(cpi_ctx, escrow_account.amount)?;

        // Cerrar la cuenta de depósito (vault) para recuperar el SOL de renta
        let cpi_accounts = CloseAccount {
            account: ctx.accounts.vault_token_account.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &[authority_seeds]);
        token::close_account(cpi_ctx)?;

        // Cerrar la cuenta de Escrow para recuperar el SOL de renta
        Ok(())
    }

    // 4. Cancelación por Timelock (Solo el Comprador puede llamar)
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow_account = &ctx.accounts.escrow_account;

        // Verificación de Timelock
        if Clock::get()?.unix_timestamp < escrow_account.timelock_expiry {
            return Err(ErrorCode::TimelockNotExpired.into());
        }

        // Verificación de estado (solo si no ha sido entregado)
        if escrow_account.status == EscrowStatus::Delivered {
            return Err(ErrorCode::AlreadyDelivered.into());
        }

        // Lógica de devolución de fondos (similar a release_funds, pero al comprador)
        // ... (omito la transferencia por brevedad, pero sigue la misma lógica de PDA)

        Ok(())
    }
}

// Contextos de Instrucción
#[derive(Accounts)]
#[instruction(amount: u64, tracking_id: String, timelock_seconds: i64)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: El vendedor es una cuenta externa
    pub seller: AccountInfo<'info>,
    /// CHECK: El oráculo es una cuenta externa (Cloudflare Worker)
    pub oracle: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowAccount::LEN,
        seeds = [b"escrow", buyer.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(
        init,
        payer = buyer,
        token::mint = mint,
        token::authority = vault_authority,
        seeds = [b"vault", escrow_account.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: Esta es la autoridad de la PDA
    #[account(
        seeds = [b"vault", escrow_account.key().as_ref()],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    #[account(mut, token::mint = mint, token::authority = buyer)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, token::Token>,
}

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    /// CHECK: El oráculo debe firmar la transacción
    #[account(signer)]
    pub oracle: AccountInfo<'info>,
    #[account(mut, has_one = oracle)]
    pub escrow_account: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    /// CHECK: El vendedor debe firmar la transacción
    #[account(signer)]
    pub seller: AccountInfo<'info>,
    #[account(mut, has_one = seller)]
    pub escrow_account: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    /// CHECK: Esta es la autoridad de la PDA
    pub vault_authority: AccountInfo<'info>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, token::Token>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(signer)]
    pub buyer: AccountInfo<'info>,
    #[account(mut, has_one = buyer)]
    pub escrow_account: Account<'info, EscrowAccount>,
    // ... (cuentas de token y vault necesarias para la devolución)
}

// Cuentas de Datos (Structs)
#[account]
pub struct EscrowAccount {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub oracle: Pubkey,
    pub amount: u64,
    pub tracking_id: String, // ID de seguimiento de la logística
    pub status: EscrowStatus,
    pub timelock_expiry: i64,
}

impl EscrowAccount {
    // Espacio necesario para la cuenta (estimación)
    pub const LEN: usize = 32 + 32 + 32 + 8 + 4 + 100 + 1 + 8; // ~217 bytes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum EscrowStatus {
    AwaitingShipment,
    InTransit,
    Delivered,
    Disputed,
    Cancelled,
}

// Errores Personalizados
#[error_code]
pub enum ErrorCode {
    #[msg("El oráculo que intenta confirmar la entrega no está autorizado para este Escrow.")]
    UnauthorizedOracle,
    #[msg("Los fondos no pueden ser liberados porque el estado no es 'Delivered'.")]
    NotYetDelivered,
    #[msg("El timelock para la cancelación automática aún no ha expirado.")]
    TimelockNotExpired,
    #[msg("El Escrow ya ha sido marcado como entregado.")]
    AlreadyDelivered,
    #[msg("La autoridad de la bóveda (vault) no es válida.")]
    InvalidVaultAuthority,
}
