import { Request, Response, NextFunction } from 'express';
import { AcademicService } from '../services/academic.service';
import { ApiResponse } from '../utils/api-response';

export class AcademicController {
  // ---------------------------------------------------------------------------
  // Academic Year Controllers
  // ---------------------------------------------------------------------------

  /** GET /academic/academic-years */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const data = await AcademicService.getAllAcademicYears(search);
      return ApiResponse.success(res, 'Academic years fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /** GET /academic/academic-years/:id */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AcademicService.getAcademicYearById(req.params.id);
      return ApiResponse.success(res, 'Academic year fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /** POST /academic/academic-years */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, start_date, end_date, college_id } = req.body;
      const result = await AcademicService.createAcademicYear({ name, start_date, end_date, college_id });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/academic-years/:id */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, start_date, end_date } = req.body;
      const result = await AcademicService.updateAcademicYear(req.params.id, { name, start_date, end_date });
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/academic-years/:id/set-current */
  static async setCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.setCurrentAcademicYear(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/academic-years/:id/toggle-status */
  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.toggleAcademicYearStatus(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Semester Controllers
  // ---------------------------------------------------------------------------

  /** GET /academic/semesters */
  static async getAllSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const academic_year_id =
        typeof req.query.academic_year_id === 'string' ? req.query.academic_year_id : undefined;
      const data = await AcademicService.getAllSemesters(academic_year_id);
      return ApiResponse.success(res, 'Semesters fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /** POST /academic/semesters */
  static async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { academic_year_id, semester_name, semester_number, start_date, end_date } = req.body;
      const result = await AcademicService.createSemester({
        academic_year_id,
        semester_name,
        semester_number,
        start_date,
        end_date,
      });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/semesters/:id */
  static async updateSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const { semester_name, semester_number, start_date, end_date } = req.body;
      const result = await AcademicService.updateSemester(req.params.id, {
        semester_name,
        semester_number,
        start_date,
        end_date,
      });
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /academic/semesters/:id */
  static async deleteSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.deleteSemester(req.params.id);
      return ApiResponse.success(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/semesters/:id/toggle-status */
  static async toggleSemesterStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.toggleSemesterStatus(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Department Controllers
  // ---------------------------------------------------------------------------

  /** GET /academic/departments */
  static async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const data = await AcademicService.getAllDepartments(search);
      return ApiResponse.success(res, 'Departments fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /** POST /academic/departments */
  static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description, college_id } = req.body;
      const result = await AcademicService.createDepartment({ name, code, description, college_id });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/departments/:id */
  static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description } = req.body;
      const result = await AcademicService.updateDepartment(req.params.id, { name, code, description });
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /academic/departments/:id */
  static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.deleteDepartment(req.params.id);
      return ApiResponse.success(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/departments/:id/toggle-status */
  static async toggleDepartmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.toggleDepartmentStatus(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------------------------------
  // Course Controllers
  // ---------------------------------------------------------------------------

  /** GET /academic/courses */
  static async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const data = await AcademicService.getAllCourses(search);
      return ApiResponse.success(res, 'Courses fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }

  /** POST /academic/courses */
  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, course_type, duration_years, total_semesters, description, department_id, college_id } =
        req.body;
      const result = await AcademicService.createCourse({
        name,
        code,
        course_type,
        duration_years,
        total_semesters,
        description,
        department_id,
        college_id,
      });
      return ApiResponse.success(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/courses/:id */
  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, course_type, duration_years, total_semesters, description } = req.body;
      const result = await AcademicService.updateCourse(req.params.id, {
        name,
        code,
        course_type,
        duration_years,
        total_semesters,
        description,
      });
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /academic/courses/:id */
  static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.deleteCourse(req.params.id);
      return ApiResponse.success(res, result.message, null);
    } catch (error) {
      next(error);
    }
  }

  /** PUT /academic/courses/:id/toggle-status */
  static async toggleCourseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AcademicService.toggleCourseStatus(req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}
