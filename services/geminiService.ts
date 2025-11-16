import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedContent, PlatformOption, ProductInput } from '../types';

const getResponseSchema = () => ({
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Tiêu đề một dòng hấp dẫn cho nội dung.' },
      thread: {
        type: Type.ARRAY,
        description: 'Mảng các chuỗi. Nếu là thread, mỗi chuỗi là một post. Nếu là Facebook Post hoặc Comment, mảng này chỉ chứa MỘT chuỗi duy nhất là toàn bộ nội dung.',
        items: { type: Type.STRING }
      },
      hashtags: {
        type: Type.ARRAY,
        description: 'Mảng gồm 5-8 hashtag phù hợp.',
        items: { type: Type.STRING }
      },
      cta_options: {
        type: Type.ARRAY,
        description: 'Mảng gồm 3 biến thể lời gọi hành động (CTA).',
        items: { type: Type.STRING }
      },
      disclosure: { type: Type.STRING, description: 'Lời tiết lộ affiliate, ví dụ: "QC", "#Ad".' },
      scheduling_suggestion: { type: Type.STRING, description: 'Gợi ý giờ đăng bài tại Việt Nam (ví dụ: "Buổi trưa (11h-13h) hoặc buổi tối (20h-22h)").' },
      template_used: { type: Type.STRING, description: 'Tên hoặc mô tả ngắn gọn về template/cách tiếp cận đã sử dụng (ví dụ: "Template kể chuyện cá nhân", "Template dạng review chi tiết").' },
      imagePrompt: { type: Type.STRING, description: 'Một câu mô tả ngắn gọn, súc tích (khoảng 15-25 từ, BẮT BUỘC bằng tiếng Anh) để tạo hình ảnh minh họa cho SẢN PHẨM. Prompt này phải thật giàu hình ảnh, tập trung vào sản phẩm trong một bối cảnh hấp dẫn, phù hợp cho mạng xã hội. Ví dụ: "A vibrant, professional product shot of a minimalist white ceramic teapot on a clean, light gray background, with soft, natural lighting."' }
    },
    required: ['title', 'thread', 'hashtags', 'cta_options', 'disclosure', 'scheduling_suggestion', 'template_used', 'imagePrompt']
  }
});

const getPlatformInstruction = (platform: PlatformOption) => {
    switch (platform) {
        case 'Thread (Ngắn)':
            return 'Mỗi phiên bản là một thread hoàn chỉnh gồm 3-4 đoạn (mỗi đoạn là 1 post). Post cuối cùng chứa CTA và link.';
        case 'Facebook Post':
            return 'Mỗi phiên bản là một bài đăng Facebook hoàn chỉnh trong MỘT ĐOẠN VĂN duy nhất. Giữ cấu trúc hấp dẫn, có mở đầu, thân bài, và kết luận với CTA + link ở cuối.';
        case 'Comment':
            return 'Mỗi phiên bản là một bình luận (comment) seeding siêu ngắn gọn (2-3 câu), súc tích, tự nhiên để gây tò mò và điều hướng người đọc. Có thể không cần chèn link trực tiếp mà chỉ cần nhắc tên sản phẩm.';
        default:
            return 'Mỗi phiên bản là một thread hoàn chỉnh gồm 6-12 đoạn (mỗi đoạn là 1 post).';
    }
};


const buildPrompt = (product: ProductInput, tones: string[], platform: PlatformOption) => {
  const { name, price, shopName, commission, discountLink } = product;

  const toneInstruction = tones.length > 0
    ? `Hãy ưu tiên sử dụng các góc nhìn/phong cách sau đây cho 3 phiên bản: ${tones.join(', ')}.`
    : 'Hãy tự do sáng tạo 3 phiên bản với 3 góc nhìn/phong cách độc đáo khác nhau.';
  
  const platformInstruction = getPlatformInstruction(platform);

  const productContext = `
- Tên sản phẩm: ${name}
- Giá bán: ${price}
- Cửa hàng: ${shopName}
- Hoa hồng nhận được: ${commission}`;

  return `
    Bạn là một chuyên gia affiliate marketing, chuyên tạo nội dung viral cho thị trường Việt Nam.

    **Nhiệm vụ:** Viết 3 phiên bản nội dung cho sản phẩm bên dưới để đăng lên nền tảng ${platform}.

    **Bối cảnh sản phẩm:**
    ${productContext}

    **YÊU CẦU QUAN TRỌNG NHẤT (TUYỆT ĐỐI KHÔNG LÀM SAI):**
    Khi cần chèn link mua hàng hoặc link ưu đãi vào bài viết, bạn BẮT BUỘC PHẢI sử dụng chính xác chuỗi ký tự sau. KHÔNG được thay thế, rút gọn, hay diễn giải nó bằng bất kỳ thông tin nào khác.
    >>> ${discountLink} <<<

    **Các yêu cầu khác:**
    1.  Tạo ra chính xác 3 phiên bản nội dung độc đáo. ${toneInstruction}
    2.  Định dạng nội dung: ${platformInstruction}
    3.  Giọng điệu: Thân thiện, gần gũi như một người bạn chia sẻ, ngắn gọn, gây tò mò. Dùng emoji thông minh, có chọn lọc.
    4.  Nhấn mạnh vào lợi ích, giá trị sản phẩm mang lại cho người dùng và sự uy tín của cửa hàng.
    5.  BẮT BUỘC phải thêm lời tiết lộ affiliate rõ ràng (ví dụ: "#QC", "#tiepthilienket", "#Ad").
    6.  Tuyệt đối không đưa ra các tuyên bố về y tế/sức khỏe hoặc tài chính/kinh tế không có căn cứ. Tránh các từ ngữ bị cấm hoặc nhạy cảm.
    7.  Cung cấp thêm metadata cho mỗi phiên bản: title, 5-8 hashtags, 3 biến thể CTA, và gợi ý giờ đăng ở Việt Nam.
    8.  BẮT BUỘC cung cấp một 'imagePrompt' (bằng tiếng Anh) để tạo ảnh. Prompt này phải chung cho cả 3 phiên bản và tập trung vào sản phẩm.
    9.  Trả kết quả dưới dạng một mảng JSON tuân thủ schema đã cung cấp.
    `;
};

export const generateViralThread = async (product: ProductInput, tones: string[], platform: PlatformOption, temperature: number): Promise<GeneratedContent> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = buildPrompt(product, tones, platform);
    const schema = getResponseSchema();
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: temperature,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (!Array.isArray(parsedJson) || parsedJson.length === 0) {
            throw new Error("API returned an empty or invalid array.");
        }

        const firstItem = parsedJson[0];
        if (!firstItem) {
            throw new Error("API returned an empty first item.");
        }
        if (!firstItem.title) {
            throw new Error("Missing 'title' in API response.");
        }
        if (!firstItem.thread) {
            throw new Error("Missing 'thread' in API response.");
        }
        if (!Array.isArray(firstItem.thread)) {
            throw new Error("'thread' is not an array in API response.");
        }
        if (firstItem.thread.length === 0) {
            throw new Error("'thread' array is empty in API response.");
        }
        
        return parsedJson as GeneratedContent;
    } catch (error) {
        console.error("Error calling Gemini API for text:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate content: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating content.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error calling Gemini API for image:", error);
        if (error instanceof Error) {
             throw new Error(`Failed to generate image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};