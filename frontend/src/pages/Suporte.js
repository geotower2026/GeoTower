import React from 'react';

const Suporte = () => (
  <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
    <h1 className="text-2xl font-bold mb-4">Suporte — Sistema GeoLog</h1>
    <p>Bem-vindo à Central de Suporte do Sistema GeoLog.</p>
    <p>Nossa equipe está disponível para auxiliar usuários Administradores, Contratados e Motoristas em dúvidas, dificuldades técnicas ou orientações relacionadas ao uso da plataforma.</p>
    <hr className="my-4" />
    <h2 className="text-xl font-bold mt-6 mb-2">📌 Canais Oficiais de Atendimento</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>📱 <b>WhatsApp (Suporte Operacional):</b> <a href="https://wa.me/5592992938603" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">(92) 99293-8603</a></li>
      <li>📧 <b>E-mail de Suporte Técnico:</b> <a href="mailto:suportegeolog@outlook.com" className="text-blue-600 underline">suportegeolog@outlook.com</a></li>
    </ul>
    <h2 className="text-xl font-bold mt-6 mb-2">🧾 Antes de entrar em contato</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>Nome de usuário</li>
      <li>Perfil de acesso (Administrador, Contratado ou Motorista)</li>
      <li>Descrição detalhada do problema</li>
      <li>Prints da tela, se possível</li>
    </ul>
    <h2 className="text-xl font-bold mt-6 mb-2">🕐 Horário de Atendimento</h2>
    <p>Segunda a Sexta-feira<br/>08:00 às 18:00 (Horário de Brasília)</p>
    <p>Solicitações enviadas fora do horário serão respondidas no próximo período útil.</p>
    <h2 className="text-xl font-bold mt-6 mb-2">🔒 Orientações de Segurança</h2>
    <ul className="list-disc ml-6 mb-2">
      <li>Nunca compartilhe sua senha com terceiros.</li>
      <li>O suporte oficial do Sistema GeoLog não solicita códigos ou dados sensíveis fora dos canais oficiais.</li>
      <li>Problemas relacionados à conexão de internet ou configuração do dispositivo podem afetar o funcionamento da plataforma.</li>
    </ul>
    <h2 className="text-xl font-bold mt-6 mb-2">⚙️ Sobre o Sistema GeoLog</h2>
    <p>O Sistema GeoLog é uma plataforma de gestão inteligente de entregas, desenvolvida para facilitar o controle logístico, acompanhamento operacional e administração de usuários em diferentes níveis de acesso.</p>
    <hr className="my-4" />
    <p className="mt-6 font-semibold">Sistema GeoLog — Gestão Inteligente de Entregas</p>
  </div>
);

export default Suporte;
