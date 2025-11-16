export interface Template {
  title: string;
  thread: string[];
  hashtags: string[];
  cta_options: string[];
  disclosure: string;
  scheduling_suggestion: string;
  template_used: string;
  imagePrompt?: string; // Prompt used to generate the image
  imageUrl?: string; // Base64 URL of the generated image
  isImageLoading?: boolean; // To show a loading state for the image
}

export type GeneratedContent = Template[];

export interface ProductInput {
  id: string; // Unique ID for React keys
  productId: string;
  name:string;
  price: string;
  revenue: string;
  shopName: string;
  commissionRate: string;
  commission: string;
  productLink: string;
  discountLink: string;
}

export interface BatchResult {
  product: ProductInput;
  content: GeneratedContent;
}

export const TONE_OPTIONS = [
  'Câu chuyện Gây Sốc',
  'Review Siêu Chi Tiết',
  'Bí Quyết/Mẹo Hay',
  'So Sánh Trước & Sau',
  '"Lật Tẩy" Sự Thật',
  'Trend Bắt Nhanh',
  'Dành Cho Người Mới',
  'Tiết Kiệm Tối Đa',
  'Nâng Cấp Cuộc Sống',
  'Hỏi & Đáp (Q&A)',
  'Drama Gia Đình/Công Sở',
] as const;

export type ToneOption = typeof TONE_OPTIONS[number];

export const PLATFORM_OPTIONS = [
  'Thread (Ngắn)', 
  'Facebook Post', 
  'Comment'
] as const;

export type PlatformOption = typeof PLATFORM_OPTIONS[number];