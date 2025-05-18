import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  value?: string | File;
  onChange: (value: File | string | null) => void;
  previewUrl?: string;
  helperText?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  id,
  label,
  accept = "image/*",
  value,
  onChange,
  previewUrl,
  helperText,
  maxSize = 5, // Default 5MB
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file preview
  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === "string" && value) {
      setPreview(value);
    } else if (previewUrl) {
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }
  }, [value, previewUrl]);
  
  const isImage = accept.includes('image');
  
  const handleFileChange = (file: File | null) => {
    if (!file) {
      onChange(null);
      setError(null);
      return;
    }
    
    // Size validation
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    // Type validation for images
    if (isImage && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Type validation for documents
    if (accept.includes('application/pdf') && !file.type.includes('pdf')) {
      setError('Please select a PDF file');
      return;
    }
    
    setError(null);
    onChange(file);
  };
  
  // Handle manual file selection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };
  
  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleUrlInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      
      {/* Hidden file input for actual file selection */}
      <Input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {/* Visual upload area */}
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
          error ? "border-destructive" : ""
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative flex flex-col items-center justify-center">
            {isImage ? (
              <div className="relative w-32 h-32 mx-auto mb-2">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-md"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="relative flex items-center p-2 bg-muted rounded mb-2 max-w-xs mx-auto">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span className="text-sm truncate">{value instanceof File ? value.name : 'Document'}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <span className="text-sm text-muted-foreground">Click to change</span>
          </div>
        ) : (
          <div className="py-4">
            {isImage ? (
              <Image className="mx-auto h-10 w-10 text-gray-400" />
            ) : (
              <FileText className="mx-auto h-10 w-10 text-gray-400" />
            )}
            <div className="mt-2 flex justify-center text-sm text-gray-500">
              <label className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none">
                <span>Upload a file</span>
                <span className="ml-1">or drag and drop</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isImage ? 'PNG, JPG, JPEG up to ' : 'PDF up to '}
              {maxSize}MB
            </p>
          </div>
        )}
      </div>
      
      {/* Alternative URL input */}
      {isImage && (
        <div className="flex mt-2">
          <Input
            type="text"
            placeholder="Or enter image URL"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
        </div>
      )}
      
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground mt-1">{helperText}</p>}
    </div>
  );
}