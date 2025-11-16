import React, { useState, useRef } from 'react';
import Header from './components/Header.tsx';
import InputForm from './components/InputForm.tsx';
import OutputDisplay from './components/OutputDisplay.tsx';
import { generateViralThread, generateImage } from './services/geminiService.ts';
import type { BatchResult, ProductInput, ToneOption, PlatformOption } from './types.ts';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);
    const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
    const [lastSubmittedPlatform, setLastSubmittedPlatform] = useState<PlatformOption | null>(null);
    const shouldStopRef = useRef(false);

    const handleSubmit = async (products: ProductInput[], tones: ToneOption[], shouldGenerateImage: boolean, platform: PlatformOption, temperature: number) => {
        setIsLoading(true);
        setError(null);
        setBatchResults(null);
        setProgressMessage(null);
        setLastSubmittedPlatform(platform);
        shouldStopRef.current = false;
        
        let results: BatchResult[] = [];

        for (let i = 0; i < products.length; i++) {
            // Check if user requested to stop
            if (shouldStopRef.current) {
                setProgressMessage('⏸️ Đã dừng theo yêu cầu.');
                setIsLoading(false);
                return;
            }

            const product = products[i];
            try {
                // Step 1: Generate Text Content
                setProgressMessage(`✍️ Đang viết nội dung cho "${product.name}" (${i + 1}/${products.length})...`);
                const textContent = await generateViralThread(product, tones, platform, temperature);
                
                // Check again after async operation
                if (shouldStopRef.current) {
                    setProgressMessage('⏸️ Đã dừng theo yêu cầu.');
                    setIsLoading(false);
                    return;
                }
                
                let finalContent = textContent;

                // Initially push text content
                results.push({ product, content: finalContent });
                setBatchResults([...results]);
                
                // Step 2: Generate Image if requested
                if (shouldGenerateImage) {
                    // Check before starting image generation
                    if (shouldStopRef.current) {
                        setProgressMessage('⏸️ Đã dừng theo yêu cầu.');
                        setIsLoading(false);
                        return;
                    }
                    
                    const imagePrompt = textContent[0]?.imagePrompt;

                    if (imagePrompt) {
                        // Show loading state for the image
                        results = results.map(r => r.product.id === product.id 
                            ? { ...r, content: r.content.map(c => ({...c, isImageLoading: true}))}
                            : r
                        );
                        setBatchResults([...results]);
                        
                        setProgressMessage(`🎨 Đang vẽ hình ảnh cho "${product.name}" (${i + 1}/${products.length})...`);
                        const imageUrl = await generateImage(imagePrompt);
                        
                        // Check again after image generation
                        if (shouldStopRef.current) {
                            setProgressMessage('⏸️ Đã dừng theo yêu cầu.');
                            setIsLoading(false);
                            return;
                        }
                        
                        // Add image URL to the final content and remove loading state (null if quota exceeded)
                        finalContent = textContent.map(template => ({ ...template, imageUrl: imageUrl || undefined, isImageLoading: false }));
                        
                        results = results.map(r => r.product.id === product.id ? { ...r, content: finalContent } : r);
                        setBatchResults([...results]);

                        // Show warning if image generation was skipped due to quota
                        if (!imageUrl) {
                            console.warn(`⚠️ Image generation skipped for "${product.name}" due to API quota limit.`);
                        }

                    } else {
                         console.warn(`No image prompt found for "${product.name}". Skipping image generation.`);
                    }
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định";
                setError(`Lỗi khi xử lý sản phẩm "${product.name}": ${errorMessage}. Đã dừng quá trình.`);
                setIsLoading(false);
                setProgressMessage(null);
                return; // Stop on first error
            }
        }
        
        setIsLoading(false);
        setProgressMessage(null);
    };

    const handleStop = () => {
        shouldStopRef.current = true;
    };

    return (
        <div className="flex flex-col h-full">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md sticky top-24">
                            <h2 className="text-lg font-bold mb-4">Tùy chỉnh & Nhập liệu</h2>
                            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
                             {isLoading && progressMessage && (
                                <div className="mt-4 space-y-3">
                                    <div className="text-center text-sm text-blue-600 dark:text-blue-400">
                                        {progressMessage}
                                    </div>
                                    <button
                                        onClick={handleStop}
                                        className="w-full py-2 px-4 border border-red-500 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <i className="fa-solid fa-stop mr-2"></i>
                                        Dừng lại
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                                <strong className="font-bold">Rất tiếc!</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        )}
                        <OutputDisplay content={batchResults} platform={lastSubmittedPlatform}/>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;