import { useState } from "react";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { FileText, X, Download, Plus, FileIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileUpload from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nanoid } from "nanoid";

interface DocumentListProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
}

export default function DocumentList({ documents, onDocumentsChange }: DocumentListProps) {
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  
  const addDocument = () => {
    // For demo purposes, we're simulating the file upload by creating a Document object
    // In a real application, you would upload the file to a server and get a URL
    let newDoc: Document;
    
    if (documentFile) {
      // Create a fake URL for demo purposes
      const fakeUrl = URL.createObjectURL(documentFile);
      newDoc = {
        id: nanoid(),
        name: documentName || documentFile.name,
        type: documentFile.type,
        url: fakeUrl,
        dateAdded: new Date().toISOString()
      };
    } else if (documentUrl) {
      newDoc = {
        id: nanoid(),
        name: documentName || "Document",
        type: "application/pdf",
        url: documentUrl,
        dateAdded: new Date().toISOString()
      };
    } else {
      return; // No document to add
    }
    
    onDocumentsChange([...documents, newDoc]);
    resetDocumentForm();
    setIsAddDocumentOpen(false);
  };
  
  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };
  
  const resetDocumentForm = () => {
    setDocumentFile(null);
    setDocumentName("");
    setDocumentUrl("");
  };
  
  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddDocumentOpen(true)}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Document
        </Button>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-md bg-muted/50">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No documents attached</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-3 border rounded-md bg-card hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getDocumentIcon(doc.type)}
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Added on {new Date(doc.dateAdded).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive" 
                  onClick={() => removeDocument(doc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>
              Upload a document or provide a URL to attach to this profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <FileUpload
              id="document-upload"
              label="Document"
              accept=".pdf,application/pdf"
              value={documentFile || documentUrl}
              onChange={(value) => {
                if (value instanceof File) {
                  setDocumentFile(value);
                  setDocumentUrl("");
                } else if (typeof value === "string") {
                  setDocumentUrl(value);
                  setDocumentFile(null);
                } else {
                  setDocumentFile(null);
                  setDocumentUrl("");
                }
              }}
              helperText="Upload a PDF document"
            />
            
            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name (Optional)</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter a name for this document"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetDocumentForm();
              setIsAddDocumentOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={addDocument}
              disabled={!documentFile && !documentUrl}
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}