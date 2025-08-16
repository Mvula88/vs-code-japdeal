'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Save, ArrowLeft, Plus, Trash2, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CarMake {
  id: string;
  name: string;
}

export default function NewLotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [lotNumber, setLotNumber] = useState('');
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [newMakeName, setNewMakeName] = useState('');
  const [isAddingMake, setIsAddingMake] = useState(false);
  const [auctionType, setAuctionType] = useState('live');
  const [soldPrice, setSoldPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  const [formData, setFormData] = useState({
    vin: '',
    model: '',
    year: '',
    mileage: '',
    engine: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    bodyType: 'sedan',
    description: '',
    startingPrice: '',
    customDays: '14',
  });

  // Fetch lot number on component mount
  useEffect(() => {
    fetchNextLotNumber();
    fetchCarMakes();
  }, []);

  // Cleanup image preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const fetchNextLotNumber = async () => {
    try {
      const response = await fetch('/api/admin/lots/next-number');
      const data = await response.json();
      setLotNumber(data.nextLotNumber || 'LOT0001');
    } catch (error) {
      console.error('Error fetching lot number:', error);
      // Generate a fallback lot number
      setLotNumber(`LOT${Date.now().toString().slice(-4)}`);
    }
  };

  const fetchCarMakes = async () => {
    try {
      const response = await fetch('/api/admin/car-makes');
      const data = await response.json();
      setCarMakes(data.carMakes || []);
    } catch (error) {
      console.error('Error fetching car makes:', error);
      // Set default makes if fetch fails
      setCarMakes([
        { id: '1', name: 'Toyota' },
        { id: '2', name: 'Nissan' },
        { id: '3', name: 'Honda' },
        { id: '4', name: 'Mazda' },
        { id: '5', name: 'Mitsubishi' },
      ]);
    }
  };

  const handleAddMake = async () => {
    if (!newMakeName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a car make name.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingMake(true);
    try {
      const response = await fetch('/api/admin/car-makes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newMakeName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${newMakeName} has been added to car makes.`,
        });
        
        // Add to local state
        const newMake = data.carMake || { id: Date.now().toString(), name: newMakeName };
        setCarMakes([...carMakes, newMake]);
        setSelectedMake(newMake.id);
        setNewMakeName('');
      } else {
        throw new Error(data.error || 'Failed to add car make');
      }
    } catch (error) {
      console.error('Error adding car make:', error);
      toast({
        title: 'Error',
        description: 'Failed to add car make. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingMake(false);
    }
  };

  const handleDeleteMake = async (makeId: string) => {
    const make = carMakes.find(m => m.id === makeId);
    if (!make) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${make.name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/car-makes?id=${makeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${make.name} has been deleted.`,
        });
        
        // Remove from local state
        setCarMakes(carMakes.filter(m => m.id !== makeId));
        if (selectedMake === makeId) {
          setSelectedMake('');
        }
      } else {
        throw new Error('Failed to delete car make');
      }
    } catch (error) {
      console.error('Error deleting car make:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete car make. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = selectedImages.length + newFiles.length;

    if (totalFiles > 10) {
      toast({
        title: 'Error',
        description: 'You can only upload up to 10 images.',
        variant: 'destructive',
      });
      return;
    }

    // Create preview URLs for new images
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setSelectedImages([...selectedImages, ...newFiles]);
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);

    toast({
      title: 'Images added',
      description: `${newFiles.length} image(s) selected. Total: ${totalFiles}`,
    });
  };

  const handleImageRemove = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);

    // Remove image from arrays
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviewUrls(newUrls);

    // Update featured image index if needed
    if (index === featuredImageIndex) {
      setFeaturedImageIndex(0);
    } else if (index < featuredImageIndex) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }

    toast({
      title: 'Image removed',
      description: `Image removed. ${newImages.length} image(s) remaining.`,
    });
  };

  const handleSetFeatured = (index: number) => {
    setFeaturedImageIndex(index);
    toast({
      title: 'Featured image set',
      description: `Image ${index + 1} is now the featured image.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMake) {
      toast({
        title: 'Error',
        description: 'Please select a car make.',
        variant: 'destructive',
      });
      return;
    }

    if (auctionType === 'ended' && !soldPrice) {
      toast({
        title: 'Error',
        description: 'Please enter the sold price for ended auction.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Prepare lot data
      const selectedMakeData = carMakes.find(m => m.id === selectedMake);
      
      // Create the lot via API
      const response = await fetch('/api/admin/lots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lot_number: lotNumber,
          make: selectedMakeData?.name,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          engine: formData.engine,
          transmission: formData.transmission,
          fuel_type: formData.fuelType,
          body_type: formData.bodyType,
          vin: formData.vin,
          condition: 'excellent', // Default value
          features: [],
          starting_price: auctionType === 'ended' ? null : parseFloat(formData.startingPrice),
          current_price: auctionType === 'ended' ? parseFloat(soldPrice) : parseFloat(formData.startingPrice),
          bid_increment: 1000, // Default value
          reserve_price: null,
          start_at: startDate?.toISOString(),
          end_at: endDate?.toISOString(),
          state: auctionType === 'ended' ? 'ended' : auctionType,
          sold_price: auctionType === 'ended' ? parseFloat(soldPrice) : null,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lot');
      }

      const lotData = await response.json();

      // Upload images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('lotId', lotData.id);
        
        selectedImages.forEach((image) => {
          imageFormData.append('images', image);
        });

        const imageResponse = await fetch('/api/admin/lots/images', {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          console.error('Failed to upload some images');
          toast({
            title: 'Warning',
            description: 'Lot created but some images failed to upload.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Lot created successfully',
        description: `Lot ${lotNumber} has been added to the platform.`,
      });
      
      router.push('/admin/lots');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create lot. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Lot</h1>
          <p className="text-muted-foreground">
            Add a new vehicle to the auction platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>
              Enter the vehicle details for this auction lot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lot-number">Lot Number (Auto-generated)</Label>
                <Input 
                  id="lot-number" 
                  value={lotNumber} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input 
                  id="vin" 
                  placeholder="Vehicle Identification Number" 
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <div className="flex space-x-2">
                  <Select value={selectedMake} onValueChange={setSelectedMake}>
                    <SelectTrigger id="make" className="flex-1">
                      <SelectValue placeholder="Select car make" />
                    </SelectTrigger>
                    <SelectContent>
                      {carMakes.map((make) => (
                        <div key={make.id} className="flex items-center justify-between">
                          <SelectItem value={make.id} className="flex-1">
                            {make.name}
                          </SelectItem>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Car Makes</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter new car make"
                            value={newMakeName}
                            onChange={(e) => setNewMakeName(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddMake}
                            disabled={isAddingMake}
                          >
                            {isAddingMake ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {carMakes.map((make) => (
                            <div key={make.id} className="flex items-center justify-between p-2 border rounded">
                              <span>{make.name}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteMake(make.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  placeholder="Land Cruiser" 
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  type="number" 
                  placeholder="2020" 
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input 
                  id="mileage" 
                  type="number" 
                  placeholder="45000" 
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine">Engine</Label>
                <Input 
                  id="engine" 
                  placeholder="4.5L V8 Diesel" 
                  value={formData.engine}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select 
                  value={formData.transmission} 
                  onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                >
                  <SelectTrigger id="transmission">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel-type">Fuel Type</Label>
                <Select 
                  value={formData.fuelType} 
                  onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
                >
                  <SelectTrigger id="fuel-type">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="body-type">Body Type</Label>
                <Select 
                  value={formData.bodyType} 
                  onValueChange={(value) => setFormData({ ...formData, bodyType: value })}
                >
                  <SelectTrigger id="body-type">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="coupe">Coupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter vehicle description and features..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auction Details</CardTitle>
            <CardDescription>
              Configure auction settings for this lot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="auction-type">Auction Type</Label>
                <Select value={auctionType} onValueChange={setAuctionType}>
                  <SelectTrigger id="auction-type">
                    <SelectValue placeholder="Select auction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live Auction</SelectItem>
                    <SelectItem value="upcoming">Upcoming Auction</SelectItem>
                    <SelectItem value="ended">Ended Auction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {auctionType === 'ended' ? (
                <div className="space-y-2">
                  <Label htmlFor="sold-price">Sold Price (N$)</Label>
                  <Input 
                    id="sold-price" 
                    type="number" 
                    placeholder="250000" 
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    required={auctionType === 'ended'}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="starting-price">Starting Price (N$)</Label>
                  <Input 
                    id="starting-price" 
                    type="number" 
                    placeholder="150000" 
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    required={auctionType !== 'ended'}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {auctionType === 'live' && (
              <div className="space-y-2">
                <Label htmlFor="custom-days">Custom Auction Duration (days)</Label>
                <Input 
                  id="custom-days" 
                  type="number" 
                  placeholder="14" 
                  value={formData.customDays}
                  onChange={(e) => setFormData({ ...formData, customDays: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Set custom duration for this live auction
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Images</CardTitle>
            <CardDescription>
              Upload photos of the vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Upload Area */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop images here, or click to browse
                </p>
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" className="mt-4" type="button" asChild>
                    <span>Select Images</span>
                  </Button>
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Maximum 10 images, up to 5MB each
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the star icon to set an image as the featured/thumbnail image
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        {/* Featured Badge */}
                        {index === featuredImageIndex && (
                          <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </div>
                        )}
                        
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className={cn(
                            "w-full h-32 object-cover rounded-lg border-2 transition-all",
                            index === featuredImageIndex 
                              ? "border-primary ring-2 ring-primary/20" 
                              : "border-border"
                          )}
                        />
                        
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant={index === featuredImageIndex ? "default" : "secondary"}
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSetFeatured(index)}
                            title="Set as featured image"
                          >
                            <Star className={cn(
                              "h-3 w-3",
                              index === featuredImageIndex && "fill-current"
                            )} />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleImageRemove(index)}
                            title="Remove image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Lot
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}