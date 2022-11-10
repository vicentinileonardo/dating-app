const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');

describe('/api/chats', () => {

  let connection;

  beforeAll( async () => {
    jest.setTimeout(8000);
    jest.unmock('mongoose');
    let uri = process.env.DB_URL;
    connection = await  mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('Database connected!');
  });

  afterAll( () => {
    mongoose.connection.close(true);
    console.log("Database connection closed");
  });

  test('GET /api/chats/ con id non presenti ', async () => {
    return request(app)
      .get('/api/chats?idUserSend=9999&idUserRecv=9999')
      .expect('Content-Type', /json/)
      .expect(403, { error: "Utente sender non esiste" });
  });

  test('GET /api/chats/ con parametri query sbagliati ', async () => {
    return request(app)
      .get('/api/chats?idUs=9999&id=9999')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('GET /api/chats/ con parametri query negativi ', async () => {
    return request(app)
      .get('/api/chats?idUserSend=-1&idUserRecv=-1')
      .expect('Content-Type', /json/)
      .expect(400, { error: "Il parametro {idUserSend} deve essere maggiore di 0" });
  });

  //-----------------------------------------------------------------------------------------//

  test('GET /api/chats/idUser con ID non presente', async () => {
    return request(app)
      .get('/api/chats/9999999999999')
      .expect('Content-Type', /json/)
      .expect(403, { error: "L\'utente non esiste" });
  });

  test('GET /api/chats/idUser con ID minore di 0', async () => {
    return request(app)
      .get('/api/chats/-1')
      .expect('Content-Type', /json/)
      .expect(400, { error: "Il parametro {idUserSend} deve avere un valore superiore a 0" });
  });

 //-----------------------------------------------------------------------------------------//
  test('GET /api/chats/idUserSend/idChat con {idUserSend} e {idChat} presenti', async () => {
    return request(app)
     .get('/api/chats/1/1')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  test('GET /api/chats/idUserSend/idChat con {idUserSend} presente e {idChat} NON presente', async () => {
    return request(app)
     .get('/api/chats/1/999999')
      .expect('Content-Type', /json/)
      .expect(404, {error: "La chat con id uguale a {idChat} non esiste"});
  });

  test('GET /api/chats/idUserSend/idChat con {idUserSend} NON presente e {idChat} presente', async () => {
    return request(app)
     .get('/api/chats/999999/1')
      .expect('Content-Type', /json/)
      .expect(403, {error: "L\'utente con id {idUserSend} non esiste"});
  });

  test('GET /api/chats/idUserSend/idChat con {idUserSend} NON presente e {idChat} NON presente', async () => {
    return request(app)
     .get('/api/chats/999999/999999')
      .expect('Content-Type', /json/)
      .expect(403, {error: "L\'utente con id {idUserSend} non esiste"});
  });

  test('GET /api/chats/idUserSend/idChat con {idUserSend} NON numerico', async () => {
    return request(app)
     .get('/api/chats/idNonNumerico/1')
      .expect('Content-Type', /json/)
      .expect(400, {error: "Il campo {idUserSend} deve essere un numero"});
  });

  test('GET /api/chats/idUserSend/idChat con {idUserSend} minore di zero', async () => {
    return request(app)
     .get('/api/chats/-50/1')
      .expect('Content-Type', /json/)
      .expect(400, {error: "Il campo {idUserSend} deve essere un numero maggiore di 0"});
  });

  test('GET /api/chats/idUserSend/idChat con {idChat} minore di zero', async () => {
    return request(app)
     .get('/api/chats/1/-50')
      .expect('Content-Type', /json/)
      .expect(400, {error: "Il campo {idChat} deve essere un numero maggiore di 0"});
  });

  test('GET /api/chats/idUserSend/idChat con {idChat} NON numerico', async () => {
    return request(app)
     .get('/api/chats/1/idNonNumerico')
      .expect('Content-Type', /json/)
      .expect(400, {error: "Il campo {idChat} deve essere un numero"});
  });

 //-----------------------------------------------------------------------------------------//

 test('PUT /api/chats/idUserSend/idChat con idUserSend NON numerico', async() => {
  return request(app)
         .put('/api/chats/mao/131')
         .set('Accept', 'application/json')
         .send({message: null})
         .expect(400, {error: 'Il parametro {idUserSend} deve essere un numero intero'});
  });

  test('PUT /api/chats/idUserSend/idChat con idChat NON numerico', async() => {
    return request(app)
          .put('/api/chats/1/mao')
          .set('Accept', 'application/json')
          .send({message: null})
          .expect(400, {error: 'Il parametro {idChat} deve essere un numero intero'});
  });

  test('PUT /api/chats/idUserSend/idChat con idUserSend intero negativo', async() => {
    return request(app)
           .put('/api/chats/-1/131')
           .set('Accept', 'application/json')
           .send({message: null})
           .expect(400, {error: 'Il parametro {idUserSend} deve essere un valore superiore a 0'});
  });

 //-----------------------------------------------------------------------------------------//

 test('PUT /api/chats/idUserSend/idChat/newMessages con idUserSend NON numerico', async() => {
  return request(app)
         .put('/api/chats/mao/131/newMessages')
         .set('Accept', 'application/json')
         .send({message: null})
         .expect(400, {error: 'Il parametro {idUserSend} deve essere un numero intero'});
  });

  test('PUT /api/chats/idUserSend/idChat/newMessages con idChat NON numerico', async() => {
    return request(app)
          .put('/api/chats/1/mao/newMessages')
          .set('Accept', 'application/json')
          .send({message: null})
          .expect(400, {error: 'Il parametro {idChat} deve essere un numero intero'});
  });

  test('PUT /api/chats/idUserSend/idChat/newMessages con idUserSend intero negativo', async() => {
    return request(app)
           .put('/api/chats/-1/131/newMessages')
           .set('Accept', 'application/json')
           .send({message: null})
           .expect(400, {error: 'Il parametro {idUserSend} deve avere un valore superiore a 0'});
  });

 //-----------------------------------------------------------------------------------------//

 test('POST /api/chats/idUserSend/idUserRecv con idUserSend NON numerico', async() => {
  return request(app)
         .post('/api/chats/')
         .set('Accept', 'application/json')
         .send({idUserSend: 'mao', idUserRecv: 131})
         .expect(400, {error: 'Il campo {idUserSend} deve essere un numero'});
  });

  test('POST /api/chats/idUserSend/idUserRecv con idUserRecv NON numerico', async() => {
    return request(app)
          .post('/api/chats/')
          .set('Accept', 'application/json')
          .send({idUserSend: 1, idUserRecv: 'mao'})
          .expect(400, {error: 'Il campo {idUserRecv} deve essere un numero'});
  });

  test('POST /api/chats/idUserSend/idUserRecv con idUserSend intero negativo', async() => {
    return request(app)
           .post('/api/chats/')
           .set('Accept', 'application/json')
           .send({idUserSend: -1, idUserRecv: 131})
           .expect(400, {error: 'Il campo {idUserSend} deve essere un numero maggiore di 0'});
   
  });
  
  //-------------------------------------------------------------------------------------------------------//

  test('DELETE /api/chats/idUserSend/idChat con idUser minore di 0', async () => {
    return request(app)
      .delete('/api/chats/-1/1')
      .expect('Content-Type', /json/)
      .expect(400, {error: 'Il campo {idUserSend} deve essere un numero maggiore di 0'});
  });

  test('DELETE /api/chats/idUserSend/idChat con idUserSend non numerico', async () => {
    return request(app)
      .delete('/api/chats/utenteUno/1')
      .expect('Content-Type', /json/)
      .expect(400, {error: 'Il campo {idUserSend} deve essere un numero'});
  });

  test('DELETE /api/chats/idUserSend/idChat con idChat non numerico', async () => {
    return request(app)
      .delete('/api/chats/1/Chat1')
      .expect('Content-Type', /json/)
      .expect(400, {error: 'Il campo {idChat} deve essere un numero'});
  });

  test('DELETE /api/chats/idUserSend/idChat con idChat minore di 0', async () => {
    return request(app)
      .delete('/api/chats/1/-1')
      .expect('Content-Type', /json/)
      .expect(400, {error: 'Il campo {idChat} deve essere un numero maggiore di 0'});
  });

  test('DELETE /api/chats/idUserSend/idChat con idUserSend inesistente', async () => {
    return request(app)
      .delete('/api/chats/9999999/1')
      .expect('Content-Type', /json/)
      .expect(403, {error: 'L\'utente non esiste'});
  });
});
