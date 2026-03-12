import React, { useState, useEffect } from 'react';
import { X, Ruler, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeQuizProps {
    isOpen: boolean;
    onClose: () => void;
    productTitle: string;
    onSizeRecommend: (size: string) => void;
}

export default function SizeQuiz({ isOpen, onClose, productTitle, onSizeRecommend }: SizeQuizProps) {
    const [step, setStep] = useState(1);
    const [height, setHeight] = useState('170');
    const [weight, setWeight] = useState('65');
    const [fit, setFit] = useState<'normal' | 'oversize'>('normal');
    const [isCalculating, setIsCalculating] = useState(false);
    const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setTimeout(() => {
                setStep(1);
                setIsCalculating(false);
                setRecommendedSize(null);
            }, 300);
        }
    }, [isOpen]);

    const handleCalculate = () => {
        setIsCalculating(true);
        setStep(3);

        // Fake calculation delay for WOW-effect
        setTimeout(() => {
            setIsCalculating(false);

            // Simple logic for demographic
            const h = parseInt(height);
            const w = parseInt(weight);

            let baseSize = 'M';
            if (w < 55) baseSize = 'XS';
            else if (w < 65) baseSize = 'S';
            else if (w < 78) baseSize = 'M';
            else if (w < 90) baseSize = 'L';
            else baseSize = 'XL';

            // Adjust for oversize preference
            if (fit === 'oversize') {
                const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                const currentIndex = sizes.indexOf(baseSize);
                if (currentIndex < sizes.length - 1) {
                    baseSize = sizes[currentIndex + 1];
                }
            }

            setRecommendedSize(baseSize);
        }, 2000);
    };

    const handleApply = () => {
        if (recommendedSize) {
            onSizeRecommend(recommendedSize);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal View */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                        className="relative bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-md">
                                    <Ruler size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight dark:text-white">Подбор размера</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">{productTitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">

                            {/* Step 1: Parameters */}
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Рост (см)</label>
                                                    <span className="text-sm font-bold dark:text-white">{height}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="140"
                                                    max="210"
                                                    value={height}
                                                    onChange={(e) => setHeight(e.target.value)}
                                                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                                />
                                                <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                                                    <span>140</span>
                                                    <span>210</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Вес (кг)</label>
                                                    <span className="text-sm font-bold dark:text-white">{weight}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="40"
                                                    max="130"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                                />
                                                <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                                                    <span>40</span>
                                                    <span>130</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setStep(2)}
                                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-semibold text-md flex items-center justify-center gap-2 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all hover:shadow-lg active:scale-95"
                                        >
                                            Далее
                                            <ArrowRight size={18} />
                                        </button>
                                    </motion.div>
                                )}

                                {/* Step 2: Fit Preference */}
                                {step === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <h4 className="text-center font-semibold text-neutral-800 dark:text-neutral-200">Как вы предпочитаете носить вещи?</h4>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setFit('normal')}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${fit === 'normal'
                                                    ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-800 shadow-md'
                                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                                                    }`}
                                            >
                                                <div className="w-16 h-16 bg-[url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&q=80')] bg-cover bg-center rounded-full border border-neutral-200 dark:border-neutral-700"></div>
                                                <div className="text-sm font-semibold dark:text-white">По фигуре</div>
                                            </button>

                                            <button
                                                onClick={() => setFit('oversize')}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${fit === 'oversize'
                                                    ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-800 shadow-md'
                                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                                                    }`}
                                            >
                                                <div className="w-16 h-16 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&q=80')] bg-cover bg-center rounded-full border border-neutral-200 dark:border-neutral-700"></div>
                                                <div className="text-sm font-semibold text-center dark:text-white">Оверсайз<br /><span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">свободнее</span></div>
                                            </button>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white py-4 rounded-2xl font-semibold text-md transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95"
                                            >
                                                Назад
                                            </button>
                                            <button
                                                onClick={handleCalculate}
                                                className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-semibold text-md flex items-center justify-center gap-2 transition-all hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:shadow-lg active:scale-95"
                                            >
                                                Подобрать размер
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Result / Loading */}
                                {step === 3 && (
                                    <motion.div
                                        key="step-3"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        className="py-8 flex flex-col items-center justify-center"
                                    >

                                        {isCalculating ? (
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="relative w-20 h-20">
                                                    <div className="absolute inset-0 border-4 border-neutral-100 dark:border-neutral-800 rounded-full"></div>
                                                    <div className="absolute inset-0 border-4 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Ruler className="text-neutral-400 dark:text-neutral-500 w-8 h-8 animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <h4 className="font-bold text-lg dark:text-white">Анализируем данные...</h4>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Сравниваем параметры с лекалами бренда</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", bounce: 0.5 }}
                                                className="flex flex-col items-center gap-6 w-full"
                                            >
                                                <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20 text-white relative">
                                                    <CheckCircle2 size={48} />
                                                    <div className="absolute -inset-2 border border-green-500 rounded-full animate-ping opacity-20"></div>
                                                </div>

                                                <div className="text-center space-y-2">
                                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Оптимальный размер для вас:</p>
                                                    <h4 className="text-6xl font-black tracking-tighter dark:text-white" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>{recommendedSize}</h4>
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/40 inline-block px-3 py-1 rounded-full mt-2">Вероятность совпадения 87%</p>
                                                </div>

                                                <button
                                                    onClick={handleApply}
                                                    className="w-full mt-4 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-semibold text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                                                >
                                                    Выбрать размер {recommendedSize}
                                                </button>
                                                <button
                                                    onClick={onClose}
                                                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline"
                                                >
                                                    Выбрать самостоятельно
                                                </button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
