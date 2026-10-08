import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';

export class LibraryController {
  static async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const books = [
        {
          id: 'book-001',
          title: 'Database System Concepts',
          author: 'Silberschatz, Korth, Sudarshan',
          ISBN: '9780073523323',
          publisher: 'McGraw-Hill',
          category_name: 'Computer Science',
          total_copies: 10,
          available_copies: 8,
          shelf_location: 'Rack B-4',
        },
        {
          id: 'book-002',
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          ISBN: '9780132350884',
          publisher: 'Prentice Hall',
          category_name: 'Software Engineering',
          total_copies: 6,
          available_copies: 4,
          shelf_location: 'Rack A-2',
        },
      ];
      return ApiResponse.success(res, 'Books catalog fetched', books);
    } catch (error) {
      next(error);
    }
  }

  static async issueBook(req: Request, res: Response, next: NextFunction) {
    try {
      const issueRecord = {
        id: `issue-${Date.now()}`,
        book_id: req.body.book_id,
        user_id: req.body.user_id,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ISSUED',
      };
      return ApiResponse.success(res, 'Book issued successfully', issueRecord, 201);
    } catch (error) {
      next(error);
    }
  }
}
