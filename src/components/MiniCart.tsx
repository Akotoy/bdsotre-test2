import { X, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function MiniCart() {
    const { isCartOpen, closeCart } = useUiStore();
    const { items, updateQuantity, removeItem } = useCartStore();
    const navigate = useNavigate();

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={closeCart}
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl border-l border-white/50 dark:border-white/10 shadow-[-8px_0_30px_rgb(0,0,0,0.1)] dark:shadow-[-8px_0_30px_rgb(0,0,0,0.4)] z-[70] flex flex-col sm:rounded-l-3xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white">Корзина ({items.length})</h2>
                            <button onClick={closeCart} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-neutral-400 dark:hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {items.length === 0 ? (
                                <div className="text-center text-neutral-500 dark:text-neutral-400 mt-20 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                        <Trash2 size={24} className="opacity-50" />
                                    </div>
                                    <p>Корзина пока пуста</p>
                                    <button
                                        onClick={closeCart}
                                        className="mt-6 text-black dark:text-white border border-black dark:border-white rounded-full px-6 py-2 font-medium hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                                    >
                                        К покупкам
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {items.map((item, index) => (
                                        <div key={item.cartItemId || item.id} className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-transparent dark:border-neutral-800 rounded-2xl group animate-in slide-in-from-right fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                                            <img src={item.image_url} alt="" className="w-20 h-24 rounded-lg object-cover bg-white dark:bg-neutral-800" referrerPolicy="no-referrer" />
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-semibold text-sm line-clamp-2 pr-2 dark:text-white">{item.title}</h3>
                                                        <button onClick={() => removeItem(item.cartItemId || item.id)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{item.price.toLocaleString('ru-RU')} ₽</p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-700">
                                                        <button onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:text-black dark:hover:text-white text-neutral-500 dark:text-neutral-400"><Minus size={12} /></button>
                                                        <span className="w-6 text-center text-xs font-semibold dark:text-white">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:text-black dark:hover:text-white text-neutral-500 dark:text-neutral-400"><Plus size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-t border-black/5 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-neutral-500 dark:text-neutral-400">Итого:</span>
                                    <span className="text-2xl font-bold dark:text-white">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                                </div>

                                <button
                                    onClick={() => {
                                        closeCart();
                                        navigate('/checkout');
                                    }}
                                    className="w-full bg-violet-600 text-white py-4 rounded-full font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
                                >
                                    Оформить заказ
                                    <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        closeCart();
                                        navigate('/cart');
                                    }}
                                    className="w-full text-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium py-2 transition-colors"
                                >
                                    Перейти в корзину
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
