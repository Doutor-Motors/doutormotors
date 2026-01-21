import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  /** The URL to encode in the QR code */
  url: string;
  /** The size of the QR code in pixels */
  size?: number;
  /** Alt text for accessibility */
  alt?: string;
  /** Label text below the QR code */
  label?: string;
  /** Color of the QR code (hex) */
  color?: string;
  /** Background color (hex) */
  bgColor?: string;
  /** Show a placeholder if URL is empty */
  showPlaceholder?: boolean;
  /** Placeholder text */
  placeholderText?: string;
  className?: string;
}

/**
 * QR Code Display Component
 * Uses the public QR Server API to generate QR codes
 * https://goqr.me/api/
 */
const QRCodeDisplay = ({
  url,
  size = 200,
  alt = "QR Code",
  label,
  color = "000000",
  bgColor = "ffffff",
  showPlaceholder = false,
  placeholderText = "QR Code - Em breve",
  className = "",
}: QRCodeDisplayProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset states when URL changes
  useEffect(() => {
    if (url) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [url]);

  // If no URL provided, show placeholder
  if (!url || showPlaceholder) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-muted rounded-lg ${className}`}>
        <QrCode className="w-24 h-24 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground text-center">{placeholderText}</p>
      </div>
    );
  }

  // Generate QR code URL using the public API
  // Format: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=URL
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=${color}&bgcolor=${bgColor}&format=svg`;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative bg-white p-3 rounded-xl shadow-sm">
        {isLoading && (
          <Skeleton className="absolute inset-3 rounded-lg" />
        )}
        
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-4 text-muted-foreground" style={{ width: size, height: size }}>
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs text-center">Erro ao carregar QR Code</p>
          </div>
        ) : (
          <img
            src={qrApiUrl}
            alt={alt}
            width={size}
            height={size}
            className={`rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
      
      {label && (
        <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
      )}
    </div>
  );
};

/**
 * Pre-configured QR codes for app stores
 */
export const PlayStoreQRCode = ({ 
  appId = "app.doutormotors.android",
  size = 150,
  className = ""
}: { appId?: string; size?: number; className?: string }) => {
  // When the app is published, this will be the real Play Store URL
  const playStoreUrl = `https://play.google.com/store/apps/details?id=${appId}`;
  
  // For now, show placeholder since app is not yet published
  return (
    <QRCodeDisplay
      url=""
      size={size}
      alt="QR Code para Google Play Store"
      label="Escaneie para baixar na Play Store"
      showPlaceholder={true}
      placeholderText="Play Store - Em breve"
      className={className}
    />
  );
};

export const AppStoreQRCode = ({ 
  appId = "app.doutormotors",
  size = 150,
  className = ""
}: { appId?: string; size?: number; className?: string }) => {
  // When the app is published, this will be the real App Store URL
  const appStoreUrl = `https://apps.apple.com/app/${appId}`;
  
  // For now, show placeholder since app is not yet published
  return (
    <QRCodeDisplay
      url=""
      size={size}
      alt="QR Code para App Store"
      label="Escaneie para baixar na App Store"
      showPlaceholder={true}
      placeholderText="App Store - Em breve"
      className={className}
    />
  );
};

/**
 * QR Code for the current page (PWA install)
 */
export const PWAInstallQRCode = ({ 
  size = 150,
  className = ""
}: { size?: number; className?: string }) => {
  // Use the current page URL for PWA install
  const pwaUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/baixar-app` 
    : 'https://doutormotors.com.br/baixar-app';
  
  return (
    <QRCodeDisplay
      url={pwaUrl}
      size={size}
      alt="QR Code para instalar o PWA"
      label="Escaneie para acessar no celular"
      color="dc2626"
      className={className}
    />
  );
};

export default QRCodeDisplay;
