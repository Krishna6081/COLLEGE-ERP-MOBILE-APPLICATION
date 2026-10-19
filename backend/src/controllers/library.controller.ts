import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { LibraryService } from '../services/library.service';
import { requireCollegeId } from '../utils/tenant';

export class LibraryController {
  static async getBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category_id } = req.query as any;
      const college_id = requireCollegeId(req.user?.college_id);
      const data = await LibraryService.getBooks({ page: +page || 1, limit: +limit || 20, search, category_id, college_id });
      return ApiResponse.paginated(res, 'Books catalog fetched', data.books, data.pagination);
    } catch (error) { next(error); }
  }

  static async getBookById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const book = await LibraryService.getBookById(req.params.id, college_id);
      return ApiResponse.success(res, 'Book details fetched', book);
    } catch (error) { next(error); }
  }

  static async createBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const book = await LibraryService.createBook({ ...req.body, college_id });
      return ApiResponse.created(res, 'Book added to library', book);
    } catch (error) { next(error); }
  }

  static async updateBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const book = await LibraryService.updateBook(req.params.id, req.body, college_id);
      return ApiResponse.success(res, 'Book updated', book);
    } catch (error) { next(error); }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const categories = await LibraryService.getCategories(college_id);
      return ApiResponse.success(res, 'Library categories fetched', categories);
    } catch (error) { next(error); }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const category = await LibraryService.createCategory({ ...req.body, college_id });
      return ApiResponse.created(res, 'Category created', category);
    } catch (error) { next(error); }
  }

  static async issueBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const result = await LibraryService.issueBook({ college_id, book_id: req.body.book_id, user_id: req.body.user_id, due_days: req.body.due_days });
      return ApiResponse.created(res, 'Book issued successfully', result);
    } catch (error) { next(error); }
  }

  static async returnBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const result = await LibraryService.returnBook(req.params.issueId, college_id);
      return ApiResponse.success(res, 'Book returned', result);
    } catch (error) { next(error); }
  }

  static async getIssuedBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search, user_id } = req.query as any;
      const college_id = requireCollegeId(req.user?.college_id);
      const data = await LibraryService.getIssuedBooks({ page: +page || 1, limit: +limit || 20, status, search, user_id, college_id });
      return ApiResponse.success(res, 'Issued books fetched', data);
    } catch (error) { next(error); }
  }

  static async getMyBorrowHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const college_id = requireCollegeId(req.user?.college_id);
      const history = await LibraryService.getUserBorrowingHistory(userId, college_id);
      return ApiResponse.success(res, 'Borrowing history fetched', history);
    } catch (error) { next(error); }
  }

  static async getOverdueBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const overdueBooks = await LibraryService.getOverdueBooks(college_id);
      return ApiResponse.success(res, 'Overdue books fetched', overdueBooks);
    } catch (error) { next(error); }
  }

  static async getLibraryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const college_id = requireCollegeId(req.user?.college_id);
      const report = await LibraryService.getLibraryReport(college_id);
      return ApiResponse.success(res, 'Library report fetched', report);
    } catch (error) { next(error); }
  }
}
