import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from 'react-konva';
import useImage from 'use-image';
import { 
  Send, 
  User, 
  Briefcase, 
  Users, 
  Smile, 
  Star,
  Frown, 
  Minus, 
  Copy, 
  Check, 
  Loader2,
  Sparkles,
  Settings,
  ChevronDown,
  Globe,
  Moon,
  Sun,
  MessageSquareReply,
  MessageSquareText,
  ArrowLeft,
  SlidersHorizontal,
  X,
  RefreshCw,
  Type as TypeIcon,
  Maximize2,
  Settings2,
  Image as ImageIcon,
  Camera,
  Upload,
  ImageIcon as LucideImageIcon,
  Layout,
  Tag,
  FileText,
  ImagePlus,
  Palette,
  Layers,
  Download,
  ChevronLeft,
  AlertCircle,
  Wand2,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { generateCorporateReply, ReplyRequest, ReplyResponse, generateProductPhotography } from './services/geminiService';
import { IMAGE_PRESETS, ImagePreset, TextStyles } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | ReplyResponse;
  image?: string;
  imageMetadata?: {
    heading?: string;
    title?: string;
    logo?: string;
    headingStyle?: TextStyles;
    titleStyle?: TextStyles;
  };
  timestamp: Date;
}

const CanvasEditor = ({ 
  image, 
  heading, 
  title, 
  logo, 
  headingStyle,
  titleStyle,
  isDarkMode,
  onExport 
}: { 
  image: string; 
  heading?: string; 
  title?: string; 
  logo?: string; 
  headingStyle?: TextStyles;
  titleStyle?: TextStyles;
  isDarkMode: boolean;
  onExport: (dataUrl: string) => void;
}) => {
  const [bgImage] = useImage(image, 'anonymous');
  const [logoImage] = useImage(logo || '', 'anonymous');
  
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0, scale: 1 });
  
  const [elements, setElements] = useState<{
    id: string;
    type: 'text' | 'logo';
    text?: string;
    x: number;
    y: number;
    fontSize?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    style?: TextStyles;
  }[]>([]);

  const updateElementStyle = (id: string, newStyle: Partial<TextStyles>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, style: { ...el.style!, ...newStyle } } : el
    ));
  };

  const updateElementFontSize = (id: string, newSize: number) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, fontSize: newSize } : el
    ));
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  useEffect(() => {
    const initialElements: any[] = [];
    if (heading) {
      initialElements.push({ 
        id: 'heading', 
        type: 'text', 
        text: heading, 
        x: 50, 
        y: 50, 
        fontSize: 48,
        style: headingStyle
      });
    }
    if (title) {
      initialElements.push({ 
        id: 'title', 
        type: 'text', 
        text: title, 
        x: 50, 
        y: 120, 
        fontSize: 32,
        style: titleStyle
      });
    }
    if (logo) {
      initialElements.push({ id: 'logo', type: 'logo', x: 50, y: 200, width: 150, height: 150 });
    }
    setElements(initialElements);
  }, [heading, title, logo, headingStyle, titleStyle]);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  // Responsive scaling
  useEffect(() => {
    if (!containerRef.current || !bgImage) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const padding = 32;
      const availableWidth = container.offsetWidth - padding;
      const availableHeight = container.offsetHeight - padding;

      const imgWidth = bgImage.width;
      const imgHeight = bgImage.height;

      const scaleX = availableWidth / imgWidth;
      const scaleY = availableHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      setStageSize({
        width: imgWidth * scale,
        height: imgHeight * scale,
        scale: scale
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [bgImage]);

  const handleExport = () => {
    if (stageRef.current) {
      setSelectedId(null);
      setTimeout(() => {
        // Export at full resolution
        const oldScale = stageRef.current.scale();
        stageRef.current.scale({ x: 1, y: 1 });
        stageRef.current.width(bgImage?.width || 800);
        stageRef.current.height(bgImage?.height || 600);
        
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        
        // Restore responsive scale
        stageRef.current.scale(oldScale);
        stageRef.current.width(stageSize.width);
        stageRef.current.height(stageSize.height);
        
        onExport(dataUrl);
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
            <Maximize2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">Interactive Editor</h3>
            <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold truncate">Drag & Resize elements</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button 
            onClick={() => {
              const initialElements: any[] = [];
              if (heading) initialElements.push({ 
                id: 'heading', 
                type: 'text', 
                text: heading, 
                x: 50, 
                y: 50, 
                fontSize: 48,
                style: headingStyle
              });
              if (title) initialElements.push({ 
                id: 'title', 
                type: 'text', 
                text: title, 
                x: 50, 
                y: 120, 
                fontSize: 32,
                style: titleStyle
              });
              if (logo) initialElements.push({ id: 'logo', type: 'logo', x: 50, y: 200, width: 150, height: 150 });
              setElements(initialElements);
              setSelectedId(null);
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-medium transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-lg shadow-amber-600/20 active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3 h-3 sm:w-4 h-4" />
            <span className="text-[10px] sm:text-sm font-bold">Save & Download</span>
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden touch-none">
        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white rounded-sm overflow-hidden">
          <Stage 
            width={stageSize.width} 
            height={stageSize.height}
            scaleX={stageSize.scale}
            scaleY={stageSize.scale}
            ref={stageRef}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
            onTouchStart={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedId(null);
              }
            }}
            style={{ cursor: selectedId ? 'move' : 'default' }}
          >
            <Layer>
              {bgImage && (
                <KonvaImage 
                  image={bgImage} 
                  width={bgImage.width} 
                  height={bgImage.height} 
                />
              )}
              
              {elements.map((el, i) => {
                if (el.type === 'text') {
                  const style = el.style || {
                    fontFamily: "'Inter', sans-serif",
                    fill: "#ffffff",
                    fontStyle: "bold",
                    shadowColor: "black",
                    shadowBlur: 10,
                    shadowOpacity: 0.5
                  };

                  const fillConfig: any = {};
                  if (style.fillType === 'gradient' && style.fill && style.fillAfter) {
                    fillConfig.fillLinearGradientStartPoint = { x: 0, y: 0 };
                    fillConfig.fillLinearGradientEndPoint = { x: 0, y: el.fontSize || 48 };
                    fillConfig.fillLinearGradientColorStops = [0, style.fill, 1, style.fillAfter];
                  } else {
                    fillConfig.fill = style.fill || '#ffffff';
                  }

                  return (
                    <KonvaText
                      key={el.id}
                      id={el.id}
                      text={el.text}
                      x={el.x}
                      y={el.y}
                      fontSize={el.fontSize}
                      fontFamily={style.fontFamily}
                      fontStyle={style.fontStyle}
                      {...fillConfig}
                      shadowColor={style.shadowColor}
                      shadowBlur={style.shadowBlur}
                      shadowOpacity={style.shadowOpacity}
                      letterSpacing={style.letterSpacing}
                      draggable
                      onDragEnd={(e) => {
                        const newElements = [...elements];
                        newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
                        setElements(newElements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const newElements = [...elements];
                        newElements[i] = {
                          ...el,
                          x: node.x(),
                          y: node.y(),
                          scaleX: node.scaleX(),
                          scaleY: node.scaleY(),
                        };
                        setElements(newElements);
                      }}
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                    />
                  );
                }
                if (el.type === 'logo' && logoImage) {
                  return (
                    <KonvaImage
                      key={el.id}
                      id={el.id}
                      image={logoImage}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      draggable
                      onDragEnd={(e) => {
                        const newElements = [...elements];
                        newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
                        setElements(newElements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const newElements = [...elements];
                        newElements[i] = {
                          ...el,
                          x: node.x(),
                          y: node.y(),
                          scaleX: node.scaleX(),
                          scaleY: node.scaleY(),
                        };
                        setElements(newElements);
                      }}
                      onClick={() => setSelectedId(el.id)}
                      onTap={() => setSelectedId(el.id)}
                    />
                  );
                }
                return null;
              })}
              
              {selectedId && (
                <Transformer
                  ref={transformerRef}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  rotateEnabled={true}
                  keepRatio={true}
                  borderStroke="#f59e0b"
                  anchorStroke="#f59e0b"
                  anchorFill="#ffffff"
                  anchorSize={8}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Text Customization Toolbar */}
        <div className={cn(
          "p-3 border-t flex flex-wrap items-center gap-4",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
        )}>
          {selectedElement && selectedElement.type === 'text' && (
            <>
              {/* Font Size */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Size</span>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  value={selectedElement.fontSize || 48}
                  onChange={(e) => updateElementFontSize(selectedId!, parseInt(e.target.value))}
                  className="w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-mono w-8">{selectedElement.fontSize}</span>
              </div>

              {/* Font Family */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Font</span>
                <select 
                  value={selectedElement.style?.fontFamily}
                  onChange={(e) => updateElementStyle(selectedId!, { fontFamily: e.target.value })}
                  className={cn(
                    "text-xs px-2 py-1 rounded-lg border",
                    isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"
                  )}
                >
                  <option value="'Inter', sans-serif">Inter</option>
                  <option value="'Cormorant Garamond', serif">Cormorant</option>
                  <option value="'Anton', sans-serif">Anton</option>
                  <option value="'Playfair Display', serif">Playfair</option>
                  <option value="'JetBrains Mono', monospace">Mono</option>
                </select>
              </div>

              {/* Color Type */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Type</span>
                <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
                  <button 
                    onClick={() => updateElementStyle(selectedId!, { fillType: 'solid' })}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                      selectedElement.style?.fillType !== 'gradient' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                    )}
                  >Solid</button>
                  <button 
                    onClick={() => updateElementStyle(selectedId!, { fillType: 'gradient', fillAfter: selectedElement.style?.fill || '#000000' })}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                      selectedElement.style?.fillType === 'gradient' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500"
                    )}
                  >Gradient</button>
                </div>
              </div>

              {/* Colors */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Color</span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="color" 
                    value={selectedElement.style?.fill || '#ffffff'}
                    onChange={(e) => updateElementStyle(selectedId!, { fill: e.target.value })}
                    className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                  />
                  {selectedElement.style?.fillType === 'gradient' && (
                    <input 
                      type="color" 
                      value={selectedElement.style?.fillAfter || '#000000'}
                      onChange={(e) => updateElementStyle(selectedId!, { fillAfter: e.target.value })}
                      className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sender, setSender] = useState<ReplyRequest['sender']>('Colleague');
  const [tone, setTone] = useState<ReplyRequest['tone']>('Positive');
  const [inputLanguage, setInputLanguage] = useState<ReplyRequest['inputLanguage']>('Auto-detect');
  const [mode, setMode] = useState<ReplyRequest['mode'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeQuickSetting, setActiveQuickSetting] = useState<'sender' | 'tone' | 'language' | 'image-theme' | 'image-bg' | 'image-logo' | 'image-preset' | 'image-color' | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Image mode settings
  const [imageHeading, setImageHeading] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageToEnhance, setImageToEnhance] = useState<string | null>(null);
  const [imageToEnhanceMimeType, setImageToEnhanceMimeType] = useState<string | null>(null);
  const [imageHeadingStyle, setImageHeadingStyle] = useState<TextStyles | undefined>(undefined);
  const [imageTitleStyle, setImageTitleStyle] = useState<TextStyles | undefined>(undefined);
  const [imageTextColor, setImageTextColor] = useState('#ffffff');
  const [imageSpecialRequirement, setImageSpecialRequirement] = useState('');
  const [imageLogo, setImageLogo] = useState<string | null>(null);
  const [imageLogoMimeType, setImageLogoMimeType] = useState<string | null>(null);
  const [imageTheme, setImageTheme] = useState<'Ramadan' | 'Special Offer' | 'Regular'>('Regular');
  const [imageBackgroundType, setImageBackgroundType] = useState('Studio');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  
  // Classic mode settings
  const [classicProductImage, setClassicProductImage] = useState<string | null>(null);
  const [classicProductMimeType, setClassicProductMimeType] = useState<string | null>(null);
  const [classicInspirationImage, setClassicInspirationImage] = useState<string | null>(null);
  const [classicInspirationMimeType, setClassicInspirationMimeType] = useState<string | null>(null);
  const classicProductInputRef = useRef<HTMLInputElement>(null);
  const classicInspirationInputRef = useRef<HTMLInputElement>(null);
  
  // Preview and Limits
  const [previewData, setPreviewData] = useState<{
    image: string;
    heading?: string;
    title?: string;
    logo?: string;
    headingStyle?: TextStyles;
    titleStyle?: TextStyles;
  } | null>(null);
  const [dailyImageCount, setDailyImageCount] = useState(0);
  const DAILY_LIMIT = 25;
  const [chatWidth, setChatWidth] = useState<'narrow' | 'standard' | 'wide'>('standard');
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API key is defined
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
      setApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load and reset daily limits
  useEffect(() => {
    const savedDate = localStorage.getItem('last_gen_date');
    const savedCount = localStorage.getItem('daily_image_count');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      localStorage.setItem('last_gen_date', today);
      localStorage.setItem('daily_image_count', '0');
      setDailyImageCount(0);
    } else if (savedCount) {
      setDailyImageCount(parseInt(savedCount, 10));
    }
  }, []);

  const incrementImageCount = () => {
    const newCount = dailyImageCount + 1;
    setDailyImageCount(newCount);
    localStorage.setItem('daily_image_count', newCount.toString());
  };

  const applyPreset = (preset: ImagePreset) => {
    setImageHeading(preset.heading);
    setImageTitle(preset.title);
    setImageHeadingStyle(preset.headingStyle);
    setImageTitleStyle(preset.titleStyle);
    setImageTextColor(preset.headingStyle.fill || '#ffffff');
    setImageTheme(preset.theme);
    setImageBackgroundType(preset.backgroundType);
    setImageSpecialRequirement(preset.specialRequirement);
    setSelectedPresetId(preset.id);
    setActiveQuickSetting(null);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    if (mode === 'image') {
      if (imageToEnhance) {
        handleImageSend(currentInput);
        return;
      }
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've noted your requirements. Now, please upload the product photo you'd like me to enhance.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      return;
    }

    setLoading(true);

    try {
      const res = await generateCorporateReply({ 
        message: currentInput, 
        sender, 
        tone, 
        inputLanguage,
        mode: mode || 'reply'
      });
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassicInspirationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setClassicInspirationImage(base64);
      setClassicInspirationMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClassicProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setClassicProductImage(base64);
      setClassicProductMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClassicSend = async () => {
    if (!classicProductImage || !classicInspirationImage || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: "Generate classic image using inspiration.",
      image: classicProductImage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const enhancedImageUrl = await generateProductPhotography({
        base64Image: classicProductImage.split(',')[1],
        mimeType: classicProductMimeType || 'image/png',
        inspirationImage: classicInspirationImage.split(',')[1],
        inspirationMimeType: classicInspirationMimeType || 'image/png',
        heading: imageHeading,
        title: imageTitle,
        logoImage: imageLogo?.split(',')[1],
        logoMimeType: imageLogoMimeType || undefined,
        theme: imageTheme,
        backgroundType: imageBackgroundType
      });
      
      incrementImageCount();
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is your classic product photography shot:",
        image: enhancedImageUrl,
        imageMetadata: {
          heading: imageHeading,
          title: imageTitle,
          logo: imageLogo || undefined,
          headingStyle: imageHeadingStyle || {
            fontFamily: "'Inter', sans-serif",
            fill: imageTextColor,
            fontStyle: "bold",
            shadowColor: "black",
            shadowBlur: 10,
            shadowOpacity: 0.5
          },
          titleStyle: imageTitleStyle || {
            fontFamily: "'Inter', sans-serif",
            fill: imageTextColor,
            fontStyle: "normal",
            shadowColor: "black",
            shadowBlur: 5,
            shadowOpacity: 0.5
          }
        },
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageLogo(base64);
      setImageLogoMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageToEnhance(base64);
      setImageToEnhanceMimeType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageSend = async (customInput?: string) => {
    if (!imageToEnhance || loading) return;

    const finalInput = customInput !== undefined ? customInput : input;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: finalInput.trim() || "Please enhance this product photo.",
      image: imageToEnhance,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const enhancedImageUrl = await generateProductPhotography({
        base64Image: imageToEnhance.split(',')[1],
        mimeType: imageToEnhanceMimeType || 'image/png',
        heading: imageHeading,
        title: imageTitle,
        specialRequirement: (finalInput + " " + imageSpecialRequirement).trim(),
        logoImage: imageLogo?.split(',')[1],
        logoMimeType: imageLogoMimeType || undefined,
        theme: imageTheme,
        backgroundType: imageBackgroundType
      });
      
      incrementImageCount();
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is your professional product photography shot:",
        image: enhancedImageUrl,
        imageMetadata: {
          heading: imageHeading,
          title: imageTitle,
          logo: imageLogo || undefined,
          headingStyle: imageHeadingStyle || {
            fontFamily: "'Inter', sans-serif",
            fill: imageTextColor,
            fontStyle: "bold",
            shadowColor: "black",
            shadowBlur: 10,
            shadowOpacity: 0.5
          },
          titleStyle: imageTitleStyle || {
            fontFamily: "'Inter', sans-serif",
            fill: imageTextColor,
            fontStyle: "normal",
            shadowColor: "black",
            shadowBlur: 5,
            shadowOpacity: 0.5
          }
        },
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process the image. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (index: number) => {
    if (loading) return;
    
    // Find the closest preceding user message
    let userMessage: ChatMessage | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    setLoading(true);
    try {
      let assistantMsg: ChatMessage;
      
      if (mode === 'image' && userMessage.image) {
        const base64Data = userMessage.image.split(',')[1];
        const mimeType = userMessage.image.split(';')[0].split(':')[1];
        
        const enhancedImageUrl = await generateProductPhotography({
          base64Image: base64Data,
          mimeType: mimeType,
          heading: imageHeading,
          title: imageTitle,
          specialRequirement: (userMessage.content as string + " " + imageSpecialRequirement).trim(),
          logoImage: imageLogo?.split(',')[1],
          logoMimeType: imageLogoMimeType || undefined,
          theme: imageTheme,
          backgroundType: imageBackgroundType
        });
        
        incrementImageCount();
        
        assistantMsg = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Here is your professional product photography shot:",
          image: enhancedImageUrl,
          imageMetadata: {
            heading: imageHeading,
            title: imageTitle,
            logo: imageLogo || undefined,
            headingStyle: imageHeadingStyle || {
              fontFamily: "'Inter', sans-serif",
              fill: imageTextColor,
              fontStyle: "bold",
              shadowColor: "black",
              shadowBlur: 10,
              shadowOpacity: 0.5
            },
            titleStyle: imageTitleStyle || {
              fontFamily: "'Inter', sans-serif",
              fill: imageTextColor,
              fontStyle: "normal",
              shadowColor: "black",
              shadowBlur: 5,
              shadowOpacity: 0.5
            }
          },
          timestamp: new Date(),
        };
      } else {
        const res = await generateCorporateReply({ 
          message: userMessage.content as string, 
          sender, 
          tone, 
          inputLanguage,
          mode: mode || 'reply'
        });
        
        assistantMsg = {
          id: Date.now().toString(),
          role: 'assistant',
          content: res,
          timestamp: new Date(),
        };
      }

      setMessages(prev => {
        const next = [...prev];
        next[index] = assistantMsg;
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans transition-colors duration-300",
      isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-white text-slate-900",
      fontSize === 'sm' ? "text-sm" : fontSize === 'lg' ? "text-lg" : "text-base"
    )}>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Star className="w-4 h-4 text-white fill-current" />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-black tracking-tighter text-white"
                >
                  Welcome <span className="text-indigo-400">Dip</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-slate-400 font-medium tracking-wide uppercase text-[10px]"
                >
                  on your own app
                </motion.p>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="h-1 bg-indigo-500/30 rounded-full mx-auto overflow-hidden"
              >
                <motion.div
                  animate={{ x: [-100, 100] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="h-full w-1/2 bg-indigo-500"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
      <input 
        type="file" 
        ref={logoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleLogoUpload} 
      />
      <input 
        type="file" 
        ref={classicProductInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleClassicProductUpload} 
      />
      <input 
        type="file" 
        ref={classicInspirationInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleClassicInspirationUpload} 
      />

      {/* Header */}
      <header className={cn(
        "flex items-center justify-between px-3 py-2 border-b sticky top-0 z-10 backdrop-blur-md",
        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-100"
      )}>
        <div className="w-8" /> {/* Spacer */}
        <h1 className={cn(
          "text-base font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis px-2",
          isDarkMode ? "text-slate-100" : "text-slate-800"
        )}>
          {!mode ? "Re-Play" : mode === 'reply' ? "Reply Mode" : mode === 'say' ? "Say Mode" : mode === 'image' ? "Image Mode" : "Classic Mode"}
        </h1>
        <div className="flex items-center gap-2">
          {mode && (
            <button 
              onClick={() => {
                setMode(null);
                setMessages([]);
                setActiveQuickSetting(null);
                setInput('');
                setImageToEnhance(null);
                setImageToEnhanceMimeType(null);
                setClassicProductImage(null);
                setClassicInspirationImage(null);
              }}
              className={cn(
                "p-2 rounded-full transition-colors mr-2",
                isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              )}
              title="Change Mode"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-yellow-400" : "hover:bg-slate-100 text-slate-500"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setShowGeneralSettings(true)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
            )}
            title="General Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-6"
      >
        <div className={cn(
          "mx-auto space-y-8 transition-all duration-300",
          chatWidth === 'narrow' ? "max-w-xl" : chatWidth === 'wide' ? "max-w-5xl" : "max-w-3xl"
        )}>
          {apiKeyMissing && (
            <div className={cn(
              "p-6 rounded-3xl border-2 border-red-500/20 bg-red-500/5 text-center space-y-4",
              isDarkMode ? "bg-red-900/10" : "bg-red-50"
            )}>
              <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-red-500">API Key Missing</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  The <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">GEMINI_API_KEY</code> environment variable is not set. 
                  Please add it to your Netlify environment variables and redeploy.
                </p>
              </div>
            </div>
          )}

          {!mode && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-8">
              <div className={cn(
                "p-3 rounded-2xl",
                isDarkMode ? "bg-slate-900" : "bg-slate-50"
              )}>
                <Sparkles className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h2 className={cn(
                  "text-xl font-bold tracking-tight",
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                )}>Welcome to Re-Play</h2>
                <p className="opacity-60">Choose how you'd like to communicate today.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl px-2">
                <button 
                  onClick={() => setMode('reply')}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50" 
                      : "bg-white border-slate-100 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5"
                  )}
                >
                  <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-500">
                    <MessageSquareReply className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-xs sm:text-sm", isDarkMode ? "text-slate-100" : "text-slate-800")}>Reply</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2">Paste message to craft response.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setMode('say')}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-emerald-500/50" 
                      : "bg-white border-slate-100 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5"
                  )}
                >
                  <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
                    <MessageSquareText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-xs sm:text-sm", isDarkMode ? "text-slate-100" : "text-slate-800")}>Say</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2">Write intent and I'll polish it.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setMode('image')}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-amber-500/50" 
                      : "bg-white border-slate-100 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5"
                  )}
                >
                  <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-500">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-xs sm:text-sm", isDarkMode ? "text-slate-100" : "text-slate-800")}>Image</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2">Upload product for photography.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setMode('classic')}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-center space-y-3 group",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 hover:border-rose-500/50" 
                      : "bg-white border-slate-100 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5"
                  )}
                >
                  <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors text-rose-500">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn("font-bold text-xs sm:text-sm", isDarkMode ? "text-slate-100" : "text-slate-800")}>Classic</h3>
                    <p className="text-[10px] text-slate-500 line-clamp-2">Use inspiration for placement.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
              <div className={cn(
                "p-3 rounded-2xl",
                isDarkMode ? "bg-slate-900" : "bg-slate-50"
              )}>
                {mode === 'reply' ? (
                  <MessageSquareReply className="w-6 h-6 text-indigo-500" />
                ) : mode === 'say' ? (
                  <MessageSquareText className="w-6 h-6 text-emerald-500" />
                ) : (
                  <Camera className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <h2 className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-slate-100" : "text-slate-800"
              )}>
                {mode === 'reply' ? "Paste the message you received" : mode === 'say' ? "What would you like to say?" : "Upload your product photo"}
              </h2>
              <p className="text-slate-500 max-w-sm">
                {mode === 'reply' 
                  ? "I'll help you craft a professional reply based on the hierarchy and tone you choose."
                  : mode === 'say'
                  ? "I'll correct your grammar and arrange your thoughts into a clear, professional message."
                  : "I'll transform your photo into a professional studio-quality product photography shot."}
              </p>
              {mode === 'image' && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={dailyImageCount >= DAILY_LIMIT}
                    className={cn(
                      "mt-4 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
                      dailyImageCount >= DAILY_LIMIT 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    Select Photo
                  </button>
                  <p className={cn(
                    "text-[10px] font-medium",
                    dailyImageCount >= DAILY_LIMIT ? "text-red-500" : "text-slate-400"
                  )}>
                    {dailyImageCount >= DAILY_LIMIT 
                      ? "Daily limit reached (25/25)" 
                      : `Daily limit: ${dailyImageCount}/${DAILY_LIMIT} images used`}
                  </p>
                </div>
              )}
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full group/msg",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]">
                <div className={cn(
                  "rounded-2xl px-4 py-3 leading-relaxed transition-colors duration-500",
                  msg.role === 'user' 
                    ? (mode === 'reply' 
                        ? (isDarkMode ? "bg-purple-900/40 text-purple-100 border border-purple-800/50 rounded-tr-none" : "bg-purple-50 text-purple-900 border border-purple-100 rounded-tr-none")
                        : mode === 'say'
                        ? (isDarkMode ? "bg-emerald-900/40 text-emerald-100 border border-emerald-800/50 rounded-tr-none" : "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tr-none")
                        : (isDarkMode ? "bg-amber-900/40 text-amber-100 border border-amber-800/50 rounded-tr-none" : "bg-amber-50 text-amber-900 border border-amber-100 rounded-tr-none")
                      )
                    : (isDarkMode ? "bg-slate-900 border border-slate-800 shadow-sm rounded-tl-none text-slate-200" : "bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-800")
                )}>
                  {msg.image && (
                    <div 
                      onClick={() => setPreviewData({
                        image: msg.image!,
                        heading: msg.imageMetadata?.heading,
                        title: msg.imageMetadata?.title,
                        logo: msg.imageMetadata?.logo,
                        headingStyle: msg.imageMetadata?.headingStyle,
                        titleStyle: msg.imageMetadata?.titleStyle
                      })}
                      className="mb-2 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 cursor-zoom-in group/img relative"
                    >
                      <img src={msg.image} alt="Uploaded product" className="w-full h-auto max-h-64 object-contain" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  {typeof msg.content === 'string' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">English Reply</span>
                          <button 
                            onClick={() => copyToClipboard((msg.content as ReplyResponse).english, msg.id + '-en')}
                            className={cn(
                              "p-1 rounded transition-colors text-slate-400",
                              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                            )}
                          >
                            {copied === msg.id + '-en' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        )}>{msg.content.english}</p>
                      </div>
                      <div className={cn(
                        "h-px w-full",
                        isDarkMode ? "bg-slate-800" : "bg-slate-50"
                      )} />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bangla Translation</span>
                          <button 
                            onClick={() => copyToClipboard((msg.content as ReplyResponse).bangla, msg.id + '-bn')}
                            className={cn(
                              "p-1 rounded transition-colors text-slate-400",
                              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
                            )}
                          >
                            {copied === msg.id + '-bn' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        )}>{msg.content.bangla}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Regenerate Button for Assistant Messages */}
                {msg.role === 'assistant' && typeof msg.content !== 'string' && (
                  <div className="flex justify-start px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRegenerate(idx)}
                      disabled={loading}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors",
                        isDarkMode ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className={cn(
                "border shadow-sm rounded-2xl rounded-tl-none px-4 py-3",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
              )}>
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className={cn(
        "p-4 sm:p-6 border-t transition-all duration-500 relative",
        !mode ? "opacity-0 pointer-events-none translate-y-10" : "opacity-100 translate-y-0",
        isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"
      )}>
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Mode Specific Upload Areas */}
          {mode === 'classic' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div 
                onClick={() => classicProductInputRef.current?.click()}
                className={cn(
                   "aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50",
                   classicProductImage ? "border-amber-500/50 bg-amber-500/5" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {classicProductImage ? (
                  <img src={classicProductImage} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Product Photo</span>
                  </>
                )}
              </div>
              <div 
                onClick={() => classicInspirationInputRef.current?.click()}
                className={cn(
                  "aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50",
                  classicInspirationImage ? "border-rose-500/50 bg-rose-500/5" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {classicInspirationImage ? (
                  <img src={classicInspirationImage} className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-[10px] font-bold uppercase text-slate-400">Inspiration</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Context-Specific Quick Selectors */}
          <AnimatePresence>
            {mode && activeQuickSetting && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "absolute bottom-full mb-4 left-4 sm:left-6 p-2 rounded-2xl border shadow-xl flex flex-wrap gap-1.5 z-30",
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}
              >
                {activeQuickSetting === 'image-theme' && (['Regular', 'Ramadan', 'Special Offer'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setImageTheme(t);
                      setSelectedPresetId(null);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      imageTheme === t 
                        ? "bg-amber-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {t}
                  </button>
                ))}
                {activeQuickSetting === 'image-bg' && (['Studio', 'Nature', 'Urban', 'Solid Color', 'Gradient'] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => {
                      setImageBackgroundType(bg);
                      setSelectedPresetId(null);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      imageBackgroundType === bg 
                        ? "bg-amber-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {bg}
                  </button>
                ))}
                {activeQuickSetting === 'image-preset' && IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      selectedPresetId === preset.id 
                        ? "bg-amber-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
                {activeQuickSetting === 'image-color' && (['#ffffff', '#000000', '#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF1493', '#8A2BE2'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setImageTextColor(color);
                      if (imageHeadingStyle) setImageHeadingStyle({ ...imageHeadingStyle, fill: color });
                      if (imageTitleStyle) setImageTitleStyle({ ...imageTitleStyle, fill: color });
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full border transition-all hover:scale-110",
                      imageTextColor === color ? "border-amber-500 scale-110 ring-2 ring-amber-500/20" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                {activeQuickSetting === 'sender' && (['Boss', 'Colleague', 'Junior'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setSender(role);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      sender === role 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {role}
                  </button>
                ))}
                {activeQuickSetting === 'tone' && (['Positive', 'Neutral', 'Negative'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      tone === t 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {t}
                  </button>
                ))}
                {activeQuickSetting === 'language' && (['Auto-detect', 'English', 'Bangla', 'Banglish'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setInputLanguage(lang);
                      setActiveQuickSetting(null);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-medium transition-all",
                      inputLanguage === lang 
                        ? "bg-indigo-600 text-white" 
                        : (isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600")
                    )}
                  >
                    {lang}
                  </button>
                ))}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
                <button 
                  onClick={() => setActiveQuickSetting(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal Selectors above input */}
          {mode && (
            <div className="flex items-center overflow-x-auto no-scrollbar gap-2 px-1 pb-1 -mx-1">
              {mode === 'reply' || mode === 'say' ? (
                <>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'sender' ? null : 'sender')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'sender'
                        ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                        : (isDarkMode 
                            ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                            : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                    )}
                  >
                    <User className="w-2 h-2" />
                    {sender}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'sender' && "rotate-180")} />
                  </button>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'tone' ? null : 'tone')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'tone'
                        ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                        : (isDarkMode 
                            ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                            : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                    )}
                  >
                    <Smile className="w-2 h-2" />
                    {tone}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'tone' && "rotate-180")} />
                  </button>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'language' ? null : 'language')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'language'
                        ? (mode === 'reply' ? "bg-purple-600 border-purple-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                        : (isDarkMode 
                            ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200" 
                            : "bg-slate-50 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300")
                    )}
                  >
                    <Globe className="w-2 h-2" />
                    {inputLanguage}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'language' && "rotate-180")} />
                  </button>
                </>
              ) : mode === 'image' ? (
                <>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                        imageToEnhance ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                      )}
                    >
                      {imageToEnhance ? (
                        <div className="w-2 h-2 rounded-full overflow-hidden border border-white/20">
                          <img src={imageToEnhance} alt="Product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <Camera className="w-2 h-2" />
                      )}
                      {imageToEnhance ? 'Product' : 'Add Product'}
                      {imageToEnhance && (
                        <X 
                          className="w-1.5 h-1.5 ml-0.5 hover:text-red-200" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageToEnhance(null);
                            setImageToEnhanceMimeType(null);
                          }}
                        />
                      )}
                    </button>
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                        imageLogo ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                      )}
                    >
                      {imageLogo ? (
                        <div className="w-2 h-2 rounded-full overflow-hidden border border-white/20">
                          <img src={imageLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <ImagePlus className="w-2 h-2" />
                      )}
                      {imageLogo ? 'Logo' : 'Add Logo'}
                      {imageLogo && (
                        <X 
                          className="w-1.5 h-1.5 ml-0.5 hover:text-red-200" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageLogo(null);
                            setImageLogoMimeType(null);
                          }}
                        />
                      )}
                    </button>
                  </div>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'image-preset' ? null : 'image-preset')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'image-preset' ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                    )}
                  >
                    <Wand2 className="w-2 h-2" />
                    {selectedPresetId ? IMAGE_PRESETS.find(p => p.id === selectedPresetId)?.name : 'Presets'}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'image-preset' && "rotate-180")} />
                  </button>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'image-theme' ? null : 'image-theme')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'image-theme' ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                    )}
                  >
                    <Palette className="w-2 h-2" />
                    {imageTheme}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'image-theme' && "rotate-180")} />
                  </button>
                  <button 
                    onClick={() => setActiveQuickSetting(activeQuickSetting === 'image-bg' ? null : 'image-bg')}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      activeQuickSetting === 'image-bg' ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                    )}
                  >
                    <Layers className="w-2 h-2" />
                    {imageBackgroundType}
                    <ChevronDown className={cn("w-1.5 h-1.5 transition-transform", activeQuickSetting === 'image-bg' && "rotate-180")} />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all hover:scale-105 active:scale-95 shrink-0",
                      imageLogo ? "bg-amber-600 border-amber-600 text-white" : (isDarkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                    )}
                  >
                    {imageLogo ? (
                      <div className="w-2 h-2 rounded-full overflow-hidden border border-white/20">
                        <img src={imageLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <ImagePlus className="w-2 h-2" />
                    )}
                    {imageLogo ? 'Logo' : 'Add Logo'}
                    {imageLogo && (
                      <X 
                        className="w-1.5 h-1.5 ml-0.5 hover:text-red-200" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageLogo(null);
                          setImageLogoMimeType(null);
                        }}
                      />
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {(mode === 'image' || mode === 'classic') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Heading (e.g. 50% OFF)" 
                  value={imageHeading}
                  onChange={(e) => setImageHeading(e.target.value)}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 sm:py-2 rounded-xl border text-[11px] outline-none transition-all",
                    isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-amber-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-amber-500/50"
                  )}
                />
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Title (e.g. Summer Sale)" 
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 sm:py-2 rounded-xl border text-[11px] outline-none transition-all",
                    isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-amber-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-amber-500/50"
                  )}
                />
              </div>
              <div className="relative sm:col-span-2">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Special Requirements (e.g. soft shadows)" 
                  value={imageSpecialRequirement}
                  onChange={(e) => setImageSpecialRequirement(e.target.value)}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 sm:py-2 rounded-xl border text-[11px] outline-none transition-all",
                    isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200 focus:border-amber-500/50" : "bg-white border-slate-200 text-slate-800 focus:border-amber-500/50"
                  )}
                />
              </div>
            </div>
          )}

          <div className="relative group">
            {mode === 'classic' || mode === 'image' ? (
              <button
                onClick={mode === 'classic' ? handleClassicSend : () => handleImageSend()}
                disabled={loading || (mode === 'classic' && (!classicProductImage || !classicInspirationImage)) || (mode === 'image' && !imageToEnhance)}
                className={cn(
                  "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  loading || (mode === 'classic' && (!classicProductImage || !classicInspirationImage)) || (mode === 'image' && !imageToEnhance)
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20 active:scale-[0.98]"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {mode === 'classic' ? "Generate Classic Shot" : "Generate Image Shot"}
              </button>
            ) : (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={mode === 'reply' ? "Paste message here..." : "What do you want to say? (e.g. tell boss i'm sick)"}
                  className={cn(
                    "w-full border rounded-2xl pl-4 pr-12 py-4 outline-none transition-all shadow-sm resize-none min-h-[56px] max-h-40",
                    fontSize === 'sm' ? "text-sm" : fontSize === 'lg' ? "text-lg" : "text-base",
                    isDarkMode 
                      ? cn(
                          "bg-slate-900 border-slate-800 text-slate-200",
                          mode === 'reply' ? "focus:ring-purple-500/10 focus:border-purple-500/30" : mode === 'say' ? "focus:ring-emerald-500/10 focus:border-emerald-500/30" : "focus:ring-amber-500/10 focus:border-amber-500/30"
                        )
                      : cn(
                          "bg-white border-slate-200 text-slate-800",
                          mode === 'reply' ? "focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500/50" : mode === 'say' ? "focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50" : "focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/50"
                        )
                  )}
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={cn(
                    "absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all",
                    input.trim() && !loading 
                      ? (mode === 'reply' 
                          ? (isDarkMode ? "bg-purple-600 text-white shadow-md hover:bg-purple-500" : "bg-purple-600 text-white shadow-md hover:bg-purple-700")
                          : mode === 'say'
                          ? (isDarkMode ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-500" : "bg-emerald-600 text-white shadow-md hover:bg-emerald-700")
                          : (isDarkMode ? "bg-amber-600 text-white shadow-md hover:bg-amber-500" : "bg-amber-600 text-white shadow-md hover:bg-amber-700")
                        )
                      : (isDarkMode ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-100 text-slate-300 cursor-not-allowed")
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-center text-slate-400">
            Re-Play can make mistakes. Check important info.
          </p>
        </div>
      </footer>
      {/* General Settings Modal */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-white/10">
              <button 
                onClick={() => setPreviewData(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>

            {/* Canvas Editor */}
            <div className="flex-1 overflow-hidden">
              <CanvasEditor 
                image={previewData.image}
                heading={previewData.heading}
                title={previewData.title}
                logo={previewData.logo}
                headingStyle={previewData.headingStyle}
                titleStyle={previewData.titleStyle}
                isDarkMode={isDarkMode}
                onExport={(dataUrl) => {
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = `product-photography-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGeneralSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGeneralSettings(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-6",
                isDarkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-100"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>General Settings</h3>
                <button 
                  onClick={() => setShowGeneralSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <TypeIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Text Size</span>
                  </div>
                  <div className="flex gap-2">
                    {(['sm', 'base', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                          fontSize === size 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                        )}
                      >
                        {size === 'sm' ? 'Small' : size === 'base' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chat Width</span>
                  </div>
                  <div className="flex gap-2">
                    {(['narrow', 'standard', 'wide'] as const).map((width) => (
                      <button
                        key={width}
                        onClick={() => setChatWidth(width)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-medium transition-all border",
                          chatWidth === width 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                        )}
                      >
                        {width.charAt(0).toUpperCase() + width.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGeneralSettings(false)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


