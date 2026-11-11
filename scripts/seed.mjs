// Llena la base de datos con el contenido original de La Cabaña:
// admin + 2 usuarios de prueba, recetas por categoría con fotos y estrellas,
// tienda de pimientas y consejos del blog con opiniones.
// Uso: npm run seed   (lee las variables de .env.local). Se puede correr varias veces.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { MONGODB_URI, ADMIN_EMAIL = "admin@lacabana.com", ADMIN_PASSWORD = "admin12345" } = process.env;
if (!MONGODB_URI) {
  console.error("Falta MONGODB_URI en .env.local");
  process.exit(1);
}

const slugify = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;
const now = new Date();

// --reset borra productos, recetas, consejos y fotos subidas (NO borra usuarios ni pedidos)
if (process.argv.includes("--reset")) {
  for (const c of ["products", "recipes", "posts", "images"]) await db.collection(c).deleteMany({});
  await db.collection("users").updateMany({}, { $set: { favorites: [] } });
  console.log("✔ Contenido anterior borrado");
}
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

/* ---------- Usuarios ---------- */
const users = db.collection("users");
async function upsertUser(name, email, password, role = "user") {
  const found = await users.findOne({ email });
  if (found) {
    if (role === "admin") await users.updateOne({ email }, { $set: { role: "admin" } });
    return found._id;
  }
  const res = await users.insertOne({
    name, email, role, avatar: "", favorites: [],
    password: await bcrypt.hash(password, 10),
    createdAt: now, updatedAt: now,
  });
  return res.insertedId;
}
const adminId = await upsertUser("La Cabaña", ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
const anaId = await upsertUser("Ana Ruiz", "ana@lacabana.com", "demo12345");
const luisId = await upsertUser("Luis Pérez", "luis@lacabana.com", "demo12345");
console.log(`✔ Usuarios: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (admin) · ana@lacabana.com y luis@lacabana.com / demo12345`);

/* ---------- Tienda (pimientas de la versión original) ---------- */
const productData = [
  ["Pimienta negra molida", 65, 30, true, "Origen: India. Intensidad media-alta. Ideal para carnes, sopas y guisos. Envase de 100 g."],
  ["Pimienta rosa en grano", 89, 20, true, "Delicada y ligeramente dulce. Perfecta para pescados y postres. Envase de 50 g."],
  ["Pimienta blanca fina", 72, 18, false, "Sabor suave y elegante. Ideal para salsas claras y purés. Envase de 80 g."],
  ["Pimienta de Jamaica", 58, 25, true, "Notas de clavo, canela y nuez moscada. Perfecta para repostería. Envase de 60 g."],
  ["Pimienta verde liofilizada", 95, 4, false, "Sabor fresco y herbáceo. Ideal para carnes a la plancha. Envase de 40 g."],
  ["Pimienta larga", 110, 12, false, "Exótica y picante. Usada en cocina india y mediterránea. Envase de 70 g."],
];
const products = db.collection("products");
const pid = {};
for (const [name, price, stock, featured, description] of productData) {
  const slug = slugify(name);
  const res = await products.findOneAndUpdate(
    { slug },
    { $setOnInsert: { name, slug, category: "Pimientas", price, stock, featured, description, image: "/img/pimienta.jpg", createdAt: now, updatedAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  pid[name] = res._id;
}
console.log(`✔ ${productData.length} productos en la tienda`);

/* ---------- Recetas ---------- */
const R = (o) => o;
const recipeData = [
  R({
    title: "Tacos de birria", category: "Desayunos", image: "/img/tacos-birria.jpg", author: adminId, prepMinutes: 180, servings: 6, difficulty: "Media",
    summary: "¿Puede un taco tan impresionante no llevar grasa? Claro que no. Ya te advertimos que repetirás.",
    ingredients: ["1 kg de carne de res (chambarete y costilla)", "4 chiles guajillo", "2 chiles ancho", "3 jitomates", "1/2 cebolla", "4 dientes de ajo", "1 cucharadita de pimienta de Jamaica", "Tortillas de maíz", "Cebolla y cilantro picados", "Limones"],
    steps: ["Desvena los chiles y remójalos en agua caliente 15 minutos.", "Licúa los chiles con jitomate, cebolla, ajo, pimienta de Jamaica y un poco de agua.", "Sella la carne en una olla y cúbrela con la salsa y 1 litro de agua.", "Cocina a fuego bajo 2 horas y media, hasta que se deshebre fácil.", "Deshebra la carne. Pasa las tortillas por la grasa del consomé y dóralas en el comal con la carne.", "Sirve con cebolla, cilantro, limón y una taza de consomé."],
    products: ["Pimienta de Jamaica"], ratings: [[anaId, 5, "Quedó como la de la fonda de mi pueblo. El consomé es lo mejor 🤤"], [luisId, 4, "Muy rica, solo tarda bastante. Vale la pena para el domingo."]], days: 1,
  }),
  R({
    title: "Mini frittatas de verduras", category: "Desayunos", image: "/img/mini-frittatas.jpg", author: anaId, prepMinutes: 25, servings: 6, difficulty: "Fácil",
    summary: "Bocaditos de huevo horneados con espinaca y pimiento. Ideales para llevar.",
    ingredients: ["6 huevos", "1 taza de espinaca picada", "1/2 pimiento rojo en cubitos", "1/4 de cebolla picada", "50 g de queso panela", "Sal y pimienta negra"],
    steps: ["Precalienta el horno a 180 °C y engrasa un molde para muffins.", "Bate los huevos con sal y pimienta.", "Reparte las verduras y el queso en el molde.", "Vierte el huevo encima, hasta 3/4 de cada hueco.", "Hornea 18 minutos, hasta que estén firmes y doraditas."],
    products: ["Pimienta negra molida"], ratings: [[luisId, 5, "Las hago el domingo y me duran para toda la semana."], [adminId, 4, ""]], days: 3,
  }),
  R({
    title: "Desayuno de campo", category: "Desayunos", image: "/img/desayuno.jpg", author: adminId, prepMinutes: 20, servings: 2, difficulty: "Fácil",
    summary: "Huevos revueltos suaves, tocino crujiente y pan tostado. Como en la cabaña.",
    ingredients: ["4 huevos", "4 tiras de tocino de pavo", "2 rebanadas de pan integral", "1 cucharada de mantequilla", "Fruta de temporada", "Sal y pimienta"],
    steps: ["Dora el tocino en un sartén sin aceite y reserva.", "Bate los huevos con sal y pimienta.", "Derrite la mantequilla a fuego bajo y cocina los huevos moviendo despacio.", "Tuesta el pan y sirve todo con fruta."],
    ratings: [[anaId, 4]], days: 9,
  }),
  R({
    title: "Crema de tomate y jengibre", category: "Almuerzos", image: "/img/crema-tomate.jpg", author: adminId, prepMinutes: 35, servings: 4, difficulty: "Fácil",
    summary: "El tomate en forma de crema con zanahoria, jengibre y hierbabuena. Te va a encantar, ¡y es facilísima!",
    ingredients: ["6 jitomates maduros", "2 zanahorias", "1/2 cebolla", "1 trozo de jengibre (2 cm)", "2 tazas de caldo de verduras", "Hojas de hierbabuena", "Aceite de oliva", "Pimienta blanca"],
    steps: ["Sofríe la cebolla, la zanahoria y el jengibre en un poco de aceite.", "Agrega los jitomates en trozos y cocina 5 minutos.", "Añade el caldo y deja hervir 20 minutos.", "Licúa hasta que quede tersa y sazona con sal y pimienta blanca.", "Sirve con hierbabuena y un chorrito de aceite de oliva."],
    products: ["Pimienta blanca fina"], ratings: [[anaId, 3, "Le faltó un poco de sal, pero el jengibre le queda increíble."], [luisId, 4, ""]], days: 2,
  }),
  R({
    title: "Bollitos de requesón y jamón", category: "Almuerzos", image: "/img/bollitos-requeson.jpg", author: luisId, prepMinutes: 20, servings: 4, difficulty: "Fácil",
    summary: "La cremosidad del requesón con el sabor intenso del jamón: un bocado irresistible.",
    ingredients: ["250 g de requesón", "100 g de jamón de pavo picado", "1 huevo", "3 cucharadas de avena molida", "Cebollín picado", "Pimienta negra"],
    steps: ["Mezcla el requesón con el huevo, la avena, el jamón y el cebollín.", "Sazona con pimienta y forma bolitas con las manos húmedas.", "Hornea a 200 °C por 15 minutos o hasta que doren."],
    products: ["Pimienta negra molida"], ratings: [[anaId, 3], [adminId, 3]], days: 6,
  }),
  R({
    title: "Milhojas de verduras", category: "Almuerzos", image: "/img/milhojas-verduras.jpg", author: anaId, prepMinutes: 40, servings: 4, difficulty: "Media",
    summary: "Capas de calabacita, zanahoria y huevo, ligeras y muy vistosas.",
    ingredients: ["2 calabacitas en láminas finas", "2 zanahorias en láminas", "4 huevos", "100 ml de leche descremada", "Queso parmesano rallado", "Sal y pimienta"],
    steps: ["Cuece las láminas de verdura al vapor 3 minutos.", "Bate huevos con leche, sal y pimienta.", "Acomoda capas de verdura en un molde y baña cada capa con la mezcla.", "Espolvorea parmesano y hornea 25 minutos a 180 °C.", "Deja reposar 5 minutos antes de cortar."],
    ratings: [[luisId, 5]], days: 12,
  }),
  R({
    title: "Ensalada de pollo mediterránea", category: "Almuerzos", image: "", author: adminId, prepMinutes: 20, servings: 2, difficulty: "Fácil",
    summary: "Pollo, aceitunas, pepino, jitomate y un toque de orégano. Ligera y llena de sabor.",
    ingredients: ["1 pechuga de pollo a la plancha", "1 pepino", "2 jitomates", "10 aceitunas negras", "1/4 de cebolla morada", "Orégano seco", "Aceite de oliva y limón"],
    steps: ["Corta el pollo en tiras y las verduras en cubos.", "Mezcla todo en un bowl con las aceitunas.", "Aliña con aceite de oliva, limón, orégano, sal y pimienta."],
    ratings: [[anaId, 4], [luisId, 4]], days: 15,
  }),
  R({
    title: "Lubina a la plancha con ensalada", category: "Cenas", image: "/img/lubina.jpg", author: adminId, prepMinutes: 25, servings: 2, difficulty: "Media",
    summary: "Un clásico de la cocina saludable: jugosa por dentro y con la piel crujiente.",
    ingredients: ["2 filetes de lubina con piel", "Mezcla de lechugas", "1 limón", "Aceite de oliva", "Pimienta rosa en grano", "Sal de mar"],
    steps: ["Seca bien los filetes y haz cortes finos en la piel.", "Calienta un sartén con poco aceite y cocina la lubina con la piel hacia abajo 4 minutos.", "Voltea y cocina 2 minutos más.", "Sirve sobre la ensalada con limón y pimienta rosa machacada."],
    products: ["Pimienta rosa en grano"], ratings: [[anaId, 3], [luisId, 4]], days: 4,
  }),
  R({
    title: "Barquitas de berenjena", category: "Cenas", image: "/img/barquitas-berenjena.jpg", author: luisId, prepMinutes: 45, servings: 4, difficulty: "Media",
    summary: "Berenjenas rellenas de verduras y queso, gratinadas al horno.",
    ingredients: ["2 berenjenas", "1 jitomate picado", "1/2 pimiento", "1/2 cebolla", "100 g de queso mozzarella light", "Albahaca", "Aceite de oliva"],
    steps: ["Parte las berenjenas a lo largo y vacía la pulpa dejando 1 cm.", "Saltea la pulpa con cebolla, pimiento y jitomate.", "Rellena las barquitas y cubre con queso.", "Hornea 25 minutos a 190 °C y decora con albahaca."],
    ratings: [[adminId, 4]], days: 7,
  }),
  R({
    title: "Crema de calabaza con crotones", category: "Cenas", image: "", author: anaId, prepMinutes: 30, servings: 4, difficulty: "Fácil",
    summary: "Ligera y reconfortante, con un toque de jengibre. Perfecta para cerrar el día.",
    ingredients: ["600 g de calabaza de Castilla", "1 papa", "1/2 cebolla", "1 cm de jengibre", "3 tazas de caldo", "Pan integral en cubitos"],
    steps: ["Cuece la calabaza, la papa, la cebolla y el jengibre en el caldo 20 minutos.", "Licúa hasta que quede cremosa.", "Dora los cubitos de pan en el comal y sirve encima."],
    ratings: [[luisId, 4], [adminId, 4]], days: 18,
  }),
  R({
    title: "Tarta de flan y chocolate sin azúcar", category: "Postres", image: "/img/tarta-flan.jpg", author: adminId, prepMinutes: 60, servings: 8, difficulty: "Media",
    summary: "¿Puede una tarta tan impresionante no llevar azúcar? Claro que sí. Ya te advertimos que repetirás.",
    ingredients: ["4 huevos", "500 ml de leche", "Endulzante al gusto", "1 cucharadita de vainilla", "150 g de chocolate amargo 85%", "100 ml de crema ligera", "Galletas integrales para la base", "1 pizca de pimienta de Jamaica"],
    steps: ["Tritura las galletas, mézclalas con un poco de mantequilla y forra el molde.", "Licúa huevos, leche, endulzante, vainilla y la pimienta de Jamaica; vierte sobre la base.", "Hornea a baño María 45 minutos a 170 °C y deja enfriar.", "Derrite el chocolate con la crema y cubre el flan.", "Refrigera mínimo 3 horas antes de servir."],
    products: ["Pimienta de Jamaica"], ratings: [[anaId, 5, "¡No se nota que no lleva azúcar! Perfecta para sesiones largas."], [luisId, 4, "Le puse un poco más de chocolate y quedó brutal."]], days: 0,
  }),
  R({
    title: "Tostadas de aguacate con huevo", category: "Desayunos", image: "", author: luisId, prepMinutes: 15, servings: 2, difficulty: "Fácil",
    summary: "Pan integral con aguacate fresco y huevo pochado. Rica en proteínas y grasas buenas.",
    ingredients: ["2 rebanadas de pan integral", "1 aguacate", "2 huevos", "Limón", "Hojuelas de chile", "Sal y pimienta"],
    steps: ["Tuesta el pan.", "Machaca el aguacate con limón, sal y pimienta y úntalo.", "Poche los huevos 3 minutos en agua con un chorrito de vinagre.", "Coloca el huevo encima y termina con chile en hojuelas."],
    ratings: [[anaId, 5, "Mi desayuno de diario. Rápido y llena un montón."], [adminId, 5, ""]], days: 10,
  }),
];

const recipes = db.collection("recipes");
const rid = {};
for (const r of recipeData) {
  const slug = slugify(r.title);
  const ratings = r.ratings.map(([user, stars, comment = ""]) => ({ user, stars, comment, createdAt: daysAgo(r.days), updatedAt: daysAgo(r.days) }));
  const ratingAvg = Math.round((ratings.reduce((n, x) => n + x.stars, 0) / ratings.length) * 10) / 10;
  const { days, ...rest } = r;
  const res = await recipes.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        ...rest,
        slug,
        products: (r.products ?? []).map((n) => pid[n]).filter(Boolean),
        ratings,
        ratingAvg,
        ratingCount: ratings.length,
        fromAI: false,
        published: true,
        createdAt: daysAgo(days),
        updatedAt: daysAgo(days),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  rid[r.title] = res._id;
}
console.log(`✔ ${recipeData.length} recetas con fotos y calificaciones`);

// Recetas guardadas de los usuarios de prueba
await users.updateOne({ _id: anaId }, { $addToSet: { favorites: { $each: [rid["Tacos de birria"], rid["Tarta de flan y chocolate sin azúcar"]] } } });
await users.updateOne({ _id: luisId }, { $addToSet: { favorites: { $each: [rid["Mini frittatas de verduras"], rid["Crema de tomate y jengibre"]] } } });

/* ---------- Blog de consejos ---------- */
const posts = db.collection("posts");
const postData = [
  {
    title: "Incluye frutas y verduras en cada comida",
    image: "/img/blog-campo.jpg", author: adminId, days: 2,
    content: "Incluir frutas y verduras frescas en cada comida mejora tu energía y te ayuda a sentirte satisfecho por más tiempo.\n\nUn truco fácil: llena la mitad de tu plato con verduras antes de servir lo demás. Si se te antoja algo dulce, una fruta de temporada siempre es buena idea.\n\nY no tienen que ser aburridas: asadas, en crema, en tacos o en licuado, ¡todo cuenta!",
    comments: [[anaId, "Ana Ruiz", "Lo de llenar medio plato con verduras me ha funcionado muchísimo 🙌"], [luisId, "Luis Pérez", "Las verduras asadas con pimienta negra son lo mejor."]],
  },
  {
    title: "Cómo cocinar con menos aceite (sin perder sabor)",
    image: "/img/recetas-hero.jpg", author: anaId, days: 5,
    content: "Usa sartenes antiadherentes y un aspersor de aceite: con una o dos rociadas basta.\n\nCocinar al vapor, al horno o en freidora de aire te da texturas crujientes sin litros de aceite.\n\nPara que no falte sabor, apuéstale a las especias: pimienta, comino, ajo en polvo y hierbas frescas hacen magia.",
    comments: [[luisId, "Luis Pérez", "¡Excelente! Yo uso el aspersor y ya no regreso."]],
  },
  {
    title: "Las especias que no pueden faltar en tu cocina",
    image: "/img/pimienta.jpg", author: luisId, days: 8,
    content: "La pimienta negra es la reina: dale unas vueltas al molino al final de la cocción para que conserve su aroma.\n\nLa pimienta de Jamaica es perfecta para guisos y también para postres como flan o pan de plátano.\n\nGuárdalas en frascos cerrados, lejos de la estufa y de la luz, para que duren más.",
    comments: [],
  },
];
for (const p of postData) {
  const slug = slugify(p.title);
  const { days, comments, ...rest } = p;
  await posts.updateOne(
    { slug },
    {
      $setOnInsert: {
        ...rest,
        slug,
        comments: comments.map(([user, name, text], i) => ({
          _id: new mongoose.Types.ObjectId(), user, name, text, createdAt: daysAgo(days - 0.1 * (i + 1)), updatedAt: daysAgo(days),
        })),
        createdAt: daysAgo(days),
        updatedAt: daysAgo(days),
      },
    },
    { upsert: true }
  );
}
console.log(`✔ ${postData.length} consejos en el blog`);

await mongoose.disconnect();
console.log("Listo 🎉  Corre: npm run dev");
