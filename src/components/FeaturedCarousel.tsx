import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  badge?: string;
  link: string;
}

interface FeaturedCarouselProps {
  items?: FeaturedItem[];
  maxItems?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  animationType?: 'slide' | 'fade';
}

export default function FeaturedCarousel({
  items = [],
  maxItems = 10,
  autoplay = true,
  autoplayInterval = 5000,
  showArrows = true,
  animationType = 'slide'
}: FeaturedCarouselProps) {
  const { darkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Limitar items ao máximo configurado
  const displayItems = items.slice(0, maxItems);

  // Fallback placeholders se não houver items
  const placeholders: FeaturedItem[] = Array.from({ length: 6 }, (_, i) => ({
    id: `placeholder-${i}`,
    title: 'Produto em Destaque',
    description: 'Descrição do produto',
    image: `https://readdy.ai/api/search-image?query=modern%20tech%20product%20on%20simple%20white%20background%20professional%20photography%20$%7Bi%7D&width=400&height=400&seq=placeholder${i}&orientation=squarish`,
    price: 99.99,
    badge: i === 0 ? 'TOP' : i === 1 ? 'NOVO' : i === 2 ? 'PROMO' : undefined,
    link: '/category'
  }));

  const finalItems = displayItems.length > 0 ? displayItems : placeholders;

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % finalItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [finalItems.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + finalItems.length) % finalItems.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [finalItems.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Autoplay
  useEffect(() => {
    if (!autoplay || isPaused || finalItems.length <= 1) return;

    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [autoplay, isPaused, autoplayInterval, nextSlide, finalItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch/Swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  if (finalItems.length === 0) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            animationType === 'fade' ? 'opacity-0' : ''
          }`}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            opacity: animationType === 'fade' ? (isTransitioning ? 0 : 1) : 1
          }}
        >
          {finalItems.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0"
              style={{ minWidth: '100%' }}
            >
              <Link
                to={item.link}
                className={`block relative overflow-hidden rounded-2xl ${
                  darkMode ? 'bg-surface' : 'bg-gray-50'
                } border ${darkMode ? 'border-gray-800' : 'border-gray-200'} group`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    {item.badge && (
                      <span
                        className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 w-fit ${
                          item.badge === 'TOP'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : item.badge === 'NOVO'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-accent to-primary text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mb-6`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary">€{item.price.toFixed(2)}</span>
                      <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-opacity font-medium whitespace-nowrap">
                        Ver Detalhes
                        <i className="ri-arrow-right-line ml-2"></i>
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative h-64 md:h-96">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && finalItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${
              darkMode ? 'bg-surface/90 hover:bg-surface' : 'bg-white/90 hover:bg-white'
            } border ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            } flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10`}
            aria-label="Anterior"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${
              darkMode ? 'bg-surface/90 hover:bg-surface' : 'bg-white/90 hover:bg-white'
            } border ${
              darkMode ? 'border-gray-800' : 'border-gray-200'
            } flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10`}
            aria-label="Próximo"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {finalItems.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {finalItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-primary to-accent'
                  : `w-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'}`
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoplay && !isPaused && finalItems.length > 1 && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{
              width: '100%',
              animation: `progress ${autoplayInterval}ms linear infinite`
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}