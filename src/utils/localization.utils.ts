//src/utils/localization.ts

import en from '../locales';

type Locale = 'en' | 'hi';

interface LocalizedMessages {
  [key: string]: string | LocalizedMessages;
}

const messages: Record<Locale, LocalizedMessages> = {
  en: en,
  hi: {},
};

function getLocalizedMessage(key: string, locale: Locale = 'en'): string {
  const localizedMessages = messages[locale];

  const getNestedMessage = (
    key: string,
    obj: LocalizedMessages
  ): string | undefined => {
    return key.split('.').reduce((result, part) => {
      if (typeof result === 'object' && result !== null && part in result) {
        return result[part];
      }
      return undefined;
    }, obj as any) as string | undefined;
  };

  return (
    getNestedMessage(key, localizedMessages) ||
    getNestedMessage(key, messages['en']) ||
    'Message not found'
  );
}

export { getLocalizedMessage, Locale };
