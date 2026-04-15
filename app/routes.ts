import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/welcome.tsx"),
  route("teacher-login", "routes/teacher-login.tsx"),
  route("admin-login", "routes/admin-login.tsx"),
  route("teacher-signup", "routes/teacher-signup.tsx"),

  // Student auth - blocked for browser access
  layout("routes/auth-layout.tsx", [
    route("login", "routes/login.tsx"),
  ]),
  route("logout", "routes/logout.tsx"),

  // Student Portal - blocked for browser access
  layout("routes/student-layout.tsx", [
    route("signup", "routes/signup.tsx"),
    route("home-page", "routes/home-page.tsx"),
    route("library", "routes/library.tsx"),
    route("my-courses", "routes/my-courses.tsx"),
    route("my-enrollments", "routes/my-enrollments.tsx"),
    route("my-payments", "routes/my-payments.tsx"),
    route("downloads", "routes/downloads.tsx"),
    route("competitions", "routes/competitions.tsx"),
    route("competition-exam/:id", "routes/competition-exam.$id.tsx"),
    route("course/:id", "routes/course-detail.tsx"),
    route("course-preview/:id", "routes/course-preview.tsx"),
    route("bundle/:id", "routes/bundle-detail.$id.tsx"),
    route("bundle-preview/:id", "routes/bundle-preview.tsx"),
    route("course-player/:courseId/:lessonId", "routes/course-player.$courseId.$lessonId.tsx"),
    route("course-exam/:courseId", "routes/course-exam.$courseId.tsx"),
    route("enroll", "routes/enroll.tsx"),
    route("browse-courses", "routes/browse-courses.tsx"),
    route("browse-bundles", "routes/browse-bundles.tsx"),
    route("payment", "routes/payment.tsx"),
    route("payment-instructions", "routes/payment-instructions.tsx"),
    route("payment-proof", "routes/payment-proof.tsx"),
    route("payment-success", "routes/payment-success.tsx"),
    route("settings", "routes/settings.tsx"),
    route("student-how-to-use", "routes/student-how-to-use.tsx"),
    route("about", "routes/about.tsx"),
    route("testimonials", "routes/testimonials.tsx"),
  ]),
  
  // Teacher Portal Routes
  layout("routes/teacher-layout.tsx", [
    route("teacher", "routes/teacher.tsx"),
    route("teacher/my-courses", "routes/teacher-my-courses.tsx"),
    route("teacher/content-manager", "routes/teacher-content-manager.tsx"),
    route("teacher/students", "routes/teacher-students.tsx"),
    route("teacher/quizzes", "routes/teacher-quizzes.tsx"),
    route("teacher/quiz-edit/:quizId", "routes/teacher-quiz-edit.$quizId.tsx"),
    route("teacher/earnings", "routes/teacher-earnings.tsx"),
    route("teacher/approvals", "routes/teacher-approvals.tsx"),
    route("teacher/withdrawal-terms", "routes/teacher-withdrawal-terms.tsx"),
    route("teacher/profile", "routes/teacher-profile.tsx"),
    route("teacher/how-to-use", "routes/teacher-how-to-use.tsx"),
    route("teacher/competitions", "routes/teacher-competitions.tsx"),
  ]),
  
  // Admin Portal
  route("admin", "routes/admin.tsx", [
    index("routes/admin-dashboard.tsx"),
    route("users", "routes/admin-users.tsx"),
    route("teachers", "routes/admin-teachers.tsx"),
    route("courses", "routes/admin-courses.tsx"),
    route("bundles", "routes/admin-bundles.tsx"),
    route("competitions", "routes/admin-competitions.tsx"),
    route("competitions/:competitionId/questions", "routes/admin-competition-questions.tsx"),
    route("library", "routes/admin-library.tsx"),
    route("library-add", "routes/admin-library-add.tsx"),
    route("library-manage/:id", "routes/admin-library-manage.$id.tsx"),
    route("library-content-add/:id", "routes/admin-library-content-add.$id.tsx"),
    route("library-edit/:id", "routes/admin-library-edit.$id.tsx"),
    route("tutorials", "routes/admin-tutorials.tsx"),
    route("content-manager", "routes/admin-content-manager.tsx"),
    route("content-edit/:lessonId", "routes/admin-content-edit.$lessonId.tsx"),
    route("content-approvals", "routes/admin-content-approvals.tsx"),
    route("payments", "routes/admin-payments.tsx"),
    route("payment-approvals", "routes/admin-payment-approvals.tsx"),
    route("settings", "routes/admin-settings.tsx"),
    route("send-notification", "routes/admin-send-notification.tsx"),
    route("manual-enrollment", "routes/admin-manual-enrollment.tsx"),
    route("home-ordering", "routes/admin-home-ordering.tsx"),
    route("popup-notices", "routes/admin-popup-notices.tsx"),
    route("categories", "routes/admin-categories.tsx"),
    route("how-to-use", "routes/admin-how-to-use.tsx"),
    route("testimonials", "routes/admin-testimonials.tsx"),
    route("user-access", "routes/admin-user-access.tsx"),
    route("payment-methods", "routes/admin-payment-methods.tsx"),
    route("featured-paths", "routes/admin-featured-paths.tsx"),
  ]),

  // API routes
  route("api/notifications", "routes/api-notifications.tsx"),

  // Utility pages
  route("no-internet", "routes/no-internet.tsx"),

  // Catch-all route for 404
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
