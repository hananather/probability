'use client';

import { createContext, useContext } from 'react';

export const ActiveProgressContext = createContext(null);
export const useActiveProgress = () => useContext(ActiveProgressContext);
