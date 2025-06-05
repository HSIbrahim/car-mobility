import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Car as CarType } from '../utils/api'; // Importera CarType

// Utöka CarType för att inkludera frontend-specifika fält
interface DisplayCar extends CarType {
  modelName: string;
  tag: string;
  shortDescription: string;
  detailsLink?: string;
}

const cardContentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: "0%",
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.8,
  }),
};

const slotContainerVariants = {
  normal: { flexGrow: 1, transition: { duration: 0.3 } },
  expanded: { flexGrow: 1.5, transition: { duration: 0.3 } }, // Justera hur mycket den expanderar
  compressed: { flexGrow: 0.5, transition: { duration: 0.3 } } // Justera hur mycket den komprimerar
};

const CarCardGrid = ({ cars }: { cars: DisplayCar[] }) => {
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const stickyElementRef = useRef<HTMLDivElement>(null);

  const [currentFirstCardIndex, setCurrentFirstCardIndex] = useState(0);
  const [prevFirstCardIndex, setPrevFirstCardIndex] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null); // Index för den överförda sloten

  const [scrollSetup, setScrollSetup] = useState({
    pinContainerHeight: 0,
    numTargetIndices: 0,
    isInitialized: false,
  });

  const direction = currentFirstCardIndex > prevFirstCardIndex ? 1 : -1;

  useEffect(() => {
    setPrevFirstCardIndex(currentFirstCardIndex);
  }, [currentFirstCardIndex]);

  const initializeScrollParameters = useCallback(() => {
    const pinContainer = pinContainerRef.current;
    const stickyEl = stickyElementRef.current;

    if (!pinContainer || !stickyEl || cars.length === 0) {
      setScrollSetup(prev => ({ 
        ...prev, 
        isInitialized: false, 
        pinContainerHeight: stickyEl?.clientHeight || window.innerHeight, 
        numTargetIndices: 0 
      }));
      if(pinContainer && stickyEl) pinContainer.style.height = `${stickyEl?.clientHeight || window.innerHeight}px`;
      setCurrentFirstCardIndex(0);
      return;
    }
    
    requestAnimationFrame(() => {
        const numCars = cars.length;
        const numVisibleCards = 2; // Vi visar alltid 2 kort
        const targetIndicesCount = Math.max(0, numCars - numVisibleCards); 

        // Justera denna faktor för att kontrollera scrollkänsligheten
        // Högre värde = mindre känsligt, behöver mer scroll för att byta kort
        const verticalScrollPerIndexChange = 1000; 
        const totalScrollableDistanceForAnimation = targetIndicesCount * verticalScrollPerIndexChange;
        
        // Pin-containerns totala höjd = höjden av sticky-elementet + totala scrollbara avståndet
        const pinHeight = (stickyEl.clientHeight || window.innerHeight) + totalScrollableDistanceForAnimation;

        pinContainer.style.height = `${pinHeight}px`;

        setScrollSetup({
            pinContainerHeight: pinHeight,
            numTargetIndices: targetIndicesCount,
            isInitialized: true,
        });
        // Anropa handleScrollCalculation direkt efter initiering för att säkerställa korrekt startposition
        handleScrollCalculation(pinHeight, targetIndicesCount, true);
    });
  }, [cars.length]);

  const handleScrollCalculation = useCallback((
    pinHeight: number,
    targetIndices: number,
    forceUpdate = false
  ) => {
    const pinContainer = pinContainerRef.current;
    const stickyEl = stickyElementRef.current;
    
    const currentIsInitialized = forceUpdate ? true : scrollSetup.isInitialized;

    if (!currentIsInitialized || !pinContainer || !stickyEl) return;

    const stickyElClientHeight = stickyEl.clientHeight || window.innerHeight;
    let newFirstIdx = 0;

    if (targetIndices === 0) { 
      setCurrentFirstCardIndex(0);
      return;
    }

    const pinRect = pinContainer.getBoundingClientRect();
    const totalAnimScrollDist = pinHeight - stickyElClientHeight;

    if (pinRect.top <= 0 && totalAnimScrollDist > 0) { 
      const verticalScrollWithinPin = -pinRect.top;
      const progress = Math.min(1, Math.max(0, verticalScrollWithinPin / totalAnimScrollDist));
      newFirstIdx = Math.round(progress * targetIndices); 
    } else { 
      newFirstIdx = 0;
    }
    
    setCurrentFirstCardIndex(newFirstIdx);
  }, [scrollSetup.isInitialized]); 

  useEffect(() => {
    initializeScrollParameters();
    const scrollListener = () => {
      if(scrollSetup.isInitialized){
        handleScrollCalculation(
            scrollSetup.pinContainerHeight,
            scrollSetup.numTargetIndices
        );
      }
    };
    window.addEventListener('scroll', scrollListener, { passive: true });
    const resizeListener = () => {
        // Återställ pin-containerns höjd före omberäkning för att säkerställa korrekt värde
        if (pinContainerRef.current) pinContainerRef.current.style.height = '';
        initializeScrollParameters();
    };
    window.addEventListener('resize', resizeListener);
    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', resizeListener);
    };
  }, [cars, initializeScrollParameters, handleScrollCalculation, scrollSetup.isInitialized, scrollSetup.pinContainerHeight, scrollSetup.numTargetIndices]);

  // Funktion för att rendera ett bilkort eller en platshållare
  const renderCarCard = (carData: DisplayCar | null, slotIndex: number) => {
    if (!carData) {
      return (
        <div className="car-card car-card-placeholder">
          {cars.length === 0 ? 'Inga bilar tillgängliga' : 'Fler bilar laddas...'}
        </div>
      );
    }
    return (
      <motion.div
        key={carData._id}
        className="car-card"
        custom={direction}
        variants={cardContentVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "tween", ease: [0.42, 0, 0.58, 1], duration: 0.5 },
          opacity: { duration: 0.25 },
          scale: { type: "tween", ease: [0.42, 0, 0.58, 1], duration: 0.5 },
        }}
      >
        <div
          className="car-image-container"
          style={{ backgroundImage: `url(${carData.image_url})` }}
        >
          <h2 className="car-model-name">{carData.modelName}</h2>
        </div>
        <div className="car-info">
          <div className="car-info-top">
            <span className="car-tag">{carData.tag}</span>
            <p className="car-short-description">{carData.shortDescription}</p>
          </div>
          {carData.detailsLink !== "no-arrow" && (
            <a href={carData.detailsLink || '#'} className="car-details-arrow"><FaArrowRight /></a>
          )}
        </div>
      </motion.div>
    );
  };

  const visibleCars = [
    cars[currentFirstCardIndex],
    cars[currentFirstCardIndex + 1]
  ].filter(Boolean); // Filtrera bort undefined om det bara finns en bil

  return (
    <div className="horizontal-pin-container" ref={pinContainerRef}>
      <div className="horizontal-sticky-element" ref={stickyElementRef}>
        <div className="visible-cards-wrapper">
          {visibleCars.map((car, index) => (
            <motion.div
              key={car ? car._id : `placeholder-${index}`} // Använd bilens ID eller en unik platshållare-nyckel
              className="card-slot"
              animate={
                hoveredSlot === index ? 'expanded' :
                (hoveredSlot !== null && hoveredSlot !== index) ? 'compressed' :
                'normal'
              }
              variants={slotContainerVariants}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onMouseEnter={() => setHoveredSlot(index)}
              onMouseLeave={() => setHoveredSlot(null)}
            >
              <AnimatePresence initial={false} custom={direction}>
                {renderCarCard(car, index)}
              </AnimatePresence>
            </motion.div>
          ))}
          {/* Lägg till en platshållare om det bara finns en bil och vi bara visar en slot */}
          {cars.length === 1 && visibleCars.length === 1 && (
            <motion.div
              className="card-slot"
              animate={
                hoveredSlot === 1 ? 'expanded' :
                (hoveredSlot !== null && hoveredSlot !== 1) ? 'compressed' :
                'normal'
              }
              variants={slotContainerVariants}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onMouseEnter={() => setHoveredSlot(1)}
              onMouseLeave={() => setHoveredSlot(null)}
            >
                <div className="car-card car-card-placeholder">
                    Ingen annan bil tillgänglig
                </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCardGrid;