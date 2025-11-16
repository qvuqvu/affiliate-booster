import React, { useState, useRef } from 'react';
import type { ProductInput, ToneOption, PlatformOption } from '../types';
import { TONE_OPTIONS, PLATFORM_OPTIONS } from '../types';

interface InputFormProps {
    onSubmit: (products: ProductInput[], tones: ToneOption[], shouldGenerateImage: boolean, platform: PlatformOption, temperature: number) => void;
    isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [products, setProducts] = useState<ProductInput[]>([]);
    const [selectedTones, setSelectedTones] = useState<ToneOption[]>([]);
    const [shouldGenerateImage, setShouldGenerateImage] = useState(false);
    const [platform, setPlatform] = useState<PlatformOption>('Thread (Ngắn)');
    const [temperature, setTemperature] = useState(0.8);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert("CSV không hợp lệ hoặc trống.");
                return;
            }
            // const headers = lines[0].split(',').map(h => h.trim());

            // Helper function to parse CSV line properly (handles quotes and commas)
            const parseCSVLine = (line: string): string[] => {
                const result: string[] = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };

            try {
                const importedProducts: ProductInput[] = lines.slice(1).map((line) => {
                    const data = parseCSVLine(line);
                    console.log('data', data, data[8])
                    return {
                        id: crypto.randomUUID(),
                        productId: data[0]?.trim() || '',
                        name: data[1]?.trim() || '',
                        price: data[2]?.trim() || '',
                        revenue: data[3]?.trim() || '',
                        shopName: data[4]?.trim() || '',
                        commissionRate: data[5]?.trim() || '',
                        commission: data[6]?.trim() || '0',
                        productLink: data[7]?.trim() || '',
                        discountLink: data[8]?.trim() || '',
                    };
                });

                // Sort by commission (descending)
                const sortedProducts = importedProducts.sort((a, b) => {
                    // Handle Vietnamese currency format: ₫480 or ₫16.900
                    // Remove currency symbol and dots (thousand separators), keep only numbers
                    const commissionA = parseFloat(a.commission.replace(/[₫.]/g, '').replace(/[^0-9]/g, '')) || 0;
                    const commissionB = parseFloat(b.commission.replace(/[₫.]/g, '').replace(/[^0-9]/g, '')) || 0;
                    return commissionB - commissionA;
                });
                
                setProducts(sortedProducts);

            } catch (error) {
                alert("Đã xảy ra lỗi khi đọc file CSV. Vui lòng kiểm tra định dạng file.");
                console.error("CSV parsing error:", error);
            }
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = '';
        }
    };


    const removeProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleToneChange = (tone: ToneOption) => {
        setSelectedTones(prev =>
            prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (products.length === 0) {
            alert('Vui lòng import danh sách sản phẩm từ file CSV.');
            return;
        }
        onSubmit(products, selectedTones, shouldGenerateImage, platform, temperature);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Input Section */}
            <div className="space-y-4">
                 <h3 className="text-base font-semibold mb-2">Nhập sản phẩm</h3>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    accept=".csv"
                    className="hidden"
                 />
                 <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full py-2 px-4 border border-dashed border-slate-400 dark:border-slate-500 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                    <i className="fa-solid fa-file-csv mr-2"></i>Import sản phẩm từ CSV
                 </button>
                 
                 {products.length > 0 && (
                     <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Đã import {products.length} sản phẩm (sắp xếp theo hoa hồng giảm dần).
                        </p>
                        {products.map((product) => (
                             <div key={product.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                 <div className="text-sm overflow-hidden whitespace-nowrap text-ellipsis mr-2">
                                    <span className="font-semibold">{product.name}</span>
                                    <span className="text-xs text-green-600 dark:text-green-400 ml-2 font-mono bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">
                                        <i className="fa-solid fa-sack-dollar fa-fw"></i> {product.commission}
                                    </span>
                                 </div>
                                 <button
                                     type="button"
                                     onClick={() => removeProduct(product.id)}
                                     className="h-6 w-6 text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                                     aria-label="Xóa sản phẩm"
                                 >
                                    <i className="fa-solid fa-trash-can"></i>
                                 </button>
                             </div>
                        ))}
                     </div>
                 )}
            </div>
            
            {/* Platform Selection Section */}
            <div>
                 <h3 className="text-base font-semibold mb-3">Chọn nền tảng</h3>
                 <div className="flex flex-col space-y-2">
                     {PLATFORM_OPTIONS.map(option => (
                         <label key={option} className="flex items-center space-x-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                             <input
                                 type="radio"
                                 name="platform"
                                 value={option}
                                 checked={platform === option}
                                 onChange={(e) => setPlatform(e.target.value as PlatformOption)}
                                 className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                             />
                             <span className="text-sm">{option}</span>
                         </label>
                     ))}
                 </div>
            </div>

            {/* Tone Selection Section */}
            <div>
                 <h3 className="text-base font-semibold mb-3">Tùy chọn phong cách (không bắt buộc)</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                     {TONE_OPTIONS.map(tone => (
                         <label key={tone} className="flex items-center space-x-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                             <input
                                 type="checkbox"
                                 checked={selectedTones.includes(tone)}
                                 onChange={() => handleToneChange(tone)}
                                 className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                             />
                             <span className="text-sm">{tone}</span>
                         </label>
                     ))}
                 </div>
            </div>
            
             {/* Temperature Control */}
            <div>
                <label htmlFor="temperature" className="text-base font-semibold mb-3 block">
                    Độ sáng tạo (Temperature)
                    <span className="ml-2 font-mono text-sm text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
                </label>
                <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
            </div>

             {/* Image Generation Option */}
            <div>
                 <label className="flex items-center space-x-2 p-3 rounded-md bg-slate-100 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <input
                        type="checkbox"
                        checked={shouldGenerateImage}
                        onChange={(e) => setShouldGenerateImage(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium"><i className="fa-regular fa-image mr-2 text-blue-500"></i>Kèm hình ảnh minh họa</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang sáng tạo...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        Tạo Nội Dung
                    </>
                )}
            </button>
        </form>
    );
};

export default InputForm;