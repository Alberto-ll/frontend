export function errorHandler(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if ('errors' in error && Array.isArray((error as { errors?: unknown }).errors)) {
      const errs = (error as { errors: unknown[] }).errors;
      const messages = errs
        .map((err) => {
          if (typeof err === 'object' && err !== null && 'msg' in err) {
            return String((err as { msg: unknown }).msg);
          }
          return '';
        })
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join('; ');
      }
    }
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    if ('error' in error && typeof (error as { error: unknown }).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  if (typeof error === 'string') return error;
  return 'Error desconocido';
}
