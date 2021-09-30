var fs = require('fs');
var express = require('express');
var Producto = require('./modules/producto.js');
var uuidv4 = require('uuid').v4;
var exphbs = require('express-handlebars');
var Server = require('socket.io').Server;
var app = express();
var PORT = process.env.PORT || 8080;
var routerApi = express.Router();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use('/api', routerApi);
var server = app.listen(PORT, function () {
    console.log("Servidor http escuchando en el puerto " + server.address().port);
});
server.on("error", function (error) { return console.log("Error en servidor " + error); });
app.engine("hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "index",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials"
}));
app.set('views', './views');
app.set('view engine', 'hbs');
var arrayProductos = [
    {
        title: "Juego de mesa T.E.G. Tradicional",
        price: 3850.50,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_659090-MLA44676313817_012021-O.webp",
        id: 1
    },
    {
        title: "Dungeon And Dragons 5e Monster Manual D&d Dnd 5ta Edición",
        price: 11275,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_726931-MLA45539678600_042021-O.webp",
        id: 2
    },
    {
        title: "Dados Dungeon & Dragons Rol Negro Pearl + Bolsa",
        price: 1297.97,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_632645-MLA40799082681_022020-O.webp",
        id: 3
    }
];
var mensajes = JSON.parse(fs.readFileSync('./content/mensajes.json', 'utf8'));
routerApi.get('/productos/listar', function (req, res) {
    if (arrayProductos.length) {
        res.status(200).json(arrayProductos);
    }
    else {
        res.status(404).json({ error: 'No hay productos cargados' });
    }
});
routerApi.get('/productos/listar/:id', function (req, res) {
    var id = req.params.id;
    var filteredArray = arrayProductos.find(function (obj) { return obj.id == id; });
    if (filteredArray) {
        res.status(200).json(filteredArray);
    }
    else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});
routerApi.post('/productos/guardar/', function (req, res) {
    var _a = req.body, title = _a.title, price = _a.price, thumbnail = _a.thumbnail;
    var producto = new Producto(title, price, thumbnail, uuidv4());
    arrayProductos.push(producto.getParsedObject());
    res.status(204).json(producto);
});
routerApi.put('/productos/actualizar/:id', function (req, res) {
    var id = req.params.id;
    var _a = req.body, title = _a.title, price = _a.price, thumbnail = _a.thumbnail;
    var productoEditado = arrayProductos.find(function (obj) { return obj.id == id; });
    if (productoEditado) {
        productoEditado.title = title, productoEditado.price = price, productoEditado.thumbnail = thumbnail;
        res.status(200).json(productoEditado);
    }
    else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});
routerApi["delete"]('/productos/borrar/:id', function (req, res) {
    var id = req.params.id;
    var removeFromArray = arrayProductos.find(function (obj) { return obj.id == id; });
    if (removeFromArray) {
        arrayProductos.splice(arrayProductos.indexOf(removeFromArray), 1);
        res.json(removeFromArray);
    }
    else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});
app.get('/', function (req, res) {
    res.render('formulario');
});
app.get('/productos/vista', function (req, res) {
    res.render('productos', { listaProductos: arrayProductos });
});
var io = new Server(server);
io.on("connection", function (socket) {
    console.log('Escuchando socket');
    socket.emit('listaProductos', arrayProductos);
    socket.on('nuevoProducto', function (data) {
        arrayProductos.push(data);
        io.sockets.emit('listaProductos', arrayProductos);
    });
    socket.emit('nuevoMensaje', mensajes);
    socket.on('nuevoMensaje', function (data) {
        mensajes.push(data);
        fs.writeFileSync('./content/mensajes.json', JSON.stringify(mensajes, null, 4));
        io.sockets.emit('nuevoMensaje', mensajes);
    });
});
/*
OBJETO PARA PRUEBA:
{
    "title": "Juego de mesa Carcassonne",
    "price": 5840,
    "thumbnail": "https://http2.mlstatic.com/D_NQ_NP_824823-MLA45578263264_042021-O.webp"
}
*/
