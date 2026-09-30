// =============================================================================
// L&D & CERTIFICATES ROUTES
// =============================================================================

import { Router } from 'express';
import { LearningController } from './learning.controller.js';

export function createLearningRouter(controller: LearningController = new LearningController()): Router {
  const router = Router();

  // ---------------------------------------------------------------------------
  // Courses API
  // ---------------------------------------------------------------------------
  router.get('/courses', controller.listCourses);
  router.post('/courses', controller.createCourse);
  router.get('/courses/:id', controller.getCourseById);
  router.patch('/courses/:id', controller.updateCourse);
  router.post('/courses/:id/enroll', controller.enrollUser);

  // Enrollments & Assignments
  router.get('/enrollments', controller.listUserEnrollments);
  router.patch('/enrollments/:enrollmentId/progress', controller.updateProgress);
  router.post('/enrollments/:enrollmentId/assignment', controller.submitAssignment);
  router.get('/enrollments/:enrollmentId/eligibility', controller.checkEligibility);

  // ---------------------------------------------------------------------------
  // Certificates API (Step 9)
  // ---------------------------------------------------------------------------
  router.get('/certificate-templates', controller.listCertificateTemplates);
  router.get('/certificate-templates/:id', controller.getCertificateTemplateById);

  router.get('/certificates', controller.listCertificates);
  router.post('/certificates/request', controller.requestCertificate);
  router.get('/certificates/verify/:refNumber', controller.verifyCertificate);
  router.get('/certificates/:id', controller.getCertificateById);
  router.post('/certificates/:id/review', controller.reviewCertificate);
  router.post('/certificates/:id/generate', controller.generateCertificate);

  return router;
}
