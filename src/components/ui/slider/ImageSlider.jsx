import React, { useEffect, useState } from "react";

const images = [
  "/banner_1.jpg",
  "/banner_2.jpg",
  "/banner_3.jpg",
  "/banner_4.jpg",
  "/banner_5.jpg",
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Previous
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Next
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Image */}
      <div className="w-full">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="block h-auto max-h-[500px] w-full object-contain"
        />
      </div>

      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrevious}
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-5 sm:h-10 sm:w-10"
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-5 sm:h-10 sm:w-10"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-[#ff7f11]"
                : "w-2 bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;