import Image from 'next/image';

export default function TestImagesPage() {
  const testImages = [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    'https://ugctohwrmliejdbrkter.supabase.co/storage/v1/object/public/car-images/test.jpg',
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg p-4">
            <p className="text-sm mb-2">Image {index + 1}</p>
            <div className="relative aspect-video bg-gray-100">
              <Image
                src={src}
                alt={`Test image ${index + 1}`}
                fill
                className="object-cover rounded"
                onError={(e) => {
                  console.error(`Failed to load image ${index + 1}:`, src);
                }}
              />
            </div>
            <p className="text-xs mt-2 truncate">{src}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Fallback Image Test</h2>
        <div className="relative w-64 h-64 bg-gray-100">
          <Image
            src="/car-placeholder.svg"
            alt="Placeholder"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}