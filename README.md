# La Cabaña 🏡

Tienda en línea de recetas y productos artesanales mexicanos, hecha con **Next.js 15 (App Router)**, **MongoDB + Mongoose** y **Tailwind CSS 4**.

## Funciones

- **Recetas por categoría** (Desayunos, Almuerzos, Cenas, Postres) con búsqueda, filtros y orden por mejor calificadas.
- **Recetario colaborativo**: cualquier usuario puede publicar, editar y borrar sus recetas, con foto subida desde la compu o el celular.
- **Calificaciones con estrellas** (1 voto por usuario, se puede cambiar) y **recetas guardadas**.
- **Tus recetas**: pestañas de guardadas y publicadas por ti.
- **Blog de consejos** con opiniones (comentarios).
- **Receta con IA** (Gemini): la llave vive solo en el servidor, con límite de uso por usuario. La receta generada se puede publicar o editar antes.
- **Perfil**: nombre, foto y cambio de contraseña.
- **Recuperar contraseña por correo** (Resend o SendGrid). Sin llave configurada, el enlace se imprime en la terminal para probar en local.
- **Tienda de pimientas** con carrito, pedidos y descuento atómico de stock.
- **Pagos con Mercado Pago** (Checkout Pro vía API de Orders): el cliente paga en Mercado Pago y al regresar el pedido se marca como pagado. Si el pago vence o se cancela, el stock regresa solo.
- **Panel admin**: ventas, productos, recetas, blog y pedidos.

## Cómo correrlo

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia `.env.example` como `.env.local` y llena los valores. Necesitas una base de MongoDB:
   - Local: `mongodb://localhost:27017/la-cabana` (con MongoDB instalado o con Docker:
     `docker run -d -p 27017:27017 --name mongo mongo:7`)
   - O gratis en la nube con [MongoDB Atlas](https://www.mongodb.com/atlas).
3. Carga datos de ejemplo (admin, usuarios de prueba, recetas, tienda y blog):
   ```bash
   npm run seed
   ```
   Usa `npm run seed:reset` para borrar el contenido anterior y volver a cargarlo (no borra usuarios ni pedidos).
4. (Opcional) Para la receta con IA, agrega `GEMINI_API_KEY=` a tu `.env.local` con una llave de https://aistudio.google.com/apikey
5. (Opcional) Para enviar correos de recuperación de contraseña agrega a `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   # o SENDGRID_API_KEY=SG.xxxxxxxx
   MAIL_FROM=La Cabaña <onboarding@resend.dev>
   ```
   Sin llave, el enlace aparece en la terminal donde corre `npm run dev`.
6. (Opcional) Para cobrar con Mercado Pago agrega tu Access Token de **prueba**:
   ```
   MP_ACCESS_TOKEN=APP_USR-xxxxxxxx
   ```
   Sin token, los pedidos quedan como "pago al entregar".
7. Arranca el servidor:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000. Entra con el admin de tu `.env.local` para ver `/admin`.

## Estructura

```
app/
  actions/        Server Actions (auth, pedidos, admin)
  admin/          Panel de administración
  recetas/        Listado y detalle de recetas
  tienda/         Listado y detalle de productos
  carrito/        Carrito y checkout
  cuenta/         Pedidos del usuario
components/       UI compartida (Header, tarjetas, carrito, formularios)
lib/              Conexión a BD, auth, consultas y utilidades
models/           Esquemas de Mongoose (User, Product, Recipe, Order)
scripts/seed.mjs  Datos de ejemplo
```

## Siguientes pasos

- Webhook de Mercado Pago (cuando el sitio esté en internet)
- Deploy en Vercel + MongoDB Atlas
