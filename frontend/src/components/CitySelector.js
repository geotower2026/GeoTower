import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCity } from '../contexts/CityContext';

export default function CitySelector() {
  const { setCity } = useCity();
  const navigate = useNavigate();

  const choose = (c) => {
    setCity(c);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Escolha a cidade</h2>
        <div className="flex gap-4">
          <button onClick={() => choose('manaus')} className="flex-1 py-3 bg-purple-600 text-white rounded">Manaus</button>
          <button onClick={() => choose('itajai')} className="flex-1 py-3 bg-blue-600 text-white rounded">Itajaí</button>
        </div>
        <p className="mt-4 text-sm text-gray-500">Você pode trocar a cidade depois em configurações.</p>
      </div>
    </div>
  );
}
