import { AppError, ApiFieldErrors } from '../types/apiError';
import { AxiosError } from 'axios';

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Solicitud inválida. Revisa los datos ingresados.',
  401: 'No autorizado. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'Recurso no encontrado.',
  405: 'Método no permitido.',
  409: 'Conflicto: ya existe un registro con esos datos.',
  500: 'Error interno del servidor. Intenta más tarde.',
};

export const parseAxiosError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  const axiosErr = error as AxiosError<{message?: string; errors?: ApiFieldErrors}>;

  if (!axiosErr.response) {
    // Network error — backend not reachable
    return new AppError(
      'No se pudo conectar al servidor. Verifica tu conexión o que el backend esté corriendo.',
      0, undefined, true
    );
  }

  const status = axiosErr.response.status;
  const data = axiosErr.response.data;
  const backendMessage = data?.message;
  const backendErrors = data?.errors;

  const message = backendMessage || HTTP_MESSAGES[status] || `Error ${status}.`;
  return new AppError(message, status, backendErrors);
};