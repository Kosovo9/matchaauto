# MATCH-AUTO: CONFIGURACIÓN MULTI-IDIOMA (i18n)

**Fecha:** 31 Diciembre 2025  
**Framework:** next-intl para Next.js

---

## 1. ESTRUCTURA DE ARCHIVOS

```
/match-auto
├── /locales
│   ├── /es                    # Español
│   │   ├── common.json        # Textos comunes (header, footer, botones)
│   │   ├── auth.json          # Autenticación (login, registro)
│   │   ├── listings.json      # Listings (crear, editar, buscar)
│   │   ├── messages.json      # Chat y mensajes
│   │   ├── legal.json         # Términos, privacidad, disclaimers
│   │   └── errors.json        # Mensajes de error
│   ├── /en                    # Inglés
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── listings.json
│   │   ├── messages.json
│   │   ├── legal.json
│   │   └── errors.json
│   ├── /pt                    # Portugués
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── listings.json
│   │   ├── messages.json
│   │   ├── legal.json
│   │   └── errors.json
│   └── /fr                    # Francés (Fase 2)
│       └── ...
├── /src
│   ├── /i18n
│   │   ├── config.ts          # Configuración de idiomas soportados
│   │   ├── request.ts         # Server-side i18n
│   │   └── routing.ts         # Client-side routing
│   └── /middleware.ts         # Detección automática de idioma
```

---

## 2. CONFIGURACIÓN DE next-intl

### Instalación
```bash
pnpm add next-intl
```

### `/src/i18n/config.ts`
```typescript
export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português'
};

export const localeFlags: Record<Locale, string> = {
  es: '🇲🇽',
  en: '🇺🇸',
  pt: '🇧🇷'
};
```

### `/src/middleware.ts` (Detección automática)
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /es/... solo si no es default
  localeDetection: true // Auto-detect from browser
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

---

## 3. ARCHIVOS DE TRADUCCIÓN (Ejemplos)

### `/locales/es/common.json`
```json
{
  "site": {
    "name": "Match-Auto",
    "tagline": "El marketplace de vehículos más grande del mundo",
    "description": "Compra, vende y renta todo tipo de vehículos: autos, motos, camiones, lanchas, aviones y más."
  },
  "nav": {
    "home": "Inicio",
    "search": "Buscar",
    "sell": "Vender",
    "messages": "Mensajes",
    "favorites": "Favoritos",
    "profile": "Perfil",
    "login": "Iniciar sesión",
    "signup": "Registrarse",
    "logout": "Cerrar sesión"
  },
  "footer": {
    "about": "Acerca de",
    "help": "Ayuda",
    "terms": "Términos y condiciones",
    "privacy": "Política de privacidad",
    "contact": "Contacto",
    "copyright": "© 2026 Match-Auto. Todos los derechos reservados."
  },
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "submit": "Enviar",
    "back": "Volver",
    "next": "Siguiente",
    "previous": "Anterior",
    "search": "Buscar",
    "filter": "Filtrar",
    "clear": "Limpiar",
    "apply": "Aplicar",
    "close": "Cerrar",
    "confirm": "Confirmar"
  },
  "time": {
    "justNow": "Justo ahora",
    "minutesAgo": "{count} minuto(s) atrás",
    "hoursAgo": "{count} hora(s) atrás",
    "daysAgo": "{count} día(s) atrás",
    "weeksAgo": "{count} semana(s) atrás",
    "monthsAgo": "{count} mes(es) atrás",
    "yearsAgo": "{count} año(s) atrás"
  }
}
```

### `/locales/es/listings.json`
```json
{
  "create": {
    "title": "Publicar vehículo",
    "step1": "Categoría",
    "step2": "Detalles",
    "step3": "Fotos",
    "step4": "Ubicación",
    "step5": "Precio",
    "selectCategory": "Selecciona el tipo de vehículo",
    "categories": {
      "car": "Auto",
      "motorcycle": "Moto",
      "truck": "Camión",
      "boat": "Lancha",
      "plane": "Avión",
      "rv": "Casa rodante",
      "commercial": "Vehículo comercial",
      "special": "Vehículo especial"
    },
    "fields": {
      "title": "Título del anuncio",
      "titlePlaceholder": "Ej: Toyota Corolla 2020 en excelente estado",
      "description": "Descripción",
      "descriptionPlaceholder": "Describe tu vehículo en detalle...",
      "make": "Marca",
      "model": "Modelo",
      "year": "Año",
      "mileage": "Kilometraje",
      "condition": "Condición",
      "price": "Precio",
      "negotiable": "Negociable",
      "location": "Ubicación",
      "photos": "Fotos (hasta 20)"
    },
    "success": "¡Anuncio publicado exitosamente!",
    "error": "Hubo un error al publicar tu anuncio. Intenta de nuevo."
  },
  "search": {
    "title": "Buscar vehículos",
    "placeholder": "Busca por marca, modelo, año...",
    "filters": "Filtros",
    "results": "{count} resultados encontrados",
    "noResults": "No se encontraron resultados",
    "sortBy": "Ordenar por",
    "sort": {
      "relevance": "Relevancia",
      "priceLow": "Precio: Menor a mayor",
      "priceHigh": "Precio: Mayor a menor",
      "dateNew": "Más recientes",
      "dateOld": "Más antiguos",
      "distance": "Distancia"
    }
  },
  "detail": {
    "contact": "Contactar vendedor",
    "favorite": "Agregar a favoritos",
    "share": "Compartir",
    "report": "Reportar",
    "views": "{count} vistas",
    "posted": "Publicado {time}",
    "location": "Ubicación",
    "description": "Descripción",
    "features": "Características",
    "sellerInfo": "Información del vendedor",
    "similarListings": "Anuncios similares"
  }
}
```

### `/locales/es/auth.json`
```json
{
  "login": {
    "title": "Iniciar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "noAccount": "¿No tienes cuenta?",
    "signupLink": "Regístrate aquí",
    "submit": "Iniciar sesión",
    "orContinueWith": "O continúa con",
    "google": "Google",
    "facebook": "Facebook",
    "apple": "Apple"
  },
  "signup": {
    "title": "Crear cuenta",
    "fullName": "Nombre completo",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "confirmPassword": "Confirmar contraseña",
    "agreeTerms": "Acepto los {termsLink} y la {privacyLink}",
    "termsLink": "términos y condiciones",
    "privacyLink": "política de privacidad",
    "submit": "Crear cuenta",
    "hasAccount": "¿Ya tienes cuenta?",
    "loginLink": "Inicia sesión aquí"
  },
  "errors": {
    "invalidEmail": "Correo electrónico inválido",
    "passwordTooShort": "La contraseña debe tener al menos 8 caracteres",
    "passwordsDoNotMatch": "Las contraseñas no coinciden",
    "emailAlreadyExists": "Este correo ya está registrado",
    "invalidCredentials": "Correo o contraseña incorrectos",
    "accountNotVerified": "Por favor verifica tu correo electrónico"
  }
}
```

### `/locales/es/legal.json`
```json
{
  "terms": {
    "title": "Términos y Condiciones",
    "lastUpdated": "Última actualización: {date}",
    "sections": {
      "acceptance": "Aceptación de los términos",
      "definitions": "Definiciones",
      "useOfService": "Uso del servicio",
      "userAccounts": "Cuentas de usuario",
      "listings": "Publicaciones",
      "payments": "Pagos",
      "liability": "Limitación de responsabilidad",
      "disputes": "Resolución de disputas",
      "changes": "Modificaciones a los términos"
    }
  },
  "privacy": {
    "title": "Política de Privacidad",
    "lastUpdated": "Última actualización: {date}",
    "sections": {
      "dataCollection": "Datos que recolectamos",
      "dataUsage": "Cómo usamos tus datos",
      "dataSharing": "Con quién compartimos tus datos",
      "userRights": "Tus derechos",
      "cookies": "Cookies y tecnologías similares",
      "security": "Seguridad de datos",
      "contact": "Contacto"
    }
  },
  "disclaimer": {
    "title": "Aviso importante",
    "content": "Match-Auto es una plataforma de intermediación que conecta compradores y vendedores. NO somos propietarios de los vehículos publicados ni garantizamos su condición, legalidad o disponibilidad. Es responsabilidad del comprador inspeccionar el vehículo antes de la compra y verificar toda la documentación legal."
  }
}
```

---

## 4. USO EN COMPONENTES

### Server Component
```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('site.name')}</h1>
      <p>{t('site.tagline')}</p>
    </div>
  );
}
```

### Client Component
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function SearchButton() {
  const t = useTranslations('common.buttons');
  
  return <button>{t('search')}</button>;
}
```

### Con variables
```typescript
const t = useTranslations('listings.search');
const count = 42;

return <p>{t('results', { count })}</p>;
// Output: "42 resultados encontrados"
```

---

## 5. SELECTOR DE IDIOMA (Componente)

```typescript
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags } from '@/i18n/config';

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Cambiar idioma manteniendo la ruta actual
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <select value={locale} onChange={(e) => handleChange(e.target.value)}>
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeFlags[loc]} {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

---

## 6. TRADUCCIÓN DE CONTENIDO GENERADO POR USUARIOS

### Opción 1: Traducción Automática con AI (Hugging Face)
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function translateText(text: string, targetLang: string) {
  const response = await hf.translation({
    model: 'facebook/nllb-200-distilled-600M',
    inputs: text,
    parameters: {
      src_lang: 'spa_Latn', // español
      tgt_lang: targetLang === 'en' ? 'eng_Latn' : 'por_Latn'
    }
  });
  
  return response.translation_text;
}
```

### Opción 2: Mostrar idioma original + botón "Traducir"
```typescript
<div>
  <p lang="es">{listing.description}</p>
  {currentLocale !== listing.language && (
    <button onClick={() => translateListing()}>
      Traducir a {localeNames[currentLocale]}
    </button>
  )}
</div>
```

---

## 7. FORMATO DE NÚMEROS, FECHAS Y MONEDAS

### Números
```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();

// Números
format.number(1234567.89); // "1,234,567.89" (en) / "1.234.567,89" (es)

// Moneda
format.number(49999, {
  style: 'currency',
  currency: 'USD'
}); // "$49,999.00" (en) / "$49.999,00" (es)
```

### Fechas
```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();

// Fecha corta
format.dateTime(new Date(), {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}); // "Dec 31, 2025" (en) / "31 dic 2025" (es)

// Fecha relativa
format.relativeTime(new Date('2025-12-30')); // "yesterday" (en) / "ayer" (es)
```

---

## 8. SEO MULTI-IDIOMA

### Metadata por idioma
```typescript
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'common.site' });
  
  return {
    title: t('name'),
    description: t('description'),
    alternates: {
      canonical: `https://match-auto.com/${locale}`,
      languages: {
        'es': 'https://match-auto.com/es',
        'en': 'https://match-auto.com/en',
        'pt': 'https://match-auto.com/pt'
      }
    }
  };
}
```

### Sitemap multi-idioma
```typescript
// /app/sitemap.ts
import { locales } from '@/i18n/config';

export default function sitemap() {
  const baseUrl = 'https://match-auto.com';
  
  const routes = ['', '/search', '/sell', '/help'];
  
  return routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])
        )
      }
    }))
  );
}
```

---

## 9. DETECCIÓN AUTOMÁTICA DE IDIOMA

### Por IP Geolocation (Cloudflare Workers)
```typescript
export async function middleware(request: Request) {
  const country = request.headers.get('CF-IPCountry');
  
  const countryToLocale: Record<string, string> = {
    'MX': 'es',
    'ES': 'es',
    'AR': 'es',
    'US': 'en',
    'CA': 'en',
    'BR': 'pt'
  };
  
  const detectedLocale = countryToLocale[country] || 'es';
  
  // Redirigir si no hay idioma en URL
  const url = new URL(request.url);
  if (!url.pathname.startsWith(`/${detectedLocale}`)) {
    return Response.redirect(`${url.origin}/${detectedLocale}${url.pathname}`);
  }
}
```

### Por Browser Language
```typescript
// Automático con next-intl middleware
// Lee header Accept-Language del browser
```

---

## 10. TESTING DE TRADUCCIONES

### Verificar traducciones faltantes
```typescript
// /scripts/check-translations.ts
import fs from 'fs';
import path from 'path';

const locales = ['es', 'en', 'pt'];
const namespaces = ['common', 'auth', 'listings', 'messages', 'legal', 'errors'];

function checkTranslations() {
  const baseLocale = 'es';
  const errors: string[] = [];
  
  namespaces.forEach((namespace) => {
    const basePath = path.join('locales', baseLocale, `${namespace}.json`);
    const baseKeys = Object.keys(JSON.parse(fs.readFileSync(basePath, 'utf-8')));
    
    locales.forEach((locale) => {
      if (locale === baseLocale) return;
      
      const localePath = path.join('locales', locale, `${namespace}.json`);
      const localeKeys = Object.keys(JSON.parse(fs.readFileSync(localePath, 'utf-8')));
      
      const missingKeys = baseKeys.filter((key) => !localeKeys.includes(key));
      
      if (missingKeys.length > 0) {
        errors.push(`[${locale}/${namespace}] Missing keys: ${missingKeys.join(', ')}`);
      }
    });
  });
  
  if (errors.length > 0) {
    console.error('❌ Translation errors found:');
    errors.forEach((err) => console.error(err));
    process.exit(1);
  } else {
    console.log('✅ All translations complete!');
  }
}

checkTranslations();
```

---

## 11. EXPANSIÓN A MÁS IDIOMAS (Fase 2+)

### Proceso de agregar nuevo idioma:

1. **Agregar locale a config:**
```typescript
// /src/i18n/config.ts
export const locales = ['es', 'en', 'pt', 'fr'] as const;
```

2. **Crear carpeta de traducciones:**
```bash
mkdir locales/fr
cp locales/en/*.json locales/fr/
```

3. **Traducir archivos:**
- Manual (contratar traductor)
- Automático con AI (Hugging Face NLLB-200)
- Híbrido (AI + revisión humana)

4. **Actualizar metadata:**
```typescript
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
  fr: 'Français'
};
```

5. **Testing:**
```bash
npm run check-translations
npm run test:i18n
```

---

## 12. BEST PRACTICES

✅ **DO:**
- Usar namespaces para organizar traducciones
- Incluir contexto en keys (`auth.login.title` vs `title`)
- Usar variables para contenido dinámico (`{count} resultados`)
- Mantener traducciones cortas y concisas
- Probar en todos los idiomas antes de deploy

❌ **DON'T:**
- Hardcodear textos en componentes
- Usar traducciones automáticas sin revisión
- Olvidar pluralización (`1 resultado` vs `2 resultados`)
- Ignorar formatos de fecha/número por región
- Traducir literalmente (considerar contexto cultural)

---

## 13. HERRAMIENTAS RECOMENDADAS

- **Traducción:** DeepL API (mejor que Google Translate)
- **Gestión:** Lokalise, Crowdin (para equipos grandes)
- **Testing:** i18n-ally (VS Code extension)
- **Linting:** eslint-plugin-i18next

---

## CONCLUSIÓN

Con esta configuración, Match-Auto tendrá:
✅ Soporte para **3 idiomas** en MVP (ESP/ENG/POR)  
✅ Expansión fácil a **25+ idiomas**  
✅ Detección automática de idioma  
✅ SEO optimizado multi-idioma  
✅ Traducción de contenido generado por usuarios  
✅ Formato correcto de números, fechas y monedas  

**Próximo paso:** Implementar archivos de traducción completos para los 3 idiomas iniciales.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - The Billion Dollar Marketplace 🚀
