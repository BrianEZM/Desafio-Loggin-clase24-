// ESTE ES EL DESAFIO DE LA CLASE 16 + MOCKS + NORMALIZR

import express from "express";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

import routes from "./routes/routes.js";

app.use(express.static("./public"));
app.use(routes);
// "/api/productos",

const ageCookie = (minutes) => {
	if (minutes === 1) {
		return 60000;
	} else {
		return minutes * 60000;
	}
};

app.use(cookieParser());
app.use(
	session({
		store: new FileStore({path: "../sesiones", ttl: 300, retries: 0
		}),
		secret: "secret",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: ageCookie(2) },
	})
);

// <------------------------- Configuracion de EJS ------------------------->

app.set("view engine", ".ejs");
app.set("views", "./src/views");

// <------------------------- Clases ------------------------->
import { optionsMySQL, optionsSQLite } from "./DB/options.js";

import Contenedor from "./contenedor.js";
const contenedor = new Contenedor({
	options: optionsMySQL.options,
	table: optionsMySQL.table,
});

// CHAT PERSISTENCIA SQLITE
import Chat from "./chat.js";
const chat = new Chat({
	options: optionsSQLite.options,
	table: optionsSQLite.table,
});

// <------------------------- Sockets ------------------------->

io.on("connection", async (socket) => {
	console.log("Un cliente se ha conectado");
	const responseProducts = await contenedor.getAll();
	socket.emit("products", responseProducts);
	const responseChats = await chat.getAll();
	socket.emit("messages", responseChats);

	socket.on("new-message", async (data) => {
		await chat.save(data);
		const response = await chat.getAll();
		io.sockets.emit("messages", response);
	});

	socket.on("new-product", async (data) => {
		await contenedor.save(data);
		const response = await contenedor.getAll();
		io.sockets.emit("products", response);
	});
});

// <------------------------- Configuracion Servidor ------------------------->
const PORT = process.env.PORT || 8080;

const connectedServer = httpServer.listen(PORT, () => {
	console.log(
		`Servidor HTTP con Websockets escuchando en el puerto ${
			connectedServer.address().port
		}`
	);
});

connectedServer.on("error", (error) =>
	console.log(`Error en servidor ${error}`)
);