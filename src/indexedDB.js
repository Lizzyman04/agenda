// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import { createNotifications } from './notifications';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AgendaDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        taskStore.createIndex('description', 'description', { unique: false });
        taskStore.createIndex('deadline', 'deadline', { unique: false });
        taskStore.createIndex('importance', 'importance', { unique: false });
        taskStore.createIndex('done', 'done', { unique: false });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
        taskStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
        settingsStore.createIndex('fixedTaskId', 'fixedTaskId', { unique: false });
        settingsStore.createIndex('name', 'name', { unique: false });
        settingsStore.createIndex('password', 'password', { unique: false });
      }

      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        notificationStore.createIndex('taskId', 'taskId', { unique: false });
        notificationStore.createIndex('sendDate', 'sendDate', { unique: false });
        notificationStore.createIndex('message', 'message', { unique: false });
        notificationStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject('Error opening IndexedDB:', event.target.errorCode);
  });
};

// Task methods
const addTask = async (task) => {
  const db = await openDB();
  const transaction = db.transaction(['tasks', 'notifications'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');
  const notificationStore = transaction.objectStore('notifications');

  task.createdAt = new Date().toISOString();
  task.updatedAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const taskRequest = taskStore.add(task);

    taskRequest.onsuccess = () => {
      const taskId = taskRequest.result;
      const notifications = createNotifications(task.createdAt, task.deadline, task.importance,  task.description);

      notifications.forEach(notification => {
        const notificationRequest = notificationStore.add({ ...notification, taskId: taskRequest.result });

        notificationRequest.onsuccess = () => {
          console.log('Notification added:', notification);
        };

        notificationRequest.onerror = (event) => {
          console.error('Error adding notification:', event.target.errorCode);
        };
      });

      resolve(taskId);
    };

    taskRequest.onerror = (event) => {
      reject('Error adding task:', event.target.errorCode);
    };
  });
};

const editTask = async (task) => {
  const db = await openDB();
  const transaction = db.transaction(['tasks', 'notifications'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');
  const notificationStore = transaction.objectStore('notifications');

  task.updatedAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const taskRequest = taskStore.put(task);

    taskRequest.onsuccess = () => {
      const index = notificationStore.index('taskId');
      const range = IDBKeyRange.only(task.id);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          const notifications = createNotifications(task.createdAt, task.deadline, task.importance, task.id);
          notifications.forEach(notification => notificationStore.add(notification));
          resolve(task.id);
        }
      };

      request.onerror = (event) => {
        reject('Error deleting notifications:', event.target.errorCode);
      };
    };

    taskRequest.onerror = (event) => {
      reject('Error editing task:', event.target.errorCode);
    };
  });
};

const removeTask = async (id) => {
  const db = await openDB();
  const transaction = db.transaction(['tasks', 'notifications', 'settings'], 'readwrite');
  const taskStore = transaction.objectStore('tasks');
  const notificationStore = transaction.objectStore('notifications');
  const settingsStore = transaction.objectStore('settings');

  return new Promise((resolve, reject) => {
    const taskRequest = taskStore.delete(id);

    taskRequest.onsuccess = () => {
      const index = notificationStore.index('taskId');
      const range = IDBKeyRange.only(id);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          const settingsIndex = settingsStore.index('fixedTaskId');
          const settingsRange = IDBKeyRange.only(id);
          const settingsRequest = settingsIndex.openCursor(settingsRange);

          settingsRequest.onsuccess = (event) => {
            const settingsCursor = event.target.result;
            if (settingsCursor) {
              const settingsRecord = settingsCursor.value;
              settingsRecord.fixedTaskId = "";
              const updateRequest = settingsCursor.update(settingsRecord);

              updateRequest.onsuccess = () => {
                resolve(id);
              };

              updateRequest.onerror = (event) => {
                reject('Error updating settings:', event.target.errorCode);
              };
            } else {
              resolve(id);
            }
          };

          settingsRequest.onerror = (event) => {
            reject('Error querying settings:', event.target.errorCode);
          };
        }
      };

      request.onerror = (event) => {
        reject('Error deleting notifications:', event.target.errorCode);
      };
    };

    taskRequest.onerror = (event) => {
      reject('Error deleting task:', event.target.errorCode);
    };
  });
};


const getTask = async (id) => {
  const db = await openDB();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const request = taskStore.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const getTasks = async () => {
  const db = await openDB();
  const transaction = db.transaction(['tasks'], 'readonly');
  const taskStore = transaction.objectStore('tasks');
  const tasks = [];

  removeExpiredNotifications().catch(console.error);

  return new Promise((resolve, reject) => {
    const request = taskStore.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        tasks.push(cursor.value);
        cursor.continue();
      } else {
        resolve(tasks);
      }
    };
    request.onerror = () => reject('Error fetching tasks');
  });
};

const getNotifications = async (taskId) => {
  const db = await openDB();
  const transaction = db.transaction(['notifications'], 'readonly');
  const notificationStore = transaction.objectStore('notifications');
  const index = notificationStore.index('taskId');
  const range = IDBKeyRange.only(taskId);
  const notifications = [];

  return new Promise((resolve, reject) => {
    const request = index.openCursor(range);
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        notifications.push(cursor.value);
        cursor.continue();
      } else {
        resolve(notifications);
      }
    };
    request.onerror = () => reject('Error fetching notifications');
  });
};

// Settings methods
const saveSettings = async (settings) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({
      id: 1,
      ...settings
    });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject('Error saving settings:', event.target.errorCode);
    };
  });
};

const getSettings = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(id);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('Error getting settings:', event.target.errorCode);
    };
  });
};

const removeExpiredNotifications = async () => {
  const db = await openDB();
  const transaction = db.transaction(['notifications'], 'readwrite');
  const notificationStore = transaction.objectStore('notifications');
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const request = notificationStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.sendDate < now) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = (event) => {
      reject('Error removing expired notifications:', event.target.errorCode);
    };
  });
};

export { addTask, editTask, removeTask, getTask, getTasks, saveSettings, getSettings, getNotifications };