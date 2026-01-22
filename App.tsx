
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PlantDashboard from './pages/PlantDashboard';
import StoreDashboard from './pages/StoreDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import { UserRole, Order, OrderStatus, User, Product } from './types';
import { supabase } from './lib/supabaseClient';

const Footer: React.FC = () => (
  <footer className="w-full py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-600 bg-white/70 backdrop-blur-sm">
    © 2025 MILHOJAS VILLA DE LEYVA SAS - Todos los derechos reservados.
  </footer>
);

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loginBgUrl, setLoginBgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [prodsRes, usersRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('settings').select('*')
      ]);

      if (prodsRes.data) setProducts(prodsRes.data.map(p => ({ id: p.id, name: p.name, imageUrl: p.image_url })));
      if (usersRes.data) setUsers(usersRes.data as User[]);
      
      if (settingsRes.data) {
        const logo = settingsRes.data.find(s => s.key === 'logo')?.value;
        const bg = settingsRes.data.find(s => s.key === 'bg')?.value;
        if (logo) setLogoUrl(logo);
        if (bg) setLoginBgUrl(bg);
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          store_id,
          status,
          created_at,
          dispatched_at,
          received_at,
          novedades,
          profiles(name),
          order_items(product_id, quantity)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      if (ordersData) {
        setOrders((ordersData as any[]).map((o: any) => ({
          id: o.id,
          storeId: o.store_id,
          storeName: o.profiles?.name || 'Tienda',
          status: o.status as OrderStatus,
          createdAt: o.created_at,
          dispatchedAt: o.dispatched_at,
          receivedAt: o.received_at,
          novedades: o.novedades,
          items: (o.order_items || []).map((i: any) => ({
            productId: i.product_id,
            quantity: i.quantity
          }))
        })));
      }
    } catch (error) {
      console.error('Error sincronizando datos:', error);
      setNotification({ message: 'Error de sincronización con servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const ordersSubscription = supabase
      .channel('public:orders_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchAllData())
      .subscribe();
    return () => { supabase.removeChannel(ordersSubscription); };
  }, [fetchAllData]);

  const addOrder = async (newOrder: Order) => {
    try {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          store_id: user?.id,
          status: OrderStatus.PENDING,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = newOrder.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      setNotification({ message: '¡Pedido enviado con éxito!', type: 'success' });
      await fetchAllData();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      setNotification({ message: 'No se pudo enviar el pedido', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === OrderStatus.DISPATCHED) {
        updateData.dispatched_at = new Date().toISOString();
      }
      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) throw error;
      setNotification({ message: `Estado actualizado a ${newStatus}`, type: 'info' });
      await fetchAllData();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setNotification({ message: 'Error al cambiar estado', type: 'error' });
    }
  };

  const confirmOrderArrival = async (orderId: string, status: OrderStatus, novedades?: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          novedades: novedades || null,
          received_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      setNotification({ message: 'Recepción confirmada con éxito', type: 'success' });
      await fetchAllData();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al confirmar recepción:', error);
      setNotification({ message: 'Error al confirmar recepción', type: 'error' });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setNotification({ message: 'Pedido eliminado correctamente', type: 'info' });
      await fetchAllData();
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setNotification({ message: 'No se pudo eliminar el pedido', type: 'error' });
    }
  };

  const updateSettings = async (key: string, value: string) => {
    try {
      const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      if (key === 'logo') setLogoUrl(value);
      if (key === 'bg') setLoginBgUrl(value);
      setNotification({ message: 'Apariencia actualizada', type: 'success' });
      setTimeout(() => setNotification(null), 2000);
    } catch (error) { console.error('Error en settings:', error); }
  };

  const handleSaveUser = async (userData: User) => {
    try {
      const isNew = userData.id.startsWith('user-');
      const { error } = await supabase.from('profiles').upsert({ id: isNew ? undefined : userData.id, username: userData.username, password: userData.password, name: userData.name, role: userData.role });
      if (error) throw error;
      fetchAllData();
    } catch (error) { console.error('Error guardando usuario:', error); }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      const isNew = productData.id.startsWith('prod-');
      const { error } = await supabase.from('products').upsert({ id: isNew ? undefined : productData.id, name: productData.name, image_url: productData.imageUrl });
      if (error) throw error;
      fetchAllData();
    } catch (error) { console.error('Error guardando producto:', error); }
  };

  if (loading && !user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
      <p className="text-stone-600 font-medium font-display uppercase tracking-widest text-xs">Cargando Planta...</p>
    </div>
  );

  if (!user) return <LoginPage logoUrl={logoUrl} loginBgUrl={loginBgUrl} users={users} />;
  
  return (
    <div className="min-h-screen bg-stone-50/90 flex flex-col relative overflow-x-hidden">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className={`${notification.type === 'success' ? 'bg-amber-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center space-x-3 border-2 border-white/20 backdrop-blur-md`}>
            <span className="font-black text-sm uppercase tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}
      <Header user={user} logout={logout} logoUrl={logoUrl} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        {user.role === UserRole.PLANT && <PlantDashboard orders={orders} updateOrderStatus={updateOrderStatus} products={products} />}
        {user.role === UserRole.STORE && <StoreDashboard currentUser={user} orders={orders.filter(o => o.storeId === user.id)} addOrder={addOrder} deleteOrder={deleteOrder} products={products} confirmArrival={confirmOrderArrival} />}
        {user.role === UserRole.ADMIN && (
          <AdminDashboard users={users} products={products} onUpdateSetting={updateSettings} onSaveUser={handleSaveUser} onSaveProduct={handleSaveProduct} />
        )}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
