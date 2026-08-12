"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin } from "lucide-react";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/lib/maps-utils";

interface MapsPreviewModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
}

export function MapsPreviewModal({ open, onClose, location }: MapsPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-duocal-accent" />
            {location}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-duocal-border">
          <iframe
            title={`Map of ${location}`}
            src={getGoogleMapsEmbedUrl(location)}
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <a href={getGoogleMapsUrl(location)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Google Maps
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
