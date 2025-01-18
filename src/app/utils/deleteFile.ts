/* eslint-disable no-undef */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import  path  from 'path';
import  fs  from 'fs';

export const getAbsoluteFilePath = (dbPath: string) => {
    try {
      const relativePath = dbPath
        .replace(/^\//, '')
        .replace(/^uploads\//, '');
      const uploadsDir = path.join(__dirname,'./uploads');    
      return path.join(uploadsDir, relativePath);
    } catch (error) {
      console.error('Error constructing file path:', error);
      return null;
    }
  };
  
  export const deleteFile = (filePath: string) => {
    try {
      if (!filePath) {
        console.error('Error: File path is undefined or null.');
        return false;
      }
      const normalizedPath = path.normalize(filePath);
      if (fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
        return true;
      } else {
        console.warn(`File not found: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
      return false;
    }
  };