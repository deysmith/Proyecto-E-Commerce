# Booksmart

<p align="center">
  <img src="https://img.shields.io/badge/Curso-IC8063_Comercio_Electrónico_II-orange" />
  <img src="https://img.shields.io/badge/Tarea-II_Semestre_2026-brown" />
  <img src="https://img.shields.io/badge/Versión-1.5.0-green" />
</p>


---

## Sobre el proyecto

Booksmart es una aplicación web de comercio electrónico  enfocada en la venta y consulta de libros.

La aplicación ofrece un catálogo de productos donde los usuarios pueden buscar libros, aplicar filtros, consultar el detalle de cada producto y gestionar un carrito de compras.

Para la búsqueda y filtrado se utiliza Algolia, permitiendo realizar consultas sobre diferentes atributos de los libros y obtener resultados de manera rápida.

El modelo de productos fue diseñado inicialmente para un entorno B2C, pero también contempla información para una futura extensión hacia un modelo B2B, como precios mayoristas, cantidades mínimas de compra y descuentos por volumen.

---

## Funcionalidades

- Búsqueda de libros implementada  mediante Algolia.
- Filtros por categoría, editorial e idioma.
- Filtro por rango de precio.
- Página de detalle de cada producto.
- Carrito de compras.
- Historial de búsquedas recientes.
- Search as you type

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| **React** | Desarrollo de la interfaz |
| **TypeScript** | Tipado y desarrollo |
| **Vite** | Desarrollo y build |
| **React Router** | Navegación entre páginas |
| **React InstantSearch** | Integración de Algolia con React |
| **Algolia** | Búsqueda y filtrado |
| **Google Books API** | Fuente de información bibliográfica |
| **GitHub Pages** | Despliegue |

---

## Modelo de productos

Los productos se encuentran definidos en:

```text
data/products.json
```

Cada producto se organiza en diferentes secciones:

```json
{
  "objectID": "ABCDEF123456",
  "productInfo": {
    "title": "Nombre del libro",
    "author": "Autor",
    "description": "Descripción...",
    "category": "Categoría",
    "publisher": "Editorial",
    "language": "Lenguaje",
    "pageCount": 250,
    "publishedDate": "2025-10-10",
    "isbn_13": "9789403837420",
    "image_url": "URL de la imagen"
  },
  "pricing": {
    "price_crc": 6540,
    "currency": "CRC",
    "discount": 0
  },
  "b2b": {
    "wholesale_price_crc": 4580,
    "min_order_quantity": 10,
    "volume_discount_pct": 5
  },
  "inventory": {
    "in_stock": true,
    "stock_by_branch": {
      "san-jose": 22,
      "cartago": 14,
      "limon": 15
    }
  },
  "rating": {
    "average": 0,
    "count": 0
  },
  "facets": {
    "language": "en",
    "category": "Fiction",
    "rating": 0,
    "publisher": "Seven Books"
  }
}

```

La separación de la información permite diferenciar los datos descriptivos del producto de los atributos utilizados específicamente para realizar filtros.

---

## Algolia

Algolia se utiliza como motor de búsqueda del catálogo.

### Searchable Attributes

Los principales campos utilizados para realizar búsquedas son:

```text
productInfo.title
productInfo.author
productInfo.publisher
```

### Facets

Los atributos configurados para filtrado son:

```text
facets.category
facets.publisher
facets.language
pricing.price_crc
```

El atributo:

```text
facets.rating
```

se encuentra contemplado para una futura implementación.

La configuración y carga del índice se realiza mediante:

```text
scripts/seed-algolia.mjs
```

---

## Fuente de información

Los datos bibliográficos de los libros fueron obtenidos mediante **Google Books API** a partir de una estantería de libros previamente seleccionada.

Posteriormente, la información fue transformada al modelo utilizado por Booksmart.

Debido a que la información bibliográfica no incluye todos los datos necesarios para representar un comercio electrónico, se generaron atributos comerciales como:

- Precio en colones.
- Precio mayorista.
- Cantidad mínima de compra.
- Descuento por volumen.
- Inventario por sede.

---

## Estructura general

```text
Proyecto-E-Commerce/
│
├── data/
│   └── products.json
│
├── scripts/
│   └── seed-algolia.mjs
│
├── src/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

La aplicación utiliza una estructura modular que separa componentes, páginas, funcionalidades, servicios, tipos y funciones auxiliares.

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/deysmith/Proyecto-E-Commerce.git
```

### 2. Entrar al proyecto

```bash
cd Proyecto-E-Commerce
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la raíz:

```env
VITE_ALGOLIA_APP_ID=TU_APP_ID
VITE_ALGOLIA_SEARCH_KEY=TU_SEARCH_KEY
VITE_INDEX_NAME=TU_INDEX_NAME
```

> No se deben subir las credenciales reales al repositorio.

### 5. Ejecutar el proyecto

```bash
npm run dev
```

---

## Build de producción

Para generar la versión de producción:

```bash
npm run build
```

Los archivos generados se encuentran en:

```text
dist/
```

---

## Despliegue

La aplicación se encuentra desplegada utilizando **GitHub Pages**.

Para realizar el despliegue:

```bash
npm run build
npm run deploy
```

El proyecto utiliza la rama:

```text
gh-pages
```

como fuente para GitHub Pages.

### Página Web

**Aplicación:**  
https://deysmith.github.io/Proyecto-E-Commerce/


---


## Decisiones de diseño

Durante el desarrollo se tomaron diferentes decisiones para adaptar el catálogo a las necesidades de un comercio electrónico:

### Google Books como fuente de datos

Se utilizó Google Books como fuente de información bibliográfica para obtener un conjunto inicial de libros.

### Información comercial generada

Se agregaron datos que no estaban disponibles en la API, como precios, inventario y características B2B.

### Separación entre producto y facetas

Los datos bibliográficos se mantienen dentro de `productInfo`, mientras que los atributos destinados al filtrado se encuentran dentro de `facets`.

### Arquitectura modular

Las funcionalidades se separaron en módulos independientes para facilitar el mantenimiento y la incorporación de nuevas funcionalidades.

---


Proyecto desarrollado para el curso de **Laboratorio 2 - E-Commerce**.

**Grupo:** 8

---
