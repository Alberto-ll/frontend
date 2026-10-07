# Reporte de Auditoría: Inconsistencias, Código Sin Uso y Calidad de Código

**Fecha:** 4 de Octubre de 2026  
**Proyecto:** Frontend FútbolYa (`/Users/constantinofinelli/frontend`)  
**Alcance:** Convenciones de nombrado de archivos y componentes, detección de código y archivos sin uso, estructura de carpetas, consistencia de tipos, arquitectura de estilos CSS y análisis estático (ESLint / TypeScript).

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Archivos y Código Sin Uso (Dead Code / Unused Files)](#2-archivos-y-código-sin-uso-dead-code--unused-files)
   - 2.1 [Archivos vacíos (0 bytes) - RESUELTO](#21-archivos-vacíos-0-bytes---resuelto)
   - 2.2 [Archivos huérfanos nunca importados - RESUELTO](#22-archivos-huérfanos-nunca-importados---resuelto)
   - 2.3 [Servicios y métodos no consumidos](#23-servicios-y-métodos-no-consumidos)
   - 2.4 [Vistas y rutas duplicadas o no navegables - RESUELTO](#24-vistas-y-rutas-duplicadas-o-no-navegables---resuelto)
   - 2.5 [Dependencias de `package.json` sin uso - RESUELTO](#25-dependencias-de-packagejson-sin-uso---resuelto)
   - 2.6 [Variables y parámetros no utilizados - RESUELTO](#26-variables-y-parámetros-no-utilizados---resuelto)
3. [Inconsistencias en el Nombrado de Archivos y Carpetas](#3-inconsistencias-en-el-nombrado-de-archivos-y-carpetas)
   - 3.1 [Estructura de directorios y erratas ortográficas](#31-estructura-de-directorios-y-erratas-ortográficas)
   - 3.2 [Casing dispar en componentes y páginas](#32-casing-dispar-en-componentes-y-páginas)
   - 3.3 [Inconsistencias en archivos CSS](#33-inconsistencias-en-archivos-css)
4. [Inconsistencias entre Nombre de Archivo y Componente Exportado](#4-inconsistencias-entre-nombre-de-archivo-y-componente-exportado)
   - 4.1 [Archivos en camelCase que exportan PascalCase](#41-archivos-en-camelcase-que-exportan-pascalcase)
   - 4.2 [Disparidades totales de nombre y rol](#42-disparidades-totales-de-nombre-y-rol)
   - 4.3 [Error crítico: Componente en minúscula](#43-error-crítico-componente-en-minúscula)
5. [Inconsistencias de Terminología y Modelado de Dominio](#5-inconsistencias-de-terminología-y-modelado-de-dominio)
   - 5.1 [Peligro de bicefalia: "Court" vs "Pitch"](#51-peligro-de-bicefalia-court-vs-pitch)
   - 5.2 [Verbos CRUD: "Add" vs "Create" vs "CreateUser"](#52-verbos-crud-add-vs-create-vs-createuser)
   - 5.3 [Vistas individuales: "GetOne" vs "Detail"](#53-vistas-individuales-getone-vs-detail)
   - 5.4 [Plurales y errores ortográficos en rutas](#54-plurales-y-errores-ortográficos-en-rutas)
6. [Inconsistencias en Tipos de TypeScript y Modelos de Datos](#6-inconsistencias-en-tipos-de-typescript-y-modelos-de-datos)
   - 6.1 [Interfaces duplicadas localmente de forma masiva](#61-interfaces-duplicadas-localmente-de-forma-masiva)
   - 6.2 [Contaminación de tipos con lógica ejecutable](#62-contaminación-de-tipos-con-lógica-ejecutable)
   - 6.3 [Convención de nombres en propiedades de datos](#63-convención-de-nombres-en-propiedades-de-datos)
7. [Inconsistencias en Estilos CSS y Colisiones Globales](#7-inconsistencias-en-estilos-css-y-colisiones-globales)
   - 7.1 [Colisión de `:root` en 15 archivos CSS](#71-colisión-de-root-en-15-archivos-css)
   - 7.2 [Importación de CSS cruzado entre módulos ajenos](#72-importación-de-css-cruzado-entre-módulos-ajenos)
   - 7.3 [Páginas sin CSS propio y CSS fuera de `static/css`](#73-páginas-sin-css-propio-y-css-fuera-de-staticcss)
8. [Inconsistencias en Imports y Dependencias](#8-inconsistencias-en-imports-y-dependencias)
   - 8.1 [Extensiones dispares en sentencias `import`](#81-extensiones-dispares-en-sentencias-import)
   - 8.2 [Bifurcación de paquetes de routing (`react-router` vs `react-router-dom`)](#82-bifurcación-de-paquetes-de-routing-react-router-vs-react-router-dom)
   - 8.3 [Manejo dispar de Feedback al Usuario (Toasts, Alertas y Diálogos)](#83-manejo-dispar-de-feedback-al-usuario-toasts-alertas-y-diálogos)
9. [Reporte de Errores ESLint (39 problemas)](#9-reporte-de-errores-eslint-39-problemas)
10. [Plan de Acción Recomendado](#10-plan-de-acción-recomendado)

---

## 1. Resumen Ejecutivo

Durante la auditoría del frontend se identificaron múltiples inconsistencias que afectan la mantenibilidad, escalabilidad y robustez del código. Los hallazgos más destacados incluyen:

- **Archivos vacíos y huérfanos:** 4 archivos vacíos de 0 bytes, 3 archivos CSS huérfanos nunca importados (incluyendo 251 líneas de un modal inexistente), 1 servicio completo sin usar y activos de ejemplo no utilizados.
- **Duplicidad de pantallas y componentes enteros:** Existen dos implementaciones paralelas e independientes para el listado y reserva de canchas (`CourtsPage` con `CourtCard` vs `ReservePitchPage` con `PitchCard`), además de una tercera implementación inline en `BusinessDetailPage`.
- **Inconsistencia grave en nombrado:** Convenciones mezcladas aleatoriamente (camelCase, PascalCase, kebab-case, minúsculas), carpetas con faltas ortográficas (`businessManagment`), y un componente funcional que inicia en minúscula (`businessPitchDetail`) lo que quiebra las reglas de React Hooks.
- **Tipado disperso y redundante:** La interfaz `Locality` se redefine en **12 archivos diferentes**, `Category` en **6 archivos** y `User` en **9 archivos**, por falta de archivos de tipos centralizados.
- **Colisión de estilos CSS:** 15 archivos CSS independientes redefinen variables globales en `:root`, generando sobrescrituras incontroladas en el bundle final de producción.
- **Violaciones de ESLint:** 39 problemas activos (36 errores y 3 advertencias), incluyendo llamadas indebidas a hooks y múltiples variables no tipadas (`any`).

---

## 2. Archivos y Código Sin Uso (Dead Code / Unused Files)

### 2.1 Archivos vacíos (0 bytes) - ✅ RESUELTO

> **Estado: Resuelto.**
> - Eliminados: `businessLayout.tsx`, `CourtCard.css`, `CourtList.css` y `categoryCreate.css`.
> - Se retiraron las importaciones de `categoryCreate.css` en `CategoryCreate.tsx` y `businessCreate.tsx`.

Los siguientes archivos se encontraban en el repositorio completamente vacíos (0 bytes) y han sido depurados:

| Archivo | Ubicación | Diagnóstico | Resolución |
|---|---|---|---|
| `businessLayout.tsx` | [`src/layout/businessLayout.tsx`](file:///Users/constantinofinelli/frontend/src/layout/businessLayout.tsx) | Archivo de layout vacío, nunca importado ni utilizado en ninguna ruta. | **Eliminado** |
| `CourtCard.css` | [`src/static/css/components/CourtCard.css`](file:///Users/constantinofinelli/frontend/src/static/css/components/CourtCard.css) | Archivo vacío. No es importado por `CourtCard.tsx`. | **Eliminado** |
| `CourtList.css` | [`src/static/css/components/CourtList.css`](file:///Users/constantinofinelli/frontend/src/static/css/components/CourtList.css) | Archivo vacío. No es importado por `CourtList.tsx`. | **Eliminado** |
| `categoryCreate.css` | [`src/static/css/categories/categoryCreate.css`](file:///Users/constantinofinelli/frontend/src/static/css/categories/categoryCreate.css) | Archivo vacío. Importado sin proveer estilos. | **Imports retirados y archivo eliminado** |

### 2.2 Archivos huérfanos nunca importados - ✅ RESUELTO

> **Estado: Resuelto.**
> - Eliminados: `ReservationModal.css`, `pitchCard.css` y `react.svg`.
> - Se creó el directorio `public/` y se movió `vite.svg` a `public/vite.svg`, corrigiendo el error 404 del favicon referenciado en `index.html`.

Archivos con contenido huérfano o ubicación inadecuada que fueron resueltos:

1. **`ReservationModal.css`** ([`src/static/css/components/ReservationModal.css`](file:///Users/constantinofinelli/frontend/src/static/css/components/ReservationModal.css)):
   - Contenía **251 líneas** de CSS estilizando un modal sin componente asociado. **(Eliminado)**.
2. **`pitchCard.css`** ([`src/static/css/pitchCard.css`](file:///Users/constantinofinelli/frontend/src/static/css/pitchCard.css)):
   - Archivo legado con clases en camelCase, redundante frente a `src/static/css/components/PitchCard.css`. **(Eliminado)**.
3. **`react.svg`** ([`src/assets/images/react.svg`](file:///Users/constantinofinelli/frontend/src/assets/images/react.svg)):
   - Asset boilerplate original de Vite sin uso. **(Eliminado)**.
4. **`vite.svg`** ([`src/assets/images/vite.svg`](file:///Users/constantinofinelli/frontend/src/assets/images/vite.svg)):
   - Reubicado a [`public/vite.svg`](file:///Users/constantinofinelli/frontend/public/vite.svg). Con esto `index.html` sirve correctamente el favicon vía `/vite.svg` sin provocar error 404.

### 2.3 Servicios y métodos no consumidos

1. **`userCouponService.ts`** ([`src/services/userCouponService.ts`](file:///Users/constantinofinelli/frontend/src/services/userCouponService.ts)):
   - Se exporta en [`src/services/index.ts`](file:///Users/constantinofinelli/frontend/src/services/index.ts#L9), pero **ninguna pantalla, componente ni hook lo importa**.
   - Ninguno de sus métodos (`getAll`, `getOne`, `findByUser`, `assign`, `updateStatus`, `remove`) es utilizado en la interfaz.
2. **`businessService.findInactive`** ([`src/services/businessService.ts`](file:///Users/constantinofinelli/frontend/src/services/businessService.ts#L12)):
   - El endpoint `/api/business/findInactive` está creado en el servicio, pero en la pantalla de negocios inactivos ([`InactiveBusinesses.tsx`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/inactiveBusinesses/inactiveBusinesses.tsx#L92-L97)) se ejecuta `businessService.findAll()` y se filtra en el cliente con `.filter(business => !business.active)`. La función del servicio queda sin uso.
3. **`reservationService.findOne`** ([`src/services/reservationService.ts`](file:///Users/constantinofinelli/frontend/src/services/reservationService.ts#L17)):
   - Definido pero nunca invocado en ninguna vista del sistema.

### 2.4 Vistas y rutas duplicadas o no navegables - ✅ RESUELTO

> **Estado: Resuelto.**
> - **Redirección de ruta duplicada:** En `App.tsx`, la ruta `/reservation/` ahora redirige limpiamente vía `<Navigate to="/reserve-pitch" replace />` a la vista principal activa `ReservePitchPage`.
> - **Remanentes eliminados:** Se removieron los componentes y estilos redundantes no navegables de la implementación "Court" (`CourtsPage.tsx`, `CourtList.tsx`, `CourtCard.tsx`, `courtPages.css`).
> - **Homepage depurada:** Se eliminó el `<div>` vacío `.About-us` en `homepage.tsx`.
> - **Admin Dashboard funcional:** Se implementó una vista completa y profesional en `adminDashboard.tsx` con métricas del sistema, panel de acciones rápidas y hub de accesos directos a todos los submódulos, respaldado por `adminDashboard.css`.

1. **Ruta `/reservation/` vs `/reserve-pitch/`**:
   - En [`App.tsx`](file:///Users/constantinofinelli/frontend/src/pages/mainPage/App.tsx#L67):
     ```tsx
     <Route path='reservation/' element={<Navigate to="/reserve-pitch" replace />}/>
     <Route path='reserve-pitch/' element={<ProtectedRoute><ReservePitchPage/></ProtectedRoute>}/>
     ```
   - Resuelto: Se descartó el código muerto de `CourtsPage`, `CourtList`, `CourtCard` y `courtPages.css`, garantizando que todas las solicitudes a `/reservation` redirijan a la pantalla oficial de canchas.
2. **Sección vacía en `homepage.tsx`**:
   - Resuelto: Removido el contenedor vacío en [`src/pages/homepage/homepage.tsx`](file:///Users/constantinofinelli/frontend/src/pages/homepage/homepage.tsx).
3. **Pantalla vacía / placeholder `adminDashboard.tsx`**:
   - Resuelto: Reemplazado por un Dashboard administrativo completo con métricas de negocios, canchas, usuarios, localidades, cupones y categorías, accesos directos de creación y enlaces directos a cada sección en [`src/pages/adminPages/adminDashboard.tsx`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/adminDashboard.tsx) y [`src/static/css/adminDashboard.css`](file:///Users/constantinofinelli/frontend/src/static/css/adminDashboard.css).

### 2.5 Dependencias de `package.json` sin uso - ✅ RESUELTO

> **Estado: Resuelto.**
> - Desinstaladas exitosamente con `npm uninstall react-jwt @types/jsonwebtoken`.

En [`package.json`](file:///Users/constantinofinelli/frontend/package.json):
1. **`react-jwt` (`^1.3.0`)**: Desinstalada. El proyecto utiliza exclusivamente `jwt-decode`.
2. **`@types/jsonwebtoken` (`^9.0.10`)**: Desinstalada de `devDependencies`.

### 2.6 Variables y parámetros no utilizados (reportados por ESLint) - ✅ RESUELTO

> **Estado: Resuelto.**
> - Corregida la variable `id` no utilizada en `pitchUpdate.tsx`.
> - Corregidos los 3 catch blocks con parámetro `error` no usado en `getReservations.tsx`.

1. Variable `id` en [`src/pages/adminPages/pitchPages/pitchUpdate.tsx#L155`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/pitchPages/pitchUpdate.tsx#L155): Desestructurada como `id: _id` y evaluada (`void _id`) para satisfacer las reglas de ESLint sin perder la exclusión del ID en `fieldsToUpdate`.
2. Parámetros `error` en catch blocks en [`src/pages/businessManagment/getReservations.tsx`](file:///Users/constantinofinelli/frontend/src/pages/businessManagment/getReservations.tsx): Simplificados a cláusulas `catch { ... }` sin variables redundantes.

---

## 3. Inconsistencias en el Nombrado de Archivos y Carpetas

### 3.1 Estructura de directorios y erratas ortográficas

1. **Falta ortográfica en carpeta principal**:
   - Carpeta actual: `src/pages/businessManagment/`
   - Corrección requerida: `src/pages/businessManagement/` (falta la letra **e** en *Management*).
2. **Inconsistencia de sufijos y convenciones en `src/pages/adminPages/`**:
   - Carpetas con sufijo `Pages` en camelCase:
     - `couponPages/`
     - `localityPages/`
     - `pitchPages/`
     - `userPages/`
     - `categoryPages/`
   - Carpetas sin sufijo `Pages`:
     - `business/` (singular, minúscula).
     - `inactiveBusinesses/` (plural, camelCase).
   - Archivo suelto en raíz del módulo:
     - `adminDashboard.tsx` directamente en `adminPages/`.
3. **Inconsistencia de carpetas en `src/pages/`**:
   - `homepage/` (todo en minúsculas).
   - `mainPage/` (camelCase).
   - `businessList/` (camelCase).
   - `businessManagment/` (camelCase con errata).
   - `adminPages/` (camelCase, plural con `Pages`).
   - `reservationPage/` (camelCase, singular con `Page`).
   - Archivos sueltos sin carpeta: `loginPage.tsx`, `registerBusiness.tsx`, `ReservePitch.tsx`.

### 3.2 Casing dispar en componentes y páginas

| Directorio | Archivo | Convención usada | Estándar recomendado |
|---|---|---|---|
| `src/layout/` | `businessLayout.tsx` | camelCase | PascalCase (`BusinessLayout.tsx`) |
| `src/layout/` | `AdminLayout.tsx` | PascalCase | PascalCase (Correcto) |
| `src/layout/` | `HomeLayout.tsx` | PascalCase | PascalCase (Correcto) |
| `src/components/` | `deleteConfirm.tsx` | camelCase | PascalCase (`DeleteConfirm.tsx`) |
| `src/components/` | `Auth.tsx` | PascalCase (Hook) | camelCase en `src/hooks/` (`useAuth.ts`) |
| `src/pages/` | `loginPage.tsx` | camelCase | PascalCase (`LoginPage.tsx`) |
| `src/pages/` | `registerBusiness.tsx` | camelCase | PascalCase (`RegisterBusinessPage.tsx`) |
| `src/pages/` | `ReservePitch.tsx` | PascalCase | PascalCase (`ReservePitchPage.tsx`) |
| `src/pages/homepage/` | `aboutUs.tsx` | camelCase | PascalCase (`AboutUs.tsx`) |
| `src/pages/homepage/` | `homeFooter.tsx` | camelCase | PascalCase (`HomeFooter.tsx`) |
| `src/pages/homepage/` | `homePageNav.tsx` | camelCase | PascalCase (`HomePageNav.tsx`) |
| `src/pages/homepage/` | `homepage.tsx` | minúsculas | PascalCase (`Homepage.tsx`) |
| `src/pages/homepage/` | `myReservations.tsx` | camelCase | PascalCase (`MyReservations.tsx`) |
| `src/pages/businessManagment/` | `add.tsx` | minúsculas | PascalCase descriptivo (`BusinessPitchAdd.tsx`) |
| `src/pages/businessManagment/` | `detail.tsx` | minúsculas | PascalCase descriptivo (`BusinessPitchDetail.tsx`) |
| `src/pages/businessManagment/` | `edit.tsx` | minúsculas | PascalCase descriptivo (`BusinessPitchEdit.tsx`) |
| `src/pages/businessManagment/` | `editBusiness.tsx` | camelCase | PascalCase descriptivo (`BusinessEdit.tsx`) |
| `src/pages/businessManagment/` | `getAll.tsx` | camelCase | PascalCase descriptivo (`BusinessPitchList.tsx`) |
| `src/pages/businessManagment/` | `getReservations.tsx` | camelCase | PascalCase descriptivo (`BusinessReservations.tsx`) |
| `src/pages/businessManagment/` | `home.tsx` | minúsculas | PascalCase descriptivo (`BusinessHome.tsx`) |
| `src/pages/businessList/` | `BusinessListPage.tsx` | PascalCase + Page | PascalCase (Correcto) |
| `src/pages/businessList/` | `BusinessDetailPage.tsx` | PascalCase + Page | PascalCase (Correcto) |
| `src/pages/reservationPage/` | `CourtsPage.tsx` | PascalCase + Page | PascalCase (Correcto) |
| `src/pages/reservationPage/` | `CourtList.tsx` | PascalCase | PascalCase (Correcto) |
| `src/pages/reservationPage/` | `reservationPage.tsx` | camelCase + Page | PascalCase (`ReservationPage.tsx`) |

### 3.3 Inconsistencias en archivos CSS

1. **Capitalización dispar**:
   - `MybusinessGetAll.css` vs `MyBusinessReservations.css` (`b` minúscula vs `B` mayúscula).
   - `ReservePitch.css` (PascalCase) vs `courtPages.css` (camelCase) vs `about.css` (minúsculas).
2. **Ubicación no estándar**:
   - `src/components/StarRating.css` reside dentro de la carpeta `src/components/`, mientras todos los demás CSS están en `src/static/css/` o `src/static/css/components/`.
3. **Plural vs Singular**:
   - `src/static/css/users/usersGetAll.css` (plural `users`) vs `userCreate.css`, `userDetail.css`, `userHome.css`, `userUpdate.css` (singular `user`).
   - En categorías todos son singulares: `categoryCreate.css`, `categoryGetAll.css`.

---

## 4. Inconsistencias entre Nombre de Archivo y Componente Exportado

Existe un patrón generalizado donde el archivo está nombrado en `camelCase`, pero el componente React exportado está en `PascalCase`.

### 4.1 Archivos en camelCase que exportan PascalCase

| Archivo | Export real del componente | Inconsistencia detectada |
|---|---|---|
| `adminDashboard.tsx` | `AdminDashboard` | Archivo `adminDashboard` vs Componente `AdminDashboard` |
| `businessCreate.tsx` | `BusinessCreate` | Archivo `businessCreate` vs Componente `BusinessCreate` |
| `businessDetail.tsx` | `BusinessDetail` | Archivo `businessDetail` vs Componente `BusinessDetail` |
| `businessGetAll.tsx` | `BusinessGetAll` | Archivo `businessGetAll` vs Componente `BusinessGetAll` |
| `businessHome.tsx` | `BusinessHome` | Archivo `businessHome` vs Componente `BusinessHome` |
| `businessUpdate.tsx` | `BusinessUpdate` | Archivo `businessUpdate` vs Componente `BusinessUpdate` |
| `categoryCreate.tsx` | `CategoryCreate` | Archivo `categoryCreate` vs Componente `CategoryCreate` |
| `categoryDetail.tsx` | `CategoryDetail` | Archivo `categoryDetail` vs Componente `CategoryDetail` |
| `categoryGetAll.tsx` | `CategoryGetAll` | Archivo `categoryGetAll` vs Componente `CategoryGetAll` |
| `categoryHome.tsx` | `CategoryHome` | Archivo `categoryHome` vs Componente `CategoryHome` |
| `categoryUpdate.tsx` | `CategoryUpdate` | Archivo `categoryUpdate` vs Componente `CategoryUpdate` |
| `couponAdd.tsx` | `CouponAdd` | Archivo `couponAdd` vs Componente `CouponAdd` |
| `couponGetAll.tsx` | `CouponGetAll` | Archivo `couponGetAll` vs Componente `CouponGetAll` |
| `couponGetOne.tsx` | `CouponGetOne` | Archivo `couponGetOne` vs Componente `CouponGetOne` |
| `couponHome.tsx` | `CouponHome` | Archivo `couponHome` vs Componente `CouponHome` |
| `couponUpdate.tsx` | `CouponUpdate` | Archivo `couponUpdate` vs Componente `CouponUpdate` |
| `inactiveBusinesses.tsx` | `InactiveBusinesses` | Archivo `inactiveBusinesses` vs Componente `InactiveBusinesses` |
| `localityCreate.tsx` | `LocalityCreate` | Archivo `localityCreate` vs Componente `LocalityCreate` |
| `localityDetail.tsx` | `LocalityDetail` | Archivo `localityDetail` vs Componente `LocalityDetail` |
| `localityGetAll.tsx` | `LocalitiesGetAll` | **Doble inconsistencia**: `locality` (singular) vs `Localities` (plural) |
| `localityHome.tsx` | `LocalityHome` | Archivo `localityHome` vs Componente `LocalityHome` |
| `localityUpdate.tsx` | `LocalityUpdate` | Archivo `localityUpdate` vs Componente `LocalityUpdate` |
| `pitchAdd.tsx` | `PitchAdd` | Archivo `pitchAdd` vs Componente `PitchAdd` |
| `pitchGetAll.tsx` | `PitchGetAll` | Archivo `pitchGetAll` vs Componente `PitchGetAll` |
| `pitchGetOne.tsx` | `PitchGetOne` | Archivo `pitchGetOne` vs Componente `PitchGetOne` |
| `pitchHome.tsx` | `PitchHome` | Archivo `pitchHome` vs Componente `PitchHome` |
| `pitchUpdate.tsx` | `PitchUpdate` | Archivo `pitchUpdate` vs Componente `PitchUpdate` |
| `userCreate.tsx` | `UserCreate` | Archivo `userCreate` vs Componente `UserCreate` |
| `userDetail.tsx` | `UserDetail` | Archivo `userDetail` vs Componente `UserDetail` |
| `userHome.tsx` | `UserHome` | Archivo `userHome` vs Componente `UserHome` |
| `userUpdate.tsx` | `UserUpdate` | Archivo `userUpdate` vs Componente `UserUpdate` |
| `usersGetAll.tsx` | `UsersGetAll` | Archivo `usersGetAll` vs Componente `UsersGetAll` |
| `deleteConfirm.tsx` | `DeleteConfirm` | Archivo `deleteConfirm` vs Componente `DeleteConfirm` |
| `loginPage.tsx` | `LoginPage` | Archivo `loginPage` vs Componente `LoginPage` |
| `registerBusiness.tsx` | `RegisterBusinessPage` | Archivo `registerBusiness` vs Componente `RegisterBusinessPage` |
| `aboutUs.tsx` | `AboutUs` | Archivo `aboutUs` vs Componente `AboutUs` |
| `homeFooter.tsx` | `HomeFooter` | Archivo `homeFooter` vs Componente `HomeFooter` |
| `homePageNav.tsx` | `HomePageNav` | Archivo `homePageNav` vs Componente `HomePageNav` |
| `homepage.tsx` | `Homepage` | Archivo `homepage` vs Componente `Homepage` |
| `myReservations.tsx` | `MyReservations` | Archivo `myReservations` vs Componente `MyReservations` |

### 4.2 Disparidades totales de nombre y rol

1. **`reservationPage.tsx`** exporta `ReservePitchPageMakeReservation`:
   - El archivo se llama `reservationPage.tsx`, pero el componente se llama `ReservePitchPageMakeReservation`.
2. **`businessManagment/add.tsx`** exporta `PitchAdd`:
   - Colisiona de nombre con el `PitchAdd` de `adminPages/pitchPages/pitchAdd.tsx`. En `App.tsx` debe renombrarse con un alias obligatorio (`import BusinessPitchAdd from '../businessManagment/add.tsx'`).
3. **`ReservePitch.tsx`** exporta `ReservePitchPage`:
   - El archivo omite el sufijo `Page` mientras el componente lo incluye.
4. **`Auth.tsx`** ([`src/components/Auth.tsx`](file:///Users/constantinofinelli/frontend/src/components/Auth.tsx)):
   - Se ubica en `components/` y usa extensión `.tsx`, pero **no es un componente ni tiene JSX**.
   - Solo exporta el custom hook `useAuth()`. Debería residir en `src/hooks/useAuth.ts`.
5. **`LayoutContext.tsx`** ([`src/components/LayoutContext.tsx`](file:///Users/constantinofinelli/frontend/src/components/LayoutContext.tsx)):
   - Reside en `components/` y mezcla un Provider (`LayoutProvider`) con una función de hook (`useLayoutMode()`), lo que genera una advertencia de ESLint `react-refresh/only-export-components`. Debería estar en `src/context/LayoutContext.tsx`.
6. **`homePageNav.tsx` y `homeFooter.tsx` en `pages/`**:
   - Son componentes de navegación y pie de página, pero están ubicados en `src/pages/homepage/` en lugar de `src/components/` o `src/layout/`.

### 4.3 Error crítico: Componente en minúscula

- **[`src/pages/businessManagment/detail.tsx#L10`](file:///Users/constantinofinelli/frontend/src/pages/businessManagment/detail.tsx#L10)**:
  ```tsx
  export default function businessPitchDetail() {
  ```
  Al comenzar con letra minúscula `businessPitchDetail`, React y el plugin de ESLint no lo reconocen como componente ni como hook, arrojando **8 errores críticos de `react-hooks/rules-of-hooks`** por invocar `useState`, `useEffect`, `useCallback`, etc.

---

## 5. Inconsistencias de Terminología y Modelado de Dominio

### 5.1 Peligro de bicefalia: "Court" vs "Pitch"

El término para "cancha de fútbol" se implementó con dos vocabularios distintos en paralelo:

| Concepto | Implementación "Court" | Implementación "Pitch" |
|---|---|---|
| **Componente Card** | [`CourtCard.tsx`](file:///Users/constantinofinelli/frontend/src/components/CourtCard.tsx) | [`PitchCard.tsx`](file:///Users/constantinofinelli/frontend/src/components/pitches/PitchCard.tsx) |
| **Página Listado** | [`CourtsPage.tsx`](file:///Users/constantinofinelli/frontend/src/pages/reservationPage/CourtsPage.tsx) | [`ReservePitch.tsx`](file:///Users/constantinofinelli/frontend/src/pages/ReservePitch.tsx) |
| **Componente Grid** | [`CourtList.tsx`](file:///Users/constantinofinelli/frontend/src/pages/reservationPage/CourtList.tsx) | Grid inline en `ReservePitch.tsx` |
| **Modelo / Tipo** | `Pitch` en `pitchType.ts` | `ReservePitch` en `reservePitchTypes.ts` |
| **Rutas SPA** | `/reservation/` | `/reserve-pitch/` y `/admin/pitchs/` |
| **Estilos CSS** | `courtPages.css` | `PitchCard.css`, `ReservePitch.css`, `pitchCard.css` |

Además, en [`BusinessDetailPage.tsx`](file:///Users/constantinofinelli/frontend/src/pages/businessList/BusinessDetailPage.tsx#L208-L230) se creó una **tercera tarjeta de cancha** escrita directamente inline con clases `.pitch-card-item`.

### 5.2 Verbos CRUD: "Add" vs "Create" vs "CreateUser"

En las rutas de administración de `App.tsx` y nombres de archivo:
- Para Cupones: `couponAdd.tsx` -> ruta `coupons/add/`
- Para Canchas: `pitchAdd.tsx` -> ruta `pitchs/add/`
- Para Negocios: `businessCreate.tsx` -> ruta `business/create/`
- Para Localidades: `localityCreate.tsx` -> ruta `localities/create/`
- Para Categorías: `categoryCreate.tsx` -> ruta `categories/create/`
- Para Usuarios: `userCreate.tsx` -> ruta `users/createUser/` (¡inconsistente con todas las demás!)

### 5.3 Vistas individuales: "GetOne" vs "Detail"

- Cupones: `couponGetOne.tsx` -> ruta `coupons/getOne/`
- Canchas: `pitchGetOne.tsx` -> ruta `pitchs/getOne/:id`
- Localidades: `localityDetail.tsx` -> ruta `localities/getOne/:id` (el archivo dice `Detail`, la ruta dice `getOne`)
- Negocios: `businessDetail.tsx` -> ruta `business/detail/:id`
- Categorías: `categoryDetail.tsx` -> ruta `categories/detail/:id`
- Usuarios: `userDetail.tsx` -> ruta `users/detail/:id`

### 5.4 Plurales y errores ortográficos en rutas

1. **`pitchs`**: En `App.tsx` ([L91](file:///Users/constantinofinelli/frontend/src/pages/mainPage/App.tsx#L91)) y en las llamadas de API ([`pitchService.ts`](file:///Users/constantinofinelli/frontend/src/services/pitchService.ts#L5)): se utiliza `pitchs` cuando el plural correcto en inglés es `pitches`.
2. **Singular vs Plural en rutas admin**:
   - `coupons/`, `localities/`, `categories/`, `users/` (plurales).
   - `business/` (singular).
3. **Trailing Slashes obligatorias**:
   - Todas las rutas en `App.tsx` tienen barra final (`/getAll/`, `/add/`, `/create/`), lo cual produce inconsistencias al navegar sin la barra o genera redirecciones dobles innecesarias.
4. **Ruta con función ambigua**:
   - [`App.tsx#L113`](file:///Users/constantinofinelli/frontend/src/pages/mainPage/App.tsx#L113): `<Route path="remove/:id" element={<LocalityHome />} />` monta el componente de Home en una URL semánticamente destinada a eliminar.

---

## 6. Inconsistencias en Tipos de TypeScript y Modelos de Datos

### 6.1 Interfaces duplicadas localmente de forma masiva

Al no existir archivos centralizados en `src/types/`, las mismas interfaces se reescriben en múltiples archivos con divergencias sutiles en sus propiedades:

1. **`interface Locality`** se declara de forma independiente en **12 archivos**:
   - [`src/services/localityService.ts#L3`](file:///Users/constantinofinelli/frontend/src/services/localityService.ts#L3)
   - [`src/pages/adminPages/inactiveBusinesses/inactiveBusinesses.tsx#L7`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/inactiveBusinesses/inactiveBusinesses.tsx#L7)
   - [`src/pages/adminPages/business/businessUpdate.tsx#L21`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/business/businessUpdate.tsx#L21)
   - [`src/pages/adminPages/localityPages/localityDetail.tsx#L6`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/localityPages/localityDetail.tsx#L6)
   - [`src/pages/adminPages/business/businessCreate.tsx#L8`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/business/businessCreate.tsx#L8)
   - [`src/pages/adminPages/localityPages/localityGetAll.tsx#L8`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/localityPages/localityGetAll.tsx#L8)
   - [`src/pages/adminPages/localityPages/localityUpdate.tsx#L6`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/localityPages/localityUpdate.tsx#L6)
   - [`src/pages/businessManagment/editBusiness.tsx#L23`](file:///Users/constantinofinelli/frontend/src/pages/businessManagment/editBusiness.tsx#L23)
   - [`src/pages/adminPages/business/businessDetail.tsx#L22`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/business/businessDetail.tsx#L22)
   - [`src/pages/adminPages/business/businessGetAll.tsx#L7`](file:///Users/constantinofinelli/frontend/src/pages/adminPages/business/businessGetAll.tsx#L7)
   - [`src/pages/registerBusiness.tsx#L10`](file:///Users/constantinofinelli/frontend/src/pages/registerBusiness.tsx#L10)
   - [`src/pages/businessList/BusinessListPage.tsx#L10`](file:///Users/constantinofinelli/frontend/src/pages/businessList/BusinessListPage.tsx#L10)
2. **`interface Category`** se declara en **6 archivos**:
   - `categoryService.ts`, `categoryDetail.tsx`, `userCreate.tsx`, `categoryGetAll.tsx`, `categoryUpdate.tsx`, `userUpdate.tsx`.
3. **`interface User`** se declara en **9 archivos**, compitiendo con `UserData` de `userData.ts`.
4. **`interface Reservation`** tiene definiciones disonantes:
   - En [`reservationType.ts`](file:///Users/constantinofinelli/frontend/src/types/reservationType.ts#L4): `pitch: Pitch; user: UserData;`.
   - En [`reservationService.ts`](file:///Users/constantinofinelli/frontend/src/services/reservationService.ts#L3): `pitch?: number | { id: number }; user?: number | { id: number; name?: string };`.
   - En [`reservePitchTypes.ts`](file:///Users/constantinofinelli/frontend/src/types/reservePitchTypes.ts#L37): `pitch: number; user: number;`.

### 6.2 Contaminación de tipos con lógica ejecutable

- **[`src/types/apiError.ts#L6-L17`](file:///Users/constantinofinelli/frontend/src/types/apiError.ts#L6-L17)**:
  Contiene la función ejecutable `errorHandler(error: unknown): string`. Los archivos de `types/` deben contener únicamente tipos e interfaces. Esta función pertenece a `src/utils/errorHandler.ts`.
  Además, utiliza múltiples casts `(error as any)`, generando 5 violaciones de ESLint `@typescript-eslint/no-explicit-any`.

### 6.3 Convención de nombres en propiedades de datos

En [`src/types/reservationType.ts`](file:///Users/constantinofinelli/frontend/src/types/reservationType.ts#L6-L7):
```typescript
export type Reservation = {
  id: number;
  ReservationDate: string; // PascalCase
  ReservationTime: string; // PascalCase
  status?: string;         // camelCase
  pitchRating?: number;    // camelCase
};
```
Se mezclan propiedades en PascalCase con propiedades en camelCase en la misma entidad.

---

## 7. Inconsistencias en Estilos CSS y Colisiones Globales

### 7.1 Colisión de `:root` en 15 archivos CSS

Quince archivos CSS diferentes declaran selectores globales `:root { ... }`:

1. `src/static/css/index.css`
2. `src/static/css/AdminLayout.css`
3. `src/static/css/crudTable.css`
4. `src/static/css/loginPage.css`
5. `src/static/css/myReservations.css`
6. `src/static/css/registerBusiness.css`
7. `src/static/css/MyBusinessReservations.css`
8. `src/static/css/MybusinessGetAll.css`
9. `src/static/css/business/homebusiness.css`
10. `src/static/css/categories/categoryHome.css`
11. `src/static/css/categories/categoryGetAll.css`
12. `src/static/css/categories/categoryUpdate.css`
13. `src/static/css/users/userHome.css`
14. `src/static/css/users/usersGetAll.css`
15. `src/static/css/users/userCreate.css`

**Impacto:** En una SPA compilada por Vite, todos los archivos CSS importados se combinan en un solo paquete global. Cuando varios archivos definen variables idénticas (`--primary-color`, `--surface-color`, etc.) con valores distintos, la última hoja de estilos cargada sobrescribe las anteriores en toda la aplicación.

### 7.2 Importación de CSS cruzado entre módulos ajenos

Componentes de una entidad están consumiendo hojas de estilo creadas para otra entidad:

- **Todos los componentes de Localidades** importan CSS de Usuarios:
  - `localityCreate.tsx` -> `import '../../../static/css/users/userCreate.css';`
  - `localityDetail.tsx` -> `import '../../../static/css/users/userDetail.css';`
  - `localityGetAll.tsx` -> `import '../../../static/css/users/usersGetAll.css';`
  - `localityHome.tsx` -> `import '../../../static/css/users/userHome.css';`
  - `localityUpdate.tsx` -> `import '../../../static/css/users/userUpdate.css';`
- **Componentes de Negocios de Admin** importan CSS de Categorías:
  - `businessCreate.tsx` -> `categoryCreate.css` (que además está vacío)
  - `businessDetail.tsx` -> `categoryDetail.css`
  - `businessGetAll.tsx` -> `categoryGetAll.css`
  - `businessUpdate.tsx` -> `categoryUpdate.css`
- **Gestión de Negocio de Propietario**:
  - `editBusiness.tsx` -> `categoryUpdate.css`
- **Componentes de Canchas**:
  - `pitchGetAll.tsx` -> `usersGetAll.css`
  - `pitchHome.tsx` -> `userHome.css`

### 7.3 Páginas sin CSS propio y CSS fuera de `static/css`

- `pitchAdd.tsx`, `pitchGetOne.tsx`, `pitchUpdate.tsx`, `couponAdd.tsx`, `couponGetAll.tsx`, `couponGetOne.tsx` y `couponUpdate.tsx` **no importan ningún CSS**. Dependen de que otra pantalla haya inyectado clases en el documento.
- `CourtCard.tsx` no importa CSS, asumiendo que su pantalla contenedora `CourtsPage.tsx` ya importó `courtPages.css`. Si se usa en otra vista, carece de diseño.
- `StarRating.css` está ubicado en `src/components/StarRating.css` en lugar de residir en `src/static/css/components/`.

---

## 8. Inconsistencias en Imports y Dependencias

### 8.1 Extensiones dispares en sentencias `import`

En `App.tsx` y otros componentes se mezclan cuatro formas distintas de importar:
1. Con extensión `.tsx`:
   - `import { AdminLayout } from '../../layout/AdminLayout.tsx';`
   - `import PitchAdd from '../adminPages/pitchPages/pitchAdd.tsx';`
2. Con extensión `.ts`:
   - `import { categoryService } from '../../../services/index.ts';`
   - `import type { Pitch } from '../../types/pitchType.ts';`
3. Con extensión `.js` apuntando a archivos TypeScript:
   - `import Toast from '../components/Toast.js';` ([`loginPage.tsx#L4`](file:///Users/constantinofinelli/frontend/src/pages/loginPage.tsx#L4))
   - `import { authService } from '../services/index.js';` ([`loginPage.tsx#L6`](file:///Users/constantinofinelli/frontend/src/pages/loginPage.tsx#L6))
   - `import { useAuth } from '../components/Auth.js';` ([`AdminLayout.tsx#L6`](file:///Users/constantinofinelli/frontend/src/layout/AdminLayout.tsx#L6))
4. Sin extensión:
   - `import ProtectedRoute from '../../components/ProtectedRoute';`
   - `import BusinessListPage from '../businessList/BusinessListPage';`

### 8.2 Bifurcación de paquetes de routing (`react-router` vs `react-router-dom`)

Tanto `react-router` como `react-router-dom` (v7.7.1) están instalados en `package.json`, y los hooks/componentes de navegación se importan indistintamente de uno u otro:
- `import { useNavigate, useOutletContext } from 'react-router';` (en `ReservePitch.tsx`, `CategoryCreate.tsx`, `App.tsx`)
- `import { Link, useNavigate } from 'react-router-dom';` (en `homePageNav.tsx`, `homepage.tsx`, `CourtCard.tsx`, `reservationPage.tsx`)

### 8.3 Manejo dispar de Feedback al Usuario (Toasts, Alertas y Diálogos)

1. **Instancias duplicadas de `Toast`**:
   - `HomeLayout.tsx` monta una instancia global de `<Toast />` y pasa `showNotification` por `OutletContext`.
   - `AdminLayout.tsx` está anidado dentro de `HomeLayout.tsx` en `App.tsx`, pero **monta una segunda instancia de `<Toast />`**.
   - `LoginPage.tsx` monta una **tercera instancia de `<Toast />`** en lugar de consumir el contexto de su layout.
2. **Mezcla de Feedback**:
   - En `loginPage.tsx`: se invoca la función nativa del navegador `alert('Usuario creado con éxito')`.
   - En `inactiveBusinesses.tsx` y `myReservations.tsx`: se utiliza `window.confirm()` nativo.
   - En las vistas de administración de usuarios, canchas, cupones y categorías: se utiliza el componente modal moderno `DeleteConfirm`.

---

## 9. Reporte de Errores ESLint (39 problemas)

Ejecución de `npm run lint`: **36 errores y 3 advertencias**.

| Archivo | Línea | Regla ESLint | Tipo | Descripción |
|---|---|---|---|---|
| `src/pages/businessManagment/detail.tsx` | 11, 12, 13, 15, 16, 18, 20, 37 | `react-hooks/rules-of-hooks` | Error (x8) | `businessPitchDetail` no empieza con mayúscula. React Hooks no pueden ejecutarse dentro de funciones que no sean componentes o hooks. |
| `src/components/LayoutContext.tsx` | 29 | `react-refresh/only-export-components` | Error | Archivo de contexto exporta tanto componentes (`LayoutProvider`) como funciones auxiliares (`useLayoutMode`). |
| `src/pages/ReservePitch.tsx` | 70, 71, 72 | `@typescript-eslint/no-explicit-any` | Error (x3) | Uso injustificado de `any` en captura de errores. |
| `src/pages/adminPages/pitchPages/pitchGetOne.tsx` | 34 | `react-hooks/exhaustive-deps` | Advertencia | Hook `useEffect` carece de dependencia `'getOne'`. |
| `src/pages/adminPages/pitchPages/pitchUpdate.tsx` | 155 | `@typescript-eslint/no-unused-vars` | Error | Variable `'id'` declarada pero nunca utilizada. |
| `src/pages/adminPages/userPages/userCreate.tsx` | 88 | `@typescript-eslint/no-explicit-any` | Error | Uso de `any`. |
| `src/pages/businessManagment/add.tsx` | 26, 39 | `@typescript-eslint/no-explicit-any` | Error (x2) | Uso de `any` en parseo de datos de negocio. |
| `src/pages/businessManagment/editBusiness.tsx` | 104 | `@typescript-eslint/no-explicit-any` | Error | Uso de `any`. |
| `src/pages/businessManagment/getAll.tsx` | 26, 40, 70 | `@typescript-eslint/no-explicit-any` | Error (x3) | Uso de `any`. |
| `src/pages/businessManagment/getReservations.tsx` | 60, 75, 210, 264, 288 | `@typescript-eslint/no-explicit-any` | Error (x5) | Uso de `any` en parámetros y eventos. |
| `src/pages/businessManagment/getReservations.tsx` | 134, 162, 485 | `@typescript-eslint/no-unused-vars` | Error (x3) | Variable `'error'` definida en catch pero no utilizada. |
| `src/pages/businessManagment/getReservations.tsx` | 439 | `react-hooks/exhaustive-deps` | Advertencia | Dependencia faltante `'searchParams'` en `useCallback`. |
| `src/pages/reservationPage/CourtsPage.tsx` | 20 | `react-hooks/exhaustive-deps` | Advertencia | Hook `useEffect` carece de dependencia `'fetchCourts'`. |
| `src/pages/reservationPage/CourtsPage.tsx` | 38, 39 | `@typescript-eslint/no-explicit-any` | Error (x2) | Uso de `any` en manejo de errores. |
| `src/pages/reservationPage/reservationPage.tsx` | 288 | `@typescript-eslint/no-explicit-any` | Error | Uso de `any`. |
| `src/types/apiError.ts` | 8, 9, 11, 12 | `@typescript-eslint/no-explicit-any` | Error (x5) | Múltiples casts a `any` dentro de `errorHandler`. |

---

## 10. Plan de Acción Recomendado

Para resolver de manera metódica y segura las inconsistencias encontradas, se recomienda la siguiente secuencia de trabajo priorizada:

### Fase 1: Limpieza Inmediata y Corrección de Errores (Prioridad Alta)
1. **[x] Eliminar archivos vacíos e inservibles (Resuelto):**
   - Eliminado `src/layout/businessLayout.tsx`.
   - Eliminados `src/static/css/components/CourtCard.css` y `CourtList.css`.
   - Eliminado `src/static/css/categories/categoryCreate.css` (retirando sus imports en `CategoryCreate.tsx` y `businessCreate.tsx`).
   - Eliminado `src/static/css/components/ReservationModal.css`.
   - Eliminado `src/static/css/pitchCard.css`.
   - Eliminado `src/assets/images/react.svg` y reubicado `vite.svg` a `public/vite.svg`.
2. **[x] Desinstalar dependencias sin uso (Resuelto):**
   - Ejecutado `npm uninstall react-jwt @types/jsonwebtoken`.
3. **Corregir errores de ESLint:**
   - Renombrar `function businessPitchDetail` a `BusinessPitchDetail` en `src/pages/businessManagment/detail.tsx`.
   - Separar `useLayoutMode` o estructurar `LayoutContext.tsx` correctamente para Fast Refresh.
   - [x] Eliminadas las variables no usadas `id` (en `pitchUpdate.tsx`) y `error` (en `getReservations.tsx`).
   - Reemplazar `any` por tipos específicos o `unknown` con type guards.

### Fase 2: Unificación de Tipos y Eliminación de Duplicados (Prioridad Alta)
1. **Crear tipos centralizados en `src/types/`:**
   - Crear `localityType.ts` con `export interface Locality { id: number; name: string; postal_code?: number; province?: string; }`.
   - Crear `categoryType.ts` con `export interface Category { id: number; description: string; usertype: string; }`.
   - Reemplazar las 12 declaraciones locales de `Locality` y las 6 de `Category`.
2. **Mover `errorHandler`:**
   - Trasladar `errorHandler` desde `src/types/apiError.ts` hacia `src/utils/errorHandler.ts`.
3. **Consolidar `Pitch` y `Court`:**
   - Adoptar un único tipo `Pitch` unificado y deprecir `ReservePitch`.
   - Decidir si `CourtsPage` / `CourtList` deben fusionarse definitivamente en `ReservePitchPage` o eliminarse.

### Fase 3: Estandarización de Nombres de Archivos y Componentes (Prioridad Media)
1. **Corregir la carpeta `businessManagment`:**
   - Renombrar `src/pages/businessManagment/` a `src/pages/businessManagement/`.
   - Renombrar sus archivos internos a PascalCase semántico (`BusinessPitchAdd.tsx`, `BusinessPitchDetail.tsx`, etc.).
2. **Estandarizar páginas a PascalCase:**
   - Renombrar `loginPage.tsx` -> `LoginPage.tsx`.
   - Renombrar `registerBusiness.tsx` -> `RegisterBusinessPage.tsx`.
   - Renombrar `deleteConfirm.tsx` -> `DeleteConfirm.tsx`.
   - Mover el hook `Auth.tsx` a `src/hooks/useAuth.ts`.
   - Mover `homePageNav.tsx` y `homeFooter.tsx` desde `src/pages/homepage/` hacia `src/components/navigation/`.
3. **Normalizar rutas y URLs:**
   - Corregir `pitchs/` a `pitches/` en `App.tsx` y en el backend si aplica.
   - Unificar verbos de administración a una convención única (`create/` vs `add/`, `detail/:id` vs `getOne/:id`).
   - Quitar trailing slashes innecesarias en subrutas de `react-router`.

### Fase 4: Saneamiento de CSS y Estandarización de Imports (Prioridad Media)
1. **Aislar selectores `:root`:**
   - Consolidar variables globales en `src/static/css/index.css`.
   - Remover las declaraciones `:root` duplicadas de los 15 archivos individuales para evitar colisiones en producción.
2. **Eliminar CSS cruzado:**
   - Crear una hoja de estilos compartida para formularios de administración (por ejemplo `src/static/css/adminForm.css`) en lugar de hacer que Localidades o Negocios importen hojas de `users` o `categories`.
3. **Mover `StarRating.css`:**
   - Trasladar `src/components/StarRating.css` a `src/static/css/components/StarRating.css`.
4. **Estandarizar imports:**
   - Remover extensiones `.tsx`, `.ts` y `.js` en imports de componentes y servicios.
   - Unificar las importaciones de routing hacia `react-router` o `react-router-dom`.
