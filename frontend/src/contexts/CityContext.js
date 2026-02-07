import React, { createContext, useContext, useEffect, useState } from 'react';
import manaConfig from '../config/cities/manaus.json';
import itajaiConfig from '../config/cities/itajai.json';

const CityContext = createContext();

export function CityProvider({ children }) {
  const [city, setCity] = useState(() => localStorage.getItem('city') || null);

  useEffect(() => {
    if (city) localStorage.setItem('city', city);
    else localStorage.removeItem('city');
  }, [city]);

  const config = city === 'itajai' ? itajaiConfig : manaConfig;

  return (
    <CityContext.Provider value={{ city, setCity, config }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}

export default CityContext;
