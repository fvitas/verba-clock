import bg from 'flag-icons/flags/4x3/bg.svg';
import ch from 'flag-icons/flags/4x3/ch.svg';
import cn from 'flag-icons/flags/4x3/cn.svg';
import cz from 'flag-icons/flags/4x3/cz.svg';
import de from 'flag-icons/flags/4x3/de.svg';
import dk from 'flag-icons/flags/4x3/dk.svg';
import esCt from 'flag-icons/flags/4x3/es-ct.svg';
import fi from 'flag-icons/flags/4x3/fi.svg';
import fr from 'flag-icons/flags/4x3/fr.svg';
import gb from 'flag-icons/flags/4x3/gb.svg';
import gr from 'flag-icons/flags/4x3/gr.svg';
import hu from 'flag-icons/flags/4x3/hu.svg';
import id from 'flag-icons/flags/4x3/id.svg';
import il from 'flag-icons/flags/4x3/il.svg';
import is from 'flag-icons/flags/4x3/is.svg';
import it from 'flag-icons/flags/4x3/it.svg';
import jp from 'flag-icons/flags/4x3/jp.svg';
import kr from 'flag-icons/flags/4x3/kr.svg';
import mk from 'flag-icons/flags/4x3/mk.svg';
import nl from 'flag-icons/flags/4x3/nl.svg';
import no from 'flag-icons/flags/4x3/no.svg';
import pl from 'flag-icons/flags/4x3/pl.svg';
import ro from 'flag-icons/flags/4x3/ro.svg';
import ru from 'flag-icons/flags/4x3/ru.svg';
import se from 'flag-icons/flags/4x3/se.svg';
import si from 'flag-icons/flags/4x3/si.svg';
import sk from 'flag-icons/flags/4x3/sk.svg';
import tr from 'flag-icons/flags/4x3/tr.svg';
import ua from 'flag-icons/flags/4x3/ua.svg';
import us from 'flag-icons/flags/4x3/us.svg';
// The four flags whose detail is invisible at 24px yet blew past Vite's 4096 B inline limit as
// SVG. Rasterized by scripts/render-flag-png.mjs — es 6x, pt 4x, rest 3x — so all 36 now inline.
import arab from './flags/arab.png';
import es from './flags/es.png';
import pt from './flags/pt.png';
import rs from './flags/rs.png';

// Presentation only, so it lives here rather than on LanguageDef — the engine, the
// widgets and the watch all consume LanguageDef and none of them wants a flag in it.
// Never import flag-icons' CSS: it references all 271 flags, which would bundle every one.
// `null` is the escape hatch for a future face with no honest flag; the row keeps the
// slot either way, so the names stay aligned.
export const LANGUAGE_FLAGS: Record<string, string | null> = {
  en: gb,
  e2: us,
  de,
  d2: de,
  d3: de, // Swabian is a German dialect, so it inherits the German flag
  d4: de,
  ch,
  fr,
  it,
  es,
  ca: esCt, // the Senyera, not Spain — emoji has no Catalonia, flag-icons does
  nl,
  dk,
  no,
  se,
  fi,
  ic: is,
  cz,
  sk,
  sl: si,
  ro,
  pe: pt, // the face is European Portuguese
  tr,
  ru,
  ua,
  gr,
  sr: rs,
  mk,
  cn,
  bg,
  hu,
  pl,
  ar: arab, // the Arab League, not a member state — the face is Modern Standard Arabic
  he: il,
  ja: jp,
  kr,
  id,
};
