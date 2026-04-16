import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ru';

export interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLanguage = signal<Language>('en');

  private apiMessageKeyMap: Record<string, string> = {
    'invalid credentials': 'common.invalidCredentials',
    'mail already exists': 'auth.mailAlreadyExists',
    'email already in use': 'auth.emailAlreadyInUse',
    'current password is incorrect': 'auth.currentPasswordIncorrect',
    'user not found': 'auth.userNotFound',
    'email is already verified': 'auth.emailAlreadyVerified',
    'verification token is required': 'auth.verificationTokenRequired',
    'verification link is invalid or expired': 'auth.verificationLinkInvalid',
    'email verified successfully': 'profile.verifySuccess',
    'if the account exists, a password reset email has been sent': 'password.resetSentGeneric',
    'token and new password are required': 'auth.resetTokenAndPasswordRequired',
    'reset link is invalid or expired': 'auth.resetLinkInvalid',
    'password reset successfully': 'password.resetSuccess',
    'password change code is invalid or expired': 'auth.passwordChangeCodeInvalid',
    'password change request not found': 'auth.passwordChangeRequestNotFound',
    'email change token is required': 'auth.emailChangeTokenRequired',
    'email change link is invalid or expired': 'auth.emailChangeLinkInvalid',
    'email change request cancelled': 'auth.emailChangeRequestCancelled',
    'email changed successfully. please verify your new email.': 'profile.emailChangeSuccess',
    'profile updated. confirm email change from your current email inbox.': 'profile.emailChangeRequested',
    'profile updated successfully': 'common.profileUpdated',
    'password changed successfully': 'common.passwordChanged',
    'verification email sent': 'profile.verifyResent',
    'server error': 'auth.serverError',
  };

  private translations: Translations = {
    // Navigation
    'nav.taskTracker': { en: 'Task Tracker', ru: 'Трекер Задач' },
    'nav.tasks': { en: 'Tasks', ru: 'Задачи' },
    'nav.analytics': { en: 'Analytics', ru: 'Аналитика' },
    'nav.logout': { en: 'Logout', ru: 'Выйти' },
    'nav.editProfile': { en: 'Edit Profile', ru: 'Редактировать профиль' },
    'nav.changePassword': { en: 'Change Password', ru: 'Сменить пароль' },
    'nav.settings': { en: 'Settings', ru: 'Настройки' },
    'nav.changeTheme': { en: 'Change Theme', ru: 'Сменить тему' },
    'nav.chooseTheme': { en: 'Choose Theme', ru: 'Выберите тему' },
    'nav.changeLanguage': { en: 'Change Language', ru: 'Сменить язык' },

    // Dashboard
    'dashboard.hello': { en: 'Hello', ru: 'Привет' },
    'dashboard.greeting': { en: 'Get your task list here', ru: 'Управляйте своими задачами здесь' },
    'dashboard.myTasks': { en: 'My Tasks', ru: 'Мои задачи' },
    'dashboard.addNewTask': { en: 'Add New Task', ru: 'Добавить задачу' },
    'dashboard.taskStatistics': { en: 'Task Statistics', ru: 'Статистика задач' },
    'dashboard.productivityChart': { en: 'Productivity Chart', ru: 'График продуктивности' },
    'dashboard.calendar': { en: 'Calendar', ru: 'Календарь' },
    'dashboard.taskSummary': { en: 'Task Summary', ru: 'Сводка задач' },

    // Tasks
    'tasks.activeTasks': { en: 'Active Tasks', ru: 'Активные задачи' },
    'tasks.completedTasks': { en: 'Completed Tasks', ru: 'Завершенные задачи' },
    'tasks.created': { en: 'Created', ru: 'Создано' },
    'tasks.completed': { en: 'Completed', ru: 'Завершено' },
    'tasks.deadline': { en: 'Deadline', ru: 'Дедлайн' },
    'tasks.daysLeft': { en: 'Days left', ru: 'Осталось' },
    'tasks.select': { en: 'Select', ru: 'Выбрать' },
    'tasks.cancel': { en: 'Cancel', ru: 'Отмена' },
    'tasks.deleteSelected': { en: 'Delete Selected', ru: 'Удалить выбранные' },
    'tasks.deleteAll': { en: 'Delete All', ru: 'Удалить все' },
    'tasks.editTask': { en: 'Edit Task', ru: 'Редактировать задачу' },
    'tasks.deleteTask': { en: 'Delete task', ru: 'Удалить задачу' },
    'tasks.noTasksYet': { en: 'No tasks added yet. Add your first task above!', ru: 'Задач пока нет. Добавьте свою первую задачу выше!' },
    'tasks.editTaskTooltip': { en: 'Edit task', ru: 'Редактировать задачу' },
    'tasks.deleteTaskTooltip': { en: 'Delete task', ru: 'Удалить задачу' },

    // Add Task
    'addTask.title': { en: 'What do you need to do?', ru: 'Что нужно сделать?' },
    'addTask.placeholder': { en: 'Enter your task here', ru: 'Введите вашу задачу' },
    'addTask.deadline': { en: 'Deadline', ru: 'Дедлайн' },
    'addTask.description': { en: 'Description (optional)', ru: 'Описание (необязательно)' },
    'addTask.descriptionPlaceholder': { en: 'Add more details about your task', ru: 'Добавьте детали о задаче' },
    'addTask.category': { en: 'Category', ru: 'Категория' },
    'addTask.priority': { en: 'Priority', ru: 'Приоритет' },
    'addTask.addButton': { en: 'Add Task', ru: 'Добавить задачу' },
    'addTask.titleRequired': { en: 'Task title is required.', ru: 'Название задачи обязательно.' },

    // Categories
    'category.work': { en: 'Work', ru: 'Работа' },
    'category.study': { en: 'Study', ru: 'Учеба' },
    'category.personal': { en: 'Personal', ru: 'Личное' },
    'category.shopping': { en: 'Shopping', ru: 'Покупки' },
    'category.other': { en: 'Other', ru: 'Другое' },

    // Priority
    'priority.low': { en: 'Low', ru: 'Низкий' },
    'priority.medium': { en: 'Medium', ru: 'Средний' },
    'priority.high': { en: 'High', ru: 'Высокий' },

    // Statistics
    'stats.totalTasks': { en: 'Total Tasks', ru: 'Всего задач' },
    'stats.completed': { en: 'Completed', ru: 'Завершено' },
    'stats.pending': { en: 'Pending', ru: 'В ожидании' },
    'stats.overallProgress': { en: 'Overall Progress', ru: 'Общий прогресс' },
    'stats.overdue': { en: 'Overdue', ru: 'Просрочено' },
    'stats.dueToday': { en: 'Due Today', ru: 'Сегодня' },
    'stats.tomorrow': { en: 'Tomorrow', ru: 'На завтра' },
    'stats.thisWeek': { en: 'This Week', ru: 'На этой неделе' },
    'stats.noDeadline': { en: 'No Deadline', ru: 'Без дедлайна' },
    'stats.today': { en: 'Today', ru: 'Сегодня' },
    'stats.hasDeadline': { en: 'Tasks with deadlines', ru: 'Задачи с дедлайном' },
    'stats.deadlineStatsHint': { en: 'Deadline statistics for active tasks', ru: 'Статистика по дедлайнам для активных задач' },
    'calendar.todayHint': { en: 'Current date', ru: 'Текущая дата' },
    'calendar.deadlineHint': { en: 'Number of tasks for the day', ru: 'Количество задач на день' },
    'analytics.activityHeatmap': { en: 'Activity Overview', ru: 'Активность за год' },
    'analytics.activitySummary': { en: 'activities in the last year', ru: 'активностей за последний год' },
    'analytics.activeDays': { en: 'active days', ru: 'активных дней' },
    'analytics.mostActiveDay': { en: 'Most Active Day', ru: 'Самый активный день' },
    'analytics.weekly': { en: 'Weekly', ru: 'Неделя' },
    'analytics.less': { en: 'Less', ru: 'Меньше' },
    'analytics.more': { en: 'More', ru: 'Больше' },

    // Chart
    'chart.week': { en: 'Week', ru: 'Неделя' },
    'chart.month': { en: 'Month', ru: 'Месяц' },
    'chart.noDataSelectedPeriod': { en: 'No data available for the selected period', ru: 'Нет данных за выбранный период' },

    // Quick Actions
    'quickActions.title': { en: 'Quick Actions', ru: 'Быстрые действия' },
    'quickActions.todayTasks': { en: "Today's Tasks", ru: 'Задачи на сегодня' },
    'quickActions.dueToday': { en: 'Due today', ru: 'С дедлайном сегодня' },
    'quickActions.overdue': { en: 'Overdue', ru: 'Просроченные' },
    'quickActions.pastDeadline': { en: 'Past deadline', ru: 'С прошедшим дедлайном' },
    'quickActions.highPriority': { en: 'High Priority', ru: 'Высокий приоритет' },
    'quickActions.importantTasks': { en: 'Important tasks', ru: 'Важные задачи' },

    // Task Summary
    'taskSummary.calculate': { en: 'Calculate Summary', ru: 'Рассчитать сводку' },

    // Settings
    'settings.title': { en: 'Settings', ru: 'Настройки' },
    'settings.appearance': { en: 'Appearance', ru: 'Внешний вид интерфейса' },
    'settings.language': { en: 'Language', ru: 'Язык' },
    'settings.about': { en: 'About', ru: 'О приложении' },
    'settings.version': { en: 'Task Tracker v1.0.0', ru: 'Трекер Задач v1.0.0' },
    'settings.description': { en: 'Your personal task management solution', ru: 'Ваше персональное решение для управления задачами' },
    'settings.themeGreen': { en: 'Light Green Theme', ru: 'Светло-зеленая тема' },
    'settings.themeBlue': { en: 'Light Blue Theme', ru: 'Светло-синяя тема' },
    'settings.themeDark': { en: 'Dark Theme', ru: 'Темная тема' },
    'settings.langEnglish': { en: 'English', ru: 'Английский' },
    'settings.close': { en: 'Close', ru: 'Закрыть' },

    // Profile
    'profile.editProfile': { en: 'Edit Profile', ru: 'Редактировать профиль' },
    'profile.pageTitle': { en: 'My Profile', ru: 'Мой профиль' },
    'profile.pageDescription': { en: 'View and update your account information', ru: 'Просматривайте и редактируйте информацию своего аккаунта' },
    'profile.name': { en: 'Name', ru: 'Имя' },
    'profile.email': { en: 'Email', ru: 'Email' },
    'profile.memberSince': { en: 'Member Since', ru: 'С нами с' },
    'profile.loading': { en: 'Loading profile...', ru: 'Загрузка профиля...' },
    'profile.quickActions': { en: 'Quick Actions', ru: 'Быстрые действия' },
    'profile.accountInfo': { en: 'Account Information', ru: 'Информация об аккаунте' },
    'profile.userId': { en: 'User ID', ru: 'ID пользователя' },
    'profile.emailStatus': { en: 'Email Status', ru: 'Статус email' },
    'profile.emailVerified': { en: 'Verified', ru: 'Подтвержден' },
    'profile.emailNotVerified': { en: 'Not verified', ru: 'Не подтвержден' },
    'profile.verifyBanner': { en: 'Please verify your email to keep your account information up to date and secure.', ru: 'Подтвердите ваш email, чтобы изменения аккаунта и восстановление доступа работали корректно.' },
    'profile.pendingEmail': { en: 'Pending Email', ru: 'Новый email в ожидании' },
    'profile.resendVerification': { en: 'Resend Verification Email', ru: 'Отправить письмо повторно' },
    'profile.resendVerificationCooldown': { en: 'Resend available in', ru: 'Повторная отправка через' },
    'profile.verifyResent': { en: 'Verification email sent', ru: 'Письмо для подтверждения отправлено' },
    'profile.verifyResentDev': { en: 'Verification link logged on server', ru: 'Ссылка подтверждения выведена в лог сервера' },
    'profile.verifyResendFailed': { en: 'Failed to resend verification email', ru: 'Не удалось отправить письмо повторно' },
    'profile.emailChangeRequested': { en: 'Email change requested. Confirm it from your current inbox.', ru: 'Запрос на смену email отправлен. Подтвердите его через вашу текущую почту.' },
    'profile.verifyTitle': { en: 'Email Verification', ru: 'Подтверждение email' },
    'profile.verifyLoading': { en: 'Verifying your email...', ru: 'Подтверждаем ваш email...' },
    'profile.verifySuccess': { en: 'Email verified successfully', ru: 'Email успешно подтвержден' },
    'profile.verifyFailed': { en: 'Failed to verify email', ru: 'Не удалось подтвердить email' },
    'profile.verifyMissingToken': { en: 'Verification token is missing', ru: 'Отсутствует токен подтверждения' },
    'profile.emailChangeTitle': { en: 'Confirm Email Change', ru: 'Подтверждение смены email' },
    'profile.emailChangeLoading': { en: 'Confirming email change...', ru: 'Подтверждаем смену email...' },
    'profile.emailChangeSuccess': { en: 'Email changed successfully. Please verify your new email.', ru: 'Email успешно изменен. Теперь подтвердите новый адрес.' },
    'profile.emailChangeFailed': { en: 'Failed to confirm email change', ru: 'Не удалось подтвердить смену email' },
    'profile.emailChangeCancelled': { en: 'Email change request cancelled', ru: 'Запрос на смену email отменен' },
    'profile.cancelEmailChange': { en: 'Cancel', ru: 'Отмена' },
    'profile.emailChangeMissingToken': { en: 'Email change token is missing', ru: 'Отсутствует токен смены email' },
    'profile.refresh': { en: 'Reload Data', ru: 'Обновить данные' },
    'profile.saving': { en: 'Saving...', ru: 'Сохранение...' },
    'profile.save': { en: 'Save', ru: 'Сохранить' },
    'profile.cancel': { en: 'Cancel', ru: 'Отмена' },
    'profile.nameRequired': { en: 'Name is required', ru: 'Имя обязательно' },
    'profile.emailRequired': { en: 'Email is required', ru: 'Email обязателен' },
    'profile.emailInvalid': { en: 'Invalid email format', ru: 'Некорректный формат email' },
    'profile.avatar': { en: 'Avatar', ru: 'Аватар' },
    'profile.uploadAvatar': { en: 'Upload Avatar', ru: 'Загрузить аватар' },
    'profile.removeAvatar': { en: 'Remove Avatar', ru: 'Удалить аватар' },
    'profile.avatarButton': { en: 'Edit', ru: 'Фото' },
    'profile.uploadPhotoMenu': { en: 'Upload...', ru: 'Загрузить...' },
    'profile.removePhotoMenu': { en: 'Remove', ru: 'Удалить' },
    'profile.avatarInvalidType': { en: 'Please choose an image file', ru: 'Выберите файл изображения' },
    'profile.avatarTooLarge': { en: 'Avatar must be smaller than 5 MB', ru: 'Аватар должен быть меньше 5 МБ' },
    'profile.avatarProcessFailed': { en: 'Failed to process avatar image', ru: 'Не удалось обработать изображение аватара' },
    'profile.avatarUpdated': { en: 'Avatar updated successfully', ru: 'Аватар успешно обновлен' },
    'profile.avatarUpdateFailed': { en: 'Failed to update avatar', ru: 'Не удалось обновить аватар' },

    // Change Password
    'password.title': { en: 'Change Password', ru: 'Сменить пароль' },
    'password.current': { en: 'Current Password', ru: 'Текущий пароль' },
    'password.new': { en: 'New Password', ru: 'Новый пароль' },
    'password.confirm': { en: 'Confirm Password', ru: 'Подтвердите пароль' },
    'password.change': { en: 'Change Password', ru: 'Сменить пароль' },
    'password.changing': { en: 'Changing...', ru: 'Смена пароля...' },
    'password.changeDisabledTitle': { en: 'Verify your email first', ru: 'Сначала подтвердите email' },
    'password.changeDisabledText': { en: 'Password changes are available only for accounts with a verified email.', ru: 'Смена пароля доступна только для аккаунтов с подтвержденной почтой.' },
    'password.codeLabel': { en: 'Confirmation Code', ru: 'Код подтверждения' },
    'password.codeHint': { en: 'We will send a 6-digit code to your verified email.', ru: 'Мы отправим 6-значный код на вашу подтвержденную почту.' },
    'password.codeSent': { en: 'Confirmation code sent', ru: 'Код подтверждения отправлен' },
    'password.codeSentDev': { en: 'Confirmation code logged on server', ru: 'Код подтверждения выведен в лог сервера' },
    'password.codeRequired': { en: 'Confirmation code is required', ru: 'Код подтверждения обязателен' },
    'password.sendCode': { en: 'Send Code', ru: 'Отправить код' },
    'password.confirmChange': { en: 'Confirm Password Change', ru: 'Подтвердить смену пароля' },
    'password.codeDeliveryCooldown': { en: 'Resend code in', ru: 'Повторная отправка кода через' },
    'password.resetTitle': { en: 'Reset Password', ru: 'Сброс пароля' },
    'password.resetDescription': { en: 'Create a new password for your account.', ru: 'Создайте новый пароль для своего аккаунта.' },
    'password.resetAction': { en: 'Reset Password', ru: 'Сбросить пароль' },
    'password.sendResetLink': { en: 'Send Reset Link', ru: 'Отправить ссылку' },
    'password.sendResetLinkCooldown': { en: 'Send again in', ru: 'Повторная отправка через' },
    'password.resetSent': { en: 'Password reset email sent', ru: 'Письмо для сброса пароля отправлено' },
    'password.resetSentGeneric': { en: 'If the account exists, a password reset email has been sent', ru: 'Если аккаунт существует, письмо для сброса пароля уже отправлено' },
    'password.resetSentDev': { en: 'Password reset link logged on server', ru: 'Ссылка для сброса пароля выведена в лог сервера' },
    'password.resetSuccess': { en: 'Password reset successfully', ru: 'Пароль успешно сброшен' },
    'password.resetFailed': { en: 'Failed to reset password', ru: 'Не удалось сбросить пароль' },
    'password.resetMissingToken': { en: 'Reset token is missing', ru: 'Отсутствует токен сброса пароля' },
    'password.currentRequired': { en: 'Current password is required', ru: 'Текущий пароль обязателен' },
    'password.newRequired': { en: 'New password is required', ru: 'Новый пароль обязателен' },
    'password.confirmRequired': { en: 'Please confirm your password', ru: 'Подтвердите пароль' },

    // Login
    'login.welcome': { en: 'Welcome to Task Tracker', ru: 'Добро пожаловать в Трекер\u00A0Задач' },
    'login.description': { en: 'A modern, intuitive task management solution designed to boost your productivity and help you stay organized.', ru: 'Современное и интуитивное решение для управления задачами, разработанное для повышения вашей продуктивности и организованности.' },
    'login.easyManagement': { en: 'Easy Task Management', ru: 'Простой контроль' },
    'login.easyManagementDesc': { en: 'Add, complete, and track tasks with a simple interface', ru: 'Управляйте задачами в пару кликов' },
    'login.customThemes': { en: 'Customizable Themes', ru: 'Настраиваемые темы' },
    'login.customThemesDesc': { en: 'Choose from beautiful themes to match your style', ru: 'Выбирайте из красивых тем под ваш стиль' },
    'login.progressTracking': { en: 'Progress Tracking', ru: 'Отслеживание прогресса' },
    'login.progressTrackingDesc': { en: 'Visual statistics to monitor your productivity', ru: 'Визуальная статистика для мониторинга продуктивности' },
    'login.loginTitle': { en: 'Login to Get Started', ru: 'Войдите, чтобы начать' },
    'login.email': { en: 'Email', ru: 'Email' },
    'login.password': { en: 'Password', ru: 'Пароль' },
    'login.loginButton': { en: 'Login', ru: 'Войти' },
    'login.forgotPassword': { en: 'Forgot password?', ru: 'Забыли пароль?' },
    'login.noAccount': { en: "Don't have an account?", ru: 'Нет аккаунта?' },
    'login.createAccount': { en: 'Create one now', ru: 'Создать сейчас' },
    'login.haveAccount': { en: 'Already have an account?', ru: 'Уже есть аккаунт?' },
    'login.loginInstead': { en: 'Login instead', ru: 'Войти' },
    'login.register': { en: 'Create Account', ru: 'Создать аккаунт' },
    'login.fullName': { en: 'Full Name', ru: 'Полное имя' },
    'login.confirmPassword': { en: 'Confirm Password', ru: 'Подтвердите пароль' },

    // Common
    'common.save': { en: 'Save', ru: 'Сохранить' },
    'common.cancel': { en: 'Cancel', ru: 'Отмена' },
    'common.close': { en: 'Close', ru: 'Закрыть' },
    'common.delete': { en: 'Delete', ru: 'Удалить' },
    'common.edit': { en: 'Edit', ru: 'Редактировать' },
    'common.loggedOut': { en: 'You have been logged out.', ru: 'Вы вышли из системы.' },
    'common.taskAdded': { en: 'Task added successfully!', ru: 'Задача успешно добавлена!' },
    'common.taskAddFailed': { en: 'Failed to add task. Please try again later.', ru: 'Не удалось добавить задачу. Пожалуйста, попробуйте позже.' },
    'common.profileLoadFailed': { en: 'Failed to load profile data', ru: 'Не удалось загрузить данные профиля' },
    'common.profileUpdated': { en: 'Profile updated successfully', ru: 'Профиль успешно обновлен' },
    'common.profileUpdateFailed': { en: 'Failed to update profile', ru: 'Не удалось обновить профиль' },
    'common.passwordsNotMatch': { en: 'Passwords do not match', ru: 'Пароли не совпадают' },
    'common.passwordChanged': { en: 'Password changed successfully', ru: 'Пароль успешно изменен' },
    'common.passwordChangeFailed': { en: 'Failed to change password', ru: 'Не удалось изменить пароль' },
    'common.taskLoadFailed': { en: 'Failed to load tasks. Please try again later.', ru: 'Не удалось загрузить задачи. Пожалуйста, попробуйте позже.' },
    'common.taskStatusUpdated': { en: 'Task status updated successfully', ru: 'Статус задачи успешно обновлен' },
    'common.taskStatusUpdateFailed': { en: 'Failed to update task status. Please try again later.', ru: 'Не удалось обновить статус задачи. Пожалуйста, попробуйте позже.' },
    'common.confirmDeleteTask': { en: 'Are you sure you want to delete this task?', ru: 'Вы уверены, что хотите удалить эту задачу?' },
    'common.taskDeleted': { en: 'Task deleted successfully', ru: 'Задача успешно удалена' },
    'common.taskDeleteFailed': { en: 'Failed to delete task. Please try again later.', ru: 'Не удалось удалить задачу. Пожалуйста, попробуйте позже.' },
    'common.taskUpdated': { en: 'Task updated successfully!', ru: 'Задача успешно обновлена!' },
    'common.taskUpdateFailed': { en: 'Failed to update task. Please try again later.', ru: 'Не удалось обновить задачу. Пожалуйста, попробуйте позже.' },
    'common.loginSuccess': { en: 'Login successful!', ru: 'Вход выполнен успешно!' },
    'common.invalidCredentials': { en: 'Invalid credentials', ru: 'Неверные учетные данные' },
    'common.nameRequired': { en: 'Name is required, must be at least 2 characters long and contain only letters and spaces.', ru: 'Имя обязательно, должно быть не менее 2 символов и содержать только буквы и пробелы.' },
    'common.allFieldsRequired': { en: 'All fields are required.', ru: 'Все поля обязательны для заполнения.' },
    'common.validEmailRequired': { en: 'Please enter a valid email address.', ru: 'Пожалуйста, введите корректный email адрес.' },
    'common.passwordMinLength': { en: 'Password must be at least 6 characters.', ru: 'Пароль должен содержать не менее 6 символов.' },
    'common.registrationSuccess': { en: 'Registration successful!', ru: 'Регистрация прошла успешно!' },
    'common.registrationFailed': { en: 'Registration failed!', ru: 'Регистрация не удалась!' },
    'common.pageNotFound': { en: 'Page not found', ru: 'Страница не найдена' },

    // Auth API
    'auth.mailAlreadyExists': { en: 'An account with this email already exists', ru: 'Аккаунт с таким email уже существует' },
    'auth.emailAlreadyInUse': { en: 'This email is already in use', ru: 'Этот email уже используется' },
    'auth.currentPasswordIncorrect': { en: 'Current password is incorrect', ru: 'Текущий пароль введён неверно' },
    'auth.userNotFound': { en: 'User not found', ru: 'Пользователь не найден' },
    'auth.emailNotVerified': { en: 'Email is not verified', ru: 'Email не подтвержден' },
    'auth.emailAlreadyVerified': { en: 'Email is already verified', ru: 'Email уже подтверждён' },
    'auth.verificationTokenRequired': { en: 'Verification token is required', ru: 'Необходим токен подтверждения' },
    'auth.verificationLinkInvalid': { en: 'Verification link is invalid or expired', ru: 'Ссылка подтверждения недействительна или устарела' },
    'auth.resetTokenAndPasswordRequired': { en: 'Token and new password are required', ru: 'Нужны токен и новый пароль' },
    'auth.resetLinkInvalid': { en: 'Reset link is invalid or expired', ru: 'Ссылка для сброса недействительна или устарела' },
    'auth.passwordChangeCodeInvalid': { en: 'Password change code is invalid or expired', ru: 'Код смены пароля неверен или истек' },
    'auth.passwordChangeRequestNotFound': { en: 'Password change request not found', ru: 'Запрос на смену пароля не найден' },
    'auth.emailChangeTokenRequired': { en: 'Email change token is required', ru: 'Необходим токен смены email' },
    'auth.emailChangeLinkInvalid': { en: 'Email change link is invalid or expired', ru: 'Ссылка смены email недействительна или устарела' },
    'auth.emailChangeRequestCancelled': { en: 'Email change request cancelled', ru: 'Запрос на смену email отменен' },
    'auth.serverError': { en: 'Server error. Please try again later.', ru: 'Ошибка сервера. Попробуйте позже.' },

    // Analytics
    'analytics.description': { en: 'Detailed insights into your task management', ru: 'Подробная информация о вашем управлении задачами' },
    'analytics.comingSoon': { en: 'Analytics content coming soon', ru: 'Содержимое аналитики скоро появится' },
  };

  constructor() {
    this.loadLanguage();
  }

  loadLanguage() {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      this.currentLanguage.set(savedLang);
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage()];
  }

  t(key: string): string {
    return this.translate(key);
  }

  tApi(message?: string | null, fallbackKey = 'auth.serverError'): string {
    if (!message) {
      return this.t(fallbackKey);
    }

    const normalized = message.trim().toLowerCase();
    const mappedKey = this.apiMessageKeyMap[normalized];
    return mappedKey ? this.t(mappedKey) : message;
  }
}
