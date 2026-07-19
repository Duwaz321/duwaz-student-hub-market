import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateBusiness } from '@/hooks/useCreateBusiness';
import { useAuth } from '@/context/AuthContext';

const CreateShopPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createBusiness, isPending } = useCreateBusiness();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image must be smaller than 2MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setLogoBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast({ title: 'Shop name is required', variant: 'destructive' });
      return;
    }

    createBusiness(
      {
        businessName: formData.businessName,
        description: formData.description,
        logoUrl: logoBase64 ?? undefined,
        student: user ? ({ id: user.userId } as any) : undefined,
      },
      {
        onSuccess: (createdShop) => {
          toast({
            title: 'Shop created successfully!',
            description: 'Your shop is now live in the marketplace.',
          });
          navigate(`/shop/${createdShop.id}`);
        },
        onError: (err) => {
          toast({
            title: 'Failed to create shop',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Create Your Shop</h1>
      <p className="text-gray-600 mb-8">Start selling your products to the student community</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Shop Logo Upload */}
          <div>
            <Label className="block mb-2">Shop Logo</Label>
            <div className="flex items-center gap-6">
              {/* Preview / Upload button */}
              <div className="relative w-28 h-28 flex-shrink-0">
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Shop logo preview"
                      className="w-28 h-28 rounded-full object-cover border-2 border-duwaz-brown"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-1 text-xs text-gray-400">Upload</span>
                  </button>
                )}
              </div>

              {/* Info text */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>Upload a logo for your shop.</p>
                <p>Recommended: square image, at least 200×200px.</p>
                <p>Max size: 2MB. Formats: JPG, PNG, WebP.</p>
                {!logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Image
                  </Button>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* Shop Name */}
          <div>
            <Label htmlFor="businessName" className="block mb-1">
              Shop Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="e.g. Snack Haven, Campus Bakery"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block mb-1">
              Shop Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell customers about your shop, what you sell, and what makes it special"
              value={formData.description}
              onChange={handleChange}
              required
              className="min-h-[120px]"
            />
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90"
              disabled={isPending}
            >
              {isPending ? 'Creating your shop...' : 'Create Shop'}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">What Happens After Creating Your Shop?</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Your shop page will be created and visible in the marketplace</li>
          <li>You can start adding products to sell to the student community</li>
          <li>Set up payment methods to receive money from sales</li>
          <li>Manage orders and track your performance through your shop dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateShopPage;
