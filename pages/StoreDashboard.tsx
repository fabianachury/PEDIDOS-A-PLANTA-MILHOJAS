
import React, { useState } from 'react';
import { User, Order, OrderStatus, Product, OrderItem } from '../types';
import { PrinterIcon } from '../components/icons';

interface StoreDashboardProps {
  currentUser: User;
  orders: Order[];
  addOrder: (newOrder: Order) => void;
  deleteOrder: (orderId: string) => void;
  products: Product[];
  confirmArrival?: (orderId: string, status: OrderStatus, novedades?: string) => void;
}

const ProductCard: React.FC<{ product: Product; quantity: number; onQuantityChange: (productId: string, quantity: number) => void }> = ({ product, quantity, onQuantityChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-stone-100 overflow-hidden flex flex-col group">
            <div className="relative h-44 overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="p-4 flex flex-col flex-grow bg-white">
                <h3 className="text-base font-bold text-stone-800 leading-tight mb-3 h-10 overflow-hidden line-clamp-2 uppercase tracking-tighter">{product.name}</h3>
                <div className="mt-auto">
                    <label className="block text-[10px] font-black text-stone-400 uppercase mb-1 tracking-widest">Cantidad</label>
                    <input
                        type="number"
                        min="0"
                        value={quantity || ''}
                        placeholder="0"
                        onChange={(e) => onQuantityChange(product.id, parseInt(e.target.value, 10) || 0)}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-black text-stone-800 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-center"
                    />
                </div>
            </div>
        </div>
    );
};

const StoreDashboard: React.FC<StoreDashboardProps> = ({ currentUser, orders, addOrder, deleteOrder, products, confirmArrival }) => {
  const [activeTab, setActiveTab] = useState<'newOrder' | 'myOrders'>('newOrder');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [orderToPreview, setOrderToPreview] = useState<Order | null>(null);
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);
  const [novedadesText, setNovedadesText] = useState('');
  const [confirmWithIssue, setConfirmWithIssue] = useState(false);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart(prevCart => ({ ...prevCart, [productId]: Math.max(0, quantity) }));
  };

  const handleSubmitOrder = async () => {
    const items: OrderItem[] = Object.entries(cart)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }));

    if (items.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      storeId: currentUser.id,
      storeName: currentUser.name,
      items,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    
    await addOrder(newOrder);
    setCart({});
    setConfirmationModalOpen(false);
    setActiveTab('myOrders');
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete);
      setOrderToDelete(null);
    }
  };

  const handleFinalArrivalConfirm = () => {
    if (orderToConfirm && confirmArrival) {
      const status = confirmWithIssue ? OrderStatus.ISSUE : OrderStatus.RECEIVED;
      confirmArrival(orderToConfirm.id, status, confirmWithIssue ? novedadesText : undefined);
      setOrderToConfirm(null);
      setNovedadesText('');
      setConfirmWithIssue(false);
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Imprimir Comprobante de Pedido</title>');
      printWindow.document.write(`
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c1917; }
          .header { border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 25px; }
          .header h2 { margin: 0; color: #d97706; text-transform: uppercase; font-size: 24px; }
          .header p { margin: 5px 0; font-size: 14px; color: #78716c; }
          .order-info { margin-bottom: 20px; font-size: 14px; }
          .order-info b { color: #1c1917; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th { text-align: left; border-bottom: 2px solid #e7e5e4; padding: 10px; font-size: 12px; text-transform: uppercase; color: #a8a29e; }
          .table td { padding: 12px 10px; border-bottom: 1px solid #f5f5f4; font-size: 14px; }
          .quantity { font-weight: 800; text-align: right; }
          .footer { margin-top: 40px; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 11px; color: #a8a29e; text-align: center; }
          .total-row { margin-top: 20px; text-align: right; font-size: 18px; font-weight: 900; }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="header">');
      printWindow.document.write(`<h2>MILHOJAS - Comprobante de Pedido</h2>`);
      printWindow.document.write(`<p>Villa de Leyva - Planta de Producción</p>`);
      printWindow.document.write('</div>');
      
      printWindow.document.write('<div class="order-info">');
      printWindow.document.write(`<p><b>ID PEDIDO:</b> #${order.id.slice(-6).toUpperCase()}</p>`);
      printWindow.document.write(`<p><b>SOLICITANTE:</b> ${order.storeName}</p>`);
      printWindow.document.write(`<p><b>FECHA:</b> ${new Date(order.createdAt).toLocaleString()}</p>`);
      printWindow.document.write(`<p><b>ESTADO:</b> ${order.status.toUpperCase()}</p>`);
      printWindow.document.write('</div>');

      printWindow.document.write('<table class="table">');
      printWindow.document.write('<thead><tr><th>Producto</th><th style="text-align: right">Cantidad</th></tr></thead>');
      printWindow.document.write('<tbody>');
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        printWindow.document.write(`<tr><td>${product?.name || 'Producto'}</td><td class="quantity">x ${item.quantity}</td></tr>`);
      });
      printWindow.document.write('</tbody></table>');

      const totalItems = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
      printWindow.document.write(`<div class="total-row">TOTAL UNIDADES: ${totalItems}</div>`);

      printWindow.document.write('<div class="footer">Este documento es un comprobante interno de solicitud de pedido para la planta de producción Milhojas Villa de Leyva.</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const cartTotalItems: number = (Object.values(cart) as number[]).reduce((sum: number, qty: number) => sum + qty, 0);
  const cartHasItems = cartTotalItems > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 font-display uppercase tracking-tight">Gestión de Pedidos</h1>
          <p className="text-stone-400 font-medium italic">Punto de Venta: {currentUser.name}</p>
        </div>
        
        <div className="inline-flex bg-stone-200/50 p-1 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('newOrder')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'newOrder' ? 'bg-white text-amber-700 shadow-xl' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Nuevo Pedido
          </button>
          <button
            onClick={() => setActiveTab('myOrders')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'myOrders' ? 'bg-white text-amber-700 shadow-xl' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Historial / Estado
          </button>
        </div>
      </div>

      {activeTab === 'newOrder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id] || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-8 rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              
              <h2 className="text-xl font-black text-stone-800 font-display mb-6 flex items-center uppercase tracking-tighter">
                Tu Carrito
                <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-lg">PRODUCCIÓN</span>
              </h2>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {cartHasItems ? (
                  Object.entries(cart).map(([productId, quantity]) => {
                    if (Number(quantity) === 0) return null;
                    const product = products.find(p => p.id === productId);
                    return (
                      <div key={productId} className="flex justify-between items-center animate-slideInRight">
                        <span className="text-sm font-bold text-stone-600">{product?.name}</span>
                        <span className="bg-stone-100 px-3 py-1 rounded-lg font-black text-stone-800 text-xs">x{quantity}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 opacity-20">
                    <p className="text-xs font-black uppercase tracking-widest">Carrito Vacío</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-dashed border-stone-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-stone-400 font-black text-[10px] uppercase tracking-widest">Total Unidades</span>
                  <span className="text-4xl font-black text-amber-600 leading-none">{cartTotalItems}</span>
                </div>
                <button
                  onClick={() => setConfirmationModalOpen(true)}
                  disabled={!cartHasItems}
                  className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-100 hover:bg-amber-700 hover:shadow-2xl transition-all disabled:opacity-20 transform active:scale-95 uppercase tracking-tight"
                >
                  Enviar a Planta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'myOrders' && (
        <div className="animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-100">
                        <thead className="bg-stone-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Pedido</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Solicitado</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Productos</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Despacho</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                                <tr key={order.id} className="hover:bg-amber-50/20 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-stone-800">#{order.id.slice(-4).toUpperCase()}</td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                      <div className="text-sm font-bold text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</div>
                                      <div className="text-[10px] text-stone-400 uppercase font-bold">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                      <div className="max-w-xs text-xs font-medium text-stone-500 line-clamp-1">
                                        {order.items.map(i => `${products.find(p=>p.id === i.productId)?.name} (x${i.quantity})`).join(', ')}
                                      </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                      {order.dispatchedAt ? (
                                        <div className="animate-fadeIn">
                                          <div className="text-sm font-black text-green-600">{new Date(order.dispatchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                          <div className="text-[9px] text-green-500 font-bold uppercase tracking-tighter italic">Ya en camino</div>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-bold text-stone-300 uppercase italic">Esperando planta...</span>
                                      )}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                        <span className={`px-4 py-1.5 inline-flex text-[10px] font-black rounded-lg uppercase tracking-tight shadow-sm border-2 ${
                                          order.status === OrderStatus.PENDING ? 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse' : 
                                          order.status === OrderStatus.RECEIVED ? 'bg-stone-50 text-stone-600 border-stone-200' :
                                          order.status === OrderStatus.ISSUE ? 'bg-red-50 text-red-600 border-red-200' :
                                          'bg-green-50 text-green-700 border-green-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        {order.status === OrderStatus.DISPATCHED && (
                                          <button 
                                            onClick={() => setOrderToConfirm(order)}
                                            className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
                                            title="Confirmar Llegada"
                                          >
                                            Confirmar Llegada
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => setOrderToPreview(order)}
                                          className="p-2 text-stone-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                          title="Ver Detalle"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </button>
                                        {order.status === OrderStatus.PENDING && (
                                          <button 
                                            onClick={() => setOrderToDelete(order.id)}
                                            className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Eliminar Pedido"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="py-32 text-center opacity-20">
                          <p className="font-black uppercase tracking-widest text-sm">No hay pedidos registrados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {orderToConfirm && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 transform transition-all animate-scaleIn border border-white/20">
            <div className="text-center mb-6">
              <div className="bg-amber-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black font-display text-stone-800 uppercase tracking-tight">Confirmar Recepción</h3>
              <p className="text-stone-400 mt-1 text-sm font-medium italic">Pedido #{orderToConfirm.id.slice(-4).toUpperCase()}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setConfirmWithIssue(false)}
                  className={`flex-grow py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${!confirmWithIssue ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-stone-50 text-stone-400 border-stone-200'}`}
                >
                  Todo Correcto
                </button>
                <button 
                  onClick={() => setConfirmWithIssue(true)}
                  className={`flex-grow py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${confirmWithIssue ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-stone-50 text-stone-400 border-stone-200'}`}
                >
                  Con Novedades
                </button>
              </div>

              {confirmWithIssue && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Reportar Novedad / Faltantes</label>
                  <textarea 
                    value={novedadesText}
                    onChange={(e) => setNovedadesText(e.target.value)}
                    placeholder="Describe lo ocurrido (ej: falta una caja, producto dañado...)"
                    className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-medium text-stone-800 text-sm h-32 resize-none"
                  />
                </div>
              )}

              <div className="pt-4 flex flex-col space-y-3">
                <button 
                  onClick={handleFinalArrivalConfirm}
                  className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all transform active:scale-95 uppercase ${confirmWithIssue ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
                >
                  Confirmar Finalización
                </button>
                <button onClick={() => setOrderToConfirm(null)} className="w-full py-2 text-stone-400 hover:text-stone-800 font-bold transition-colors uppercase text-[10px] tracking-widest">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmationModalOpen && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 transform transition-all animate-scaleIn border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-amber-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <h3 className="text-3xl font-black font-display text-stone-800 uppercase tracking-tight">¿Enviar a Planta?</h3>
              <p className="text-stone-400 mt-2 font-medium">Una vez enviado, el equipo de producción comenzará a trabajar en tu pedido inmediatamente.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <button onClick={handleSubmitOrder} className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-amber-700 transition-all transform active:scale-95 uppercase">Confirmar y Enviar</button>
              <button onClick={() => setConfirmationModalOpen(false)} className="w-full py-4 text-stone-400 hover:text-stone-800 font-bold transition-colors uppercase text-xs tracking-widest">Volver a revisar</button>
            </div>
          </div>
        </div>
      )}

      {orderToDelete && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg p-10 transform transition-all animate-scaleIn border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-red-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-3xl font-black font-display text-stone-800 uppercase tracking-tight">¿Eliminar Pedido?</h3>
              <p className="text-stone-400 mt-2 font-medium">Esta acción no se puede deshacer. Se cancelará la solicitud de producción.</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <button onClick={handleConfirmDelete} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-red-700 transition-all transform active:scale-95 uppercase tracking-widest">Eliminar permanentemente</button>
              <button onClick={() => setOrderToDelete(null)} className="w-full py-4 text-stone-400 hover:text-stone-800 font-bold transition-colors uppercase text-xs tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {orderToPreview && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 transform transition-all animate-scaleIn border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Resumen del Pedido</span>
                <h3 className="text-3xl font-black font-display text-stone-800 uppercase tracking-tight mt-1">Pedido #{orderToPreview.id.slice(-4).toUpperCase()}</h3>
                <p className="text-stone-400 text-sm font-medium">{new Date(orderToPreview.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-tight border-2 ${
                  orderToPreview.status === OrderStatus.PENDING ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                  orderToPreview.status === OrderStatus.RECEIVED ? 'bg-stone-50 text-stone-600 border-stone-200' :
                  orderToPreview.status === OrderStatus.ISSUE ? 'bg-red-50 text-red-600 border-red-200' :
                  'bg-green-50 text-green-700 border-green-100'
                }`}>
                  {orderToPreview.status}
                </div>
                <button 
                  onClick={() => handlePrint(orderToPreview)}
                  className="flex items-center space-x-2 text-[10px] font-black uppercase text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-2 rounded-xl transition-all"
                >
                  <PrinterIcon className="h-4 w-4" />
                  <span>Imprimir Pedido</span>
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8">
              {orderToPreview.novedades && (
                <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl mb-4">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Novedades Reportadas</h4>
                  <p className="text-sm font-medium text-red-700">{orderToPreview.novedades}</p>
                </div>
              )}
              {orderToPreview.items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center space-x-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <img src={product?.imageUrl} alt={product?.name} className="h-16 w-16 object-cover rounded-xl shadow-sm"/>
                    <div className="flex-grow">
                      <p className="font-bold text-stone-800 uppercase tracking-tight">{product?.name}</p>
                      <p className="text-xs text-stone-400 font-medium">Referencia: {product?.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-black text-stone-400 uppercase">Cantidad</span>
                      <span className="text-xl font-black text-stone-800">{item.quantity}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-dashed border-stone-200 flex items-center justify-between">
              <div className="text-left">
                <span className="text-stone-400 font-black text-[10px] uppercase tracking-widest block">Total Productos</span>
                <span className="text-2xl font-black text-stone-800">{orderToPreview.items.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
              </div>
              <button onClick={() => setOrderToPreview(null)} className="px-10 py-4 bg-stone-800 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-stone-900 transition-all transform active:scale-95 uppercase">Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
