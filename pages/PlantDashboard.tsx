
import React, { useState } from 'react';
import { Order, OrderStatus, Product } from '../types';
import { ChevronRightIcon, PrinterIcon } from '../components/icons';

interface PlantDashboardProps {
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  products: Product[];
}

const statusConfig: Record<OrderStatus, { color: string; nextStatus?: OrderStatus; actionText?: string }> = {
    [OrderStatus.PENDING]: { color: 'bg-blue-100 text-blue-800', nextStatus: OrderStatus.DISPATCHED, actionText: 'Despachar' },
    [OrderStatus.DISPATCHED]: { color: 'bg-green-100 text-green-800' },
    [OrderStatus.RECEIVED]: { color: 'bg-stone-200 text-stone-600' },
    [OrderStatus.ISSUE]: { color: 'bg-red-100 text-red-800' },
};

const OrderCard: React.FC<{ order: Order; onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void; products: Product[] }> = ({ order, onUpdateStatus, products }) => {
    const config = statusConfig[order.status];

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Imprimir Pedido</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .total { margin-top: 20px; font-weight: bold; text-align: right; }
                    .novedad { color: red; border: 2px solid red; padding: 10px; margin-top: 20px; }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="header">');
            printWindow.document.write(`<h2>MILHOJAS - Planta de Despacho</h2>`);
            printWindow.document.write(`<p>Destino: <b>${order.storeName}</b></p>`);
            printWindow.document.write(`<p>Fecha Pedido: ${new Date(order.createdAt).toLocaleString()}</p>`);
            if (order.dispatchedAt) printWindow.document.write(`<p>Fecha Despacho: ${new Date(order.dispatchedAt).toLocaleString()}</p>`);
            if (order.receivedAt) printWindow.document.write(`<p>Fecha Recepción: ${new Date(order.receivedAt).toLocaleString()}</p>`);
            printWindow.document.write('</div>');
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                printWindow.document.write(`<div class="item"><span>${product?.name}</span><b>x${item.quantity}</b></div>`);
            });
            if (order.novedades) {
                printWindow.document.write(`<div class="novedad"><b>NOVEDAD REPORTADA:</b><br/>${order.novedades}</div>`);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-black text-stone-800 uppercase tracking-tighter text-lg">{order.storeName}</h3>
                        <div className="flex flex-col text-[9px] text-stone-400 font-bold space-y-0.5 mt-0.5">
                          <span>SOLICITADO: {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {order.dispatchedAt && (
                            <span className="text-green-600 uppercase bg-green-50 px-1 rounded w-fit">DESPACHADO: {new Date(order.dispatchedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                          {order.receivedAt && (
                            <span className="text-amber-600 uppercase bg-amber-50 px-1 rounded w-fit">RECIBIDO: {new Date(order.receivedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${config.color}`}>
                        {order.status}
                    </span>
                </div>
                {order.novedades && (
                  <div className="mb-3 p-3 bg-red-50 border-2 border-red-100 rounded-xl">
                    <span className="block text-[8px] font-black text-red-500 uppercase tracking-widest mb-0.5">Novedad de Tienda:</span>
                    <p className="text-[11px] font-bold text-red-800 line-clamp-2">{order.novedades}</p>
                  </div>
                )}
                <div className="bg-stone-50 rounded-xl p-3 space-y-2">
                    {order.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                            <div key={item.productId} className="flex justify-between text-sm">
                                <span className="text-stone-600 font-medium">{product?.name || 'Producto'}</span>
                                <span className="font-black text-stone-900">x{item.quantity}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex space-x-2">
                {config.nextStatus && (
                    <button
                        onClick={() => onUpdateStatus(order.id, config.nextStatus!)}
                        className="flex-grow flex justify-center items-center space-x-2 text-xs font-black py-3 px-4 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg shadow-amber-100"
                    >
                        <span>{config.actionText}</span>
                        <ChevronRightIcon className="h-4 w-4"/>
                    </button>
                )}
                <button
                    onClick={handlePrint}
                    className="p-3 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                >
                    <PrinterIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const PlantDashboard: React.FC<PlantDashboardProps> = ({ orders, updateOrderStatus, products }) => {
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const historyOrders = orders.filter(o => [OrderStatus.DISPATCHED, OrderStatus.RECEIVED, OrderStatus.ISSUE].includes(o.status))
                                    .sort((a, b) => new Date(b.dispatchedAt || b.createdAt).getTime() - new Date(a.dispatchedAt || a.createdAt).getTime());

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-stone-800 font-display">Pedidos en Planta</h1>
                  <p className="text-stone-500 font-medium italic">Gestiona los despachos del día en tiempo real.</p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-6 py-3 bg-stone-800 text-white rounded-2xl hover:bg-stone-900 font-bold transition-all shadow-xl shadow-stone-200 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Historial de Despachos</span>
                </button>
            </div>
            
            <div className="bg-stone-200/40 rounded-3xl p-6 min-h-[400px] border border-stone-200/50">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-700 font-display flex items-center">
                    Pendientes de Despacho
                    <span className="ml-3 bg-amber-600 text-white text-xs px-2.5 py-1 rounded-full font-black">{pendingOrders.length}</span>
                  </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingOrders.length > 0 ? (
                      pendingOrders.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(order => (
                          <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} products={products} />
                      ))
                  ) : (
                      <div className="col-span-full py-20 text-center bg-white/50 rounded-2xl border-2 border-dashed border-stone-200">
                        <div className="text-stone-300 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Todos los pedidos están al día</p>
                      </div>
                  )}
              </div>
            </div>

            {showHistoryModal && (
              <div className="fixed inset-0 bg-stone-900/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl flex flex-col h-[85vh] overflow-hidden border border-white/20 animate-scaleIn">
                  <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <div>
                      <h2 className="text-3xl font-bold text-stone-800 font-display">Histórico de Despacho</h2>
                      <p className="text-stone-400 text-sm font-medium">Registro detallado y feedback de tiendas</p>
                    </div>
                    <button onClick={() => setShowHistoryModal(false)} className="p-2 bg-stone-100 text-stone-400 hover:text-stone-800 rounded-xl transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  
                  <div className="p-8 flex-grow overflow-y-auto bg-white">
                    {historyOrders.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historyOrders.map(order => (
                          <div key={order.id} className="relative group">
                            {order.status === OrderStatus.ISSUE && (
                              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg z-10 shadow-lg animate-pulse">NOVEDAD</div>
                            )}
                            {order.status === OrderStatus.RECEIVED && (
                              <div className="absolute -top-2 -right-2 bg-stone-600 text-white text-[8px] font-black px-2 py-1 rounded-lg z-10 shadow-lg">FINALIZADO</div>
                            )}
                            <OrderCard order={order} onUpdateStatus={updateOrderStatus} products={products} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center h-full opacity-30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p className="text-xl font-bold text-stone-400">Sin registros de despacho</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default PlantDashboard;
