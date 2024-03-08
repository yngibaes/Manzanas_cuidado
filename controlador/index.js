//Se importan los paquetes.
const express = require('express');
const mysql2 = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const path = require('path')

//Configurar el midddleware 
//Sirve para mirar si hay mas middleware en la carpeta sirve para hacer la conexion de los paquetes 
//Esto sirve para que este activo ({extended:true}))
app.use(bodyParser.urlencoded({ extended: true }));

//Llamar paquetes json
app.use(bodyParser.json());

//Paquete locales estaticos body-parse
app.use(express.static(__dirname))

//Sacar cookies
app.use(session({
    secret: 'Anitamonita',
    resave: false,
    saveUninitialized: false,
   /*  cookie: { maxAge: (5 * 60 * 60 * 1000)} */ //Cookies sosorras
}))

//Para las rutas
app.use(express.static(path.join(__dirname)))

//Conexión a la base de datos.
const data = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'manzanitos',
};

/* app.get('*', async (req,res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/index.html"))
}) */

app.get('/login-page', async (req,res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/login.html"))
})

app.get('/signup-page', async (req,res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/signup.html"))
})

//Crear usuario.
app.post('/signup', async (req, res) => {
    //Se llaman los nombres de los inputs del form.
    const { nombre_usu, tipo_doc, doc, fk_manzanas} = req.body;
    //Try, lo utilizamos para que el programa intente primero algo antes de mandarle error.
    try {
        //Este es para que se haga la conexión sólo en lo que se necesite y no este abierta siempre.
        const db = await mysql2.createConnection(data)

        //Esto se realiza para que verificar que no exista registros iguales 
        let [check] = await db.execute('SELECT * FROM usuario WHERE doc = ? AND tipo_doc=?', [doc, tipo_doc])

        //Verificar si el usuario existe.
        if (check.length > 0) {
            res.status(401).send(`<script> 
                window.onload = function(){
                alert('Ya existe este usuario');
                window.location.href = 'http://127.0.0.1:5501/vistas/html/login.html'}
                </script>`)
        }
        else {
            //Await para decir le que actue cuando se llame tiene que estar async para que sirva el await de igual manera
            //Aquí envía la información.
            await db.execute('INSERT INTO usuario (nombre_usu, tipo_doc, doc, fk_manzanas) VALUES (?,?,?,?)', [nombre_usu, tipo_doc, doc, fk_manzanas])
        
            /* req.session.user = user; */
            res.status(201).send(`<script> 
                window.onload = function(){
                alert('Datos Registrados');
                window.location.href = 'http://127.0.0.1:5501/vistas/html/login.html'}
                </script>`)
        }
        await db.end() //Cerramos conexión
    }
    catch (err) { 
        //Aquí ya capturamos el error
        console.log(`Resumen del error: ${err}`)
        res.status(500).send(`<script> 
            window.onload = function(){
            alert('Error en el servidor');
            window.location.href = 'http://127.0.0.1:5501/vistas/html/index.html'}
            </script>`)
    }
});

//Iniciar sesión.
app.post('/login', async (req, res) => {
    const { tipo_doc, doc } = req.body //Capturamos los datos del formulario.
    try {
        const db = await mysql2.createConnection(data)
        //Verificar credenciales
        const [check] = await db.execute('SELECT * FROM usuario WHERE tipo_doc = ? AND doc = ?', [tipo_doc, doc])
        console.log(check) //Aquí mostramos todos los datos del usuario que se encontró.
        if (check.length > 0) {
            req.session.nombre_usu = check[0].nombre_usu; //Aquí se capturan los datos de nombre y doc.
            req.session.doc = doc;
            //Se necesita verificar si el usuario es admin o usuario, además se llama tanto el nombre como el documento para próximas consultas no se repitan datos por nombres repetidos.
            if(check[0].rol=="Admin"){
                const user = {nombre_usu: check[0].nombre_usu} //Guardar el nombre
                console.log(user) //Para imprimir el nombre del usuario
                res.locals.user=user //Enviarlo por rutas, si no lo tengo ahí no deja enviarlo a otras rutas.
                res.sendFile(path.join(__dirname,`../vistas/html/admin.html`))}
            else{
                const user = {nombre_usu: check[0].nombre_usu} //Guardar el nombre
                console.log(user) //Para imprimir el nombre del usuario
                res.locals.user=user //Enviarlo por rutas, si no lo tengo ahí no deja enviarlo a otras rutas.
                res.sendFile(path.join(__dirname,`../vistas/html/usuario.html`))
            }
        } else{
            res.status(500).send(`<script>
            window.onload = function(){
            alert('Usuario no encontrado');
            window.location.href = 'http://127.0.0.1:5501/vistas/html/index.html'}
            </script>`)
        }
        await db.end() //Cerramos conexión
    }
    catch (err) {
        console.log(`Resumen del error: ${err}`)
        res.status(500).send(`<script> 
            window.onload = function(){
            alert('Error en el servidor');
            window.location.href = 'http://127.0.0.1:5501/vistas/html/index.html'}
            </script>`)
    }
})

//Se enruta un archivo - este es el de usuario.
app.post('/obtener-usuario', (req, res) => {
    const user = req.session.nombre_usu; //Aquí se llama el nombre de usuario
    console.log(user) //Se confirma el nombre de usuario
    if(user){
        res.json({ nombre_usu: user}) //Se envía el nombre
    }else{
        res.status(401).send('Usuario no encontrado')
    }
})

//Esto es para llamar los servicios dependiendo de cuales esta registrado con la fk_manzanas del usuario.
app.post('/obtener-servicios-usuario', async (req, res) => {
    const nombre_usu = req.session.nombre_usu //Llamamos los datos que teníamos en el login, para tomarlos directamente y no pasar por la url
    const doc = req.session.doc
    console.log(nombre_usu, doc) //Confirmamos que los datos estén definidos.
    try {
        const db = await mysql2.createConnection(data) //Conexión
        const [serData] = await db.execute('SELECT servicios.nombre_ser FROM usuario INNER JOIN manzanas ON manzanas.id_manzanas = usuario.fk_manzanas INNER JOIN manzanas_servicios ON manzanas_servicios.fk_manzanas = manzanas.id_manzanas INNER JOIN servicios ON servicios.id_servicios = manzanas_servicios.fk_servicios WHERE usuario.doc=? and usuario.nombre_usu=? ORDER BY servicios.id_servicios ASC', [doc,nombre_usu]) //Consulta de los servicios que tenga el usuario.
        console.log(serData) //Se muestra los servicios encontrados.
        res.json({ servicios: serData.map(row => row.nombre_ser) }) // Se mapean los datos que se encontraron, aquí específicamente el nombre de los servcios, esto para que se muestren uno por uno al usuario. Enlistar los datos en el orden en que vayan llegando.
        await db.end() //Cerramos conexión
    } catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Guardar el servicio que solicita la persona.
app.post('/guardar-servicios-usuario', async (req, res) => {
    const db = await mysql2.createConnection(data) //Conexión.
    const {servicios, fechaHora } = req.body //Capturamos datos que envía tanto la url como el form.
    const nombre_usu = req.session.nombre_usu //Llamamos los datos que teníamos en el login, para tomarlos directamente y no pasar por la url
    const doc = req.session.doc    
    console.log(nombre_usu, doc) //confirmamos que este enviando datos.
    try {
        for (const servicio of servicios) {
            const conID = await db.query ('SELECT id_usuario from usuario WHERE doc = ?', [doc]) //Buscamos el id del usuario con su documento.
            const [serData] = await db.query('SELECT servicios.id_servicios FROM servicios WHERE servicios.nombre_ser=?', [servicios]) //Buscamos el id de los servicios con el nombre de este.
            console.log("ID Usuario:", conID[0][0].id_usuario, "| ID Servicio:", serData[0].id_servicios) //Verificamos que este leyendo los ids.
            await db.execute('INSERT INTO solicitud (`solicitud_usu`,`codigoS`, `fecha`) VALUES (?,?,?)', [conID[0][0].id_usuario, serData[0].id_servicios, fechaHora])//Enviamos los datos, los [] son para entrar en los objetos y el doble entrar a un array y después a un objeto.
            console.log("Datos enviados") //Confirmamos que los datos hayan sido envíados.
            res.status(200).send('Servicio guardado');
        }
        await db.end() //Cerramos conexión
    } catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Obtener las solicitudes que se han mandado
app.post('/obtener-solicitudes',async(req, res) => {
    const nombre_usu = req.session.nombre_usu //Llamamos los datos que teníamos en el login, para tomarlos directamente y no pasar por la url
    const doc = req.session.doc    
    console.log(nombre_usu, doc) //Confirmamos que esten los datos.
    try {
        const db = await mysql2.createConnection(data) //Conexión
        const [soliData] = await db.execute('SELECT solicitud.id_solicitud, servicios.nombre_ser, servicios.tipo, solicitud.fecha from solicitud INNER JOIN usuario ON solicitud.solicitud_usu = usuario.id_usuario INNER JOIN manzanas ON usuario.fk_manzanas = manzanas.id_manzanas INNER JOIN manzanas_servicios ON manzanas.id_manzanas = manzanas_servicios.fk_manzanas INNER JOIN servicios ON manzanas_servicios.fk_servicios = servicios.id_servicios WHERE usuario.doc = ?  AND solicitud.codigoS=servicios.id_servicios', [doc]) //Aquí buscamos el id de la solicitud, servicio y fecha pedida con el documento del usuario.
        console.log(soliData) //Se verifica que muestre datos.
        res.json({ 
            solicitudes: soliData.map(row =>([ 
                //Aquí tomamos los datos capturados en un json y los mapeamos para que se convierta en un Array para poder enviarlos y mostrarlos en el html. 
                // * [] => Array | {} => Objeto
                row.id_solicitud,
                row.nombre_ser,
                row.tipo,
                row.fecha,
            ]))
        }) 
        await db.end() //Cerramos conexión
    } catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Eliminar solicitud
app.delete('/eliminar-solicitud', async(req, res) =>{
    const {id_solicitud} = req.body //Captura el id de la solicitud
    const db = await mysql2.createConnection(data) //Conexión
    try{
        await db.execute('DELETE FROM solicitud WHERE id_solicitud = ?', [id_solicitud]); //Consulta para eliminar
        console.log("Solicitud eliminada") //Confirmación
        res.status(200).send('Solicitud eliminada'); //Envía confirmación al html
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if(err){
        console.log(err)
        res.status(500).send("Error al cerrar la sesión")
      }else{
        res.status(200).send("Sesión cerrada")
      }
    });
});

//-------------------------
//ADMIN

// Ruta del admin.
app.post('/obtener-admin', (req, res) => {
    const user = req.session.nombre_usu; //Aquí se llama el nombre de usuario
    console.log(user) //Se confirma el nombre de usuario
    if(user){
        res.json({ nombre_usu: user}) //Se envía el nombre
    }else{
        res.status(401).send('Usuario no encontrado')
    }
})

//Rutas
app.get('/servicios', async (req, res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/admin/servicios.html"));
})

app.get('/manzanas', async (req, res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/admin/manzanas.html"));
})

app.get('/usuarios', async (req, res)=>{
    res.sendFile(path.join(__dirname, "../vistas/html/admin/usuarios.html"));
})

//Capturar los servicios.
app.post('/servicios', async (req, res)=>{
    const db = await mysql2.createConnection(data) //Conexión
    try{
        const [serData] = await db.execute('SELECT * from servicios'); //Consulta para eliminar
        console.log(serData)
        res.json({ 
            servicios: serData.map(row =>([ 
                //Aquí tomamos los datos capturados en un json y los mapeamos para que se convierta en un Array para poder enviarlos y mostrarlos en el html. 
                // * [] => Array | {} => Objeto
                row.id_servicios,
                row.nombre_ser,
                row.tipo,
            ]))
        }) 
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Crear servicios
app.post('/crear-servicio', async (req, res)=>{
    const { nombre_ser, tipo} = req.body;
    const db = await mysql2.createConnection(data)
    try{
        const [check] = await db.execute('SELECT * FROM servicios WHERE servicios.nombre_ser = ? AND servicios.tipo = ?', [nombre_ser, tipo]);
        if(check.length > 0){
             // No existe una manzana con el nombre y la dirección especificados
            res.status(401).send('<script> window.onload=function(){alert("Servicio ya esta registrado"); window.location.href="/servicios"}</script>');
        }
        else{
             // Ya existe una manzana con el nombre y la dirección especificados
             await db.execute('INSERT INTO servicios (nombre_ser, tipo) VALUES (?,?)', [nombre_ser, tipo])
             res.status(200).send(`<script> 
                alert('Servicio guardardo');
                window.location.href="/servicios"
                </script>`)
        }
    }catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Eliminar los servicios
app.delete('/eliminar-servicios', async(req, res) =>{
    const {id_servicios} = req.body //Captura el id de la solicitud
    const db = await mysql2.createConnection(data) //Conexión
    try{
        await db.execute('DELETE FROM servicios WHERE id_servicios = ?', [id_servicios]); //Consulta para eliminar
        console.log("Servicio eliminado") //Confirmación
        res.status(200).send('Servicio eliminado'); //Envía confirmación al html
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Actualizar servicio
app.post('/actua-servicio', async (req, res)=>{
    const { nombre_ser, tipo, id_servicios} = req.body;
    const db = await mysql2.createConnection(data)
    try{
        await db.execute('UPDATE servicios SET nombre_ser=?, tipo=? WHERE id_servicios=?', [nombre_ser, tipo, id_servicios])
        res.status(200).send(`<script> 
                alert('Servicio actualizado');
                window.location.href="/servicios"
                </script>`)
    }catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Capturar manzanas
app.post('/manzanas', async (req, res)=>{
    const db = await mysql2.createConnection(data) //Conexión
    try{
        const [manData] = await db.execute('SELECT * from manzanas'); //Consulta para eliminar
        console.log(manData)
        res.json({ 
            manzanas: manData.map(row =>([ 
                //Aquí tomamos los datos capturados en un json y los mapeamos para que se convierta en un Array para poder enviarlos y mostrarlos en el html. 
                // * [] => Array | {} => Objeto
                row.id_manzanas,
                row.nombre_man,
                row.dir,
            ]))
        }) 
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Crear manzana
app.post('/crear-manzana', async (req, res)=>{
    const { nombre_man, dir} = req.body;
    const db = await mysql2.createConnection(data)
    try{
        const [check] = await db.execute('SELECT * FROM manzanas WHERE manzanas.nombre_man = ? AND manzanas.dir = ?', [nombre_man, dir]);
        if(check.length > 0){
             // No existe una manzana con el nombre y la dirección especificados
            res.status(401).send('<script> window.onload=function(){alert("Manzana ya esta registrada"); window.location.href="/manzanas"}</script>');
        }
        else{
             // Ya existe una manzana con el nombre y la dirección especificados
             await db.execute('INSERT INTO manzanas (nombre_man, dir) VALUES (?,?)', [nombre_man, dir])
             res.status(200).send(`<script> 
                alert('Manzana guardarda');
                window.location.href="/manzanas"
                </script>`)
        }
    }catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Actualizar manzana
app.post('/actua-manzana', async (req, res)=>{
    const { nombre_man, dir, id_manzanas} = req.body;
    const db = await mysql2.createConnection(data)
    try{
        await db.execute('UPDATE manzanas SET nombre_man=?, dir=? WHERE id_manzanas=?', [nombre_man, dir, id_manzanas])
        res.status(200).send(`<script> 
                alert('Manzana actualizada');
                window.location.href="/manzanas"
                </script>`)
    }catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Capturar solicitudes
app.post('/usuarios', async (req, res)=>{
    const db = await mysql2.createConnection(data) //Conexión
    try{
        const [usuData] = await db.execute('SELECT usuario.id_usuario, usuario.nombre_usu, usuario.tipo_doc, usuario.doc, manzanas.nombre_man from usuario INNER JOIN manzanas ON usuario.fk_manzanas=manzanas.id_manzanas WHERE usuario.fk_manzanas=manzanas.id_manzanas AND usuario.rol="Usuario"'); //Consulta para eliminar
        console.log(usuData)
        res.json({ 
            usuarios: usuData.map(row =>([ 
                //Aquí tomamos los datos capturados en un json y los mapeamos para que se convierta en un Array para poder enviarlos y mostrarlos en el html. 
                // * [] => Array | {} => Objeto
                row.id_usuario,
                row.nombre_usu,
                row.tipo_doc,
                row.doc,
                row.nombre_man,
            ]))
        }) 
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Eliminar usuario
app.delete('/eliminar-usuario', async(req, res) =>{
    const {doc} = req.body //Captura el id de la solicitud
    const db = await mysql2.createConnection(data) //Conexión
    try{
        await db.execute('DELETE FROM usuario WHERE doc = ?', [doc]); //Consulta para eliminar
        console.log("Usuario eliminado") //Confirmación
        res.status(200).send('Usuario eliminado'); //Envía confirmación al html
    }catch (error) {
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//Actualizar usuario
app.post('/actua-usuario', async (req, res)=>{
    const { tipo_doc, fk_manzanas, id_usuario} = req.body;
    const db = await mysql2.createConnection(data)
    try{
        await db.execute('UPDATE usuario SET tipo_doc=?, fk_manzanas=? WHERE id_usuario=?', [tipo_doc, fk_manzanas, id_usuario])
        res.status(200).send(`<script> 
                alert('Usuario actualizado');
                window.location.href="/usuarios"
                </script>`)
    }catch (error) { 
        //Capturamos el error.
        console.error('Error en el servidor', error)
        res.status(500).send('Reinicie el server sorra')
    }
})

//El puerto desde que se esta escuchando
app.listen(3005, () => {
    console.log('Servidor prendido')
})