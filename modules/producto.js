class Producto {
    constructor(title, price, thumbnail, id) {
        this.title = title || '';
        this.price = price || 0;
        this.thumbnail = thumbnail || '';
        this.id = id;
    }
    /* Esta funcion existe porque al pushear en array, el objeto se guardaba como "Producto {...}". Solo se mostraba al hacer console.log esto, pero igual lo estaba guardando mal.*/
    getParsedObject() {
        let parsedJSON = JSON.stringify(this, null, 4);
        return JSON.parse(parsedJSON);;
    }
}

module.exports = Producto;