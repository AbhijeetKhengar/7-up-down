import { Translations } from '../types/message';
import fs from 'fs';
import path from 'path';

class LocalizationService {
  private locales: Record<string, Translations> = {};
  private currentLocale: string = 'en';

  constructor() {
    try {
      this.loadLocales();
    } catch (error) {
      console.error('Error loading locales:', error);
      throw error;
    }
  }

  private loadLocales() {
    const localesDir = path.join(__dirname, '../locales');

    // Validate locales directory exists
    if (!fs.existsSync(localesDir)) {
      throw new Error(`Locales directory not found: ${localesDir}`);
    }

    const files = fs
      .readdirSync(localesDir)
      .filter((file) => path.extname(file) === '.json');

    if (files.length === 0) {
      console.warn('No locale JSON files found in the locales directory');
    }

    files.forEach((file) => {
      try {
        const localeName = path.basename(file, '.json');
        const filePath = path.join(localesDir, file);

        const fileContent = fs
          .readFileSync(filePath, 'utf-8')
          .replace(/^\uFEFF/, '');

        try {
          const parsedContent: Translations = JSON.parse(fileContent);

          if (typeof parsedContent !== 'object') {
            throw new Error('Parsed content is not a valid object');
          }

          this.locales[localeName] = parsedContent;
          //console.log(`Loaded locale: ${localeName}`);
        } catch (parseError) {
          console.error(`Error parsing locale file ${file}:`, parseError);
          throw parseError;
        }
      } catch (fileError) {
        console.error(`Error processing locale file ${file}:`, fileError);
      }
    });

    if (Object.keys(this.locales).length === 0) {
      throw new Error('No valid locales were loaded');
    }
  }

  setLocale(locale: string) {
    if (!this.locales[locale]) {
      throw new Error(
        `Locale "${locale}" not found. Available locales: ${Object.keys(
          this.locales
        ).join(', ')}`
      );
    }
    this.currentLocale = locale;
  }

  get translations(): Translations {  
    return this.locales[this.currentLocale];
  }

  // Optional: method to get available locales
  getAvailableLocales(): string[] {
    return Object.keys(this.locales);
  }
}

export const localizationService = new LocalizationService();
