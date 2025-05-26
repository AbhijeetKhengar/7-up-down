// File: src/helpers/sendResponse.helper.ts
import { encrypt } from 'crypt-vault';
import { Response } from 'express';
import { ENCRYPTION_ENABLED } from '../app'
import dotenv from 'dotenv';
dotenv.config();

interface ApiResponseObject {
  status: string;
  code: number;
  message: string;
  decrypted_data?: any;
  data?: any;
}

interface SendResponseOptions {
  code: number;
  status: string;
  message: string;
  decryptedData?: any;
  data?: any;
}

class SendResponse {
  code: number;
  status: string;
  message: string;
  decryptedData?: any;
  data?: any;

  constructor({
    code,
    status,
    message,
    decryptedData,
    data,
  }: SendResponseOptions) {
    this.code = code;
    this.status = status;
    this.message = message;
    this.decryptedData = decryptedData;
    this.data = data;
  }

  public send(res: Response): Response {
    const responseObject: ApiResponseObject = {
      status: this.status,
      code: this.code,
      message: this.message,
      data: this.data ? ENCRYPTION_ENABLED ? encrypt(this.data) : this.data : undefined,
    };

    // Include decrypted_data only in non-production environments
    if (process.env.NODE_ENV !== 'production' && ENCRYPTION_ENABLED) {
      responseObject.decrypted_data = this.data;
    }

    return res.status(this.code).json(responseObject);
  }
}

export default SendResponse;
