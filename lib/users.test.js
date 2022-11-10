const request  = require('supertest');
const app      = require('./app');
const mongoose = require('mongoose');

describe('/api/users', () => {

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
	
  test('GET /api/users', () => {
    return request(app)
    .get('/api/users')
    .expect(200);
  });

  test('POST /api/users con User non specificato (nessun campo)', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .expect(400, { error: 'Il campo {u_name} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {u_name} non dichiarato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ surname: 'rossi',
                email: 'mario@gmail.com',
             password: '123',
       check_password: '123',
             birthday: '1900-10-10',
                  sex: 'male',
      sex_orientation: 'straight'
    })
      .expect(400, { error: 'Il campo {u_name} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {u_name} contenente numeri', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario89',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
      .expect(400, { error: 'Il campo {u_name} non può contenere numeri o simboli speciali.' });
  });
  
  test('POST /api/users con parametro {u_name} contenente caratteri speciali', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario!',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
      .expect(400, { error: 'Il campo {u_name} non può contenere numeri o simboli speciali.' });
  });
  
  test('POST /api/users con parametro {surname} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {surname} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {surname} contenente numeri', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi89',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
      .expect(400, { error: 'Il campo {surname} non può contenere numeri o simboli speciali.' });
  });
  
  test('POST /api/users con parametro {email} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {email} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {email} non valido', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mariogmailcom',
            password: '123',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {email} deve contenere un indirizzo e-mail valido.' });
  });
  
  test('POST /api/users con parametro {password} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.' });
  });
  
  test('POST /api/users con parametro {check_password} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.' });
  });
  
  test('POST /api/users con parametri {password} e {check_password} non coincidenti', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123blu',
      check_password: '123',
            birthday: '1900-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {password} non deve essere vuoto e deve essere uguale al campo {check_password}.' });
  });
  
  test('POST /api/users con parametro {birthday} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {birthday} non può essere vuoto e deve contenere una data valida.' });
  });
  
  test('POST /api/users con parametro {birthday} che indica un età minore di 18', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '2019-10-10',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {birthday} indica un utente non maggiorenne.' });
  });
  
  test('POST /api/users con parametro {birthday} invalido (con caratteri)', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '2000-10-1r',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {birthday} non può essere vuoto e deve contenere una data valida.' });
  });
  
  test('POST /api/users con parametro {birthday} invalido (data inesistente)', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '2000-15-35',
                 sex: 'male',
     sex_orientation: 'straight'
    })
    .expect(500);
  });
  
  test('POST /api/users con parametro {sex} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1990-10-10',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {sex} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {sex} contenente un valore non valido', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1990-10-10',
                 sex: 'coso',
     sex_orientation: 'straight'
    })
    .expect(400, { error: 'Il campo {sex} può contenere solamente i seguenti valori: male, female, other.' });
  });
  
  test('POST /api/users con parametro {sex_orientation} non specificato', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1990-10-10',
                 sex: 'male'
    })
    .expect(400, { error: 'Il campo {sex_orientation} non può essere vuoto.' });
  });
  
  test('POST /api/users con parametro {sex_orientation} contenente un valore non valido', () => {
    return request(app)
      .post('/api/users')
      .set('Accept', 'application/json')
      .send({ u_name: 'mario',
             surname: 'rossi',
               email: 'mario@gmail.com',
            password: '123',
      check_password: '123',
            birthday: '1990-10-10',
                 sex: 'male',
     sex_orientation: 'varia'
    })
    .expect(400, { error: 'Il campo {sex_orientation} può contenere solamente i seguenti valori: straight, gay.' });
  });
  
  test('PUT /api/users/id con id utente presente nel database', () => {
		return request(app)
			.put('/api/users/1')
			.set('Accept', 'application/json')
			.send({	bio: 'Lorem ipsum dolor sit amet.',
					nickname: 'Nick'})
			.expect(200); 
	});

	test('PUT /api/users/id con id utente NON presente nel database', () => {
		return request(app)
			.put('/api/users/999')
			.set('Accept', 'application/json')
			.send({	bio: 'Lorem ipsum dolor sit amet.',
					nickname: 'Nick'})
			.expect(404, {error: "User not Found"}); 
	});
	
	test('PUT /api/users/id con id presente, ma con nessun campo specificato', () => {
		return request(app)
			.put('/api/users/1')
			.set('Accept', 'application/json')
			.send()
			.expect(200); 
	});
	
	test('PUT /api/users/id con {birthday} che indica un minorenne', () => {
		return request(app)
			.put('/api/users/1')
			.set('Accept', 'application/json')
			.send({	birthday: '2010-12-01'})
			.expect(400, {error: "L'età non deve essere minore di 18 anni."}); 
	});
	
	test('PUT /api/users/id con {birthday} che indica un età superiore a 99 anni', () => {
		return request(app)
			.put('/api/users/1')
			.set('Accept', 'application/json')
			.send({	birthday: '1000-12-01'})
			.expect(400, {error: "L'eta' non deve essere superiore a 99 anni."}); 
	});
	
	test('PUT /api/users/id con {birthday} invalida (con carattere)', () => {
		return request(app)
			.put('/api/users/1')
			.set('Accept', 'application/json')
			.send({	birthday: '2010-12-0r'})
			.expect(400, {error: "Data di nascita non valida."}); 
	});
	
	test('DELETE /api/users/id con ID non numerico', async() => {
		return request(app)
			.delete('/api/users/Nick')
			.set('Accept', 'application/json')
			.expect(400, {error: 'Il parametro {idUser} deve essere numerico'})
	});

	test('DELETE /api/users/id con ID numerico non presente nel database', async() => {
		return request(app)
			.delete('/api/users/0')
			.set('Accept', 'application/json')
			.expect(404, {error: 'Utente non trovato'})
	});

	test('DELETE /api/users/id con ID numerico molto grande', async() => {
		return request(app)
			.delete('/api/users/999999999999999999999999999999999999999999999999')
			.set('Accept', 'application/json')
			.expect(404, {error: 'Utente non trovato'})
	});

  /*
	test('DELETE /api/users/id con ID numerico presente nel database', async() => {
		//Da aggiungere il pezzo di codice per inserire l'utente nel database
		return request(app)
			.delete('/api/users/1')
			.set('Accept', 'application/json')
			.expect(204, {message: 'Utente con id 0 eliminato con succcesso'})
  });
  */

	test('DELETE /api/users/id specificando un ID numerico negativo', async() => {
		return request(app)
			.delete('/api/users/-131')
			.set('Accept', 'application/json')
			.expect(400, {error: 'Il parametro {idUser} deve essere maggiore di 0'})
  });
  
  test('GET /api/users/:idUser con id non presente', () => {
    return request(app)
      .get('/api/users/' + 99999)
    .expect(404, { error : 'User not found' });
  });

  test('GET /api/users/:idUser con id minore di 0', () => {
    return request(app)
      .get('/api/users/' + (-1))
    .expect(400, { error: 'Field {idUser} must be a number greater than 0' });
  });

  test('GET /api/users/:idUser con id non numerico', () => {
    return request(app)
      .get('/api/users/' + "idprova")
    .expect(400, { error: 'Field {idUser} must be a number' });
  });
  
  test('GET /api/users/search con sesso non valido', () => {
    return request(app)
      .get('/api/users/search?sexw=coso&sexo=straight&etamin=not_selected&etamax=not_selected&relation=true')
    .expect(400, { error: "Il campo {Sesso} può contenere solamente i seguenti valori: male, female, other, not_selected." });
  });
  
  test('GET /api/users/search con orientamento sessuale non valido', () => {
    return request(app)
      .get('/api/users/search?sexw=male&sexo=vario&etamin=not_selected&etamax=not_selected&relation=true')
    .expect(400, { error: "Il campo {Orientamento sessuale} può contenere solamente i seguenti valori: straight, gay, not_selected." });
  });
  
  test('GET /api/users/search con {etamin} vuoto', () => {
    return request(app)
      .get('/api/users/search?sexw=male&sexo=straight&etamax=not_selected&relation=true')
    .expect(400, { error: "Il campo {età minima} deve contenere un valore numerico intero o not_selected." });
  });
  
  test('GET /api/users/search che non ritrova utenti con i parametri indicati', () => {
    return request(app)
      .get('/api/users/search?sexw=other&sexo=straight&etamin=not_selected&etamax=not_selected&relation=true&intw=9999999999999999999')
    .expect(404, { error: "Nessun utente con le caratteristiche richieste." });
  });
  
  test('GET /api/users/search con {relation} non valido', () => {
    return request(app)
      .get('/api/users/search?sexw=other&sexo=straight&etamin=not_selected&etamax=not_selected&relation=icanseeit')
    .expect(400, { error: "Il campo {relation} non può essere vuoto e può contenere solamente i seguenti valori: true, false." });
  });

});
