import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const useShopAppInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const updateInstalled = () => setIsInstalled(media.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    updateInstalled();
    media.addEventListener('change', updateInstalled);
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      media.removeEventListener('change', updateInstalled);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  return { installPrompt, isInstalled };
};

const InstallShopAppButton = () => {
  const { toast } = useToast();
  const { installPrompt, isInstalled } = useShopAppInstall();

  const install = async () => {
    if (!installPrompt) {
      toast({
        title: 'Install Duwaz Shop',
        description: 'Use your browser menu and choose Install app or Add to Home Screen.',
      });
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      toast({ title: 'Duwaz Shop is installing' });
    }
  };

  if (isInstalled) return null;

  return (
    <Button type="button" variant="outline" size="sm" onClick={install}>
      {installPrompt ? <Download className="mr-1.5 h-4 w-4" /> : <Smartphone className="mr-1.5 h-4 w-4" />}
      Install app
    </Button>
  );
};

export default InstallShopAppButton;
