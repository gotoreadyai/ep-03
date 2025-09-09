// ============================================
// src/pages/auth/index.ts
// GŁÓWNY PLIK AUTH - TYLKO EKSPORTY
// ============================================

// Eksportuj wszystkie moduły auth jako niezależne mikroserwisy
export { LoginModule } from './login';
export { RegisterModule } from './register';
export { ForgotPasswordModule } from './forgot-password';
export { UpdatePasswordModule } from './update-password';