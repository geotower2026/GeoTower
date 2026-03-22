// src/config/companyLogo.js
//
// Cole aqui a string base64 da sua logo.
// Formato: 'data:image/png;base64,iVBORw0KGgo...'
//
// ─── Como gerar o base64 ───────────────────────────────────────────────────
//  OPÇÃO A (terminal):
//    node -e "const fs=require('fs'); console.log('data:image/png;base64,' + fs.readFileSync('./logo.png').toString('base64'));"
//
//  OPÇÃO B (browser — arrasta a imagem aqui):
//    Abra o console do navegador e cole:
//    const toB64 = (file) => new Promise(r => { const fr = new FileReader(); fr.onload = e => r(e.target.result); fr.readAsDataURL(file); });
//    // depois: const b64 = await toB64(file); console.log(b64);
//
//  OPÇÃO C (online — sem instalar nada):
//    Acesse https://www.base64-image.de/ e arraste sua logo PNG/JPG/SVG
//    Copie a string gerada (começa com data:image/...)
//
// ──────────────────────────────────────────────────────────────────────────

export const COMPANY_LOGO_BASE64 = '';   // ← cole aqui

export const COMPANY_NAME        = 'Sua Empresa Ltda.';
export const COMPANY_SLOGAN      = 'Logística & Transporte';
export const COMPANY_CNPJ        = '00.000.000/0001-00';

// Dimensões no PDF (em pontos pt — 1 pt ≈ 0.352 mm)
// Ajuste logo_w / logo_h para não distorcer a imagem.
// Regra rápida: se sua logo é 400x100px → ratio = 4:1 → use 120x30 (pt)
export const LOGO_PDF = {
  w : 110,   // largura em pt
  h :  36,   // altura em pt
};
