
import React, { useState, useEffect } from 'react';
import { User, Product, UserRole } from '../types';
import { SQL_SETUP_SCRIPT } from '../lib/supabaseClient';

interface AdminDashboardProps {
  users: User[];
  products: Product[];
  onUpdateSetting: (key: string, value: string) => Promise<void>;
  onSaveUser: (user: User) => void;
  onSaveProduct: (product: Product) => void;
}

const initialUserFormState = { username: '', name: '', password: '', confirmPassword: '', role: UserRole.STORE };
const initialProductFormState = { name: '', imageUrl: '' };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  products, 
  onUpdateSetting, 
  onSaveUser,
  onSaveProduct
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'config' | 'setup'>('users');
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<any>(initialUserFormState);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<any>(initialProductFormState);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userFormData.password !== userFormData.confirmPassword) {
      alert("⚠️ Error: Las contraseñas no coinciden. Por favor, verifíquelas.");
      return;
    }

    setIsSaving(true);
    try {
      const finalUser = {
        ...userFormData,
        id: editingUser?.id || `user-${Date.now()}`
      };
      // No enviamos confirmPassword a la base de datos
      const { confirmPassword, ...userDataToSave } = finalUser;
      onSaveUser(userDataToSave);
      setUserModalOpen(false);
      setShowPassword(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalProduct = {
        ...productFormData,
        imageUrl: productImagePreview || productFormData.imageUrl,
        id: editingProduct?.id || `prod-${Date.now()}`
      };
      onSaveProduct(finalProduct);
      setProductModalOpen(false);
      setProductImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Error al guardar producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SQL_FIX_COLUMNS = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS novedades TEXT;`;

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-stone-800 font-display">Administración</h1>
      </div>
      
      <div className="border-b border-stone-200 mb-6 flex space-x-8 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('users')} className={`py-4 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Usuarios</button>
        <button onClick={() => setActiveTab('products')} className={`py-4 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'products' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Productos</button>
        <button onClick={() => setActiveTab('config')} className={`py-4 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'config' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>Apariencia</button>
        <button onClick={() => setActiveTab('setup')} className={`py-4 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'setup' ? 'border-blue-500 text-blue-600' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>⚙️ Montaje y Errores</button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-stone-100">
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-700 font-display">Gestión de Usuarios</h2>
              <button onClick={() => { setEditingUser(null); setUserFormData(initialUserFormState); setShowPassword(false); setUserModalOpen(true); }} className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-lg shadow-amber-100 transition-all">Añadir Usuario</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(user => (
                <div key={user.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-stone-800">{user.name}</p>
                    <p className="text-xs text-stone-400 font-medium">@{user.username} • <span className="uppercase text-amber-600">{user.role}</span></p>
                  </div>
                  <button onClick={() => { setEditingUser(user); setUserFormData({username: user.username, name: user.name, role: user.role, password: user.password, confirmPassword: user.password}); setShowPassword(false); setUserModalOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
           <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-700 font-display">Catálogo de Productos</h2>
              <button onClick={() => { setEditingProduct(null); setProductFormData(initialProductFormState); setProductImagePreview(null); setProductModalOpen(true); }} className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold shadow-lg shadow-amber-100 transition-all">Nuevo Producto</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map(product => (
                <div key={product.id} className="group relative bg-stone-50 rounded-2xl p-3 border border-stone-100 text-center">
                  <img src={product.imageUrl} alt={product.name} className="h-24 w-full rounded-xl object-cover mb-2 grayscale group-hover:grayscale-0 transition-all"/>
                  <p className="text-xs font-bold text-stone-800 line-clamp-1">{product.name}</p>
                  <button onClick={() => { 
                    setEditingProduct(product); 
                    setProductFormData(product); 
                    setProductImagePreview(product.imageUrl);
                    setProductModalOpen(true); 
                  }} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-lg shadow-sm text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'config' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-stone-700 font-display">Logo de la Empresa</h2>
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl text-center bg-stone-50/50">
                  {logoPreview ? (
                    <img src={logoPreview} className="h-32 mx-auto mb-4 object-contain" alt="Preview" />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-stone-300">No hay imagen</div>
                  )}
                  <input type="file" id="logo-upload" accept="image/*" onChange={(e) => handleFileChange(e, setLogoPreview)} className="hidden" />
                  <label htmlFor="logo-upload" className="cursor-pointer inline-block px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors">Seleccionar Imagen</label>
                </div>
                <button 
                  onClick={() => logoPreview && onUpdateSetting('logo', logoPreview)} 
                  disabled={!logoPreview}
                  className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-900 disabled:bg-stone-200 transition-all"
                >
                  Guardar Logo
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-stone-700 font-display">Fondo de Pantalla (Login)</h2>
                <div className="p-8 border-2 border-dashed border-stone-200 rounded-3xl text-center bg-stone-50/50">
                   {bgPreview ? (
                    <img src={bgPreview} className="h-32 mx-auto mb-4 object-cover w-full rounded-xl" alt="Preview" />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-stone-300">No hay imagen</div>
                  )}
                  <input type="file" id="bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, setBgPreview)} className="hidden" />
                  <label htmlFor="bg-upload" className="cursor-pointer inline-block px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors">Seleccionar Fondo</label>
                </div>
                <button 
                  onClick={() => bgPreview && onUpdateSetting('bg', bgPreview)} 
                  disabled={!bgPreview}
                  className="w-full py-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-900 disabled:bg-stone-200 transition-all"
                >
                  Guardar Fondo
                </button>
              </div>
            </div>
        )}

        {activeTab === 'setup' && (
          <div className="animate-fadeIn space-y-8">
            <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem]">
              <h2 className="text-2xl font-bold text-red-900 mb-4 font-display">⚠️ ¿Ves el error "column received_at does not exist"?</h2>
              <p className="text-sm text-red-700 mb-6 font-medium">Copia este código, ve a tu <b>SQL Editor</b> en Supabase y ejecútalo para solucionar el problema de sincronización:</p>
              <div className="relative group">
                 <button 
                  onClick={() => copyToClipboard(SQL_FIX_COLUMNS)}
                  className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black shadow-lg hover:bg-red-700 transition-all"
                >
                  {copied ? '¡Copiado!' : 'Copiar Parche'}
                </button>
                <pre className="bg-stone-900 text-red-100 p-6 rounded-2xl text-xs font-mono overflow-x-auto border-2 border-red-200/20">
                  {SQL_FIX_COLUMNS}
                </pre>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem]">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 font-display">🚀 Guía de Implementación Completa</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-blue-800 flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                    Base de Datos (Supabase)
                  </h3>
                  <ul className="space-y-3 text-sm text-stone-600 ml-11">
                    <li>• Crea cuenta en <a href="https://supabase.com" target="_blank" className="text-blue-600 font-bold underline">Supabase.com</a>.</li>
                    <li>• Crea un proyecto "Panaderia Planta".</li>
                    <li>• Ve al <b>SQL Editor</b>, pega el script de abajo y dale a <b>Run</b>.</li>
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-blue-800 flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                    Enlace de Datos
                  </h3>
                  <ul className="space-y-3 text-sm text-stone-600 ml-11">
                    <li>• Copia la <i>URL</i> y <i>Anon Key</i> de tu proyecto.</li>
                    <li>• Pégalas en el archivo <code>env.ts</code> del código.</li>
                    <li>• Despliega en Vercel o Netlify.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => copyToClipboard(SQL_SETUP_SCRIPT)}
                  className={`px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white text-stone-800 hover:bg-stone-100 border border-stone-200'}`}
                >
                  {copied ? '¡Copiado!' : 'Copiar Script Completo'}
                </button>
              </div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-1">Script de Configuración de Base de Datos</label>
              <div className="bg-stone-900 rounded-3xl p-1 shadow-2xl">
                <pre className="text-amber-100/70 p-8 overflow-x-auto text-[11px] font-mono leading-relaxed max-h-[400px] scrollbar-thin scrollbar-thumb-stone-700">
                  {SQL_SETUP_SCRIPT}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Usuarios */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 transform transition-all animate-scaleIn border border-stone-100">
            <h3 className="text-2xl font-bold font-display text-stone-800 mb-6">{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Nombre Completo</label>
                <input required type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-black"/>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Nombre de Usuario (Login)</label>
                <input required type="text" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-black"/>
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-black pr-12"/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-amber-600 transition-colors">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={userFormData.confirmPassword} onChange={e => setUserFormData({...userFormData, confirmPassword: e.target.value})} className={`w-full px-5 py-3 bg-stone-50 border rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none font-bold text-black pr-12 ${userFormData.confirmPassword && userFormData.password !== userFormData.confirmPassword ? 'border-red-500 ring-2 ring-red-500/10' : 'border-stone-200'}`}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-amber-600 transition-colors">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {userFormData.confirmPassword && userFormData.password !== userFormData.confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 animate-pulse">Las contraseñas no coinciden</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Rol en la Empresa</label>
                <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-black">
                  <option value={UserRole.STORE}>Punto de Venta (Tienda)</option>
                  <option value={UserRole.PLANT}>Planta de Producción</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={isSaving} className="flex-grow py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg hover:bg-amber-700 transition-all">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button>
                <button type="button" onClick={() => { setUserModalOpen(false); setShowPassword(false); }} className="px-6 py-4 bg-stone-100 text-stone-500 rounded-2xl font-bold hover:bg-stone-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Productos */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 transform transition-all animate-scaleIn border border-stone-100">
            <h3 className="text-2xl font-bold font-display text-stone-800 mb-6">{editingProduct ? 'Editar Producto' : 'Añadir Producto'}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Nombre del Producto</label>
                <input required type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-black"/>
              </div>
              
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Imagen del Producto</label>
                <div className="flex flex-col items-center p-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl space-y-3">
                  {productImagePreview || productFormData.imageUrl ? (
                    <img src={productImagePreview || productFormData.imageUrl} className="h-32 w-full object-cover rounded-xl shadow-sm" alt="Preview" />
                  ) : (
                    <div className="h-32 w-full bg-stone-100 flex items-center justify-center rounded-xl text-stone-300">Sin imagen</div>
                  )}
                  <div className="flex w-full space-x-2">
                    <input type="file" id="product-img-upload" accept="image/*" onChange={(e) => handleFileChange(e, setProductImagePreview)} className="hidden" />
                    <label htmlFor="product-img-upload" className="flex-grow cursor-pointer text-center px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors uppercase tracking-tight">Elegir Archivo</label>
                    {(productImagePreview || productFormData.imageUrl) && (
                      <button type="button" onClick={() => { setProductImagePreview(null); setProductFormData({...productFormData, imageUrl: ''}); }} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[10px] font-black text-stone-300 uppercase">URL</span>
                  </div>
                  <input type="text" value={productFormData.imageUrl} onChange={e => { setProductFormData({...productFormData, imageUrl: e.target.value}); setProductImagePreview(null); }} placeholder="O pega enlace directo aquí..." className="w-full pl-12 pr-5 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-xs font-bold text-black italic"/>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={isSaving} className="flex-grow py-4 bg-amber-600 text-white rounded-2xl font-black shadow-lg hover:bg-amber-700 transition-all">{isSaving ? 'Guardando...' : 'Guardar Producto'}</button>
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-6 py-4 bg-stone-100 text-stone-500 rounded-2xl font-bold hover:bg-stone-200 transition-all">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
