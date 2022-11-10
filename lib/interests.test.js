const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');

describe('/api/interests', () => {

  let connection;
  //let interestSpy;

  beforeAll( async () => {
    jest.setTimeout(8000);
    jest.unmock('mongoose');
    let uri = process.env.DB_URL;
    connection = await  mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('Database connected!');


    /*
    const Interest = require('./models/interest');

    interestSpy = jest.spyOn(Interest, 'findById').mockImplementation((id2) => {
      if (id2==1010)
        return {
          self: '/api/interests/1010',
          name: 'Software Engineering 2'
        };
      else
        return {};
    });
  */
 
  });
  

    afterAll( async () => {
      
      //interestSpy.mockRestore();
      mongoose.connection.close(true);
      console.log("Database connection closed");
    });
    
  
  /*
  test('GET /api/interests/:id con id presente', async () => {
    return request(app)
      .get('/api/interests/1010')
      .expect('Content-Type', /json/)
      .expect(200, {
        self: '/api/interests/1010',
        name: 'Pallavolo'
      });
  });
  */
  
  test('GET /api/interests/:id con ID non numerico', async () => {
    return request(app)
      .get('/api/interests/sport')
      .expect('Content-Type', /json/)
      .expect(400, { error: "L'id deve essere numerico" });
  });
  
  test('GET /api/interests/:id con ID minore di 0', async () => {
    return request(app)
      .get('/api/interests/-1')
      .expect('Content-Type', /json/)
      .expect(400, { error: "L'id deve essere un valore intero maggiore di 0" });
  });
  
  test('GET /api/interests/:id con interesse non contenuto nel database', async () => {
    return request(app)
      .get('/api/interests/9999999999')
      .expect('Content-Type', /json/)
      .expect(404, { error: 'Interesse non trovato' });
  });
  
  test('GET /api/interests/:id/users con interesse non contenuto nel database', async () => {
    return request(app)
      .get('/api/interests/9999999999/users')
      .expect('Content-Type', /json/)
      .expect(404, { error: "Nessun utente con interesse 9999999999 trovato" });
  });
  
   test('POST /api/interests con parametro description non specificato', () => {
    return request(app)
      .post('/api/interests')
      .set('Accept', 'application/json')
      .send({ name: 'My Interest'
    })
    .expect(400, { error: 'Il campo {description} deve essere una stringa non vuota.' });
  });

  test('POST /api/interests con parametro name in formato non corretto', () => {
    return request(app)
      .post('/api/interests')
      .set('Accept', 'application/json')
      .send({ name: 'My Int3r3st',
         description: 'Describe here'
    })
    .expect(400, { error: 'Il campo {name} non può contenere numeri o simboli speciali.' });
  });
  
  
  //Il test funziona, ma bisogna popolare bene il db all'inzio. 
  /*
	test('DELETE /api/interests/id con parametro id presente nel DB', () => {
	return request(app)
	  .delete('/api/interests/3')
	  .set('Accept', 'application/json')
	.expect(204);
  });*/
  

	test('DELETE /api/interests/id con parametro id NON presente nel DB', () => {
	return request(app)
	  .delete('/api/interests/999999')
	  .set('Accept', 'application/json')
	  .expect(404, {error: 'Interesse non trovato'});
  });
  
  test('GET /api/interests/', () => {
    return request(app)
      .get('/api/interests')
    .expect(200);
  });

  test('PUT /api/interests/id con id presente presente nel database', () => {
		return request(app)
			.put('/api/interests/1')
			.set('Accept', 'application/json')
			.send({	name: 'Calcio',
					description: 'Calcio'})
			.expect(200); 
	});

	test('PUT /api/interests/id con id interesse NON presente nel database', () => {
		return request(app)
			.put('/api/interests/100')
			.set('Accept', 'application/json')
			.send({	name: 'Dancing with friends',
					description: 'Dancing'})
			.expect(404, { error: 'Interesse non trovato' }); 
	});
	
	test('PUT /api/interests/id con id presente, ma con nessun campo specificato', () => {
		return request(app)
			.put('/api/interests/1')
			.set('Accept', 'application/json')
			.send()
			.expect(400); 
	});
  
});
