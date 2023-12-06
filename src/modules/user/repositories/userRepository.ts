import { pool } from '../../../mysql';
import { v4 as uuidv4 } from 'uuid'
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken'
import { Request, Response } from 'express';

class UserRepository {
  create(request: Request, response: Response){

    const {name, email, password} = request.body;

    pool.getConnection((err: any, connection: any) => {

      hash(password, 10, (err, hash) => {

        if(err){
          return response.status(500).json(err);
        }

        connection.query(
          'SELECT email FROM users WHERE email = ?',
          [email],
          (error: any, result: any, fields: any) => {
            if (error) {
              connection.release();
              return response.status(500).json(error);
            }
        
            if (result.length > 0) {
              connection.release();
              return response.status(409).json({message: "E-mail já existe"});
            }
        
            // Se chegou até aqui, o e-mail não existe no banco de dados, então pode inserir o usuário normalmente
            connection.query(
              'INSERT INTO users (user_id, name, email, password) VALUES (?,?,?,?)',
              [uuidv4(), name, email, hash],
              (error: any, result: any, fields: any) => {
                connection.release();
        
                if (error) {
                  return response.status(400).json(error);
                }
        
                response.status(200).json({message: "Usuário criado com sucesso"});
              }
            );
          }
        );
      })  
    })
  }

  login(request: Request, response: Response){

    const {email, password} = request.body;

    pool.getConnection((err: any, connection: any) => {

      connection.query(

        'SELECT * FROM users WHERE email = ?',
        [email],

        (error: any, results: any, filds: any) => {
          
          connection.release();

          if (error) {
            return response.status(400).json({error: "Erro na sua autenticação"});
          }

          if (results.length === 0) {
            return response.status(400).json({error: "Usuário não encontrado"});
          }

          compare(password, results[0].password, (err, result) => {

            if (err) {
              return response.status(400).json({error: "Erro na sua autenticação"});
            }

            if (result) {
              const token = sign({
                id: results[0].user_id,
                email: results[0].email
              }, process.env.SECRET as string, {expiresIn: "1d"})

              return response.status(200).json({token: token, message: "Autenticado com sucesso"});
            } else {
              return response.status(400).json({error: "Usuário ou senha incorretos. Verifique os dados e tente novamente."});
            }
          })
        }
      )
    })
  }

  getUser(request: any, response: any) {
    const decode: any = verify(request.headers.authorization, process.env.SECRET as string);
    if(decode.email){
      pool.getConnection((error, conn) => {
        conn.query(
          'SELECT * FROM users WHERE email=?',
          [decode.email],
          (error, resultado, fields) => {
            conn.release();
            if(error) {
              return response.status(400).send({
                error: error,
                response: null
              })
            }

            return response.status(201).send({
              user: {
                nome: resultado[0].name,
                email: resultado[0].email,
                id: resultado[0].user_id,
              }
            })
          }
        )
      })
    }
  }

}

export { UserRepository };