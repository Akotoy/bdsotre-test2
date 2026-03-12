import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, MapPin, Truck, CreditCard, Shield,
  Phone, Mail, User, CheckCircle2, Package, ChevronDown
} from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { motion, AnimatePresence } from 'motion/react';

const STEPS = ['Контакты', 'Доставка', 'Оплата'] as const;

export default function Checkout() {
  const { items, clearCart, discountPercent } = useCartStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('cdek');
  const [addrCity, setAddrCity] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrApt, setAddrApt] = useState('');
  const [cdekPrice, setCdekPrice] = useState<number | null>(null);
  const [cdekLoading, setCdekLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const addToast = useUiStore((s) => s.addToast);

  const fullAddress = [addrCity, addrStreet, addrHouse, addrApt].filter(Boolean).join(', ');

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountPercent ? (totalPrice * discountPercent) / 100 : 0;
  const deliveryCost = deliveryMethod === 'cdek' ? (cdekPrice || 0) : deliveryMethod === 'post' ? 250 : 0;
  const finalPrice = Math.floor(totalPrice - discountAmount + deliveryCost);

  // Calculate CDEK from city
  React.useEffect(() => {
    if (deliveryMethod !== 'cdek' || !addrCity || addrCity.length < 2) {
      setCdekPrice(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCdekLoading(true);
      try {
        const res = await fetch('/api/delivery/cdek/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: addrCity, items }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.price) setCdekPrice(data.price);
        }
      } catch (err) {
        console.error('CDEK error:', err);
      } finally {
        setCdekLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [addrCity, deliveryMethod, items]);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const fd = new FormData(e.currentTarget);
      const customer = {
        name: fd.get('name') as string,
        phone: fd.get('phone') as string,
        email: fd.get('email') as string,
        address: fullAddress || 'Самовывоз',
      };
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer, deliveryMethod, totalAmount: finalPrice, description: 'Оплата заказа', returnUrl: `${window.location.origin}/cabinet` }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.confirmation?.confirmation_url) {
        window.location.href = data.confirmation.confirmation_url;
      } else throw new Error();
    } catch {
      addToast('Ошибка при создании платежа. Попробуйте позже.', 'error');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-4">Корзина пуста</p>
        <Link to="/catalog" className="text-violet-600 font-bold hover:underline">В каталог</Link>
      </div>
    );
  }

  const DELIVERY_OPTIONS = [
    {
      id: 'cdek',
      name: 'СДЭК',
      desc: '2–4 рабочих дня',
      price: cdekLoading ? '...' : cdekPrice ? `${cdekPrice} ₽` : 'Рассчитается',
      icon: Truck,
    },
    {
      id: 'post',
      name: 'Почта России',
      desc: '5–14 дней',
      price: 'от 250 ₽',
      icon: Package,
    },
    {
      id: 'pickup',
      name: 'Самовывоз',
      desc: 'Сегодня',
      price: 'Бесплатно',
      icon: MapPin,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 pt-4 mb-6">
        <Link to="/" className="hover:text-violet-600 transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-violet-600 transition-colors">Корзина</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-900 dark:text-white font-medium">Оформление</span>
      </nav>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <button onClick={() => setActiveStep(i)} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < activeStep ? 'bg-green-500 text-white' : i === activeStep ? 'bg-violet-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                {i < activeStep ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-semibold ${i <= activeStep ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>{step}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px max-w-16 ${i < activeStep ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Form ── */}
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6 lg:col-span-2">

          {/* Contacts — accordion step 0 */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(0)}
              className="w-full flex items-center gap-3 p-6"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep > 0 ? 'bg-green-500 text-white' : 'bg-violet-600 text-white'}`}>
                {activeStep > 0 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <h2 className="text-base font-bold dark:text-white flex-1 text-left">Контактные данные</h2>
              <ChevronDown size={18} className={`text-neutral-400 transition-transform ${activeStep === 0 ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeStep === 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'name', label: 'Имя и Фамилия', placeholder: 'Иван Иванов', icon: User, type: 'text' },
                        { name: 'phone', label: 'Телефон', placeholder: '+7 (999) 000-00-00', icon: Phone, type: 'tel' },
                      ].map(({ name, label, placeholder, icon: Icon, type }) => (
                        <div key={name} className="space-y-1.5">
                          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{label}</label>
                          <div className="relative">
                            <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input required name={name} type={type} placeholder={placeholder}
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-neutral-900 transition-colors text-sm" />
                          </div>
                        </div>
                      ))}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Email (для чека)</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input required name="email" type="email" placeholder="ivan@example.com"
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-neutral-900 transition-colors text-sm" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                    >
                      Далее →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Delivery — accordion step 1 */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: '80px' }}>
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="w-full flex items-center gap-3 p-6"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep > 1 ? 'bg-green-500 text-white' : activeStep === 1 ? 'bg-violet-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                {activeStep > 1 ? <CheckCircle2 size={16} /> : '2'}
              </div>
              <h2 className="text-base font-bold dark:text-white flex-1 text-left">Способ доставки</h2>
              <ChevronDown size={18} className={`text-neutral-400 transition-transform ${activeStep === 1 ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {DELIVERY_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const sel = deliveryMethod === opt.id;
                        return (
                          <label key={opt.id}
                            className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${sel ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-900/10' : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'}`}
                          >
                            <input type="radio" name="delivery" value={opt.id} checked={sel} onChange={e => setDeliveryMethod(e.target.value)} className="sr-only" />
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-xl transition-colors ${sel ? 'bg-violet-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                <Icon size={18} />
                              </div>
                              {sel && (
                                <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-sm dark:text-white">{opt.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{opt.desc}</p>
                            <p className="text-sm font-bold mt-3 text-violet-600 dark:text-violet-400">{opt.price}</p>
                          </label>
                        );
                      })}
                    </div>

                    {deliveryMethod !== 'pickup' && (
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">Адрес доставки</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            required={deliveryMethod !== 'pickup'}
                            value={addrCity}
                            onChange={e => setAddrCity(e.target.value)}
                            placeholder="Город"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors text-sm"
                          />
                          <input
                            required={deliveryMethod !== 'pickup'}
                            value={addrStreet}
                            onChange={e => setAddrStreet(e.target.value)}
                            placeholder="Улица"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors text-sm"
                          />
                          <input
                            required={deliveryMethod !== 'pickup'}
                            value={addrHouse}
                            onChange={e => setAddrHouse(e.target.value)}
                            placeholder="Дом"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors text-sm"
                          />
                          <input
                            value={addrApt}
                            onChange={e => setAddrApt(e.target.value)}
                            placeholder="Квартира (необяз.)"
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors text-sm"
                          />
                        </div>
                        {deliveryMethod === 'cdek' && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {cdekLoading ? '⏳ Рассчитываем стоимость...' : cdekPrice ? `✅ Стоимость доставки: ${cdekPrice} ₽` : 'Введите город для расчёта стоимости'}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                    >
                      Далее →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Payment — accordion step 2 */}
          <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="w-full flex items-center gap-3 p-6"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 2 ? 'bg-violet-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                3
              </div>
              <h2 className="text-base font-bold dark:text-white flex-1 text-left">Оплата</h2>
              <ChevronDown size={18} className={`text-neutral-400 transition-transform ${activeStep === 2 ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <div className="p-2.5 bg-white dark:bg-neutral-900 rounded-xl shadow-sm shrink-0">
                        <Shield size={20} className="text-violet-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm dark:text-white">Безопасная оплата через ЮКassa</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Мы не храним данные карты. Все транзакции защищены.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </form>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl sticky top-24 shadow-sm space-y-5">
            <h2 className="font-bold text-base dark:text-white">Ваш заказ</h2>

            {/* Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.cartItemId || item.id} className="flex gap-3 items-center">
                  <div className="w-14 h-18 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" style={{ height: '4.5rem' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold dark:text-white line-clamp-2 leading-snug">{item.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.quantity} шт.</p>
                  </div>
                  <p className="text-sm font-bold dark:text-white shrink-0">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Товары</span>
                <span className="font-medium dark:text-white">{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                  <span>Скидка</span>
                  <span>−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Доставка</span>
                <span className="font-medium dark:text-white">
                  {deliveryMethod === 'pickup' ? 'Бесплатно' : deliveryCost > 0 ? `${deliveryCost} ₽` : 'По тарифам'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <span className="font-bold dark:text-white">К оплате</span>
              <span className="font-black text-2xl dark:text-white">{finalPrice.toLocaleString('ru-RU')} ₽</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg ${isProcessing ? 'bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed text-white' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Обработка...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard size={18} /> Оплатить
                </span>
              )}
            </motion.button>

            <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
              Нажимая «Оплатить», вы соглашаетесь с <a href="#" className="underline hover:text-violet-600 transition-colors">офертой</a>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
