
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../config/database';

export class CollegeController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  )
  
  
  {
    try {
      const { code, name, address, email, phone, website } = req.body;

      if (!code?.trim() || !name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'College code and name are required.',
        });
      }

      const id = randomUUID();

      await pool.query(
        `INSERT INTO colleges
          (id, code, name, address, email, phone, website)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          code.trim(),
          name.trim(),
          address?.trim() || null,
          email?.trim() || null,
          phone?.trim() || null,
          website?.trim() || null,
        ]
      );

      return res.status(201).json({
        success: true,
        message: 'College added successfully.',
        college: {
          id,
          code: code.trim(),
          name: name.trim(),
          address: address?.trim() || null,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

static async getAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const [rows] = await pool.query(
      `SELECT id, code, name, address, email, phone, website,
              status, created_at
       FROM colleges
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      message: 'Colleges fetched successfully.',
      colleges: rows,
    });
  } catch (error) {
    next(error);
  }
}
}
