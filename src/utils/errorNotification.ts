import { notification } from 'antd';
import i18n from '../i18n';

interface ErrorNotificationOptions {
  showConsole?: boolean; // 콘솔에도 출력할지 여부
  duration?: number; // 알림 표시 시간 (초)
}

/**
 * 에러를 사용자에게 알림
 * @param title 에러 제목
 * @param error 에러 객체 또는 메시지
 * @param options 추가 옵션
 */
export function notifyError(
  title: string,
  error: unknown,
  options: ErrorNotificationOptions = {}
): void {
  const { showConsole = true, duration = 4.5 } = options;
  
  // 에러 메시지 추출
  let errorMessage = i18n.t('messages:error.unknown');
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  // 콘솔 출력
  if (showConsole) {
    console.error(`[${title}]`, error);
  }
  
  // 사용자 알림
  notification.error({
    message: title,
    description: errorMessage,
    duration,
    placement: 'topRight',
  });
}

/**
 * 경고 알림
 */
export function notifyWarning(
  title: string,
  message: string,
  duration: number = 3
): void {
  notification.warning({
    message: title,
    description: message,
    duration,
    placement: 'topRight',
  });
}

/**
 * 성공 알림 (기존 message.success 대체용)
 */
export function notifySuccess(
  message: string,
  duration: number = 2
): void {
  notification.success({
    message: i18n.t('messages:error.success'),
    description: message,
    duration,
    placement: 'topRight',
  });
}

/**
 * 정보 알림
 */
export function notifyInfo(
  title: string,
  message: string,
  duration: number = 3
): void {
  notification.info({
    message: title,
    description: message,
    duration,
    placement: 'topRight',
  });
}

/**
 * 데이터베이스 관련 에러 처리
 */
export function notifyDBError(error: unknown): void {
  notifyError(i18n.t('messages:error.database'), error, {
    duration: 5,
  });
}

/**
 * 네트워크 관련 에러 처리
 */
export function notifyNetworkError(error: unknown): void {
  notifyError(i18n.t('messages:error.network'), error, {
    duration: 5,
  });
}