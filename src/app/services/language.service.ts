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

  private translations: Translations = {
    // Navigation
    'nav.taskTracker': { en: 'Task Tracker', ru: 'Трекер Задач' },
    'nav.logout': { en: 'Logout', ru: 'Выйти' },
    'nav.editProfile': { en: 'Edit Profile', ru: 'Редактировать профиль' },
    'nav.changePassword': { en: 'Change Password', ru: 'Сменить пароль' },
    'nav.settings': { en: 'Settings', ru: 'Настройки' },

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
    'stats.thisWeek': { en: 'This Week', ru: 'На этой неделе' },
    'stats.noDeadline': { en: 'No Deadline', ru: 'Без дедлайна' },
    'stats.today': { en: 'Today', ru: 'Сегодня' },
    'stats.hasDeadline': { en: 'Has Deadline', ru: 'Есть дедлайн' },

    // Chart
    'chart.week': { en: 'Week', ru: 'Неделя' },
    'chart.month': { en: 'Month', ru: 'Месяц' },

    // Settings
    'settings.title': { en: 'Settings', ru: 'Настройки' },
    'settings.appearance': { en: 'Appearance', ru: 'Внешний вид' },
    'settings.language': { en: 'Language', ru: 'Язык' },
    'settings.about': { en: 'About', ru: 'О приложении' },
    'settings.version': { en: 'Task Tracker v1.0.0', ru: 'Трекер Задач v1.0.0' },
    'settings.description': { en: 'Your personal task management solution', ru: 'Ваше персональное решение для управления задачами' },
    'settings.close': { en: 'Close', ru: 'Закрыть' },

    // Profile
    'profile.editProfile': { en: 'Edit Profile', ru: 'Редактировать профиль' },
    'profile.name': { en: 'Name', ru: 'Имя' },
    'profile.email': { en: 'Email', ru: 'Email' },
    'profile.save': { en: 'Save', ru: 'Сохранить' },
    'profile.cancel': { en: 'Cancel', ru: 'Отмена' },

    // Change Password
    'password.title': { en: 'Change Password', ru: 'Сменить пароль' },
    'password.current': { en: 'Current Password', ru: 'Текущий пароль' },
    'password.new': { en: 'New Password', ru: 'Новый пароль' },
    'password.confirm': { en: 'Confirm Password', ru: 'Подтвердите пароль' },
    'password.change': { en: 'Change Password', ru: 'Сменить пароль' },

    // Login
    'login.welcome': { en: 'Welcome to Task Tracker', ru: 'Добро пожаловать в Трекер Задач' },
    'login.description': { en: 'A modern, intuitive task management solution designed to boost your productivity and help you stay organized.', ru: 'Современное, интуитивное решение для управления задачами, разработанное для повышения вашей продуктивности и организованности.' },
    'login.easyManagement': { en: 'Easy Task Management', ru: 'Простое управление задачами' },
    'login.easyManagementDesc': { en: 'Add, complete, and track tasks with a simple interface', ru: 'Добавляйте, завершайте и отслеживайте задачи с простым интерфейсом' },
    'login.customThemes': { en: 'Customizable Themes', ru: 'Настраиваемые темы' },
    'login.customThemesDesc': { en: 'Choose from beautiful themes to match your style', ru: 'Выбирайте из красивых тем под ваш стиль' },
    'login.progressTracking': { en: 'Progress Tracking', ru: 'Отслеживание прогресса' },
    'login.progressTrackingDesc': { en: 'Visual statistics to monitor your productivity', ru: 'Визуальная статистика для мониторинга продуктивности' },
    'login.loginTitle': { en: 'Login to Get Started', ru: 'Войдите, чтобы начать' },
    'login.email': { en: 'Email', ru: 'Email' },
    'login.password': { en: 'Password', ru: 'Пароль' },
    'login.loginButton': { en: 'Login', ru: 'Войти' },
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
}
