# Centro Heydar Aliyev — Sitio Web Interactivo

Página web profesional e interactiva sobre el **Centro Cultural Heydar Aliyev** de Bakú, Azerbaiyán. Diseñado por Zaha Hadid Architects (2012).

## Características

- Modelo 3D interactivo con **Three.js** (arrastra para rotar)
- Fondo animado 3D paramétrico en el hero
- Galería fotográfica con lightbox
- Animaciones de scroll suaves
- Contadores animados de estadísticas
- Timeline de construcción
- Biografía completa de Zaha Hadid
- Mapa interactivo de ubicación
- **100% responsive** (móvil, tablet, escritorio)
- Un solo archivo HTML — sin dependencias locales

## Cómo publicar en GitHub Pages

```bash
# 1. Crea un repositorio en github.com (nombre sugerido: heydar-aliyev-center)

# 2. Desde esta carpeta:
git init
git add index.html
git commit -m "Add Heydar Aliyev Center webpage"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/heydar-aliyev-center.git
git push -u origin main
```

### 3. Activar GitHub Pages
- Ve a tu repositorio en GitHub
- Settings → Pages
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Save

Tu sitio estará disponible en:
`https://TU_USUARIO.github.io/heydar-aliyev-center/`
