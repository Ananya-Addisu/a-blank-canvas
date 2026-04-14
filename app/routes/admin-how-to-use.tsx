// Fix #8: Comprehensive admin how-to-use page with searchable workflows
import { useState } from 'react';
import type { Route } from './+types/admin-how-to-use';
import { Search, ChevronDown, ChevronRight, Users, BookOpen, Package, CreditCard, Award, Library, Settings, FolderEdit, PlayCircle, Send, UserPlus, LayoutGrid, Shield, FileQuestion, MessageSquare, Megaphone, FolderTree, Pin, Upload, Star, LayoutDashboard, ShieldOff } from 'lucide-react';
import { Input } from '~/components/ui/input/input';
import styles from './admin-how-to-use.module.css';


interface Workflow {
  id: string;
  title: string;
  icon: any;
  category: string;
  steps: string[];
  tags: string[];
}

const workflows: Workflow[] = [
  {
    id: 'add-student',
    title: 'Add a New Student',
    icon: Users,
    category: 'User Management',
    steps: [
      'Go to Users page from the sidebar',
      'Click "Add User" button at the top',
      'Fill in full name, phone number, institution, academic year, and password',
      'Click "Add User" to create - the student is auto-approved',
    ],
    tags: ['student', 'user', 'add', 'create', 'signup'],
  },
  {
    id: 'approve-student',
    title: 'Approve a Pending Student',
    icon: Users,
    category: 'User Management',
    steps: [
      'Go to Users page from the sidebar',
      'Look at the "Pending Approvals" section at the top',
      'Review the student details (name, phone, institution, year)',
      'Click "Approve" to grant access or "Reject" to deny',
    ],
    tags: ['student', 'approve', 'pending', 'review'],
  },
  {
    id: 'edit-student',
    title: 'Edit a Student\'s Details or Password',
    icon: Users,
    category: 'User Management',
    steps: [
      'Go to Users page from the sidebar',
      'Click on the student row or click the "Edit" button',
      'Update name, phone, institution, academic year, or set a new password',
      'Leave password blank to keep the current one',
      'Click "Save Changes"',
    ],
    tags: ['student', 'edit', 'password', 'update', 'modify'],
  },
  {
    id: 'force-logout',
    title: 'Force Logout & Reset Device for a Student',
    icon: Shield,
    category: 'User Management',
    steps: [
      'Go to Users page and click on the student',
      'Scroll down to the Security & Session section',
      'Check the "Last Logout" and "Bound Device" information',
      'Click "Force Logout & Reset Device" button',
      'Confirm the action - the student loses access immediately',
      'The student can then log in from any device and bind a new one',
    ],
    tags: ['logout', 'device', 'reset', 'security', 'binding', 'force'],
  },
  {
    id: 'approve-teacher',
    title: 'Approve a Teacher',
    icon: Users,
    category: 'User Management',
    steps: [
      'Go to Teachers page from the sidebar',
      'Look at the "Pending Approvals" section',
      'Review the teacher credentials and information',
      'Click "Approve" to allow them to create courses',
    ],
    tags: ['teacher', 'approve', 'pending'],
  },
  {
    id: 'create-course',
    title: 'Create a New Course',
    icon: BookOpen,
    category: 'Courses',
    steps: [
      'Go to Courses page from the sidebar',
      'Click "Add Course" button',
      'Fill in: course name, description, category (Year 1-5), department, price',
      'Select the assigned teacher from the dropdown',
      'Toggle "Bundle Exclusive" if the course should only be available via bundle purchase',
      'Click "Add Course" to create',
    ],
    tags: ['course', 'create', 'add', 'new'],
  },
  {
    id: 'edit-course',
    title: 'Edit an Existing Course',
    icon: BookOpen,
    category: 'Courses',
    steps: [
      'Go to Courses page from the sidebar',
      'Click on the course row in the table',
      'The edit dialog will open with pre-filled values',
      'Make your changes and click "Update Course"',
    ],
    tags: ['course', 'edit', 'update', 'modify'],
  },
  {
    id: 'delete-course',
    title: 'Delete a Course',
    icon: BookOpen,
    category: 'Courses',
    steps: [
      'Go to Courses page from the sidebar',
      'Find the course in the table',
      'Click the red "Delete" button in the Actions column',
      'Confirm the deletion - this removes the course and ALL its content permanently',
      'Warning: This cannot be undone and removes all chapters, lessons, and enrollments',
    ],
    tags: ['course', 'delete', 'remove'],
  },
  {
    id: 'add-content',
    title: 'Add Chapters & Lessons to a Course',
    icon: FolderEdit,
    category: 'Content Management',
    steps: [
      'Go to Content Manager from the sidebar',
      'Select a course from the dropdown at the top',
      'Click "Add Chapter" to create a new chapter section',
      'Inside each chapter, click "Add Lesson" to add content',
      'Choose lesson type: Video (YouTube URL), Document (markdown/PDF URL), or Markdown (write directly)',
      'Fill in the title, description, and content URL',
      'Lessons start as "Pending" until approved via Content Approvals',
    ],
    tags: ['content', 'chapter', 'lesson', 'add', 'video', 'document', 'markdown'],
  },
  {
    id: 'edit-lesson',
    title: 'Edit a Lesson',
    icon: FolderEdit,
    category: 'Content Management',
    steps: [
      'Go to Content Manager from the sidebar',
      'Select the course containing the lesson',
      'Click on the lesson card or the pencil icon',
      'Update the title, description, content URL, or type',
      'Click "Update Lesson" to save changes',
      'Note: Edited lessons may be re-submitted for approval',
    ],
    tags: ['lesson', 'edit', 'update', 'modify', 'content'],
  },
  {
    id: 'reorder-lessons',
    title: 'Reorder Lessons or Chapters',
    icon: FolderEdit,
    category: 'Content Management',
    steps: [
      'Go to Content Manager and select a course',
      'Drag lessons using the grip handle on the left side',
      'Drop the lesson in the desired position',
      'The new order is saved automatically',
    ],
    tags: ['reorder', 'sort', 'drag', 'order', 'arrange'],
  },
  {
    id: 'approve-content',
    title: 'Approve or Reject Teacher Content',
    icon: FolderEdit,
    category: 'Content Management',
    steps: [
      'Go to Content Approvals from the sidebar',
      'Review the list of pending lessons and library content',
      'Click "Approve" to publish the content',
      'Click "Reject" and provide a reason to deny it',
      'Approved content becomes visible to enrolled students',
    ],
    tags: ['approve', 'reject', 'content', 'review', 'pending', 'teacher'],
  },
  {
    id: 'create-bundle',
    title: 'Create a Course Bundle',
    icon: Package,
    category: 'Bundles',
    steps: [
      'Go to Bundles page from the sidebar',
      'Click "Create Bundle" button at the top right',
      'Fill in: bundle name, description, year level, semester',
      'Select the courses to include by checking them from the course list',
      'Set a discount percentage if desired (e.g., 20% off total price)',
      'Set the bundle price in ETB',
      'Optionally choose a thumbnail image from the catalog',
      'Toggle "Active" to make it visible to students',
      'Click "Create Bundle" to save',
    ],
    tags: ['bundle', 'create', 'add', 'package', 'discount'],
  },
  {
    id: 'manage-featured-paths',
    title: 'Manage Featured Paths (Learning Paths)',
    icon: Star,
    category: 'Featured Paths',
    steps: [
      'Go to Featured Paths from the sidebar',
      'This dedicated page shows all current featured paths and available bundles that can be promoted',
      'To promote a bundle: find it in the "Available Bundles" section and click "Add to Featured"',
      'To edit a featured path: click "Edit" to update its name, description, thumbnail, courses, price, or exclusive settings',
      'Use the up/down arrows to reorder featured paths — the order determines display on the student home page',
      'Toggle "Featured Path Exclusive" to hide it from regular bundle listings (only shows in the Featured Paths section)',
      'To remove from featured: click "Remove" — the bundle returns to the Available Bundles list',
      'Featured Paths appear prominently on the student home page with a special card design',
    ],
    tags: ['featured', 'path', 'learning', 'bundle', 'promote', 'highlight', 'home', 'star'],
  },
  {
    id: 'bundle-exclusive-courses',
    title: 'Make Courses Bundle-Exclusive',
    icon: Package,
    category: 'Bundles',
    steps: [
      'Go to Courses page from the sidebar',
      'Click on the course you want to make bundle-exclusive',
      'Toggle "Bundle Exclusive" to ON',
      'Click "Update Course" to save',
      'Bundle-exclusive courses cannot be purchased individually — students must buy the bundle',
      'This is useful for courses that are only meant to be part of a package deal',
      'The course will show a "Bundle Only" badge on the student home page',
    ],
    tags: ['bundle', 'exclusive', 'course', 'package', 'restrict'],
  },
  {
    id: 'manual-enrollment',
    title: 'Manually Enroll a Student (No Payment Required)',
    icon: UserPlus,
    category: 'Enrollments',
    steps: [
      'Go to Manual Enrollment from the sidebar',
      'Choose whether to enroll in a Course or Bundle',
      'Select the student from the dropdown',
      'Select the course or bundle to grant access to',
      'Click "Approve Access" - the student gets immediate access',
      'This bypasses the payment flow entirely',
    ],
    tags: ['enroll', 'manual', 'free', 'grant', 'access', 'bypass', 'payment'],
  },
  {
    id: 'approve-payment',
    title: 'Approve or Reject a Payment',
    icon: CreditCard,
    category: 'Payments',
    steps: [
      'Go to Payment Approvals from the sidebar',
      'Review pending payment submissions with proof screenshots',
      'Check the student name, amount, payment method (Telebirr/CBE/BoA)',
      'Click "Approve" to grant course access',
      'Click "Reject" to deny (add notes explaining why)',
      'Approved payments automatically activate the enrollment',
    ],
    tags: ['payment', 'approve', 'reject', 'proof', 'telebirr', 'cbe', 'boa'],
  },
  {
    id: 'view-payments',
    title: 'View All Payment History',
    icon: CreditCard,
    category: 'Payments',
    steps: [
      'Go to Payments from the sidebar',
      'View all payment submissions across all students',
      'Filter by status: pending, approved, rejected',
      'See payment method, amount, and review timestamps',
    ],
    tags: ['payment', 'history', 'view', 'all'],
  },
  {
    id: 'create-competition',
    title: 'Create a Competition',
    icon: Award,
    category: 'Competitions',
    steps: [
      'Go to Competitions from the sidebar',
      'Click "Create Competition" button',
      'Fill in: title, description, date, time, duration (minutes), max participants',
      'Optionally gate the competition to require a purchased course',
      'Save the competition (it starts as unpublished)',
      'Click "Publish" to make it visible to students',
      'Add questions via the "Manage Questions" button',
    ],
    tags: ['competition', 'create', 'exam', 'quiz', 'publish', 'gate'],
  },
  {
    id: 'manage-competition-questions',
    title: 'Add Questions to a Competition',
    icon: Award,
    category: 'Competitions',
    steps: [
      'Go to Competitions from the sidebar',
      'Click "Manage Questions" on the competition card',
      'Click "Add Question" button',
      'Choose question type: Multiple Choice, True/False, or Short Answer',
      'Enter the question text, options (for MC), correct answer, and explanation',
      'Set point value for each question',
      'Drag to reorder questions as needed',
    ],
    tags: ['competition', 'questions', 'add', 'manage', 'multiple choice', 'true false'],
  },
  {
    id: 'view-competition-results',
    title: 'View Competition Results',
    icon: Award,
    category: 'Competitions',
    steps: [
      'Go to Competitions from the sidebar',
      'Click "View Results" on the competition card',
      'See student scores, ranks, and disqualification status',
      'Check entry/exit times for each participant',
    ],
    tags: ['competition', 'results', 'scores', 'rankings'],
  },
  {
    id: 'add-library-category',
    title: 'Add a Library Category (Tab)',
    icon: Library,
    category: 'Library',
    steps: [
      'Go to Library from the sidebar',
      'Click "Add Tab" button at the top',
      'Enter the tab name (e.g., "Past Exams", "Study Guides", "Biology Resources")',
      'Add a description explaining what this category contains',
      'Choose an icon from the dropdown (Book, FileText, Video, etc.)',
      'Set the status to "active" to make it visible',
      'Click "Add Tab" to create the category',
      'The new tab will appear in the Library page for students',
    ],
    tags: ['library', 'category', 'tab', 'add', 'create', 'section'],
  },
  {
    id: 'add-library-content',
    title: 'Add Content to a Library Category',
    icon: Library,
    category: 'Library',
    steps: [
      'Go to Library from the sidebar',
      'Find the category (tab) you want to add content to',
      'Click "Manage" on that category card',
      'On the manage page, click "Add Content" button',
      'Fill in the content details:',
      '  - Title: name of the resource (e.g., "2023 Biology Final Exam")',
      '  - Description: what the content covers',
      '  - Content Type: choose Book (PDF), Exam, or Video',
      '  - Subject: the academic subject area',
      '  - Author: who created the content (optional)',
      'For PDFs/Books: paste the file URL (Google Drive link, Supabase storage URL, etc.)',
      'For Videos: select "YouTube" as source and paste the YouTube URL',
      'Click "Add Content" to save — it will appear in the student Library under that tab',
    ],
    tags: ['library', 'content', 'add', 'book', 'exam', 'video', 'pdf', 'resource'],
  },
  {
    id: 'edit-library-category',
    title: 'Edit or Delete a Library Category',
    icon: Library,
    category: 'Library',
    steps: [
      'Go to Library from the sidebar',
      'Click "Edit" on the category card you want to modify',
      'Update the name, description, icon, or status',
      'Click "Save" to apply changes',
      'To delete a category, click "Delete" — this removes the tab and ALL content inside it',
      'Warning: Deleting a category is permanent and cannot be undone',
    ],
    tags: ['library', 'edit', 'delete', 'category', 'tab', 'modify'],
  },
  {
    id: 'manage-library-content',
    title: 'Edit or Delete Library Content Items',
    icon: Library,
    category: 'Library',
    steps: [
      'Go to Library from the sidebar',
      'Click "Manage" on the category containing the content',
      'Find the content item in the list',
      'Click "Edit" to update its title, URL, description, or type',
      'Click "Delete" to permanently remove the content item',
      'Changes are reflected immediately for students',
    ],
    tags: ['library', 'content', 'edit', 'delete', 'manage', 'update'],
  },
  {
    id: 'upload-images-markdown',
    title: 'Add Images to Markdown Content',
    icon: FolderEdit,
    category: 'Content Management',
    steps: [
      'Open the Markdown editor when creating or editing a lesson',
      'Click the "Upload Image" button in the toolbar above the editor',
      'Select an image file (JPEG, PNG, GIF, WebP, SVG - max 5MB)',
      'Wait for the upload to complete',
      'Click "Insert" to add the image directly into your content, or "Copy MD" to copy the markdown syntax',
      'The image will display as ![image](url) in the markdown preview',
    ],
    tags: ['image', 'upload', 'markdown', 'photo', 'picture', 'content'],
  },
  {
    id: 'manage-tutorials',
    title: 'Manage Tutorial Videos',
    icon: PlayCircle,
    category: 'Tutorials',
    steps: [
      'Go to Tutorials from the sidebar',
      'Click "Add Tutorial" to create a new tutorial video',
      'Enter title, description, video URL, target audience',
      'Set the display order to control the sequence',
      'Toggle active/inactive status',
    ],
    tags: ['tutorial', 'video', 'how-to', 'guide'],
  },
  {
    id: 'send-notification',
    title: 'Send a Notification to Users',
    icon: Send,
    category: 'Notifications',
    steps: [
      'Go to Send Notification from the sidebar',
      'Select the target audience: all students, all teachers, or specific users',
      'Enter the notification title and message',
      'Optionally add an action URL for the notification to link to',
      'Click "Send Notification"',
    ],
    tags: ['notification', 'send', 'message', 'broadcast', 'announce'],
  },
  {
    id: 'home-ordering',
    title: 'Organize Student Home Page Display Order',
    icon: LayoutGrid,
    category: 'Settings',
    steps: [
      'Go to Home Ordering from the sidebar',
      'Switch between Bundles and Courses tabs',
      'Use the arrow buttons to move items up or down',
      'Click "Save Order" when done',
      'The student home page will reflect the new ordering',
    ],
    tags: ['order', 'home', 'display', 'arrange', 'organize', 'sort'],
  },
  {
    id: 'app-settings',
    title: 'Manage App Settings',
    icon: Settings,
    category: 'Settings',
    steps: [
      'Go to Settings from the sidebar',
      'Toggle features: Library, Competitions, etc.',
      'Update payment method details (Telebirr, CBE, BoA account numbers)',
      'Changes take effect immediately',
    ],
    tags: ['settings', 'toggle', 'enable', 'disable', 'payment', 'configure'],
  },
  {
    id: 'create-quiz',
    title: 'Create a Quiz for Students',
    icon: FileQuestion,
    category: 'Quizzes',
    steps: [
      'Quizzes are created by teachers through the Teacher Portal',
      'Go to Teachers page and ensure the teacher is approved and assigned to a course',
      'The teacher navigates to Quizzes in their portal and clicks "Create Quiz"',
      'They fill in: quiz title, description, select the course, set duration and passing score',
      'Optionally add markdown content and a video URL for study material',
      'Click "Create Quiz" - it starts as a draft',
    ],
    tags: ['quiz', 'create', 'exam', 'test', 'assessment', 'teacher'],
  },
  {
    id: 'add-quiz-questions',
    title: 'Add Questions to a Quiz',
    icon: FileQuestion,
    category: 'Quizzes',
    steps: [
      'The teacher opens their quiz from the Quizzes page and clicks "Edit"',
      'Scroll to the Questions section and click "Add Question"',
      'Choose question type: Multiple Choice, True/False, or Short Answer',
      'Enter the question text and set the point value',
      'For Multiple Choice: add 2-4 answer options and mark the correct one',
      'For True/False: select whether the answer is True or False',
      'Add an explanation that students see after answering',
      'Drag questions to reorder them as needed',
      'Click "Publish" when the quiz is ready for students',
    ],
    tags: ['quiz', 'questions', 'multiple choice', 'true false', 'short answer', 'teacher'],
  },
  {
    id: 'manage-quiz-results',
    title: 'View Quiz Results & Student Attempts',
    icon: FileQuestion,
    category: 'Quizzes',
    steps: [
      'Teachers can view quiz attempts from their Quizzes page',
      'Each quiz shows the number of attempts and average score',
      'Click on a quiz to see individual student scores and answers',
      'Students who score above the passing score are marked as passed',
      'Admins can view all quizzes across all teachers from the admin dashboard',
    ],
    tags: ['quiz', 'results', 'scores', 'attempts', 'grades', 'performance'],
  },
  {
    id: 'approve-quiz',
    title: 'Approve Quizzes Created by Teachers',
    icon: FileQuestion,
    category: 'Quizzes',
    steps: [
      'Teacher-created quizzes go through the Content Approvals workflow',
      'Go to Content Approvals from the sidebar',
      'Quizzes submitted by teachers appear alongside lesson content',
      'Review the quiz title, description, and associated course',
      'Click "Preview" to see the quiz questions and structure',
      'Click "Approve" to make the quiz available to enrolled students',
      'Click "Reject" with a reason if changes are needed',
      'Teachers can edit and resubmit rejected quizzes',
    ],
    tags: ['quiz', 'approve', 'reject', 'teacher', 'review', 'content'],
  },
  {
    id: 'manage-testimonials',
    title: 'Manage Student Testimonials',
    icon: MessageSquare,
    category: 'Testimonials',
    steps: [
      'Go to Testimonials from the sidebar',
      'View all submitted testimonials with filter tabs (All, Pending, Approved, Rejected)',
      'Review pending testimonials submitted by students',
      'Click "Approve" to make a testimonial visible on the About Us page',
      'Click "Reject" to hide it from public view',
      'Click "Edit" to modify the testimonial content before or after approval',
      'Click the delete button to permanently remove a testimonial',
      'Approved testimonials appear on the student About Us page',
    ],
    tags: ['testimonial', 'review', 'approve', 'student', 'feedback', 'about'],
  },
  {
    id: 'manage-popup-notices',
    title: 'Create Targeted Popup Notices for Students',
    icon: Megaphone,
    category: 'Notifications',
    steps: [
      'Go to Popup Notices from the sidebar',
      'Click "Add Notice" button',
      'Enter a title and provide the image URL for the notice',
      'Select the target year level (leave empty for all students)',
      'Set the start date and end date for when the notice should appear',
      'Set the display interval (e.g., every 8 hours) - this controls how often it re-appears',
      'Optionally link a course or bundle: select "Course" or "Bundle" from the link dropdown',
      'If linking, choose the specific course/bundle and set the button text (e.g., "View Course", "Enroll Now")',
      'The button will appear below the image in the popup — clicking it navigates the student to the linked item',
      'If no link is set, the popup shows the image only with no button',
      'Click "Create Notice" to save',
      'The notice will popup to targeted students 3 seconds after they load the home page',
      'Students can dismiss it, and it will re-appear after the interval period',
      'Toggle the notice on/off or delete it anytime',
    ],
    tags: ['popup', 'notice', 'ad', 'targeted', 'image', 'year', 'schedule', 'link', 'course', 'bundle'],
  },
  {
    id: 'manage-categories',
    title: 'Manage Home Page Categories',
    icon: FolderTree,
    category: 'Settings',
    steps: [
      'Go to Categories from the sidebar',
      'Default categories (Freshman, Year 2-5) are pre-created',
      'Click "Add Category" to create a new one (e.g., Computer Science)',
      'Use the arrow buttons to reorder categories',
      'Click "Save Order" to apply the new order',
      'System categories cannot be deleted but custom ones can',
      'Categories determine how courses/bundles are grouped on the student home page',
    ],
    tags: ['category', 'home', 'organize', 'year', 'group', 'freshman'],
  },
  {
    id: 'pin-top-courses',
    title: 'Pin Courses/Bundles to Top of Home Page',
    icon: Pin,
    category: 'Settings',
    steps: [
      'Go to Home Ordering from the sidebar',
      'Switch to the "Bundles / Courses" tab',
      'You\'ll see a "Top Courses (Pinned)" section at the top',
      'Find any course or bundle in the category listings below',
      'Click the pin icon next to a course/bundle to pin it',
      'Pinned items appear in a special "Top Courses" section on the student home page',
      'Click the X button on a pinned item to unpin it',
      'These courses/bundles still appear in their original category as well',
    ],
    tags: ['pin', 'top', 'featured', 'hot', 'promote', 'highlight'],
  },
  {
    id: 'upload-video-supabase',
    title: 'Upload a Video to Supabase (Secure Hosting)',
    icon: Upload,
    category: 'Content Management',
    steps: [
      'Go to Content Manager from the sidebar',
      'Select a course and open or create a chapter',
      'Click "Add Lesson" and choose "Video" as the content type',
      'In the "Video Source" dropdown, select "Upload Video" instead of "YouTube URL"',
      'Click the file input to select a video file from your device',
      'Wait for the upload to complete (a success message will appear)',
      'Click "Add Lesson" to save - the video is stored securely in Supabase',
      'Uploaded videos support secure playback with watermarking and encrypted offline downloads',
      'YouTube videos can only be bookmarked/saved, but uploaded videos can be downloaded by students',
    ],
    tags: ['video', 'upload', 'supabase', 'secure', 'download', 'stream', 'hosting'],
  },
  {
    id: 'upload-thumbnails',
    title: 'Upload Thumbnail Images for Courses & Bundles',
    icon: Upload,
    category: 'Content Management',
    steps: [
      'Go to Courses or Bundles page from the sidebar',
      'Click on a course/bundle to edit it',
      'Find the "Thumbnail Image URL" field in the edit form',
      'To get an image URL: use the image upload API endpoint at /api/upload-image',
      'Alternatively, host the image on any public URL (Google Drive, Imgur, etc.)',
      'Paste the image URL into the Thumbnail field and save',
      'The thumbnail will appear in the Type 2 home page layout (horizontal scroll with images)',
      'Recommended image size: 400x300px or similar 4:3 ratio for best results',
    ],
    tags: ['thumbnail', 'image', 'upload', 'course', 'bundle', 'photo', 'picture', 'type2'],
  },
  {
    id: 'switch-home-ui',
    title: 'Switch Between Home Page UI Layouts',
    icon: LayoutGrid,
    category: 'Settings',
    steps: [
      'Go to Settings from the sidebar',
      'Scroll down to "Home Page UI Style" section',
      'Select Type 1 (classic grid) or Type 2 (horizontal scroll with images)',
      'Type 2 is the default and shows course/bundle thumbnail images in a modern mobile layout',
      'Click "Save Home UI Style" to apply the change immediately',
      'Students will see the new layout on their next visit',
    ],
    tags: ['home', 'ui', 'layout', 'type1', 'type2', 'switch', 'toggle', 'style'],
  },
  {
    id: 'admin-dashboard',
    title: 'Understand the Admin Dashboard',
    icon: LayoutDashboard,
    category: 'Settings',
    steps: [
      'The Dashboard is the first page you see after logging in',
      'It shows key stats at a glance: total students, pending approvals, pending payments, and total courses',
      'Below the stats you can see recent enrollments, recent payments, and new student sign-ups',
      'Use the quick-action cards to jump directly to common tasks like approving payments or reviewing students',
      'The dashboard refreshes each time you visit it — no manual refresh needed',
    ],
    tags: ['dashboard', 'overview', 'stats', 'home', 'summary'],
  },
  {
    id: 'manage-payment-methods',
    title: 'Add or Edit Payment Methods',
    icon: CreditCard,
    category: 'Payments',
    steps: [
      'Go to Payment Methods from the sidebar',
      'Click "Add Payment Method" to create a new one',
      'Fill in: method name (e.g., Telebirr, CBE, BoA), account name, account number',
      'Optionally enter a bank name if applicable',
      'Toggle "Active" to show or hide the method from students',
      'Click "Save" to create the payment method',
      'To edit: click on an existing method and update its details',
      'To deactivate: toggle the "Active" switch off — students will no longer see it as an option',
      'Active payment methods appear on the student payment page with copy-able account numbers',
    ],
    tags: ['payment', 'method', 'telebirr', 'cbe', 'boa', 'bank', 'account', 'add', 'edit'],
  },
  {
    id: 'user-access-control',
    title: 'Manage User Access & Deactivate Accounts',
    icon: ShieldOff,
    category: 'User Management',
    steps: [
      'Go to User Access from the sidebar',
      'This page shows all students and teachers with their current access status',
      'Search for a specific user by name or phone number',
      'Click "Deactivate" to suspend a user\'s account — they will be locked out immediately',
      'Click "Activate" to restore access for a deactivated user',
      'Deactivated users cannot log in or access any content until reactivated',
      'Use this for policy violations, refund situations, or temporary suspensions',
      'The user\'s enrollments and data are preserved — only login access is blocked',
    ],
    tags: ['access', 'deactivate', 'suspend', 'block', 'ban', 'activate', 'security', 'user'],
  },
];

export default function AdminHowToUse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [...new Set(workflows.map(w => w.category))];

  const filtered = workflows.filter(w => {
    const matchesSearch = searchQuery === '' ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tags.some(t => t.includes(searchQuery.toLowerCase())) ||
      w.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'all' || w.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const grouped = filtered.reduce<Record<string, Workflow[]>>((acc, w) => {
    if (!acc[w.category]) acc[w.category] = [];
    acc[w.category].push(w);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Guide</h1>
        <p className={styles.subtitle}>Search and find step-by-step instructions for every admin workflow</p>
      </div>

      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <Input
          type="search"
          placeholder="Search workflows... (e.g., approve, payment, course, bundle)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.categoryFilters}>
        <button
          className={`${styles.categoryButton} ${filterCategory === 'all' ? styles.categoryActive : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          All ({workflows.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.categoryButton} ${filterCategory === cat ? styles.categoryActive : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.workflowList}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className={styles.categoryGroup}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            {items.map(workflow => {
              const Icon = workflow.icon;
              const isExpanded = expandedId === workflow.id;
              return (
                <div key={workflow.id} className={styles.workflowCard}>
                  <button
                    className={styles.workflowHeader}
                    onClick={() => setExpandedId(isExpanded ? null : workflow.id)}
                  >
                    <div className={styles.workflowIcon}>
                      <Icon size={20} />
                    </div>
                    <span className={styles.workflowTitle}>{workflow.title}</span>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  {isExpanded && (
                    <div className={styles.workflowSteps}>
                      {workflow.steps.map((step, i) => (
                        <div key={i} className={styles.step}>
                          <span className={styles.stepNumber}>{i + 1}</span>
                          <span className={styles.stepText}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={48} />
            <p>No workflows match "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
