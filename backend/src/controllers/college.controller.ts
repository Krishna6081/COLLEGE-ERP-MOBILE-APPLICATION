
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

static async update(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { code, name, address, email, phone, website } = req.body;

    if (!code?.trim() || !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'College code and name are required.',
      });
    }

    const [existingRows]: any = await pool.query(
      'SELECT id FROM colleges WHERE id = ?',
      [id]
    );

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'College not found.',
      });
    }

    await pool.query(
      `UPDATE colleges
       SET code = ?,
           name = ?,
           address = ?,
           email = ?,
           phone = ?,
           website = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        code.trim(),
        name.trim(),
        address?.trim() || null,
        email?.trim() || null,
        phone?.trim() || null,
        website?.trim() || null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'College updated successfully.',
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

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const [collegeRows]: any = await pool.query(
        'SELECT id, name, code FROM colleges WHERE id = ?',
        [id]
      );

      if (!collegeRows || collegeRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'College not found.',
        });
      }

      const college = collegeRows[0];

      // Check for associated users
      const [userRows]: any = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE college_id = ? AND deleted_at IS NULL',
        [id]
      );
      const userCount = Number(userRows[0]?.count ?? 0);

      // Check for associated students
      const [studentRows]: any = await pool.query(
        'SELECT COUNT(*) as count FROM students WHERE college_id = ?',
        [id]
      );
      const studentCount = Number(studentRows[0]?.count ?? 0);

      // Check for associated faculty
      const [facultyRows]: any = await pool.query(
        'SELECT COUNT(*) as count FROM faculty WHERE college_id = ?',
        [id]
      );
      const facultyCount = Number(facultyRows[0]?.count ?? 0);

      if (userCount > 0 || studentCount > 0 || facultyCount > 0) {
        const reasons: string[] = [];
        if (userCount > 0) reasons.push(`${userCount} active user(s)`);
        if (studentCount > 0) reasons.push(`${studentCount} student(s)`);
        if (facultyCount > 0) reasons.push(`${facultyCount} faculty member(s)`);

        return res.status(400).json({
          success: false,
          message: `Cannot delete college "${college.name}" because it has ${reasons.join(', ')} associated with it. Please reassign or remove them before deleting.`,
        });
      }

      await pool.query('DELETE FROM colleges WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: `College "${college.name}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }

}
