import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { LibraryController } from '../controllers/library.controller';

const router = Router();
router.use(authenticate);

// ── Public-ish (any authenticated user can browse)
router.get('/books', requirePermission('library.view'), LibraryController.getBooks);
router.get('/books/:id', requirePermission('library.view'), LibraryController.getBookById);
router.get('/categories', requirePermission('library.view'), LibraryController.getCategories);

// ── Self borrowing history
router.get('/my-history', requirePermission('library.self.view'), LibraryController.getMyBorrowHistory);

// ── Librarian: manage books, categories, issues
router.post('/books',
  requirePermission('library.manage'),
  LibraryController.createBook
);
router.patch('/books/:id',
  requirePermission('library.manage'),
  LibraryController.updateBook
);
router.post('/categories',
  requirePermission('library.manage'),
  LibraryController.createCategory
);
router.post('/issue',
  requirePermission('library.issue'),
  LibraryController.issueBook
);
router.post('/return/:issueId',
  requirePermission('library.issue'),
  LibraryController.returnBook
);
router.get('/issued',
  requirePermission('library.manage'),
  LibraryController.getIssuedBooks
);
router.get('/overdue',
  requirePermission('library.manage'),
  LibraryController.getOverdueBooks
);
router.get('/report',
  requirePermission('library.manage'),
  LibraryController.getLibraryReport
);

export default router;
