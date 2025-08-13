'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: { id: string; file_path: string; is_thumbnail?: boolean; display_order: number }[];
  carTitle: string;
}

export default function ImageGallery({ images, carTitle }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-video flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">No images available</p>
      </Card>
    );
  }

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_thumbnail) return -1;
    if (b.is_thumbnail) return 1;
    return a.display_order - b.display_order;
  });

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={sortedImages[selectedIndex].file_path}
            alt={`${carTitle} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
          
          {/* Navigation Buttons */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
            onClick={() => setIsFullscreen(true)}
          >
            <Expand className="h-4 w-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        {sortedImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative aspect-video rounded overflow-hidden border-2 transition-all',
                  selectedIndex === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted-foreground'
                )}
              >
                <Image
                  src={image.file_path}
                  alt={`${carTitle} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {image.is_thumbnail && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                    Main
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-[90vh]">
            <Image
              src={sortedImages[selectedIndex].file_path}
              alt={`${carTitle} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
            
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}