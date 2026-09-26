// Express's own Request type has no `userId` field -- TypeScript will reject
// `req.userId = ...` anywhere in the app unless something tells it that
// property is allowed to exist. This "module augmentation" merges an extra
// field onto Express's own interface, globally, for every file in the project.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// A `declare global` block only actually applies as an augmentation if this
// file is treated as a module. A file with no top-level import/export is
// instead treated as a global script -- so this empty `export {}` exists
// purely to make that true, not to export anything.
export {};
