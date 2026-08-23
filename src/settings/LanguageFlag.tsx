import { LANGUAGE_FLAGS } from './language-flags';

type LanguageFlagProps = {
  languageId: string;
};

// Decorative: the language name is always the accessible label, so alt stays empty.
// The hairline keeps white-heavy flags (Japan, Indonesia, Poland, Finland) off the panel.
export function LanguageFlag({ languageId }: LanguageFlagProps) {
  const flag = LANGUAGE_FLAGS[languageId];
  if (!flag) return null;
  return (
    <img
      src={flag}
      alt=""
      className="h-[18px] w-6 rounded-xs shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
    />
  );
}
