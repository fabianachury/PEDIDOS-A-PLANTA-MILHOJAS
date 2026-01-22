
import React from 'react';
import { User } from '../types';
import { LogOutIcon } from './icons';

interface HeaderProps {
  user: User;
  logout: () => void;
  logoUrl: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, logout, logoUrl }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40 border-b border-amber-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            {logoUrl ? (
              <img className="h-12 sm:h-14 w-auto object-contain" src={logoUrl} alt="Logo" />
            ) : (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-stone-800 font-display leading-tight">MILHOJAS</h1>
                <span className="text-[10px] tracking-widest text-amber-600 font-bold uppercase">Villa de Leyva</span>
              </div>
            )}
            <div className="hidden md:flex items-center px-3 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Planta en Línea</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="text-right flex flex-col justify-center">
              <span className="text-[10px] text-stone-400 font-bold uppercase">Sesión activa</span>
              <span className="text-sm font-bold text-stone-800">{user.name}</span>
            </div>
            <button 
              onClick={logout} 
              className="group flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-stone-50 text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-all border border-stone-100 hover:border-amber-200"
              title="Cerrar Sesión"
            >
              <LogOutIcon className="h-5 w-5 sm:mr-2 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline text-sm font-bold">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
