import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { requireCollegeId } from '../utils/tenant';

export class LibraryService {
  // ─────────────────────────────────────────────────────────
  // BOOKS CATALOG
  // ─────────────────────────────────────────────────────────
  static async getBooks(params: {
    page?: number; limit?: number; search?: string;
    category_id?: string; college_id?: string | null;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, bc.name as category_name
      FROM books b
      LEFT JOIN book_categories bc ON b.category_id = bc.id
      WHERE b.college_id = ?
    `;
    const queryParams: any[] = [college_id];
    if (params.search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.ISBN LIKE ?)`;
      const term = `%${params.search}%`;
      queryParams.push(term, term, term);
    }
    if (params.category_id) {
      query += ` AND b.category_id = ?`;
      queryParams.push(params.category_id);
    }

    const countQuery = query.replace('SELECT b.*, bc.name as category_name', 'SELECT COUNT(*) as total');
    query += ` ORDER BY b.title ASC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams.slice(0, -2));
    const total = Number(countRows[0]?.total || 0);

    return {
      books: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  static async getBookById(bookId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT b.*, bc.name as category_name FROM books b
       LEFT JOIN book_categories bc ON b.category_id = bc.id
       WHERE b.id = ? AND b.college_id = ?`,
      [bookId, college_id]
    );
    if (!rows.length) throw new NotFoundError('Book not found');
    return rows[0];
  }

  static async createBook(data: {
    college_id: string; category_id: string; title: string; author: string;
    ISBN: string; publisher?: string; edition?: string; total_copies?: number;
  }) {
    const college_id = requireCollegeId(data.college_id);
    if (!data.title || !data.author || !data.ISBN || !data.college_id || !data.category_id) {
      throw new ValidationError('Title, author, ISBN, college, and category are required');
    }

    const [categories] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM book_categories WHERE id = ? AND college_id = ?`, [data.category_id, college_id]
    );
    if (!categories.length) throw new NotFoundError('Book category not found for this college');

    const bookId = uuidv4();
    const copies = data.total_copies || 1;

    try {
      await pool.query(
        `INSERT INTO books (id, college_id, category_id, title, author, ISBN, publisher, edition, total_copies, available_copies)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [bookId, college_id, data.category_id, data.title, data.author,
         data.ISBN, data.publisher || null, data.edition || null, copies, copies]
      );
      return { id: bookId, ...data, college_id, available_copies: copies, total_copies: copies };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('A book with this ISBN already exists');
      }
      throw error;
    }
  }

  static async updateBook(bookId: string, data: Partial<{
    title: string; author: string; publisher: string; edition: string;
    total_copies: number; shelf_location: string; status: string;
  }>, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    const book = await LibraryService.getBookById(bookId, college_id);
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title) { fields.push('title = ?'); values.push(data.title); }
    if (data.author) { fields.push('author = ?'); values.push(data.author); }
    if (data.publisher) { fields.push('publisher = ?'); values.push(data.publisher); }
    if (data.edition) { fields.push('edition = ?'); values.push(data.edition); }
    if (data.shelf_location) { fields.push('shelf_location = ?'); values.push(data.shelf_location); }
    if (data.total_copies !== undefined) {
      const diff = data.total_copies - (book.total_copies || 0);
      fields.push('total_copies = ?', 'available_copies = available_copies + ?');
      values.push(data.total_copies, diff);
    }
    if (data.status) { fields.push('status = ?'); values.push(data.status); }

    if (!fields.length) throw new ValidationError('No fields to update');
    values.push(bookId, college_id);

    await pool.query(`UPDATE books SET ${fields.join(', ')} WHERE id = ? AND college_id = ?`, values);
    return LibraryService.getBookById(bookId, college_id);
  }

  // ─────────────────────────────────────────────────────────
  // BOOK CATEGORIES
  // ─────────────────────────────────────────────────────────
  static async getCategories(collegeId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT bc.*, COUNT(b.id) as book_count FROM book_categories bc
       LEFT JOIN books b ON b.category_id = bc.id
       WHERE bc.college_id = ? GROUP BY bc.id ORDER BY bc.name`,
      [collegeId]
    );
    return rows;
  }

  static async createCategory(data: { college_id: string; name: string; description?: string }) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO book_categories (id, college_id, name, description) VALUES (?, ?, ?, ?)`,
      [id, data.college_id, data.name, data.description || null]
    );
    return { id, ...data };
  }

  // ─────────────────────────────────────────────────────────
  // BOOK ISSUE
  // ─────────────────────────────────────────────────────────
  static async issueBook(data: { college_id: string; book_id: string; user_id: string; due_days?: number }) {
    const college_id = requireCollegeId(data.college_id);
    if (!data.book_id || !data.user_id) {
      throw new ValidationError('Book ID and user ID are required');
    }
    if (data.due_days !== undefined && (!Number.isInteger(data.due_days) || data.due_days < 1 || data.due_days > 365)) {
      throw new ValidationError('Due days must be an integer between 1 and 365');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Check book availability
      const [books] = await conn.query<RowDataPacket[]>(
        'SELECT available_copies, title FROM books WHERE id = ? AND college_id = ? FOR UPDATE',
        [data.book_id, college_id]
      );

      if (!books.length) throw new NotFoundError('Book not found for this college');

      const [users] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM users WHERE id = ? AND college_id = ? AND status = 'ACTIVE' AND deleted_at IS NULL`,
        [data.user_id, college_id]
      );
      if (!users.length) throw new NotFoundError('Borrower not found or inactive in this college');

      if (books[0].available_copies <= 0) {
        throw new ValidationError(`Book "${books[0].title}" is currently not available`);
      }

      // Check if user already has this book issued
      const [existingIssue] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM book_issues WHERE book_id = ? AND user_id = ? AND status = 'ISSUED'`,
        [data.book_id, data.user_id]
      );

      if (existingIssue.length) {
        throw new ConflictError('User already has this book issued');
      }

      // Check max books per user limit
      const [currentIssues] = await conn.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM book_issues bi
         JOIN books b ON b.id = bi.book_id
         WHERE bi.user_id = ? AND bi.status = 'ISSUED' AND b.college_id = ?`,
        [data.user_id, college_id]
      );

      const maxBooks = 3; // from system settings
      if (Number(currentIssues[0]?.count || 0) >= maxBooks) {
        throw new ValidationError(`Maximum ${maxBooks} books can be issued at a time`);
      }

      const issueId = uuidv4();
      const issueDate = new Date();
      const dueDays = data.due_days ?? 14;
      const dueDate = new Date(issueDate.getTime() + dueDays * 24 * 60 * 60 * 1000);

      await conn.query(
        `INSERT INTO book_issues (id, book_id, user_id, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?, 'ISSUED')`,
        [issueId, data.book_id, data.user_id,
         issueDate.toISOString().split('T')[0],
         dueDate.toISOString().split('T')[0]]
      );

      const [updateResult]: any = await conn.query(
        `UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND college_id = ? AND available_copies > 0`,
        [data.book_id, college_id]
      );
      if (!updateResult.affectedRows) throw new ConflictError('Book availability changed; retry the issue');

      await conn.commit();

      return {
        issue_id: issueId,
        book_title: books[0].title,
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        message: 'Book issued successfully',
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // ─────────────────────────────────────────────────────────
  // BOOK RETURN
  // ─────────────────────────────────────────────────────────
  static async returnBook(issueId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    if (!issueId) throw new ValidationError('Issue ID is required');

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [issues] = await conn.query<RowDataPacket[]>(
        `SELECT bi.*, b.title FROM book_issues bi JOIN books b ON bi.book_id = b.id
         WHERE bi.id = ? AND bi.status = 'ISSUED' AND b.college_id = ? FOR UPDATE`,
        [issueId, college_id]
      );

      if (!issues.length) throw new NotFoundError('Issue record not found for this college or book already returned');

      const issue = issues[0];
      const returnDate = new Date();
      const dueDate = new Date(issue.due_date);

      // Calculate fine (₹5 per day overdue)
      let fineAmount = 0;
      if (returnDate > dueDate) {
        const overdueDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fineAmount = overdueDays * 5;
      }

      await conn.query(
        `UPDATE book_issues SET status = ?, return_date = ?, fine_amount = ? WHERE id = ?`,
        ['RETURNED', returnDate.toISOString().split('T')[0], fineAmount, issueId]
      );

      await conn.query(
        `UPDATE books SET available_copies = available_copies + 1 WHERE id = ? AND college_id = ?`,
        [issue.book_id, college_id]
      );

      await conn.commit();

      return {
        issue_id: issueId,
        book_title: issue.title,
        return_date: returnDate.toISOString().split('T')[0],
        fine_amount: fineAmount,
        message: fineAmount > 0
          ? `Book returned with fine of ₹${fineAmount}`
          : 'Book returned successfully',
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // ─────────────────────────────────────────────────────────
  // ISSUED BOOKS (for librarian)
  // ─────────────────────────────────────────────────────────
  static async getIssuedBooks(params: {
    page?: number; limit?: number; status?: string; college_id?: string | null;
    search?: string; user_id?: string;
  }) {
    const college_id = requireCollegeId(params.college_id);
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT bi.id, bi.issue_date, bi.due_date, bi.return_date, bi.fine_amount, bi.status,
             b.title as book_title, b.author, b.ISBN,
             u.first_name, u.last_name, u.email, u.user_type
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      JOIN users u ON bi.user_id = u.id
      WHERE b.college_id = ?
    `;
    const params2: any[] = [college_id];

    if (params.status) { query += ` AND bi.status = ?`; params2.push(params.status); }
    if (params.user_id) { query += ` AND bi.user_id = ?`; params2.push(params.user_id); }
    if (params.search) {
      query += ` AND (b.title LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
      const t = `%${params.search}%`;
      params2.push(t, t, t);
    }

    query += ` ORDER BY bi.issue_date DESC LIMIT ? OFFSET ?`;
    params2.push(limit, offset);

    try {
      const [rows] = await pool.query<RowDataPacket[]>(query, params2);
      return { issues: rows, page, limit };
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // USER's OWN BOOK HISTORY
  // ─────────────────────────────────────────────────────────
  static async getUserBorrowingHistory(userId: string, collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT bi.*, b.title, b.author, b.ISBN, bc.name as category
         FROM book_issues bi
         JOIN books b ON bi.book_id = b.id
         JOIN book_categories bc ON b.category_id = bc.id
         WHERE bi.user_id = ? AND b.college_id = ? ORDER BY bi.issue_date DESC`,
        [userId, college_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // OVERDUE BOOKS
  // ─────────────────────────────────────────────────────────
  static async getOverdueBooks(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT bi.id, bi.issue_date, bi.due_date,
                DATEDIFF(CURDATE(), bi.due_date) as overdue_days,
                DATEDIFF(CURDATE(), bi.due_date) * 5 as calculated_fine,
                b.title, b.author,
                u.first_name, u.last_name, u.email, u.mobile
         FROM book_issues bi
         JOIN books b ON bi.book_id = b.id
         JOIN users u ON bi.user_id = u.id
         WHERE bi.status = 'ISSUED' AND bi.due_date < ? AND b.college_id = ?
         ORDER BY bi.due_date ASC`,
        [today, college_id]
      );

      // Mark them as OVERDUE in DB
      if (rows.length > 0) {
        await pool.query(
          `UPDATE book_issues bi JOIN books b ON b.id = bi.book_id
           SET bi.status = 'OVERDUE', bi.fine_amount = DATEDIFF(CURDATE(), bi.due_date) * 5
           WHERE bi.status = 'ISSUED' AND bi.due_date < ? AND b.college_id = ?`,
          [today, college_id]
        );
      }

      return rows;
    } catch (error) {
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────
  // LIBRARY REPORTS
  // ─────────────────────────────────────────────────────────
  static async getLibraryReport(collegeId: string) {
    const college_id = requireCollegeId(collegeId);
    try {
      const [bookStats] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total_titles, SUM(total_copies) as total_copies,
                SUM(available_copies) as available_copies,
                (SUM(total_copies) - SUM(available_copies)) as issued_copies
         FROM books WHERE college_id = ?`,
        [college_id]
      );

      const [issueStats] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total_issues,
                COUNT(CASE WHEN status = 'ISSUED' THEN 1 END) as currently_issued,
                COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) as overdue,
                COUNT(CASE WHEN status = 'RETURNED' THEN 1 END) as returned,
                SUM(bi.fine_amount) as total_fines_collected
         FROM book_issues bi
         JOIN books b ON bi.book_id = b.id
         WHERE b.college_id = ?`,
        [college_id]
      );

      return {
        book_statistics: bookStats[0] || {},
        issue_statistics: issueStats[0] || {},
      };
    } catch (error) {
      throw error;
    }
  }
}
