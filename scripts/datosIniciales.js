// Datos iniciales del inventario (los mismos que usaba el front con LocalStorage)
const v = (marca, modelo, desde, hasta) => ({ marca, modelo, desde, hasta })

const VEHICULOS = [
    v('Chevrolet', 'Spark GT', 2010, 2020),
    v('Chevrolet', 'Sail', 2012, 2020),
    v('Chevrolet', 'Aveo', 2008, 2017),
    v('Renault', 'Logan', 2010, 2022),
    v('Renault', 'Sandero', 2009, 2022),
    v('Renault', 'Duster', 2012, 2023),
    v('Mazda', 'Mazda 2', 2010, 2022),
    v('Mazda', 'Mazda 3', 2010, 2023),
    v('Mazda', 'CX-5', 2013, 2023),
    v('Kia', 'Picanto', 2008, 2023),
    v('Kia', 'Rio', 2010, 2023),
    v('Toyota', 'Corolla', 2009, 2023),
    v('Toyota', 'Hilux', 2010, 2023)
]

const PRODUCTOS = [
    {
        nombre: 'Filtro de aceite', referencia: 'MF-W712', marca: 'Mann-Filter', categoria: 'Filtros',
        stock: 24, stockMinimo: 8, precio: 32000, ubicacion: 'Pasillo A · Estante 2',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2010, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Chevrolet', 'Aveo', 2008, 2017), v('Renault', 'Logan', 2010, 2018), v('Kia', 'Picanto', 2008, 2016)]
    },
    {
        nombre: 'Pastillas de freno delanteras', referencia: 'BP-0986', marca: 'Bosch', categoria: 'Frenos',
        stock: 3, stockMinimo: 6, precio: 98000, ubicacion: 'Pasillo B · Estante 1',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2015, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Kia', 'Rio', 2010, 2017), v('Kia', 'Picanto', 2012, 2023)]
    },
    {
        nombre: 'Bujía de iridio', referencia: 'NGK-ILKR7', marca: 'NGK', categoria: 'Encendido',
        stock: 40, stockMinimo: 12, precio: 46000, ubicacion: 'Pasillo C · Estante 3',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2010, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Mazda', 'Mazda 2', 2010, 2022), v('Mazda', 'Mazda 3', 2010, 2018), v('Toyota', 'Corolla', 2009, 2018), v('Renault', 'Logan', 2010, 2022)]
    },
    {
        nombre: 'Filtro de aire', referencia: 'AC-A3147', marca: 'ACDelco', categoria: 'Filtros',
        stock: 0, stockMinimo: 6, precio: 41000, ubicacion: 'Pasillo A · Estante 3',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2013, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Renault', 'Sandero', 2009, 2022)]
    },
    {
        nombre: 'Amortiguador delantero', referencia: 'MO-G7142', marca: 'Monroe', categoria: 'Suspensión',
        stock: 4, stockMinimo: 4, precio: 215000, ubicacion: 'Bodega · Rack 1',
        compatibilidad: [v('Toyota', 'Corolla', 2009, 2023), v('Mazda', 'Mazda 3', 2010, 2023), v('Mazda', 'CX-5', 2013, 2023), v('Renault', 'Duster', 2012, 2023)]
    },
    {
        nombre: 'Correa de distribución', referencia: 'GT-5560', marca: 'Gates', categoria: 'Motor',
        stock: 9, stockMinimo: 4, precio: 124000, ubicacion: 'Pasillo C · Estante 1',
        compatibilidad: [v('Chevrolet', 'Aveo', 2008, 2017), v('Renault', 'Logan', 2010, 2022), v('Renault', 'Sandero', 2009, 2022), v('Kia', 'Rio', 2010, 2023), v('Kia', 'Picanto', 2008, 2023)]
    },
    {
        nombre: 'Disco de freno ventilado', referencia: 'BR-09A', marca: 'Brembo', categoria: 'Frenos',
        stock: 2, stockMinimo: 4, precio: 285000, ubicacion: 'Pasillo B · Estante 2',
        compatibilidad: [v('Mazda', 'Mazda 3', 2010, 2023), v('Mazda', 'CX-5', 2013, 2023), v('Toyota', 'Corolla', 2009, 2023), v('Toyota', 'Hilux', 2010, 2023)]
    },
    {
        nombre: 'Batería 12V 45Ah', referencia: 'BO-S4005', marca: 'Bosch', categoria: 'Eléctrico',
        stock: 11, stockMinimo: 5, precio: 420000, ubicacion: 'Bodega · Rack 2',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2010, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Kia', 'Picanto', 2008, 2023), v('Kia', 'Rio', 2010, 2023), v('Mazda', 'Mazda 2', 2010, 2022), v('Renault', 'Logan', 2010, 2022)]
    },
    {
        nombre: 'Bomba de agua', referencia: 'DN-W2051', marca: 'Denso', categoria: 'Motor',
        stock: 0, stockMinimo: 3, precio: 178000, ubicacion: 'Pasillo C · Estante 2',
        compatibilidad: [v('Toyota', 'Corolla', 2009, 2023), v('Toyota', 'Hilux', 2010, 2023), v('Mazda', 'Mazda 3', 2010, 2016)]
    },
    {
        nombre: 'Filtro de combustible', referencia: 'MF-WK58', marca: 'Mann-Filter', categoria: 'Filtros',
        stock: 18, stockMinimo: 6, precio: 54000, ubicacion: 'Pasillo A · Estante 1',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2016, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Chevrolet', 'Aveo', 2008, 2017), v('Renault', 'Duster', 2012, 2023)]
    },
    {
        nombre: 'Kit de embrague', referencia: 'SX-3000', marca: 'Sachs', categoria: 'Transmisión',
        stock: 5, stockMinimo: 2, precio: 560000, ubicacion: 'Bodega · Rack 3',
        compatibilidad: [v('Renault', 'Logan', 2010, 2022), v('Renault', 'Sandero', 2009, 2022), v('Chevrolet', 'Aveo', 2008, 2017), v('Kia', 'Rio', 2010, 2023)]
    },
    {
        nombre: 'Limpiaparabrisas 22"', referencia: 'BO-AE22', marca: 'Bosch', categoria: 'Accesorios',
        stock: 30, stockMinimo: 10, precio: 38000, ubicacion: 'Pasillo D · Estante 1',
        compatibilidad: [v('Chevrolet', 'Spark GT', 2010, 2020), v('Chevrolet', 'Sail', 2012, 2020), v('Mazda', 'Mazda 2', 2010, 2022), v('Mazda', 'Mazda 3', 2010, 2023), v('Kia', 'Picanto', 2008, 2023), v('Kia', 'Rio', 2010, 2023)]
    }
]

module.exports = {
    VEHICULOS,
    PRODUCTOS
}