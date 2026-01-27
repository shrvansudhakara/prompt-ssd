import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Pre-configured Uploadthing components for file uploads
 */
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
