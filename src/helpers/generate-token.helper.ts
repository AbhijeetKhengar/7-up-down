import { dynamicEncrypt } from 'crypt-vault';

interface TokenData {
  key: string;
  [key: string]: any; // Allow additional dynamic properties
}
/**
 * generateToken
 * @param data:any data which you want to put in token
 * @returns token and key to decrypt that token
 * @description this function is to generate token for authenticate client request.
 */
export const generateToken = (data: TokenData) => {
  // const key = generateString(32);
  const token = dynamicEncrypt(
    { ...data, createdAt: `${new Date().getTime()}` },
    data.key
  );
  return { token };
};
