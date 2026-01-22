
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MILHOJAS_LOGO_BASE64 } from '../constants';
import { User } from '../types';

interface LoginPageProps {
  loginBgUrl: string | null;
  logoUrl: string | null;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ loginBgUrl, logoUrl, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(username, password);
    if (!success) setError('Usuario o contraseña incorrectos.');
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundImage: loginBgUrl ? `url(${loginBgUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl relative border border-stone-100">
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl p-4 inline-block mb-4 shadow-sm border border-stone-50">
              <img src={logoUrl || MILHOJAS_LOGO_BASE64} alt="Logo" className="h-28 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 font-display tracking-tight">PEDIDOS A PLANTA</h1>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="relative group">
                <input 
                  type="text" 
                  required 
                  className="w-full px-5 py-4 bg-stone-800 border-2 border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-white font-medium placeholder:text-stone-400 transition-all" 
                  placeholder="Usuario" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                />
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  required 
                  className="w-full px-5 py-4 bg-stone-800 border-2 border-stone-700 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-white font-medium placeholder:text-stone-400 transition-all" 
                  placeholder="Contraseña" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold border border-red-100 animate-pulse">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-4 bg-amber-600 text-white rounded-xl font-black text-lg shadow-lg shadow-amber-200 hover:bg-amber-700 hover:shadow-xl transition-all active:scale-95 disabled:bg-stone-300 disabled:shadow-none mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
      <footer className="py-4 text-center text-[10px] font-bold text-stone-500 bg-white/60 backdrop-blur-sm uppercase tracking-widest border-t border-stone-100">
        © 2025 MILHOJAS VILLA DE LEYVA SAS - Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default LoginPage;
