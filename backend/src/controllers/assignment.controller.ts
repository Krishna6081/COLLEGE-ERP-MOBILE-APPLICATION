import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { AuthenticatedRequest } from '../models/types';
import { AssignmentService } from '../services/assignment.service';
import { requireCollegeId } from '../utils/tenant';

export class AssignmentController {
  // ── Assignments ────────────────────────────────────────
  static async getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { page, limit, status, subject_id, division_id, college_id: requestedCollegeId } = req.query as any;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? requestedCollegeId : user.college_id);
      const params: any = { page: +page || 1, limit: +limit || 20, status, subject_id, college_id };
      if (user.user_type === 'STUDENT') params.student_user_id = user.id;
      else if (user.user_type === 'HOD' || user.roles.includes('HOD')) {
        params.hod_user_id = user.id;
        params.division_id = division_id;
      } else if (user.user_type === 'FACULTY' || user.roles.includes('FACULTY')) {
        params.faculty_user_id = user.id;
      } else {
        params.division_id = division_id;
      }
      const data = await AssignmentService.getAssignments(params);
      return ApiResponse.success(res, 'Assignments fetched', data);
    } catch (error) { next(error); }
  }

  static async getAssignmentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const scope = user.user_type === 'STUDENT'
        ? { student_user_id: user.id }
        : user.user_type === 'HOD' || user.roles.includes('HOD')
          ? { hod_user_id: user.id }
          : user.user_type === 'FACULTY' || user.roles.includes('FACULTY')
            ? { faculty_user_id: user.id }
            : {};
      const assignment = await AssignmentService.getAssignmentById(req.params.id, college_id, scope);
      return ApiResponse.success(res, 'Assignment details fetched', assignment);
    } catch (error) { next(error); }
  }

  static async createAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const isFaculty = user.user_type === 'FACULTY' || user.roles.includes('FACULTY');
      const isHod = user.user_type === 'HOD' || user.roles.includes('HOD');
      const college_id = requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id);
      const actor = {
        faculty_user_id: isFaculty ? user.id : undefined,
        hod_user_id: isHod ? user.id : undefined,
      };
      const assignment = await AssignmentService.createAssignment({
        faculty_id: isFaculty ? undefined : req.body.faculty_id,
        subject_id: req.body.subject_id,
        division_id: req.body.division_id,
        title: req.body.title,
        description: req.body.description,
        file_url: req.body.file_url,
        total_marks: req.body.total_marks,
        deadline: req.body.deadline,
      }, college_id, actor);
      return ApiResponse.created(res, 'Assignment created', assignment);
    } catch (error) { next(error); }
  }

  static async updateAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const scope = {
        faculty_user_id: user.user_type === 'FACULTY' || user.roles.includes('FACULTY') ? user.id : undefined,
        hod_user_id: user.user_type === 'HOD' || user.roles.includes('HOD') ? user.id : undefined,
      };
      const assignment = await AssignmentService.updateAssignment(req.params.id, req.body, college_id, scope);
      return ApiResponse.success(res, 'Assignment updated', assignment);
    } catch (error) { next(error); }
  }

  static async deleteAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const scope = {
        faculty_user_id: user.user_type === 'FACULTY' || user.roles.includes('FACULTY') ? user.id : undefined,
        hod_user_id: user.user_type === 'HOD' || user.roles.includes('HOD') ? user.id : undefined,
      };
      const result = await AssignmentService.deleteAssignment(req.params.id, college_id, scope);
      return ApiResponse.success(res, 'Assignment closed', result);
    } catch (error) { next(error); }
  }

  // ── Submissions ────────────────────────────────────────
  static async getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? req.query.college_id as string : user.college_id);
      const scope = {
        faculty_user_id: user.user_type === 'FACULTY' || user.roles.includes('FACULTY') ? user.id : undefined,
        hod_user_id: user.user_type === 'HOD' || user.roles.includes('HOD') ? user.id : undefined,
      };
      const submissions = await AssignmentService.getSubmissions(req.params.id, college_id, scope);
      return ApiResponse.success(res, 'Submissions fetched', submissions);
    } catch (error) { next(error); }
  }

  static async submitAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssignmentService.submitAssignment({
        assignment_id: req.params.id,
        student_user_id: req.user!.id,
        college_id: requireCollegeId(req.user!.college_id),
        file_url: req.body.file_url,
        submission_text: req.body.submission_text,
      });
      return ApiResponse.created(res, 'Assignment submitted', result);
    } catch (error) { next(error); }
  }

  static async gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssignmentService.gradeSubmission(req.params.submissionId, {
        marks_obtained: req.body.marks_obtained,
        feedback: req.body.feedback,
      }, requireCollegeId(req.user!.college_id), req.user!.id);
      return ApiResponse.success(res, 'Submission graded', result);
    } catch (error) { next(error); }
  }

  // ── Study Materials ────────────────────────────────────
  static async getStudyMaterials(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { page, limit, subject_id, department_id, college_id: requestedCollegeId } = req.query as any;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const college_id = requireCollegeId(isSuperAdmin ? requestedCollegeId : user.college_id);
      const params: any = { page: +page || 1, limit: +limit || 20, subject_id, college_id };
      if (user.user_type === 'STUDENT') params.student_user_id = user.id;
      else if (user.user_type === 'HOD' || user.roles.includes('HOD')) params.hod_user_id = user.id;
      else if (user.user_type === 'FACULTY' || user.roles.includes('FACULTY')) params.faculty_user_id = user.id;
      else params.department_id = department_id;
      const data = await AssignmentService.getStudyMaterials(params);
      return ApiResponse.success(res, 'Study materials fetched', data);
    } catch (error) { next(error); }
  }

  static async uploadStudyMaterial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const isSuperAdmin = user.user_type === 'SUPER_ADMIN' || user.roles.includes('SUPER_ADMIN');
      const isFaculty = user.user_type === 'FACULTY' || user.roles.includes('FACULTY');
      const isHod = user.user_type === 'HOD' || user.roles.includes('HOD');
      const material = await AssignmentService.uploadStudyMaterial({
        subject_id: req.body.subject_id,
        faculty_id: isFaculty ? undefined : req.body.faculty_id,
        title: req.body.title,
        description: req.body.description,
        file_url: req.body.file_url,
        file_type: req.body.file_type,
        unit_name: req.body.unit_name,
        external_link: req.body.external_link,
      }, requireCollegeId(isSuperAdmin ? req.body.college_id : user.college_id), {
        faculty_user_id: isFaculty ? user.id : undefined,
        hod_user_id: isHod ? user.id : undefined,
      });
      return ApiResponse.created(res, 'Study material uploaded', material);
    } catch (error) { next(error); }
  }
}
