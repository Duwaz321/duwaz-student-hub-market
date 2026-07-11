import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createBusiness(
      {
        businessName: formData.businessName,
        description: formData.description,
        student: user ? { id: user.userId } as any : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Shop created successfully!',
            description: 'Your shop is now live in the marketplace.',
          });
          navigate('/marketplace');
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
          {/* Logo placeholder — image upload requires a backend file endpoint (future step) */}
          <div>
            <Label className="block mb-2">Shop Logo</Label>
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-full bg-gray-50">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="block mb-1">
                Shop Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Enter your shop name"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="block mb-1">
                Shop Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell customers about your shop and what makes it special"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              className="w-full bg-duwaz-brown hover:bg-duwaz-brown/90"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Shop'}
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
