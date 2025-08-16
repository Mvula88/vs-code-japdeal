'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TestImageDebugPage() {
  const [imageData, setImageData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/debug/images')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setImageData(data);
      })
      .catch(err => {
        console.error('Failed to fetch:', err);
        setError(err.message);
      });
  }, []);

  const testUrls = [
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://ugctohwrmliejdbrkter.supabase.co/storage/v1/object/public/car-images/test.jpg',
    '/car-placeholder.svg'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Image Debug Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          Error: {error}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Direct Image Tests</h2>
        <div className="grid grid-cols-3 gap-4">
          {testUrls.map((url, idx) => (
            <div key={idx} className="border p-4 rounded">
              <p className="text-sm mb-2">Test {idx + 1}: {url.substring(0, 50)}...</p>
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={url} 
                  alt={`Test ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load image ${idx + 1}:`, url);
                    (e.target as HTMLImageElement).src = '/car-placeholder.svg';
                  }}
                />
              </div>
              <p className="text-xs mt-2">Using standard img tag</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Next.js Image Component Tests</h2>
        <div className="grid grid-cols-3 gap-4">
          {testUrls.map((url, idx) => (
            <div key={idx} className="border p-4 rounded">
              <p className="text-sm mb-2">Next Image {idx + 1}</p>
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={url}
                  alt={`Next Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error(`Next Image failed ${idx + 1}:`, url);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {imageData && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Database Images</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(imageData, null, 2)}
          </pre>
          
          {imageData.data && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {imageData.data.map((lot: any) => (
                <div key={lot.lot_number} className="border p-4 rounded">
                  <p className="font-bold mb-2">{lot.lot_number}</p>
                  {lot.images.map((img: any, idx: number) => (
                    <div key={img.id} className="mb-2">
                      <p className="text-xs mb-1">Image {idx + 1} {img.is_thumbnail ? '(Thumbnail)' : ''}</p>
                      <div className="relative h-32 bg-gray-100">
                        <img
                          src={img.file_path}
                          alt={`${lot.lot_number} image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('DB image failed:', img.file_path);
                            (e.target as HTMLImageElement).src = '/car-placeholder.svg';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}