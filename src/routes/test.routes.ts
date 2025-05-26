import { decrypt, dynamicDecrypt, encrypt } from 'crypt-vault';
import { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  router.post('/encrypt', (req, res) => {
    const encrypted = encrypt(req.body);
    res.status(200).send({ encrypted });
  });

  router.post('/decrypt', (req, res) => {
    console.log(req.body);
    const decrypted = decrypt(req.body.data);
    res.status(200).send({ decrypted });
  });

  router.post('/dynamic-decrypt', (req, res) => {
    console.log(req.body);
    const data = dynamicDecrypt(req.body.token, req.body.key);
    res.status(200).send({ data });
  });
  return router;
}
